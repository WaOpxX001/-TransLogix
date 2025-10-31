<?php
// Test script para verificar la API de viajes
session_start();

// Simular usuario logueado
$_SESSION['user_id'] = 1;
$_SESSION['role'] = 'admin';
$_SESSION['user_role'] = 'admin';

echo "<h2>🧪 Test API Viajes</h2>";

// Test 1: Verificar conexión a base de datos
echo "<h3>1. Test Conexión Base de Datos</h3>";
try {
    require_once 'config.php';
    $db = new Database();
    $conn = $db->getConnection();
    echo "✅ Conexión exitosa<br>";
} catch (Exception $e) {
    echo "❌ Error de conexión: " . $e->getMessage() . "<br>";
}

// Test 2: Verificar tabla viajes
echo "<h3>2. Test Tabla Viajes</h3>";
try {
    $stmt = $conn->query("DESCRIBE viajes");
    $columns = $stmt->fetchAll();
    echo "✅ Tabla viajes existe con " . count($columns) . " columnas:<br>";
    foreach ($columns as $col) {
        echo "- " . $col['Field'] . " (" . $col['Type'] . ")<br>";
    }
} catch (Exception $e) {
    echo "❌ Error tabla viajes: " . $e->getMessage() . "<br>";
}

// Test 3: Crear viaje de prueba
echo "<h3>3. Test Crear Viaje</h3>";
try {
    $testData = [
        'origen_estado' => 'Jalisco',
        'origen_municipio' => 'Guadalajara',
        'destino_estado' => 'Nuevo León',
        'destino_municipio' => 'Monterrey',
        'transportista_id' => 1,
        'vehiculo_id' => 1,
        'fecha_salida' => '2025-01-20T10:00',
        'descripcion' => 'Viaje de prueba'
    ];
    
    // Simular POST request
    $_POST = $testData;
    
    // Generar número de viaje
    $stmt = $conn->query("SELECT COUNT(*) as total FROM viajes");
    $count = $stmt->fetch()['total'];
    $numero_viaje = 'VJ-' . str_pad($count + 1, 3, '0', STR_PAD_LEFT);
    
    // Insertar viaje
    $sql = "INSERT INTO viajes (
                numero_viaje, 
                origen_estado, 
                origen_municipio, 
                destino_estado, 
                destino_municipio, 
                transportista_id, 
                vehiculo_id, 
                fecha_programada, 
                hora_programada, 
                observaciones,
                estado
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente')";
    
    $fecha_hora = new DateTime($testData['fecha_salida']);
    $fecha_programada = $fecha_hora->format('Y-m-d');
    $hora_programada = $fecha_hora->format('H:i:s');
    
    $stmt = $conn->prepare($sql);
    $result = $stmt->execute([
        $numero_viaje,
        $testData['origen_estado'],
        $testData['origen_municipio'],
        $testData['destino_estado'],
        $testData['destino_municipio'],
        $testData['transportista_id'],
        $testData['vehiculo_id'],
        $fecha_programada,
        $hora_programada,
        $testData['descripcion']
    ]);
    
    if ($result) {
        $viaje_id = $conn->lastInsertId();
        echo "✅ Viaje creado exitosamente - ID: $viaje_id, Número: $numero_viaje<br>";
    } else {
        echo "❌ Error al crear viaje<br>";
    }
    
} catch (Exception $e) {
    echo "❌ Error creando viaje: " . $e->getMessage() . "<br>";
}

// Test 4: Listar viajes
echo "<h3>4. Test Listar Viajes</h3>";
try {
    $stmt = $conn->query("SELECT * FROM viajes ORDER BY id DESC LIMIT 5");
    $viajes = $stmt->fetchAll();
    echo "✅ Encontrados " . count($viajes) . " viajes:<br>";
    foreach ($viajes as $viaje) {
        echo "- ID: {$viaje['id']}, Número: {$viaje['numero_viaje']}, Estado: {$viaje['estado']}<br>";
    }
} catch (Exception $e) {
    echo "❌ Error listando viajes: " . $e->getMessage() . "<br>";
}

// Test 5: Test API endpoint
echo "<h3>5. Test API Endpoint</h3>";
echo "<a href='api/viajes/list.php' target='_blank'>🔗 Test api/viajes/list.php</a><br>";
echo "<a href='api/dashboard/data.php' target='_blank'>🔗 Test api/dashboard/data.php</a><br>";

?>
