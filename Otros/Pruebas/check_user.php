<?php
session_start();
header('Content-Type: application/json');

$response = [
    'session_active' => isset($_SESSION['user_id']),
    'user_id' => $_SESSION['user_id'] ?? null,
    'user_role' => $_SESSION['rol'] ?? null,
    'session_data' => $_SESSION
];

echo json_encode($response, JSON_PRETTY_PRINT);
?>
