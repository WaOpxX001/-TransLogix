<?php
// Test database connection and table structure
try {
    $pdo = new PDO(
        "mysql:host=localhost;dbname=transporte_pro;charset=utf8mb4",
        "root",
        "",
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
    
    echo "✅ Database connection successful\n\n";
    
    // Check if tables exist
    $tables = ['usuarios', 'vehiculos'];
    
    foreach ($tables as $table) {
        try {
            $stmt = $pdo->query("DESCRIBE $table");
            echo "✅ Table '$table' exists:\n";
            while ($row = $stmt->fetch()) {
                echo "  - {$row['Field']} ({$row['Type']})\n";
            }
            echo "\n";
        } catch (PDOException $e) {
            echo "❌ Table '$table' does not exist or error: " . $e->getMessage() . "\n\n";
        }
    }
    
    // Test data in tables
    foreach ($tables as $table) {
        try {
            $stmt = $pdo->query("SELECT COUNT(*) as count FROM $table");
            $result = $stmt->fetch();
            echo "📊 Table '$table' has {$result['count']} records\n";
            
            // Show first few records
            $stmt = $pdo->query("SELECT * FROM $table LIMIT 3");
            while ($row = $stmt->fetch()) {
                echo "  Sample record: " . json_encode($row) . "\n";
            }
            echo "\n";
        } catch (PDOException $e) {
            echo "❌ Error querying table '$table': " . $e->getMessage() . "\n\n";
        }
    }
    
} catch (PDOException $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "\n";
}
?>
