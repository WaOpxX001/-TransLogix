<?php
session_start();

header('Content-Type: application/json');

// Verificar si el usuario está logueado
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'error' => 'No hay sesión activa',
        'action' => 'Por favor, inicia sesión nuevamente'
    ]);
    exit;
}

// Obtener información del usuario desde la base de datos
require_once 'config.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    $stmt = $conn->prepare("SELECT id, nombre, email, rol FROM usuarios WHERE id = ? AND activo = 1");
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch();
    
    if (!$user) {
        echo json_encode([
            'error' => 'Usuario no encontrado en la base de datos',
            'user_id' => $_SESSION['user_id']
        ]);
        exit;
    }
    
    // Corregir las variables de sesión
    $_SESSION['user_role'] = $user['rol'];
    $_SESSION['role'] = $user['rol']; // Mantener ambas por compatibilidad
    $_SESSION['username'] = $user['nombre'];
    
    echo json_encode([
        'success' => true,
        'message' => 'Sesión corregida exitosamente',
        'user_data' => [
            'id' => $user['id'],
            'nombre' => $user['nombre'],
            'email' => $user['email'],
            'rol' => $user['rol']
        ],
        'session_before' => [
            'user_role_before' => $_SESSION['user_role'] ?? 'No definido',
            'role_before' => $_SESSION['role'] ?? 'No definido'
        ],
        'session_after' => [
            'user_role' => $_SESSION['user_role'],
            'role' => $_SESSION['role'],
            'can_edit_viajes' => in_array($_SESSION['user_role'], ['admin', 'supervisor'])
        ]
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo json_encode([
        'error' => 'Error al corregir la sesión: ' . $e->getMessage()
    ]);
}
?>
