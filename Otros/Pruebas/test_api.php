<?php
// Test API dashboard
echo "<h2>Testing Dashboard API</h2>";

// Simular sesión
session_start();
$_SESSION['user_id'] = 1;
$_SESSION['rol'] = 'administrador';

echo "<p>Session user_id: " . $_SESSION['user_id'] . "</p>";
echo "<p>Session rol: " . $_SESSION['rol'] . "</p>";

echo "<h3>Calling API...</h3>";

// Llamar a la API
$url = 'http://localhost/LogisticaFinal/api/dashboard/data.php';
$context = stream_context_create([
    'http' => [
        'method' => 'GET',
        'header' => [
            'Cookie: ' . session_name() . '=' . session_id()
        ]
    ]
]);

$response = file_get_contents($url, false, $context);

echo "<h3>Response:</h3>";
echo "<pre>" . htmlspecialchars($response) . "</pre>";

if ($response === false) {
    echo "<p style='color: red;'>Error: No se pudo obtener respuesta de la API</p>";
} else {
    $data = json_decode($response, true);
    if ($data === null) {
        echo "<p style='color: red;'>Error: La respuesta no es JSON válido</p>";
        echo "<p>JSON Error: " . json_last_error_msg() . "</p>";
    } else {
        echo "<p style='color: green;'>✅ API funcionando correctamente</p>";
        echo "<h3>Datos recibidos:</h3>";
        echo "<pre>" . print_r($data, true) . "</pre>";
    }
}
?>
