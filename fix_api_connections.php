<?php
/**
 * Script para actualizar todas las conexiones de base de datos en los archivos de la API
 * Este script reemplaza las conexiones hardcodeadas por el uso del archivo config.php
 */

$apiDir = __DIR__ . '/api';

// Patrón a buscar (conexión hardcodeada)
$oldPattern = '/\$pdo\s*=\s*new\s+PDO\s*\(\s*["\']mysql:host=localhost;dbname=[^;]+;charset=utf8mb4["\']\s*,\s*["\'][^"\']*["\']\s*,\s*["\'][^"\']*["\']\s*,\s*\[[^\]]+\]\s*\);/s';

// Reemplazo
$newCode = "require_once __DIR__ . '/../config.php';";

function scanDirectory($dir, $pattern, $replacement) {
    $files = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($dir),
        RecursiveIteratorIterator::SELF_FIRST
    );

    $updated = 0;
    foreach ($files as $file) {
        if ($file->isFile() && $file->getExtension() === 'php') {
            $filepath = $file->getPathname();
            $content = file_get_contents($filepath);
            
            // Verificar si el archivo tiene una conexión hardcodeada
            if (preg_match($pattern, $content)) {
                // Reemplazar la conexión hardcodeada
                $newContent = preg_replace($pattern, $replacement, $content);
                
                if ($newContent !== $content) {
                    file_put_contents($filepath, $newContent);
                    echo "✅ Actualizado: " . $filepath . "\n";
                    $updated++;
                }
            }
        }
    }
    
    return $updated;
}

echo "🔧 Actualizando archivos de la API...\n\n";
$count = scanDirectory($apiDir, $oldPattern, $newCode);
echo "\n✅ Total de archivos actualizados: $count\n";
?>
