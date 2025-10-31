<?php
// Test directo del rechazo
require_once 'config.php';

header('Content-Type: text/html; charset=utf-8');

$db = new Database();
$conn = $db->getConnection();

echo "<html><head><meta charset='UTF-8'><title>Test de Rechazo</title>";
echo "<style>
    body { font-family: Arial; padding: 20px; background: #f5f5f5; }
    .box { background: white; padding: 20px; margin: 20px 0; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    h2 { color: #2196f3; }
    .success { color: #4caf50; }
    .error { color: #f44336; }
    pre { background: #263238; color: #aed581; padding: 15px; border-radius: 5px; overflow-x: auto; }
</style></head><body>";

echo "<h1>🧪 Test de Rechazo Directo</h1>";

// 1. Verificar estructura de tabla
echo "<div class='box'>";
echo "<h2>1. Estructura de Tabla</h2>";
$stmt = $conn->query("DESCRIBE solicitudes_viajes");
$columnas = $stmt->fetchAll(PDO::FETCH_ASSOC);

$columnas_necesarias = ['dias_bloqueo', 'fecha_desbloqueo', 'motivo_denegacion'];
$columnas_existentes = array_column($columnas, 'Field');

echo "<ul>";
foreach ($columnas_necesarias as $col) {
    if (in_array($col, $columnas_existentes)) {
        echo "<li class='success'>✅ $col existe</li>";
    } else {
        echo "<li class='error'>❌ $col NO EXISTE</li>";
        echo "<p class='error'>EJECUTA: ALTER TABLE solicitudes_viajes ADD COLUMN $col ...</p>";
    }
}
echo "</ul>";
echo "</div>";

// 2. Buscar solicitudes pendientes
echo "<div class='box'>";
echo "<h2>2. Solicitudes Pendientes</h2>";
$stmt = $conn->query("
    SELECT 
        s.id,
        s.viaje_id,
        s.transportista_id,
        s.estado,
        v.origen_estado,
        v.destino_estado,
        t.nombre as transportista
    FROM solicitudes_viajes s
    LEFT JOIN viajes v ON s.viaje_id = v.id
    LEFT JOIN usuarios t ON s.transportista_id = t.id
    WHERE s.estado = 'pendiente'
    ORDER BY s.fecha_solicitud DESC
");
$pendientes = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (count($pendientes) > 0) {
    echo "<p class='success'>✅ Hay " . count($pendientes) . " solicitudes pendientes</p>";
    echo "<table border='1' cellpadding='10'>";
    echo "<tr><th>ID</th><th>Viaje</th><th>Transportista</th><th>Acción</th></tr>";
    foreach ($pendientes as $p) {
        echo "<tr>";
        echo "<td>{$p['id']}</td>";
        echo "<td>#{$p['viaje_id']}: {$p['origen_estado']} → {$p['destino_estado']}</td>";
        echo "<td>{$p['transportista']} (ID: {$p['transportista_id']})</td>";
        echo "<td><a href='?rechazar={$p['id']}&viaje={$p['viaje_id']}&trans={$p['transportista_id']}'>Rechazar</a></td>";
        echo "</tr>";
    }
    echo "</table>";
} else {
    echo "<p class='error'>❌ No hay solicitudes pendientes</p>";
}
echo "</div>";

// 3. Procesar rechazo si se solicitó
if (isset($_GET['rechazar'])) {
    echo "<div class='box'>";
    echo "<h2>3. Procesando Rechazo</h2>";
    
    $solicitud_id = $_GET['rechazar'];
    $viaje_id = $_GET['viaje'];
    $transportista_id = $_GET['trans'];
    $dias_bloqueo = 10;
    $motivo = "Prueba de rechazo desde test_rechazo_directo.php";
    $fecha_desbloqueo = date('Y-m-d H:i:s', strtotime("+{$dias_bloqueo} days"));
    
    echo "<p>Solicitud ID: $solicitud_id</p>";
    echo "<p>Viaje ID: $viaje_id</p>";
    echo "<p>Transportista ID: $transportista_id</p>";
    echo "<p>Días de bloqueo: $dias_bloqueo</p>";
    echo "<p>Fecha desbloqueo: $fecha_desbloqueo</p>";
    
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
        
        if ($resultado) {
            echo "<p class='success'>✅ UPDATE ejecutado correctamente</p>";
            echo "<p>Filas afectadas: " . $stmt->rowCount() . "</p>";
            
            // Verificar que se guardó
            $stmt = $conn->prepare("SELECT * FROM solicitudes_viajes WHERE id = ?");
            $stmt->execute([$solicitud_id]);
            $verificacion = $stmt->fetch(PDO::FETCH_ASSOC);
            
            echo "<h3>Verificación:</h3>";
            echo "<pre>" . print_r($verificacion, true) . "</pre>";
            
            // Probar la API
            echo "<h3>Prueba de API:</h3>";
            $url = "http://" . $_SERVER['HTTP_HOST'] . "/LogisticaFinal/api/viajes/verificar_solicitud.php?viaje_id=$viaje_id&user_id=$transportista_id";
            echo "<p>URL: <a href='$url' target='_blank'>$url</a></p>";
            
            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            $response = curl_exec($ch);
            curl_close($ch);
            
            echo "<pre>" . $response . "</pre>";
            
            $json = json_decode($response, true);
            if ($json && $json['bloqueado']) {
                echo "<p class='success'>✅ API reporta: BLOQUEADO por {$json['dias_restantes']} días</p>";
            } else {
                echo "<p class='error'>❌ API NO reporta el bloqueo</p>";
            }
            
        } else {
            echo "<p class='error'>❌ UPDATE falló</p>";
        }
        
    } catch (Exception $e) {
        echo "<p class='error'>❌ Error: " . $e->getMessage() . "</p>";
    }
    
    echo "</div>";
}

// 4. Mostrar rechazos existentes
echo "<div class='box'>";
echo "<h2>4. Rechazos Existentes</h2>";
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
    WHERE s.estado = 'rechazada'
    ORDER BY s.fecha_respuesta DESC
    LIMIT 10
");
$rechazos = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (count($rechazos) > 0) {
    echo "<p class='success'>✅ Hay " . count($rechazos) . " rechazos registrados</p>";
    echo "<table border='1' cellpadding='10'>";
    echo "<tr><th>ID</th><th>Viaje</th><th>Transportista</th><th>Días Bloqueo</th><th>Días Restantes</th><th>Fecha Desbloqueo</th><th>Motivo</th></tr>";
    foreach ($rechazos as $r) {
        $bloqueado = $r['dias_restantes'] > 0 ? '🔒' : '✅';
        echo "<tr>";
        echo "<td>{$r['id']}</td>";
        echo "<td>#{$r['viaje_id']}: {$r['origen_estado']} → {$r['destino_estado']}</td>";
        echo "<td>{$r['transportista']} (ID: {$r['transportista_id']})</td>";
        echo "<td>{$r['dias_bloqueo']}</td>";
        echo "<td>$bloqueado {$r['dias_restantes']}</td>";
        echo "<td>{$r['fecha_desbloqueo']}</td>";
        echo "<td>{$r['motivo_denegacion']}</td>";
        echo "</tr>";
    }
    echo "</table>";
} else {
    echo "<p class='error'>❌ No hay rechazos registrados</p>";
}
echo "</div>";

echo "</body></html>";
?>
