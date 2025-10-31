<?php
/**
 * Script de optimización de base de datos para TransLogix
 * Aplica índices y optimizaciones para mejorar el rendimiento
 */

require_once 'config.php';

echo "🚀 Iniciando optimización de base de datos TransLogix...\n\n";

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    // Leer archivo de optimización SQL
    $sqlFile = 'sql/optimize_indexes.sql';
    if (!file_exists($sqlFile)) {
        throw new Exception("Archivo SQL no encontrado: $sqlFile");
    }
    
    $sql = file_get_contents($sqlFile);
    $statements = explode(';', $sql);
    
    $executed = 0;
    $errors = 0;
    
    foreach ($statements as $statement) {
        $statement = trim($statement);
        if (empty($statement) || strpos($statement, '--') === 0) {
            continue;
        }
        
        try {
            $conn->exec($statement);
            $executed++;
            echo "✅ Ejecutado: " . substr($statement, 0, 50) . "...\n";
        } catch (PDOException $e) {
            $errors++;
            echo "⚠️ Error: " . $e->getMessage() . "\n";
        }
    }
    
    echo "\n📊 Resumen de optimización:\n";
    echo "- Statements ejecutados: $executed\n";
    echo "- Errores: $errors\n";
    
    // Verificar tamaño de tablas
    echo "\n📈 Estadísticas de tablas:\n";
    $tables = ['gastos', 'viajes', 'vehiculos', 'usuarios'];
    
    foreach ($tables as $table) {
        $stmt = $conn->query("SELECT COUNT(*) as count FROM $table");
        $count = $stmt->fetch()['count'];
        echo "- $table: $count registros\n";
    }
    
    // Verificar índices creados
    echo "\n🔍 Índices verificados:\n";
    $stmt = $conn->query("SHOW INDEX FROM gastos WHERE Key_name LIKE 'idx_%'");
    $indexes = $stmt->fetchAll();
    echo "- Gastos: " . count($indexes) . " índices optimizados\n";
    
    $stmt = $conn->query("SHOW INDEX FROM viajes WHERE Key_name LIKE 'idx_%'");
    $indexes = $stmt->fetchAll();
    echo "- Viajes: " . count($indexes) . " índices optimizados\n";
    
    echo "\n🎉 Optimización completada exitosamente!\n";
    echo "💡 La plataforma debería ser notablemente más rápida ahora.\n";
    
} catch (Exception $e) {
    echo "❌ Error durante la optimización: " . $e->getMessage() . "\n";
    exit(1);
}
?>
