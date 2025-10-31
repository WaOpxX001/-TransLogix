<?php
// Script de prueba para verificar bloqueos
require_once 'config.php';

$db = new Database();
$conn = $db->getConnection();

echo "<h2>🔍 Verificación de Bloqueos</h2>";

// Parámetros de prueba
$viaje_id = $_GET['viaje_id'] ?? 13; // Cambiar según tu viaje
$transportista_id = $_GET['transportista_id'] ?? 3; // Cambiar según tu transportista

echo "<p><strong>Viaje ID:</strong> $viaje_id</p>";
echo "<p><strong>Transportista ID:</strong> $transportista_id</p>";
echo "<hr>";

// 1. Verificar solicitudes rechazadas (estado 'denegada')
echo "<h3>1. Solicitudes Rechazadas (Denegadas)</h3>";
$stmt = $conn->prepare("
    SELECT 
        id,
        viaje_id,
        transportista_id,
        estado,
        fecha_respuesta,
        motivo_denegacion,
        dias_bloqueo,
        fecha_desbloqueo,
        NOW() as fecha_actual,
        CASE 
            WHEN fecha_desbloqueo > NOW() THEN 'BLOQUEADO'
            ELSE 'DESBLOQUEADO'
        END as estado_bloqueo,
        DATEDIFF(fecha_desbloqueo, NOW()) as dias_restantes
    FROM solicitudes_viajes
    WHERE viaje_id = ? 
    AND transportista_id = ?
    AND estado = 'denegada'
    ORDER BY fecha_respuesta DESC
");
$stmt->execute([$viaje_id, $transportista_id]);
$rechazos = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (count($rechazos) > 0) {
    echo "<table border='1' cellpadding='5'>";
    echo "<tr>";
    echo "<th>ID</th>";
    echo "<th>Estado</th>";
    echo "<th>Fecha Respuesta</th>";
    echo "<th>Días Bloqueo</th>";
    echo "<th>Fecha Desbloqueo</th>";
    echo "<th>Fecha Actual</th>";
    echo "<th>Estado Bloqueo</th>";
    echo "<th>Días Restantes</th>";
    echo "<th>Motivo</th>";
    echo "</tr>";
    
    foreach ($rechazos as $r) {
        $color = $r['estado_bloqueo'] === 'BLOQUEADO' ? 'background: #fee2e2;' : 'background: #d1fae5;';
        echo "<tr style='$color'>";
        echo "<td>{$r['id']}</td>";
        echo "<td>{$r['estado']}</td>";
        echo "<td>{$r['fecha_respuesta']}</td>";
        echo "<td>{$r['dias_bloqueo']}</td>";
        echo "<td>{$r['fecha_desbloqueo']}</td>";
        echo "<td>{$r['fecha_actual']}</td>";
        echo "<td><strong>{$r['estado_bloqueo']}</strong></td>";
        echo "<td><strong>{$r['dias_restantes']}</strong></td>";
        echo "<td>{$r['motivo_denegacion']}</td>";
        echo "</tr>";
    }
    echo "</table>";
} else {
    echo "<p>❌ No hay solicitudes rechazadas para este viaje y transportista</p>";
}

// 2. Verificar solicitudes pendientes
echo "<h3>2. Solicitudes Pendientes</h3>";
$stmt = $conn->prepare("
    SELECT id, estado, fecha_solicitud
    FROM solicitudes_viajes
    WHERE viaje_id = ? AND estado = 'pendiente'
");
$stmt->execute([$viaje_id]);
$pendientes = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (count($pendientes) > 0) {
    echo "<table border='1' cellpadding='5'>";
    echo "<tr><th>ID</th><th>Estado</th><th>Fecha Solicitud</th></tr>";
    foreach ($pendientes as $p) {
        echo "<tr>";
        echo "<td>{$p['id']}</td>";
        echo "<td>{$p['estado']}</td>";
        echo "<td>{$p['fecha_solicitud']}</td>";
        echo "</tr>";
    }
    echo "</table>";
} else {
    echo "<p>✅ No hay solicitudes pendientes</p>";
}

// 3. Simular verificación de API
echo "<h3>3. Simulación de API verificar_solicitud.php</h3>";
$stmt = $conn->prepare("
    SELECT fecha_respuesta, motivo_denegacion, dias_bloqueo, fecha_desbloqueo
    FROM solicitudes_viajes
    WHERE viaje_id = ? 
    AND transportista_id = ? 
    AND estado = 'denegada'
    AND (fecha_desbloqueo IS NULL OR fecha_desbloqueo > NOW())
    ORDER BY fecha_respuesta DESC
    LIMIT 1
");
$stmt->execute([$viaje_id, $transportista_id]);
$rechazo = $stmt->fetch(PDO::FETCH_ASSOC);

if ($rechazo) {
    $fecha_actual = new DateTime();
    $fecha_desbloqueo = new DateTime($rechazo['fecha_desbloqueo']);
    
    if ($fecha_desbloqueo <= $fecha_actual) {
        echo "<p style='background: #d1fae5; padding: 10px;'>";
        echo "✅ <strong>NO BLOQUEADO</strong> - La fecha de desbloqueo ya pasó";
        echo "</p>";
    } else {
        $interval = $fecha_actual->diff($fecha_desbloqueo);
        $dias_restantes = $interval->days;
        if ($dias_restantes == 0) {
            $dias_restantes = 1;
        }
        
        echo "<p style='background: #fee2e2; padding: 10px;'>";
        echo "🔒 <strong>BLOQUEADO</strong><br>";
        echo "Días restantes: <strong>$dias_restantes</strong><br>";
        echo "Días bloqueo total: <strong>{$rechazo['dias_bloqueo']}</strong><br>";
        echo "Fecha desbloqueo: <strong>{$rechazo['fecha_desbloqueo']}</strong><br>";
        echo "Motivo: {$rechazo['motivo_denegacion']}";
        echo "</p>";
        
        echo "<h4>JSON que devolvería la API:</h4>";
        echo "<pre>";
        echo json_encode([
            'success' => true,
            'tiene_solicitud' => false,
            'bloqueado' => true,
            'dias_restantes' => $dias_restantes,
            'dias_bloqueo_total' => (int)$rechazo['dias_bloqueo'],
            'fecha_desbloqueo' => $rechazo['fecha_desbloqueo'],
            'motivo_rechazo' => $rechazo['motivo_denegacion']
        ], JSON_PRETTY_PRINT);
        echo "</pre>";
    }
} else {
    echo "<p style='background: #d1fae5; padding: 10px;'>";
    echo "✅ <strong>NO BLOQUEADO</strong> - No hay rechazos activos";
    echo "</p>";
}

// 4. Verificar estructura de tabla
echo "<h3>4. Estructura de Tabla solicitudes_viajes</h3>";
$stmt = $conn->query("DESCRIBE solicitudes_viajes");
$columns = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "<table border='1' cellpadding='5'>";
echo "<tr><th>Campo</th><th>Tipo</th><th>Null</th><th>Default</th></tr>";
foreach ($columns as $col) {
    echo "<tr>";
    echo "<td>{$col['Field']}</td>";
    echo "<td>{$col['Type']}</td>";
    echo "<td>{$col['Null']}</td>";
    echo "<td>{$col['Default']}</td>";
    echo "</tr>";
}
echo "</table>";

echo "<hr>";
echo "<p><a href='?viaje_id=$viaje_id&transportista_id=$transportista_id'>🔄 Recargar</a></p>";
?>
