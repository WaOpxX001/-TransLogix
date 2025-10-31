<?php
// Script para verificar bloqueos en la base de datos
require_once 'config.php';

header('Content-Type: text/html; charset=utf-8');

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    echo "<html><head><meta charset='UTF-8'><title>Verificación de Bloqueos</title>";
    echo "<style>
        body { font-family: Arial; padding: 20px; background: #f5f5f5; }
        .box { background: white; padding: 20px; margin: 20px 0; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h2 { color: #2196f3; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #2196f3; color: white; }
        .success { color: #4caf50; font-weight: bold; }
        .error { color: #f44336; font-weight: bold; }
        .warning { color: #ff9800; font-weight: bold; }
        .bloqueado { background: #ffebee; }
        .pendiente { background: #fff3e0; }
        .aprobada { background: #e8f5e9; }
    </style></head><body>";
    
    echo "<h1>🔍 Verificación de Sistema de Bloqueos</h1>";
    
    // 1. Verificar estructura de tabla
    echo "<div class='box'>";
    echo "<h2>1. Estructura de Tabla solicitudes_viajes</h2>";
    $stmt = $conn->query("DESCRIBE solicitudes_viajes");
    echo "<table><tr><th>Campo</th><th>Tipo</th><th>Null</th><th>Default</th></tr>";
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "<tr>";
        echo "<td>{$row['Field']}</td>";
        echo "<td>{$row['Type']}</td>";
        echo "<td>{$row['Null']}</td>";
        echo "<td>{$row['Default']}</td>";
        echo "</tr>";
    }
    echo "</table>";
    
    // Verificar si existen las columnas necesarias
    $columnas_necesarias = ['dias_bloqueo', 'fecha_desbloqueo', 'motivo_denegacion'];
    $stmt = $conn->query("SHOW COLUMNS FROM solicitudes_viajes");
    $columnas_existentes = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $columnas_existentes[] = $row['Field'];
    }
    
    echo "<p><strong>Verificación de columnas:</strong></p><ul>";
    foreach ($columnas_necesarias as $col) {
        if (in_array($col, $columnas_existentes)) {
            echo "<li class='success'>✅ $col existe</li>";
        } else {
            echo "<li class='error'>❌ $col NO EXISTE - EJECUTA agregar_dias_bloqueo.sql</li>";
        }
    }
    echo "</ul></div>";
    
    // 2. Todas las solicitudes
    echo "<div class='box'>";
    echo "<h2>2. Todas las Solicitudes</h2>";
    $stmt = $conn->query("
        SELECT 
            s.*,
            v.origen_estado,
            v.destino_estado,
            t.nombre as transportista_nombre,
            CASE 
                WHEN s.fecha_desbloqueo IS NOT NULL AND s.fecha_desbloqueo > NOW() THEN 'BLOQUEADO'
                WHEN s.estado = 'pendiente' THEN 'PENDIENTE'
                WHEN s.estado = 'aprobada' THEN 'APROBADA'
                WHEN s.estado = 'rechazada' THEN 'RECHAZADA'
                ELSE s.estado
            END as estado_actual,
            CASE 
                WHEN s.fecha_desbloqueo IS NOT NULL AND s.fecha_desbloqueo > NOW() 
                THEN DATEDIFF(s.fecha_desbloqueo, NOW())
                ELSE 0
            END as dias_restantes_calculados
        FROM solicitudes_viajes s
        LEFT JOIN viajes v ON s.viaje_id = v.id
        LEFT JOIN usuarios t ON s.transportista_id = t.id
        ORDER BY s.fecha_solicitud DESC
        LIMIT 20
    ");
    
    $solicitudes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($solicitudes) > 0) {
        echo "<p class='success'>✅ Se encontraron " . count($solicitudes) . " solicitudes</p>";
        echo "<table>";
        echo "<tr>
            <th>ID</th>
            <th>Viaje</th>
            <th>Transportista</th>
            <th>Estado</th>
            <th>Días Bloqueo</th>
            <th>Días Restantes</th>
            <th>Fecha Desbloqueo</th>
            <th>Motivo</th>
        </tr>";
        
        foreach ($solicitudes as $sol) {
            $clase = '';
            if ($sol['estado_actual'] == 'BLOQUEADO') $clase = 'bloqueado';
            elseif ($sol['estado_actual'] == 'PENDIENTE') $clase = 'pendiente';
            elseif ($sol['estado_actual'] == 'APROBADA') $clase = 'aprobada';
            
            echo "<tr class='$clase'>";
            echo "<td>{$sol['id']}</td>";
            echo "<td>Viaje #{$sol['viaje_id']}: {$sol['origen_estado']} → {$sol['destino_estado']}</td>";
            echo "<td>{$sol['transportista_nombre']}</td>";
            echo "<td><strong>{$sol['estado_actual']}</strong></td>";
            echo "<td>" . ($sol['dias_bloqueo'] ?: '-') . "</td>";
            echo "<td>" . ($sol['dias_restantes_calculados'] ?: '-') . "</td>";
            echo "<td>" . ($sol['fecha_desbloqueo'] ?: '-') . "</td>";
            echo "<td>" . ($sol['motivo_denegacion'] ?: '-') . "</td>";
            echo "</tr>";
        }
        echo "</table>";
    } else {
        echo "<p class='warning'>⚠️ No hay solicitudes en la base de datos</p>";
    }
    echo "</div>";
    
    // 3. Solicitudes rechazadas activas (bloqueadas)
    echo "<div class='box'>";
    echo "<h2>3. Bloqueos Activos (Rechazos Vigentes)</h2>";
    $stmt = $conn->query("
        SELECT 
            s.*,
            v.origen_estado,
            v.destino_estado,
            t.nombre as transportista_nombre,
            DATEDIFF(s.fecha_desbloqueo, NOW()) as dias_restantes
        FROM solicitudes_viajes s
        LEFT JOIN viajes v ON s.viaje_id = v.id
        LEFT JOIN usuarios t ON s.transportista_id = t.id
        WHERE s.estado = 'rechazada'
        AND s.fecha_desbloqueo IS NOT NULL
        AND s.fecha_desbloqueo > NOW()
        ORDER BY s.fecha_desbloqueo ASC
    ");
    
    $bloqueos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($bloqueos) > 0) {
        echo "<p class='error'>🔒 Se encontraron " . count($bloqueos) . " bloqueos activos</p>";
        echo "<table>";
        echo "<tr>
            <th>Viaje ID</th>
            <th>Ruta</th>
            <th>Transportista</th>
            <th>Días Bloqueo</th>
            <th>Días Restantes</th>
            <th>Fecha Desbloqueo</th>
            <th>Motivo</th>
        </tr>";
        
        foreach ($bloqueos as $b) {
            echo "<tr class='bloqueado'>";
            echo "<td>{$b['viaje_id']}</td>";
            echo "<td>{$b['origen_estado']} → {$b['destino_estado']}</td>";
            echo "<td>{$b['transportista_nombre']} (ID: {$b['transportista_id']})</td>";
            echo "<td>{$b['dias_bloqueo']}</td>";
            echo "<td><strong>{$b['dias_restantes']}</strong></td>";
            echo "<td>{$b['fecha_desbloqueo']}</td>";
            echo "<td>{$b['motivo_denegacion']}</td>";
            echo "</tr>";
        }
        echo "</table>";
        
        echo "<h3>🧪 Prueba con estos datos:</h3>";
        echo "<ul>";
        foreach ($bloqueos as $b) {
            echo "<li>Viaje ID <strong>{$b['viaje_id']}</strong> - Transportista ID <strong>{$b['transportista_id']}</strong> ({$b['transportista_nombre']}) - <strong>{$b['dias_restantes']} días restantes</strong></li>";
        }
        echo "</ul>";
    } else {
        echo "<p class='warning'>⚠️ No hay bloqueos activos en este momento</p>";
        echo "<p>Para probar el sistema:</p>";
        echo "<ol>";
        echo "<li>Crea un viaje pendiente</li>";
        echo "<li>Como transportista, solicita el inicio</li>";
        echo "<li>Como admin, rechaza la solicitud con motivo y días de bloqueo</li>";
        echo "<li>Vuelve a cargar esta página para ver el bloqueo</li>";
        echo "</ol>";
    }
    echo "</div>";
    
    // 4. Prueba de API
    echo "<div class='box'>";
    echo "<h2>4. Prueba de API</h2>";
    if (count($bloqueos) > 0) {
        $primer_bloqueo = $bloqueos[0];
        $viaje_id = $primer_bloqueo['viaje_id'];
        $user_id = $primer_bloqueo['transportista_id'];
        
        echo "<p>Probando API con:</p>";
        echo "<ul>";
        echo "<li>Viaje ID: <strong>$viaje_id</strong></li>";
        echo "<li>Usuario ID: <strong>$user_id</strong></li>";
        echo "</ul>";
        
        $url = "http://" . $_SERVER['HTTP_HOST'] . "/LogisticaFinal/api/viajes/verificar_solicitud.php?viaje_id=$viaje_id&user_id=$user_id";
        echo "<p>URL de prueba: <a href='$url' target='_blank'>$url</a></p>";
        
        // Hacer la petición
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($ch);
        curl_close($ch);
        
        echo "<h4>Respuesta de la API:</h4>";
        echo "<pre style='background: #263238; color: #aed581; padding: 15px; border-radius: 5px; overflow-x: auto;'>";
        $json = json_decode($response, true);
        echo json_encode($json, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        echo "</pre>";
        
        if ($json && $json['success']) {
            if ($json['bloqueado']) {
                echo "<p class='error'>🔒 API reporta: BLOQUEADO por {$json['dias_restantes']} días</p>";
            } else {
                echo "<p class='warning'>⚠️ API reporta: NO BLOQUEADO (puede ser un error)</p>";
            }
        } else {
            echo "<p class='error'>❌ Error en la API: " . ($json['error'] ?? 'Desconocido') . "</p>";
        }
    } else {
        echo "<p class='warning'>⚠️ No hay bloqueos para probar</p>";
    }
    echo "</div>";
    
    // 5. Instrucciones
    echo "<div class='box'>";
    echo "<h2>5. Próximos Pasos</h2>";
    echo "<ol>";
    echo "<li>Si las columnas no existen, ejecuta: <code>database/agregar_dias_bloqueo.sql</code></li>";
    echo "<li>Si no hay bloqueos activos, crea uno siguiendo los pasos arriba</li>";
    echo "<li>Abre <a href='test_bloqueo.html' target='_blank'>test_bloqueo.html</a> para probar el JavaScript</li>";
    echo "<li>Limpia el caché del navegador (Ctrl+Shift+Delete)</li>";
    echo "<li>Recarga la página de viajes con Ctrl+F5</li>";
    echo "</ol>";
    echo "</div>";
    
    echo "</body></html>";
    
} catch (Exception $e) {
    echo "<div class='box'>";
    echo "<h2 class='error'>❌ Error</h2>";
    echo "<p class='error'>" . $e->getMessage() . "</p>";
    echo "</div>";
    echo "</body></html>";
}
?>
