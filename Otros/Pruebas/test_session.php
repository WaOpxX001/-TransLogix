<?php
session_start();

header('Content-Type: application/json');

$user_role = $_SESSION['user_role'] ?? $_SESSION['role'] ?? '';

echo json_encode([
    'session_data' => $_SESSION,
    'user_id' => $_SESSION['user_id'] ?? 'No definido',
    'role' => $_SESSION['role'] ?? 'No definido',
    'user_role' => $_SESSION['user_role'] ?? 'No definido',
    'effective_role' => $user_role,
    'username' => $_SESSION['username'] ?? 'No definido',
    'session_id' => session_id(),
    'is_admin' => $user_role === 'admin',
    'is_supervisor' => $user_role === 'supervisor',
    'can_edit_viajes' => in_array($user_role, ['admin', 'supervisor']),
    'session_keys' => array_keys($_SESSION)
], JSON_PRETTY_PRINT);
?>
