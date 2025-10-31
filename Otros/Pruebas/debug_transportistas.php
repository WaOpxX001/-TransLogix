<?php
// Script de diagnóstico para transportistas
session_start();

echo "<h2>Diagnóstico de Transportistas</h2>";

// Verificar sesión
echo "<h3>1. Estado de la sesión:</h3>";
echo "<pre>";
print_r($_SESSION);
echo "</pre>";

// Conectar a la base de datos
try {
    $pdo = new PDO(
        "mysql:host=localhost;dbname=transporte_pro;charset=utf8mb4",
        "root",
        "",
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    echo "<h3>2. ✅ Conexión a BD exitosa</h3>";
    
    // Verificar tabla usuarios
    echo "<h3>3. Estructura de tabla usuarios:</h3>";
    $stmt = $pdo->query("DESCRIBE usuarios");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "<table border='1'>";
    echo "<tr><th>Campo</th><th>Tipo</th></tr>";
    foreach ($columns as $column) {
        echo "<tr><td>" . $column['Field'] . "</td><td>" . $column['Type'] . "</td></tr>";
    }
    echo "</table>";
    
    // Verificar datos de transportistas
    echo "<h3>4. Transportistas en la BD:</h3>";
    $stmt = $pdo->query("SELECT id, nombre, apellido, email, rol, estado, activo FROM usuarios WHERE rol = 'transportista'");
    $transportistas = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if ($transportistas) {
        echo "<table border='1'>";
        echo "<tr><th>ID</th><th>Nombre</th><th>Apellido</th><th>Email</th><th>Rol</th><th>Estado</th><th>Activo</th></tr>";
        foreach ($transportistas as $t) {
            echo "<tr>";
            echo "<td>" . $t['id'] . "</td>";
            echo "<td>" . $t['nombre'] . "</td>";
            echo "<td>" . $t['apellido'] . "</td>";
            echo "<td>" . $t['email'] . "</td>";
            echo "<td>" . $t['rol'] . "</td>";
            echo "<td>" . ($t['estado'] ?? 'NULL') . "</td>";
            echo "<td>" . ($t['activo'] ?? 'NULL') . "</td>";
            echo "</tr>";
        }
        echo "</table>";
    } else {
        echo "<p style='color: red;'>❌ No se encontraron transportistas</p>";
    }
    
    // Probar la consulta de la API
    echo "<h3>5. Consulta de la API:</h3>";
    $sql = "SELECT id, nombre, apellido, email, telefono, licencia, estado, activo, fecha_registro 
            FROM usuarios 
            WHERE rol = 'transportista' AND (activo = 1 OR estado = 'activo')
            ORDER BY nombre, apellido";
    
    echo "<p><strong>SQL:</strong> " . $sql . "</p>";
    
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo "<p><strong>Resultados:</strong> " . count($result) . " transportistas encontrados</p>";
        if ($result) {
            echo "<pre>" . print_r($result, true) . "</pre>";
        }
    } catch (Exception $e) {
        echo "<p style='color: red;'>❌ Error en consulta: " . $e->getMessage() . "</p>";
    }
    
} catch (Exception $e) {
    echo "<h3>❌ Error de conexión: " . $e->getMessage() . "</h3>";
}
?>
