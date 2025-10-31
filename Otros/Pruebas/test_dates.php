<?php
// Test script to check date filtering
header('Content-Type: text/html');
require_once 'config.php';

try {
    $db = new Database();
    $conn = $db->getConnection();

    echo "<h2>Testing Date Filter</h2>";

    // Check what data exists in gastos table
    $query = "SELECT fecha, COUNT(*) as count FROM gastos GROUP BY fecha ORDER BY fecha DESC LIMIT 20";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    $dates = $stmt->fetchAll();

    echo "<h3>Available dates in gastos table (last 20):</h3>";
    echo "<ul>";
    foreach ($dates as $date) {
        echo "<li>Date: " . $date['fecha'] . " - Count: " . $date['count'] . "</li>";
    }
    echo "</ul>";

    // Test with actual date range from the user's data
    $start_date = '2025-08-31';
    $end_date = '2025-09-29';
    
    echo "<h3>Testing filter from $start_date to $end_date:</h3>";
    
    // Also test what the API is actually receiving
    echo "<h4>Testing API call simulation:</h4>";
    $_GET['start_date'] = $start_date;
    $_GET['end_date'] = $end_date;
    $_GET['format'] = 'json';
    
    echo "<p>Simulating API call with start_date=$start_date, end_date=$end_date</p>";

    // Test the actual filter query
    $query = "SELECT g.id, g.tipo, g.monto, g.fecha, g.descripcion, g.numero_factura, g.estado,
                     u.nombre as usuario_nombre, v.placa as vehiculo_placa, g.litros, g.kilometraje
             FROM gastos g 
             LEFT JOIN usuarios u ON g.usuario_id = u.id 
             LEFT JOIN vehiculos v ON g.vehiculo_id = v.id 
             WHERE g.fecha >= ? AND g.fecha <= ?
             ORDER BY g.fecha DESC";

    $params = [$start_date, $end_date];
    $stmt = $conn->prepare($query);
    $stmt->execute($params);
    $data = $stmt->fetchAll();

    echo "<p>Found " . count($data) . " records (showing all)</p>";
    
    echo "<table border='1'>";
    echo "<tr><th>ID</th><th>Date</th><th>Type</th><th>Amount</th><th>User</th><th>Vehicle</th></tr>";
    foreach ($data as $row) {
        echo "<tr>";
        echo "<td>" . $row['id'] . "</td>";
        echo "<td>" . $row['fecha'] . "</td>";
        echo "<td>" . $row['tipo'] . "</td>";
        echo "<td>$" . $row['monto'] . "</td>";
        echo "<td>" . ($row['usuario_nombre'] ?? 'N/A') . "</td>";
        echo "<td>" . ($row['vehiculo_placa'] ?? 'N/A') . "</td>";
        echo "</tr>";
    }
    echo "</table>";

} catch (Exception $e) {
    echo "<p>Error: " . $e->getMessage() . "</p>";
}
?>
