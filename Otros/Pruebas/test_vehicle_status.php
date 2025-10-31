<?php
/**
 * Archivo de prueba para verificar la columna de estado de vehículos
 */
header('Content-Type: text/html; charset=utf-8');

require_once 'config.php';

echo "<h2>🚚 Prueba de Estados de Vehículos</h2>";

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    // Test 1: Verificar estructura de tabla vehículos
    echo "<h3>1. Estructura de tabla vehículos</h3>";
    
    $stmt = $conn->prepare("DESCRIBE vehiculos");
    $stmt->execute();
    $columns = $stmt->fetchAll();
    
    echo "<table border='1' style='border-collapse: collapse; margin: 10px 0;'>";
    echo "<tr><th>Campo</th><th>Tipo</th><th>Null</th><th>Key</th><th>Default</th></tr>";
    
    $hasEstadoColumn = false;
    foreach ($columns as $column) {
        echo "<tr>";
        echo "<td>{$column['Field']}</td>";
        echo "<td>{$column['Type']}</td>";
        echo "<td>{$column['Null']}</td>";
        echo "<td>{$column['Key']}</td>";
        echo "<td>{$column['Default']}</td>";
        echo "</tr>";
        
        if ($column['Field'] === 'estado') {
            $hasEstadoColumn = true;
        }
    }
    echo "</table>";
    
    if ($hasEstadoColumn) {
        echo "✅ La columna 'estado' existe en la tabla<br>";
    } else {
        echo "❌ La columna 'estado' NO existe en la tabla<br>";
        echo "<strong>Solución:</strong> Ejecutar: <code>ALTER TABLE vehiculos ADD COLUMN estado VARCHAR(50) DEFAULT 'En Operación';</code><br>";
    }
    
    // Test 2: Verificar datos de vehículos
    echo "<h3>2. Datos de vehículos</h3>";
    
    $stmt = $conn->prepare("SELECT id, placa, marca, modelo, tipo, estado FROM vehiculos LIMIT 10");
    $stmt->execute();
    $vehiculos = $stmt->fetchAll();
    
    if ($vehiculos) {
        echo "<table border='1' style='border-collapse: collapse; margin: 10px 0;'>";
        echo "<tr><th>ID</th><th>Placa</th><th>Marca</th><th>Modelo</th><th>Tipo</th><th>Estado</th></tr>";
        
        foreach ($vehiculos as $vehiculo) {
            $estado = $vehiculo['estado'] ?? 'Sin estado';
            $estadoClass = '';
            
            switch ($estado) {
                case 'En Operación':
                case 'operativo':
                    $estadoClass = 'style="background-color: #d4edda; color: #155724;"';
                    break;
                case 'En Mantenimiento':
                case 'mantenimiento':
                    $estadoClass = 'style="background-color: #fff3cd; color: #856404;"';
                    break;
                case 'Fuera de Servicio':
                case 'fuera_servicio':
                    $estadoClass = 'style="background-color: #f8d7da; color: #721c24;"';
                    break;
            }
            
            echo "<tr>";
            echo "<td>{$vehiculo['id']}</td>";
            echo "<td><strong>{$vehiculo['placa']}</strong></td>";
            echo "<td>{$vehiculo['marca']}</td>";
            echo "<td>{$vehiculo['modelo']}</td>";
            echo "<td>{$vehiculo['tipo']}</td>";
            echo "<td $estadoClass><strong>$estado</strong></td>";
            echo "</tr>";
        }
        echo "</table>";
        
        // Estadísticas de estados
        $stmt = $conn->prepare("SELECT estado, COUNT(*) as count FROM vehiculos GROUP BY estado");
        $stmt->execute();
        $stats = $stmt->fetchAll();
        
        echo "<h4>📊 Distribución de estados:</h4>";
        foreach ($stats as $stat) {
            $estado = $stat['estado'] ?? 'Sin estado';
            echo "• <strong>$estado</strong>: {$stat['count']} vehículos<br>";
        }
        
    } else {
        echo "⚠️ No hay vehículos en la base de datos<br>";
    }
    
    // Test 3: Actualizar estados de ejemplo (si no existen)
    if ($hasEstadoColumn) {
        echo "<h3>3. Actualizar estados de ejemplo</h3>";
        
        // Contar vehículos sin estado
        $stmt = $conn->prepare("SELECT COUNT(*) as count FROM vehiculos WHERE estado IS NULL OR estado = ''");
        $stmt->execute();
        $sinEstado = $stmt->fetch()['count'];
        
        if ($sinEstado > 0) {
            echo "⚠️ Hay $sinEstado vehículos sin estado definido<br>";
            
            // Actualizar con estados por defecto
            $stmt = $conn->prepare("UPDATE vehiculos SET estado = 'En Operación' WHERE estado IS NULL OR estado = ''");
            $stmt->execute();
            $updated = $stmt->rowCount();
            
            echo "✅ Actualizados $updated vehículos con estado 'En Operación'<br>";
        } else {
            echo "✅ Todos los vehículos tienen estado definido<br>";
        }
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "<br>";
}

echo "<hr>";
echo "<h3>🎨 Estados disponibles:</h3>";
echo "<ul>";
echo "<li><span style='background-color: #d4edda; color: #155724; padding: 4px 8px; border-radius: 4px;'>✅ En Operación</span> - Vehículo disponible para uso</li>";
echo "<li><span style='background-color: #fff3cd; color: #856404; padding: 4px 8px; border-radius: 4px;'>🔧 En Mantenimiento</span> - Vehículo en reparación</li>";
echo "<li><span style='background-color: #f8d7da; color: #721c24; padding: 4px 8px; border-radius: 4px;'>❌ Fuera de Servicio</span> - Vehículo no disponible</li>";
echo "</ul>";

echo "<h3>🧪 Funciones JavaScript disponibles:</h3>";
echo "<ul>";
echo "<li><code>testVehicleStatus()</code> - Probar estados de vehículos en consola</li>";
echo "<li><code>window.VehiculosManager.getStatusBadge('En Operación')</code> - Generar badge de estado</li>";
echo "</ul>";

echo "<h3>📝 Notas:</h3>";
echo "<ul>";
echo "<li>La tabla ahora incluye una columna 'Estado' con badges coloridos</li>";
echo "<li>Los estados se muestran tanto en vista de escritorio como móvil</li>";
echo "<li>Los colores son: Verde (Operación), Amarillo (Mantenimiento), Rojo (Fuera de Servicio)</li>";
echo "<li>Si falta la columna 'estado' en la BD, se debe agregar manualmente</li>";
echo "</ul>";
?>
