<?php
// Check vehiculos and usuarios table structures
echo "<h2>Diagnóstico de Columnas</h2>";

try {
    $pdo = new PDO(
        "mysql:host=localhost;dbname=transporte_pro;charset=utf8mb4",
        "root",
        "",
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    
    echo "<h3>Estructura tabla VEHICULOS:</h3>";
    $stmt = $pdo->query("DESCRIBE vehiculos");
    echo "<table border='1'>";
    echo "<tr><th>Campo</th><th>Tipo</th><th>Null</th><th>Key</th><th>Default</th></tr>";
    while ($row = $stmt->fetch()) {
        echo "<tr><td>{$row['Field']}</td><td>{$row['Type']}</td><td>{$row['Null']}</td><td>{$row['Key']}</td><td>{$row['Default']}</td></tr>";
        echo "<td>" . $column['Key'] . "</td>";
        echo "<td>" . $column['Default'] . "</td>";
        echo "<td>" . $column['Extra'] . "</td>";
        echo "</tr>";
    }
    echo "</table>";
    
    echo "<h3>Datos de ejemplo:</h3>";
    $stmt = $pdo->query("SELECT * FROM vehiculos LIMIT 3");
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if ($data) {
        echo "<pre>" . print_r($data, true) . "</pre>";
    } else {
        echo "No hay datos en la tabla vehiculos";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
