<?php
// Check table structures and diagnose SQL errors
echo "<h2>Diagnóstico de Tablas</h2>";

try {
    $pdo = new PDO(
        "mysql:host=localhost;dbname=transporte_pro;charset=utf8mb4",
        "root",
        "",
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    
    echo "<h3>✅ Conexión exitosa</h3>";
    
    // Check if tables exist
    echo "<h3>Tablas existentes:</h3>";
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "<ul>";
    foreach ($tables as $table) {
        echo "<li>$table</li>";
    }
    echo "</ul>";
    
    // Check usuarios structure
    echo "<h3>Estructura tabla USUARIOS:</h3>";
    try {
        $stmt = $pdo->query("DESCRIBE usuarios");
        echo "<table border='1'>";
        echo "<tr><th>Campo</th><th>Tipo</th><th>Null</th><th>Key</th><th>Default</th></tr>";
        while ($row = $stmt->fetch()) {
            echo "<tr><td>{$row['Field']}</td><td>{$row['Type']}</td><td>{$row['Null']}</td><td>{$row['Key']}</td><td>{$row['Default']}</td></tr>";
        }
        echo "</table>";
    } catch (Exception $e) {
        echo "<p style='color: red;'>❌ Error: " . $e->getMessage() . "</p>";
    }
    
    // Check vehiculos structure
    echo "<h3>Estructura tabla VEHICULOS:</h3>";
    try {
        $stmt = $pdo->query("DESCRIBE vehiculos");
        echo "<table border='1'>";
        echo "<tr><th>Campo</th><th>Tipo</th><th>Null</th><th>Key</th><th>Default</th></tr>";
        while ($row = $stmt->fetch()) {
            echo "<tr><td>{$row['Field']}</td><td>{$row['Type']}</td><td>{$row['Null']}</td><td>{$row['Key']}</td><td>{$row['Default']}</td></tr>";
        }
        echo "</table>";
    } catch (Exception $e) {
        echo "<p style='color: red;'>❌ Error: " . $e->getMessage() . "</p>";
    }
    
    // Check viajes structure
    echo "<h3>Estructura tabla VIAJES:</h3>";
    try {
        $stmt = $pdo->query("DESCRIBE viajes");
        echo "<table border='1'>";
        echo "<tr><th>Campo</th><th>Tipo</th><th>Null</th><th>Key</th><th>Default</th></tr>";
        while ($row = $stmt->fetch()) {
            echo "<tr><td>{$row['Field']}</td><td>{$row['Type']}</td><td>{$row['Null']}</td><td>{$row['Key']}</td><td>{$row['Default']}</td></tr>";
        }
        echo "</table>";
    } catch (Exception $e) {
        echo "<p style='color: red;'>❌ Tabla viajes no existe: " . $e->getMessage() . "</p>";
    }
    
} catch (PDOException $e) {
    echo "<h3 style='color: red;'>❌ Error de conexión: " . $e->getMessage() . "</h3>";
}
?>
