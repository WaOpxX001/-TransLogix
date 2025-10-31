<?php
session_start();

header('Content-Type: application/json');

$debug_info = [
    'timestamp' => date('Y-m-d H:i:s'),
    'session_status' => session_status(),
    'session_id' => session_id(),
    'session_data' => $_SESSION,
    'php_version' => phpversion(),
    'server_info' => [
        'REQUEST_METHOD' => $_SERVER['REQUEST_METHOD'] ?? 'N/A',
        'HTTP_HOST' => $_SERVER['HTTP_HOST'] ?? 'N/A',
        'REQUEST_URI' => $_SERVER['REQUEST_URI'] ?? 'N/A'
    ]
];

// Verificar conexión a base de datos
try {
    require_once 'config.php';
    $db = new Database();
    $conn = $db->getConnection();
    
    $debug_info['database'] = [
        'connection' => 'OK',
        'pdo_available' => class_exists('PDO')
    ];
    
    // Verificar usuario actual
    if (isset($_SESSION['user_id'])) {
        $stmt = $conn->prepare("SELECT id, nombre, email, rol, activo FROM usuarios WHERE id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch();
        
        $debug_info['current_user'] = $user ?: 'Usuario no encontrado';
        
        // Verificar permisos
        $user_role = $_SESSION['user_role'] ?? $_SESSION['role'] ?? '';
        $debug_info['permissions'] = [
            'effective_role' => $user_role,
            'can_create_viajes' => in_array($user_role, ['admin', 'supervisor', 'transportista']),
            'can_edit_viajes' => in_array($user_role, ['admin', 'supervisor']),
            'can_delete_viajes' => in_array($user_role, ['admin', 'supervisor'])
        ];
    } else {
        $debug_info['current_user'] = 'No hay sesión activa';
        $debug_info['permissions'] = 'No disponible - sin sesión';
    }
    
} catch (Exception $e) {
    $debug_info['database'] = [
        'connection' => 'ERROR',
        'error' => $e->getMessage()
    ];
}

// Verificar archivos críticos
$critical_files = [
    'config.php',
    'api/viajes/create.php',
    'api/viajes/update.php',
    'api/viajes/delete.php',
    'api/viajes/list.php',
    'api/auth/login.php'
];

$debug_info['files'] = [];
foreach ($critical_files as $file) {
    $debug_info['files'][$file] = file_exists($file) ? 'EXISTS' : 'MISSING';
}

echo json_encode($debug_info, JSON_PRETTY_PRINT);
?>
