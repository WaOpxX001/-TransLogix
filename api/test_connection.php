<?php
// Test database connection
header('Content-Type: application/json');

// Show environment variables (for debugging)
$env_vars = [
    'MYSQLHOST' => $_ENV['MYSQLHOST'] ?? $_SERVER['MYSQLHOST'] ?? getenv('MYSQLHOST') ?: 'NOT SET',
    'MYSQLDATABASE' => $_ENV['MYSQLDATABASE'] ?? $_SERVER['MYSQLDATABASE'] ?? getenv('MYSQLDATABASE') ?: 'NOT SET',
    'MYSQLUSER' => $_ENV['MYSQLUSER'] ?? $_SERVER['MYSQLUSER'] ?? getenv('MYSQLUSER') ?: 'NOT SET',
    'MYSQLPORT' => $_ENV['MYSQLPORT'] ?? $_SERVER['MYSQLPORT'] ?? getenv('MYSQLPORT') ?: 'NOT SET',
    'MYSQLPASSWORD' => '***HIDDEN***'
];

try {
    require_once __DIR__ . '/config.php';
    
    // Test query
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM usuarios");
    $result = $stmt->fetch();
    
    echo json_encode([
        'success' => true,
        'message' => 'Database connection successful',
        'environment' => $env_vars,
        'users_count' => $result['count']
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'environment' => $env_vars
    ]);
}
?>
