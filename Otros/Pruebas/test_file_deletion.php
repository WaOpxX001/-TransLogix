<?php
/**
 * Archivo de prueba para verificar la eliminación automática de imágenes
 */
header('Content-Type: text/html; charset=utf-8');

require_once 'config.php';
require_once 'includes/file_utils.php';

echo "<h2>🧪 Prueba de Eliminación Automática de Imágenes</h2>";

// Test 1: Verificar función de eliminación segura
echo "<h3>1. Probar función deleteFileSecurely()</h3>";

// Crear un archivo de prueba
$testFile = 'test_' . uniqid() . '.txt';
$testDir = 'uploads/recibos/';
$testPath = $testDir . $testFile;

// Crear directorio si no existe
if (!is_dir($testDir)) {
    mkdir($testDir, 0755, true);
}

// Crear archivo de prueba
file_put_contents($testPath, 'Este es un archivo de prueba para eliminación');

if (file_exists($testPath)) {
    echo "✅ Archivo de prueba creado: $testFile<br>";
    
    // Probar eliminación
    $result = deleteFileSecurely($testFile, 'uploads/recibos/');
    
    if ($result['success'] && $result['file_deleted']) {
        echo "✅ Archivo eliminado correctamente<br>";
    } else {
        echo "❌ Error eliminando archivo: " . $result['message'] . "<br>";
    }
} else {
    echo "❌ No se pudo crear archivo de prueba<br>";
}

// Test 2: Verificar información de archivos
echo "<h3>2. Información de archivos en uploads/recibos/</h3>";

$uploadDir = 'uploads/recibos/';
if (is_dir($uploadDir)) {
    $files = scandir($uploadDir);
    $imageFiles = array_filter($files, function($file) use ($uploadDir) {
        return is_file($uploadDir . $file) && 
               preg_match('/\.(jpg|jpeg|png|gif|webp|txt)$/i', $file);
    });
    
    echo "📁 Archivos encontrados: " . count($imageFiles) . "<br>";
    
    foreach ($imageFiles as $file) {
        $info = getFileInfo($file, 'uploads/recibos/');
        $size = $info['exists'] ? round($info['size'] / 1024, 2) . ' KB' : 'N/A';
        echo "   - $file ($size)<br>";
    }
} else {
    echo "📁 Directorio uploads/recibos/ no existe<br>";
}

// Test 3: Verificar conexión con base de datos
echo "<h3>3. Verificar registros en base de datos</h3>";

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM gastos WHERE recibo_imagen IS NOT NULL AND recibo_imagen != ''");
    $stmt->execute();
    $result = $stmt->fetch();
    
    echo "💾 Gastos con imagen en BD: " . $result['total'] . "<br>";
    
    // Mostrar algunos ejemplos
    $stmt = $conn->prepare("SELECT id, recibo_imagen, fecha FROM gastos WHERE recibo_imagen IS NOT NULL AND recibo_imagen != '' LIMIT 5");
    $stmt->execute();
    $gastos = $stmt->fetchAll();
    
    if ($gastos) {
        echo "📋 Ejemplos de gastos con imagen:<br>";
        foreach ($gastos as $gasto) {
            $fileExists = file_exists('uploads/recibos/' . $gasto['recibo_imagen']) ? '✅' : '❌';
            echo "   - ID {$gasto['id']}: {$gasto['recibo_imagen']} $fileExists<br>";
        }
    }
    
} catch (Exception $e) {
    echo "❌ Error conectando a BD: " . $e->getMessage() . "<br>";
}

echo "<hr>";
echo "<h3>🔧 Funciones disponibles en JavaScript:</h3>";
echo "<ul>";
echo "<li><code>scanOrphanedFiles()</code> - Escanear archivos huérfanos</li>";
echo "<li><code>cleanupOrphanedFiles()</code> - Limpiar archivos huérfanos</li>";
echo "</ul>";

echo "<h3>📝 Notas:</h3>";
echo "<ul>";
echo "<li>Al eliminar un gasto, su imagen se elimina automáticamente</li>";
echo "<li>Los archivos se verifican por seguridad antes de eliminar</li>";
echo "<li>Se registran logs de todas las operaciones de archivos</li>";
echo "<li>Solo se eliminan archivos dentro del directorio permitido</li>";
echo "</ul>";
?>
