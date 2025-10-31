<?php
// Test completo del sistema de viajes
echo "<h2>🔧 Diagnóstico Completo - Sistema de Viajes</h2>";

try {
    $pdo = new PDO(
        "mysql:host=localhost;dbname=transporte_pro;charset=utf8mb4",
        "root",
        "",
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    
    echo "<h3>✅ Conexión a BD exitosa</h3>";
    
    // Test API transportistas
    echo "<h3>🚛 Test API Transportistas</h3>";
    session_start();
    $_SESSION['user_id'] = 1; // Simular usuario logueado
    $_SESSION['user_role'] = 'admin';
    
    try {
        $sql = "SELECT id, nombre, email, telefono, licencia, rol, activo FROM usuarios WHERE rol = 'transportista' ORDER BY nombre";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        $transportistas = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo "<p>✅ Query transportistas exitosa: " . count($transportistas) . " encontrados</p>";
        if ($transportistas) {
            echo "<table border='1'>";
            echo "<tr><th>ID</th><th>Nombre</th><th>Email</th><th>Teléfono</th><th>Licencia</th></tr>";
            foreach (array_slice($transportistas, 0, 3) as $t) {
                echo "<tr>";
                echo "<td>" . $t['id'] . "</td>";
                echo "<td>" . $t['nombre'] . "</td>";
                echo "<td>" . $t['email'] . "</td>";
                echo "<td>" . ($t['telefono'] ?? 'NULL') . "</td>";
                echo "<td>" . ($t['licencia'] ?? 'NULL') . "</td>";
                echo "</tr>";
            }
            echo "</table>";
        }
    } catch (Exception $e) {
        echo "<p style='color: red;'>❌ Error transportistas: " . $e->getMessage() . "</p>";
    }
    
    // Test API vehículos
    echo "<h3>🚚 Test API Vehículos</h3>";
    try {
        $sql = "SELECT id, marca, modelo, placa, estado FROM vehiculos ORDER BY marca, modelo";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        $vehiculos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo "<p>✅ Query vehículos exitosa: " . count($vehiculos) . " encontrados</p>";
        if ($vehiculos) {
            echo "<table border='1'>";
            echo "<tr><th>ID</th><th>Marca</th><th>Modelo</th><th>Placa</th><th>Estado</th></tr>";
            foreach (array_slice($vehiculos, 0, 3) as $v) {
                echo "<tr>";
                echo "<td>" . $v['id'] . "</td>";
                echo "<td>" . $v['marca'] . "</td>";
                echo "<td>" . $v['modelo'] . "</td>";
                echo "<td>" . $v['placa'] . "</td>";
                echo "<td>" . $v['estado'] . "</td>";
                echo "</tr>";
            }
            echo "</table>";
        }
    } catch (Exception $e) {
        echo "<p style='color: red;'>❌ Error vehículos: " . $e->getMessage() . "</p>";
    }
    
    // Test estructura tabla viajes
    echo "<h3>📋 Estructura Tabla Viajes</h3>";
    try {
        $stmt = $pdo->query("DESCRIBE viajes");
        echo "<table border='1'>";
        echo "<tr><th>Campo</th><th>Tipo</th><th>Null</th><th>Key</th><th>Default</th></tr>";
        while ($row = $stmt->fetch()) {
            echo "<tr><td>{$row['Field']}</td><td>{$row['Type']}</td><td>{$row['Null']}</td><td>{$row['Key']}</td><td>{$row['Default']}</td></tr>";
        }
        echo "</table>";
    } catch (Exception $e) {
        echo "<p style='color: red;'>❌ Error estructura viajes: " . $e->getMessage() . "</p>";
    }
    
    // Test API viajes
    echo "<h3>📋 Test API Viajes</h3>";
    try {
        $sql = "SELECT v.*, 
                       u.nombre as transportista_nombre,
                       vh.placa as vehiculo_placa,
                       vh.marca as vehiculo_marca,
                       vh.modelo as vehiculo_modelo
                FROM viajes v
                LEFT JOIN usuarios u ON v.transportista_id = u.id
                LEFT JOIN vehiculos vh ON v.vehiculo_id = vh.id
                ORDER BY v.id DESC";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        $viajes = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo "<p>✅ Query viajes exitosa: " . count($viajes) . " encontrados</p>";
        if ($viajes) {
            echo "<table border='1'>";
            echo "<tr><th>ID</th><th>Origen</th><th>Destino</th><th>Transportista</th><th>Vehículo</th><th>Estado</th></tr>";
            foreach (array_slice($viajes, 0, 3) as $v) {
                echo "<tr>";
                echo "<td>" . $v['id'] . "</td>";
                echo "<td>" . ($v['origen_estado'] ?? '') . " " . ($v['origen_municipio'] ?? '') . "</td>";
                echo "<td>" . ($v['destino_estado'] ?? '') . " " . ($v['destino_municipio'] ?? '') . "</td>";
                echo "<td>" . ($v['transportista_nombre'] ?? 'NULL') . "</td>";
                echo "<td>" . ($v['vehiculo_placa'] ?? 'NULL') . "</td>";
                echo "<td>" . $v['estado'] . "</td>";
                echo "</tr>";
            }
            echo "</table>";
        } else {
            echo "<p style='color: orange;'>⚠️ No hay viajes en la base de datos</p>";
        }
    } catch (Exception $e) {
        echo "<p style='color: red;'>❌ Error viajes: " . $e->getMessage() . "</p>";
    }
    
    // Test directo de APIs
    echo "<h3>🌐 Test APIs Directas</h3>";
    
    echo "<p><strong>Test transportistas API:</strong></p>";
    $url1 = "http://localhost/LogisticaFinal/api/transportistas/list.php";
    echo "<a href='$url1' target='_blank'>$url1</a><br>";
    
    echo "<p><strong>Test vehículos API:</strong></p>";
    $url2 = "http://localhost/LogisticaFinal/api/vehiculos/list.php";
    echo "<a href='$url2' target='_blank'>$url2</a><br>";
    
    echo "<p><strong>Test viajes API:</strong></p>";
    $url3 = "http://localhost/LogisticaFinal/api/viajes/list.php";
    echo "<a href='$url3' target='_blank'>$url3</a><br>";
    
} catch (PDOException $e) {
    echo "<h3 style='color: red;'>❌ Error de conexión: " . $e->getMessage() . "</h3>";
}

echo "<hr>";
echo "<h3>🔧 Instrucciones de Prueba</h3>";
echo "<ol>";
echo "<li>Haz clic en los enlaces de APIs arriba para verificar que devuelven JSON válido</li>";
echo "<li>Ve a la pestaña de viajes y abre la consola del navegador (F12)</li>";
echo "<li>Haz clic en 'Nuevo Viaje' y revisa los mensajes de consola</li>";
echo "<li>Si no funciona, ejecuta en consola: <code>window.ViajesManager.showCreateModal()</code></li>";
echo "</ol>";
?>
