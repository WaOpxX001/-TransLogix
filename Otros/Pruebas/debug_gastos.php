<?php
require_once 'config.php';

$db = new Database();
$conn = $db->getConnection();

echo "<h2>Debug - Gastos en Base de Datos</h2>";

// Ver todos los gastos
$query = "SELECT id, fecha, estado, monto, tipo, MONTH(fecha) as mes, YEAR(fecha) as año FROM gastos ORDER BY fecha DESC";
$stmt = $conn->prepare($query);
$stmt->execute();
$gastos = $stmt->fetchAll();

echo "<h3>Todos los gastos:</h3>";
echo "<table border='1'>";
echo "<tr><th>ID</th><th>Fecha</th><th>Estado</th><th>Monto</th><th>Tipo</th><th>Mes</th><th>Año</th></tr>";
foreach ($gastos as $gasto) {
    echo "<tr>";
    echo "<td>{$gasto['id']}</td>";
    echo "<td>{$gasto['fecha']}</td>";
    echo "<td>{$gasto['estado']}</td>";
    echo "<td>\${$gasto['monto']}</td>";
    echo "<td>{$gasto['tipo']}</td>";
    echo "<td>{$gasto['mes']}</td>";
    echo "<td>{$gasto['año']}</td>";
    echo "</tr>";
}
echo "</table>";

// Estadísticas por mes
echo "<h3>Estadísticas por mes:</h3>";
$statsQuery = "SELECT 
    MONTH(fecha) as mes,
    YEAR(fecha) as año,
    COUNT(*) as total,
    COUNT(CASE WHEN estado = 'aprobado' THEN 1 END) as aprobados,
    COUNT(CASE WHEN estado = 'rechazado' THEN 1 END) as rechazados,
    COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as pendientes,
    SUM(monto) as total_monto
    FROM gastos 
    GROUP BY YEAR(fecha), MONTH(fecha)
    ORDER BY año DESC, mes DESC";

$stmt = $conn->prepare($statsQuery);
$stmt->execute();
$stats = $stmt->fetchAll();

echo "<table border='1'>";
echo "<tr><th>Mes</th><th>Año</th><th>Total</th><th>Aprobados</th><th>Rechazados</th><th>Pendientes</th><th>Monto Total</th></tr>";
foreach ($stats as $stat) {
    echo "<tr>";
    echo "<td>{$stat['mes']}</td>";
    echo "<td>{$stat['año']}</td>";
    echo "<td>{$stat['total']}</td>";
    echo "<td>{$stat['aprobados']}</td>";
    echo "<td>{$stat['rechazados']}</td>";
    echo "<td>{$stat['pendientes']}</td>";
    echo "<td>\${$stat['total_monto']}</td>";
    echo "</tr>";
}
echo "</table>";

// Mes actual
echo "<h3>Mes actual (octubre 2025):</h3>";
$currentQuery = "SELECT 
    COUNT(*) as total,
    COUNT(CASE WHEN estado = 'aprobado' THEN 1 END) as aprobados,
    COUNT(CASE WHEN estado = 'rechazado' THEN 1 END) as rechazados,
    COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as pendientes,
    SUM(monto) as total_monto
    FROM gastos 
    WHERE MONTH(fecha) = MONTH(CURRENT_DATE()) AND YEAR(fecha) = YEAR(CURRENT_DATE())";

$stmt = $conn->prepare($currentQuery);
$stmt->execute();
$current = $stmt->fetch();

echo "<p><strong>Total gastos octubre 2025:</strong> {$current['total']}</p>";
echo "<p><strong>Aprobados:</strong> {$current['aprobados']}</p>";
echo "<p><strong>Rechazados:</strong> {$current['rechazados']}</p>";
echo "<p><strong>Pendientes:</strong> {$current['pendientes']}</p>";
echo "<p><strong>Monto total:</strong> \${$current['total_monto']}</p>";

echo "<p><strong>Fecha actual:</strong> " . date('Y-m-d') . "</p>";
echo "<p><strong>Mes actual:</strong> " . date('m') . "</p>";
echo "<p><strong>Año actual:</strong> " . date('Y') . "</p>";
?>
