<?php
// Script para insertar un rechazo manualmente y verificar
require_once 'config.php';

header('Content-Type: text/html; charset=utf-8');

$db = new Database();
$conn = $db->getConnection();

echo "<html><head><meta charset='UTF-8'><title>Insertar Rechazo Manual</title>";
echo "<style>
    body { font-family: Arial; padding: 20px; background: #f5f5f5; }
    .box { background: white; padding: 20px; margin: 20px 0; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    h2 { color: #2196f3; }
    .success { color: #4caf50; }
    .error { color: #f44336; }
    pre { background: #263238; color: #aed581; padding: 15px; border-radius: 5px; overflow-x: auto; }
    button { background: #2196f3; color: white; border: none; padding: 12px 24px; border-radius: 5px; cursor: pointer; margin: 5px; }
</style></head><body>";

echo "<h1>🔧 Insertar Rechazo Manual</h1>";

// Usar IDs directos que sabemos que existen
$viaje_id = 17;
$transportista_id = 2; // Cambiar este número si es necesario

echo "<div class='box'>";
echo "<h2>Información</h2>";
echo "<p>Viaje ID: $viaje_id</p>";
echo "<p>Transportista ID: $transportista_id</p>";
echo "<p><strong>Si el transportista ID no existe, cambia el número en el código</strong></p>";
echo "</div>";

// Paso 1: Verificar si ya existe una solicitud
echo "<div class='box'>";
echo "<h2>Paso 1: Verificar Solicitud Existente</h2>";
$stmt = $conn->prepare("SELECT * FROM solicitudes_viajes WHERE viaje_id = ? AND transportista_id = ?");
$stmt->execute([$viaje_id, $transportista_id]);
$solicitud_existente = $stmt->fetch(PDO::FETCH_ASSOC);

if ($solicitud_existente) {
    echo "<p class='success'>✅ Ya existe una solicitud:</p>";
    echo "<pre>" . print_r($solicitud_existente, true) . "</pre>";
    $solicitud_id = $solicitud_existente['id'];
} else {
    echo "<p class='error'>❌ No existe solicitud, creando una nueva...</p>";
    
    // Crear solicitud
    $stmt = $conn->prepare("
        INSERT INTO solicitudes_viajes 
        (viaje_id, transportista_id, estado, fecha_solicitud)
        VALUES (?, ?, 'pendiente', NOW())
    ");
    $stmt->execute([$viaje_id, $transportista_id]);
    $solicitud_id = $conn->lastInsertId();
    
    echo "<p class='success'>✅ Solicitud creada con ID: $solicitud_id</p>";
}
echo "</div>";

// Paso 2: Rechazar la solicitud
if (isset($_GET['rechazar'])) {
    echo "<div class='box'>";
    echo "<h2>Paso 2: Rechazando Solicitud</h2>";
    
    $dias_bloqueo = 5;
    $motivo = "Prueba manual de rechazo - " . date('Y-m-d H:i:s');
    $fecha_desbloqueo = date('Y-m-d H:i:s', strtotime("+{$dias_bloqueo} days"));
    
    echo "<p>Solicitud ID: $solicitud_id</p>";
    echo "<p>Días de bloqueo: $dias_bloqueo</p>";
    echo "<p>Fecha desbloqueo: $fecha_desbloqueo</p>";
    echo "<p>Motivo: $motivo</p>";
    
    try {
        $stmt = $conn->prepare("
            UPDATE solicitudes_viajes 
            SET estado = 'rechazada', 
                fecha_respuesta = NOW(),
                aprobado_por = 1,
                motivo_denegacion = ?,
                dias_bloqueo = ?,
                fecha_desbloqueo = ?
            WHERE id = ?
        ");
        
        $resultado = $stmt->execute([$motivo, $dias_bloqueo, $fecha_desbloqueo, $solicitud_id]);
        
        if ($resultado && $stmt->rowCount() > 0) {
            echo "<p class='success'>✅ UPDATE ejecutado correctamente</p>";
            echo "<p>Filas afectadas: " . $stmt->rowCount() . "</p>";
            
            // Verificar
            $stmt = $conn->prepare("SELECT * FROM solicitudes_viajes WHERE id = ?");
            $stmt->execute([$solicitud_id]);
            $verificacion = $stmt->fetch(PDO::FETCH_ASSOC);
            
            echo "<h3>Verificación en BD:</h3>";
            echo "<pre>" . print_r($verificacion, true) . "</pre>";
            
            if ($verificacion['estado'] === 'rechazada' && 
                $verificacion['dias_bloqueo'] == $dias_bloqueo && 
                $verificacion['fecha_desbloqueo'] !== null) {
                echo "<p class='success'>✅✅✅ RECHAZO GUARDADO CORRECTAMENTE EN LA BD</p>";
            } else {
                echo "<p class='error'>❌ Los datos NO se guardaron correctamente</p>";
            }
            
            // Probar API
            echo "<h3>Prueba de API:</h3>";
            $url = "http://" . $_SERVER['HTTP_HOST'] . "/LogisticaFinal/api/viajes/verificar_solicitud.php?viaje_id=$viaje_id&user_id=$transportista_id";
            echo "<p>URL: <a href='$url' target='_blank'>$url</a></p>";
            
            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            echo "<p>HTTP Code: $httpCode</p>";
            echo "<pre>" . $response . "</pre>";
            
            $json = json_decode($response, true);
            if ($json && isset($json['bloqueado']) && $json['bloqueado'] === true) {
                echo "<p class='success'>✅✅✅ API REPORTA CORRECTAMENTE: BLOQUEADO por {$json['dias_restantes']} días</p>";
                echo "<p class='success'>🎉 TODO FUNCIONA CORRECTAMENTE</p>";
            } else {
                echo "<p class='error'>❌ API NO reporta el bloqueo correctamente</p>";
                echo "<p>Respuesta completa:</p>";
                echo "<pre>" . print_r($json, true) . "</pre>";
            }
            
        } else {
            echo "<p class='error'>❌ UPDATE no afectó ninguna fila</p>";
        }
        
    } catch (Exception $e) {
        echo "<p class='error'>❌ Error: " . $e->getMessage() . "</p>";
    }
    
    echo "</div>";
} else {
    echo "<div class='box'>";
    echo "<h2>Paso 2: Rechazar Solicitud</h2>";
    echo "<p>Solicitud ID: $solicitud_id</p>";
    echo "<p>Viaje ID: $viaje_id</p>";
    echo "<p>Transportista ID: $transportista_id (Carlos)</p>";
    echo "<button onclick='location.href=\"?rechazar=1\"'>🔒 Rechazar Ahora</button>";
    echo "</div>";
}

// Paso 3: Ver todas las solicitudes
echo "<div class='box'>";
echo "<h2>Paso 3: Todas las Solicitudes</h2>";
$stmt = $conn->query("
    SELECT 
        s.*,
        v.origen_estado,
        v.destino_estado,
        t.nombre as transportista,
        DATEDIFF(s.fecha_desbloqueo, NOW()) as dias_restantes
    FROM solicitudes_viajes s
    LEFT JOIN viajes v ON s.viaje_id = v.id
    LEFT JOIN usuarios t ON s.transportista_id = t.id
    ORDER BY s.fecha_solicitud DESC
    LIMIT 10
");
$todas = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (count($todas) > 0) {
    echo "<table border='1' cellpadding='10' style='width:100%; border-collapse: collapse;'>";
    echo "<tr style='background: #2196f3; color: white;'>";
    echo "<th>ID</th><th>Viaje</th><th>Transportista</th><th>Estado</th><th>Días Bloqueo</th><th>Días Restantes</th><th>Fecha Desbloqueo</th></tr>";
    foreach ($todas as $s) {
        $color = '';
        if ($s['estado'] === 'rechazada') $color = 'background: #ffebee;';
        elseif ($s['estado'] === 'pendiente') $color = 'background: #fff3e0;';
        elseif ($s['estado'] === 'aprobada') $color = 'background: #e8f5e9;';
        
        echo "<tr style='$color'>";
        echo "<td>{$s['id']}</td>";
        echo "<td>#{$s['viaje_id']}: {$s['origen_estado']} → {$s['destino_estado']}</td>";
        echo "<td>{$s['transportista']}</td>";
        echo "<td><strong>{$s['estado']}</strong></td>";
        echo "<td>" . ($s['dias_bloqueo'] ?: '-') . "</td>";
        echo "<td>" . ($s['dias_restantes'] ?: '-') . "</td>";
        echo "<td>" . ($s['fecha_desbloqueo'] ?: '-') . "</td>";
        echo "</tr>";
    }
    echo "</table>";
} else {
    echo "<p class='error'>❌ No hay solicitudes en la BD</p>";
}
echo "</div>";

echo "</body></html>";
?>
