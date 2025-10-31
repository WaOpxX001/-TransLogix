<?php
session_start();

header('Content-Type: application/json');

// Simular login como transportista para pruebas
if (isset($_GET['simulate']) && $_GET['simulate'] === 'transportista') {
    require_once 'config.php';
    
    try {
        $db = new Database();
        $conn = $db->getConnection();
        
        // Buscar un usuario transportista
        $stmt = $conn->prepare("SELECT id, nombre, email, rol FROM usuarios WHERE rol = 'transportista' AND activo = 1 LIMIT 1");
        $stmt->execute();
        $transportista = $stmt->fetch();
        
        if ($transportista) {
            $_SESSION['user_id'] = $transportista['id'];
            $_SESSION['user_role'] = $transportista['rol'];
            $_SESSION['role'] = $transportista['rol'];
            $_SESSION['username'] = $transportista['nombre'];
            
            echo json_encode([
                'success' => true,
                'message' => 'Sesión simulada como transportista',
                'user' => $transportista,
                'session' => $_SESSION
            ], JSON_PRETTY_PRINT);
        } else {
            echo json_encode([
                'error' => 'No se encontró ningún transportista en la base de datos'
            ]);
        }
        
    } catch (Exception $e) {
        echo json_encode([
            'error' => 'Error simulando sesión: ' . $e->getMessage()
        ]);
    }
    
    exit;
}

// Mostrar información actual
$user_role = $_SESSION['user_role'] ?? $_SESSION['role'] ?? '';

echo json_encode([
    'current_session' => $_SESSION,
    'user_role' => $user_role,
    'is_transportista' => $user_role === 'transportista',
    'restrictions' => [
        'can_create_viajes' => in_array($user_role, ['admin', 'supervisor', 'transportista']),
        'can_edit_viajes' => in_array($user_role, ['admin', 'supervisor']),
        'can_delete_viajes' => in_array($user_role, ['admin', 'supervisor']),
        'sees_only_own_viajes' => $user_role === 'transportista'
    ],
    'ui_changes_for_transportista_only' => [
        'hide_nuevo_viaje_button' => $user_role === 'transportista',
        'hide_transportista_filter' => $user_role === 'transportista', 
        'hide_edit_delete_buttons' => $user_role === 'transportista',
        'show_only_details_button' => $user_role === 'transportista',
        'title_changes_to' => $user_role === 'transportista' ? 'Mis Viajes Asignados' : 'Gestión de Viajes'
    ],
    'admin_supervisor_see_everything' => [
        'all_buttons_visible' => in_array($user_role, ['admin', 'supervisor']),
        'all_filters_visible' => in_array($user_role, ['admin', 'supervisor']),
        'all_viajes_visible' => in_array($user_role, ['admin', 'supervisor']),
        'can_create_edit_delete' => in_array($user_role, ['admin', 'supervisor'])
    ],
    'simulate_url' => $_SERVER['REQUEST_URI'] . '?simulate=transportista'
], JSON_PRETTY_PRINT);
?>
