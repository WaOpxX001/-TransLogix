<?php
// Debug completo del sistema
header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>Debug Completo - TransLogix</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .success { background: #d4edda; }
        .error { background: #f8d7da; }
        .info { background: #d1ecf1; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #f2f2f2; }
        pre { background: #f8f9fa; padding: 10px; border-radius: 3px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>🔍 Debug Completo del Sistema TransLogix</h1>

<?php
try {
    // 1. Verificar conexión a base de datos
    echo "<div class='section info'>";
    echo "<h2>1. 🗄️ Conexión a Base de Datos</h2>";
    
    $pdo = new PDO(
        "mysql:host=localhost;dbname=transporte_pro;charset=utf8mb4",
        "root",
        "",
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );
    echo "✅ Conexión exitosa a la base de datos<br>";
    echo "</div>";

    // 2. Verificar sesión
    echo "<div class='section info'>";
    echo "<h2>2. 👤 Estado de Sesión</h2>";
    session_start();
    if (isset($_SESSION['user_id'])) {
        echo "✅ Sesión activa<br>";
        echo "Usuario ID: " . $_SESSION['user_id'] . "<br>";
        echo "Rol: " . ($_SESSION['rol'] ?? 'No definido') . "<br>";
    } else {
        echo "❌ No hay sesión activa<br>";
    }
    echo "</div>";

    // 3. Verificar datos de gastos
    echo "<div class='section info'>";
    echo "<h2>3. 💰 Datos de Gastos en Base de Datos</h2>";
    
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM gastos");
    $totalGastos = $stmt->fetch()['total'];
    echo "Total de registros en tabla gastos: <strong>$totalGastos</strong><br><br>";
    
    if ($totalGastos > 0) {
        // Estadísticas generales
        $stmt = $pdo->query("SELECT 
            COUNT(*) as total_registros,
            SUM(monto) as total_monto,
            COUNT(CASE WHEN estado = 'aprobado' THEN 1 END) as aprobados,
            COUNT(CASE WHEN estado = 'rechazado' THEN 1 END) as rechazados,
            COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as pendientes,
            SUM(CASE WHEN estado = 'aprobado' THEN monto ELSE 0 END) as monto_aprobados,
            SUM(CASE WHEN estado = 'rechazado' THEN monto ELSE 0 END) as monto_rechazados
            FROM gastos");
        $stats = $stmt->fetch();
        
        echo "<h3>📊 Estadísticas Generales:</h3>";
        echo "<table>";
        echo "<tr><th>Métrica</th><th>Valor</th></tr>";
        echo "<tr><td>Total Registros</td><td>{$stats['total_registros']}</td></tr>";
        echo "<tr><td><strong>Total Monto</strong></td><td><strong>\${$stats['total_monto']}</strong></td></tr>";
        echo "<tr><td>Gastos Aprobados (cantidad)</td><td>{$stats['aprobados']}</td></tr>";
        echo "<tr><td>Gastos Rechazados (cantidad)</td><td>{$stats['rechazados']}</td></tr>";
        echo "<tr><td>Gastos Pendientes (cantidad)</td><td>{$stats['pendientes']}</td></tr>";
        echo "<tr><td><strong>Monto Aprobados</strong></td><td><strong>\${$stats['monto_aprobados']}</strong></td></tr>";
        echo "<tr><td><strong>Monto Rechazados</strong></td><td><strong>\${$stats['monto_rechazados']}</strong></td></tr>";
        echo "</table>";
        
        // Gastos por categoría
        echo "<h3>📋 Gastos por Categoría:</h3>";
        $stmt = $pdo->query("SELECT tipo, COUNT(*) as cantidad, SUM(monto) as total FROM gastos GROUP BY tipo ORDER BY total DESC");
        $categorias = $stmt->fetchAll();
        
        echo "<table>";
        echo "<tr><th>Categoría</th><th>Cantidad</th><th>Monto Total</th></tr>";
        foreach ($categorias as $cat) {
            echo "<tr><td>{$cat['tipo']}</td><td>{$cat['cantidad']}</td><td>\${$cat['total']}</td></tr>";
        }
        echo "</table>";
        
        // Últimos 10 gastos
        echo "<h3>📝 Últimos 10 Gastos:</h3>";
        $stmt = $pdo->query("SELECT id, fecha, tipo, monto, estado, descripcion FROM gastos ORDER BY fecha DESC LIMIT 10");
        $ultimos = $stmt->fetchAll();
        
        echo "<table>";
        echo "<tr><th>ID</th><th>Fecha</th><th>Tipo</th><th>Monto</th><th>Estado</th><th>Descripción</th></tr>";
        foreach ($ultimos as $gasto) {
            echo "<tr>";
            echo "<td>{$gasto['id']}</td>";
            echo "<td>{$gasto['fecha']}</td>";
            echo "<td>{$gasto['tipo']}</td>";
            echo "<td>\${$gasto['monto']}</td>";
            echo "<td>{$gasto['estado']}</td>";
            echo "<td>" . substr($gasto['descripcion'] ?? '', 0, 50) . "</td>";
            echo "</tr>";
        }
        echo "</table>";
    }
    echo "</div>";

    // 4. Probar la API directamente
    echo "<div class='section info'>";
    echo "<h2>4. 🔌 Prueba de API</h2>";
    
    // Simular llamada a la API
    ob_start();
    include 'api/dashboard/data_simple_pdo.php';
    $apiOutput = ob_get_clean();
    
    echo "<h3>Respuesta de la API:</h3>";
    echo "<pre>" . htmlspecialchars($apiOutput) . "</pre>";
    
    // Intentar decodificar JSON
    $apiData = json_decode($apiOutput, true);
    if ($apiData) {
        echo "<h3>✅ JSON válido. Datos decodificados:</h3>";
        echo "<table>";
        echo "<tr><th>Campo</th><th>Valor</th></tr>";
        if (isset($apiData['expenses'])) {
            foreach ($apiData['expenses'] as $key => $value) {
                echo "<tr><td>expenses.$key</td><td>$value</td></tr>";
            }
        }
        echo "</table>";
        
        if (isset($apiData['expensesByCategory'])) {
            echo "<h3>Categorías en API:</h3>";
            echo "<table>";
            echo "<tr><th>Categoría</th><th>Monto</th></tr>";
            foreach ($apiData['expensesByCategory'] as $cat => $monto) {
                echo "<tr><td>$cat</td><td>\$$monto</td></tr>";
            }
            echo "</table>";
        }
    } else {
        echo "<h3>❌ Error: JSON inválido</h3>";
        echo "Error JSON: " . json_last_error_msg();
    }
    echo "</div>";

    // 5. Verificar archivos JavaScript
    echo "<div class='section info'>";
    echo "<h2>5. 📄 Verificación de Archivos</h2>";
    
    $files = [
        'assets/js/dashboard.js',
        'assets/js/main.js',
        'api/dashboard/data_simple_pdo.php'
    ];
    
    foreach ($files as $file) {
        if (file_exists($file)) {
            $size = filesize($file);
            $modified = date('Y-m-d H:i:s', filemtime($file));
            echo "✅ $file - Tamaño: {$size} bytes - Modificado: $modified<br>";
        } else {
            echo "❌ $file - No existe<br>";
        }
    }
    echo "</div>";

} catch (Exception $e) {
    echo "<div class='section error'>";
    echo "<h2>❌ Error</h2>";
    echo "Error: " . $e->getMessage() . "<br>";
    echo "Archivo: " . $e->getFile() . "<br>";
    echo "Línea: " . $e->getLine() . "<br>";
    echo "</div>";
}
?>

<div class="section info">
    <h2>6. 🔧 Acciones Recomendadas</h2>
    <p><strong>Si los datos de la base de datos son correctos pero la API no los muestra:</strong></p>
    <ul>
        <li>Verificar que la sesión esté activa</li>
        <li>Revisar filtros por rol de usuario</li>
        <li>Comprobar consultas SQL</li>
    </ul>
    
    <p><strong>Si la API muestra datos correctos pero el frontend no:</strong></p>
    <ul>
        <li>Limpiar cache del navegador completamente</li>
        <li>Verificar que los archivos JavaScript se estén cargando</li>
        <li>Revisar consola del navegador por errores</li>
    </ul>
    
    <p><a href="index.html?debug=1&v=<?php echo time(); ?>">🚀 Ir al Dashboard con Debug</a></p>
</div>

</body>
</html>
