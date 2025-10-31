<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🔍 Diagnóstico Completo del Sistema</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        .test-section { margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .success { background: #d4edda; border-color: #c3e6cb; }
        .error { background: #f8d7da; border-color: #f5c6cb; }
        .warning { background: #fff3cd; border-color: #ffeaa7; }
        .info { background: #d1ecf1; border-color: #bee5eb; }
        pre { background: #f8f9fa; padding: 10px; border-radius: 4px; }
    </style>
</head>
<body class="bg-light">
    <div class="container py-4">
        <h1 class="mb-4">🔍 Diagnóstico Completo del Sistema</h1>
        
        <?php
        // 1. VERIFICAR ARCHIVOS
        echo '<div class="test-section">';
        echo '<h3>📁 1. Verificación de Archivos</h3>';
        
        $archivos = [
            'index.html' => 'Archivo principal',
            'assets/js/main.js' => 'JavaScript principal',
            'assets/js/cache-manager.js' => 'Gestor de cache',
            'assets/js/anti-flash.js' => 'Sistema anti-flash',
            'assets/css/dark-theme.css' => 'Tema oscuro',
            'api/roles/reset-password.php' => 'Reset de contraseña',
            'api/auth/login.php' => 'Login',
            'config.php' => 'Configuración'
        ];
        
        $archivosOK = true;
        foreach ($archivos as $archivo => $descripcion) {
            $existe = file_exists($archivo);
            $modificado = $existe ? date('Y-m-d H:i:s', filemtime($archivo)) : 'N/A';
            $tamaño = $existe ? filesize($archivo) : 0;
            
            echo '<div class="' . ($existe ? 'alert alert-success' : 'alert alert-danger') . ' mb-2">';
            echo '<strong>' . ($existe ? '✅' : '❌') . ' ' . $archivo . '</strong><br>';
            echo '<small>' . $descripcion . '</small><br>';
            if ($existe) {
                echo '<small>Última modificación: ' . $modificado . ' | Tamaño: ' . number_format($tamaño) . ' bytes</small>';
            }
            echo '</div>';
            
            if (!$existe) $archivosOK = false;
        }
        echo '</div>';
        
        // 2. VERIFICAR VERSIONES EN HTML
        echo '<div class="test-section">';
        echo '<h3>🔢 2. Verificación de Versiones en HTML</h3>';
        
        if (file_exists('index.html')) {
            $html = file_get_contents('index.html');
            
            // Buscar versiones de archivos JS y CSS
            preg_match_all('/\.(js|css)\?v=([^"\']+)/', $html, $matches);
            
            if (!empty($matches[0])) {
                echo '<div class="alert alert-info">';
                echo '<strong>Versiones encontradas:</strong><br>';
                $versiones = array_unique($matches[2]);
                foreach ($versiones as $version) {
                    echo '• v' . $version . '<br>';
                }
                echo '</div>';
                
                // Verificar si todas tienen la misma versión
                if (count($versiones) > 1) {
                    echo '<div class="alert alert-warning">';
                    echo '⚠️ <strong>ADVERTENCIA:</strong> Hay múltiples versiones. Esto puede causar problemas de cache.';
                    echo '</div>';
                }
            } else {
                echo '<div class="alert alert-warning">';
                echo '⚠️ No se encontraron parámetros de versión en los archivos.';
                echo '</div>';
            }
        }
        echo '</div>';
        
        // 3. VERIFICAR BASE DE DATOS
        echo '<div class="test-section">';
        echo '<h3>🗄️ 3. Verificación de Base de Datos</h3>';
        
        try {
            require_once 'config.php';
            $db = new Database();
            $conn = $db->getConnection();
            
            echo '<div class="alert alert-success">✅ Conexión a base de datos exitosa</div>';
            
            // Verificar tabla usuarios
            $stmt = $conn->query("DESCRIBE usuarios");
            $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
            
            echo '<div class="alert alert-info">';
            echo '<strong>Columnas en tabla usuarios:</strong><br>';
            echo implode(', ', $columns);
            echo '</div>';
            
            // Verificar tipo de columna password
            $stmt = $conn->query("SHOW COLUMNS FROM usuarios LIKE 'password'");
            $passwordCol = $stmt->fetch(PDO::FETCH_ASSOC);
            
            echo '<div class="alert alert-info">';
            echo '<strong>Columna password:</strong><br>';
            echo 'Tipo: ' . $passwordCol['Type'] . '<br>';
            echo 'Null: ' . $passwordCol['Null'] . '<br>';
            echo 'Default: ' . ($passwordCol['Default'] ?? 'NULL');
            echo '</div>';
            
            // Contar usuarios
            $stmt = $conn->query("SELECT COUNT(*) FROM usuarios");
            $count = $stmt->fetchColumn();
            
            echo '<div class="alert alert-success">';
            echo '✅ Total de usuarios: ' . $count;
            echo '</div>';
            
        } catch (Exception $e) {
            echo '<div class="alert alert-danger">';
            echo '❌ Error de base de datos: ' . $e->getMessage();
            echo '</div>';
        }
        echo '</div>';
        
        // 4. VERIFICAR CACHE DEL NAVEGADOR
        echo '<div class="test-section">';
        echo '<h3>🌐 4. Headers de Cache</h3>';
        
        echo '<div class="alert alert-info">';
        echo '<strong>Headers actuales:</strong><br>';
        echo 'Cache-Control: ' . (isset($_SERVER['HTTP_CACHE_CONTROL']) ? $_SERVER['HTTP_CACHE_CONTROL'] : 'No establecido') . '<br>';
        echo 'Pragma: ' . (isset($_SERVER['HTTP_PRAGMA']) ? $_SERVER['HTTP_PRAGMA'] : 'No establecido') . '<br>';
        echo '</div>';
        
        echo '<div class="alert alert-warning">';
        echo '<strong>⚠️ Para aplicar cambios:</strong><br>';
        echo '1. Presiona <code>Ctrl + Shift + Delete</code><br>';
        echo '2. Selecciona "Cache" y "Cookies"<br>';
        echo '3. Limpia el cache<br>';
        echo '4. O usa <code>Ctrl + F5</code> para forzar recarga';
        echo '</div>';
        echo '</div>';
        
        // 5. TEST DE ACTUALIZACIÓN DE CONTRASEÑA
        echo '<div class="test-section">';
        echo '<h3>🔐 5. Test de Actualización de Contraseña</h3>';
        
        if (isset($_POST['test_password'])) {
            $testId = intval($_POST['user_id']);
            $testPassword = $_POST['test_password_value'];
            
            try {
                $stmt = $conn->prepare("UPDATE usuarios SET password = ? WHERE id = ?");
                $result = $stmt->execute([$testPassword, $testId]);
                
                if ($result) {
                    echo '<div class="alert alert-success">✅ UPDATE ejecutado correctamente</div>';
                    
                    // Verificar
                    $verifyStmt = $conn->prepare("SELECT id, nombre, email, password FROM usuarios WHERE id = ?");
                    $verifyStmt->execute([$testId]);
                    $user = $verifyStmt->fetch(PDO::FETCH_ASSOC);
                    
                    echo '<div class="alert alert-info">';
                    echo '<strong>Usuario actualizado:</strong><br>';
                    echo 'ID: ' . $user['id'] . '<br>';
                    echo 'Nombre: ' . $user['nombre'] . '<br>';
                    echo 'Email: ' . $user['email'] . '<br>';
                    echo 'Password guardada: <code>' . $user['password'] . '</code><br>';
                    echo 'Password enviada: <code>' . $testPassword . '</code><br>';
                    echo 'Match: ' . ($user['password'] === $testPassword ? '✅ YES' : '❌ NO');
                    echo '</div>';
                    
                    // Test de login
                    $loginMatch = ($user['password'] === $testPassword);
                    echo '<div class="alert ' . ($loginMatch ? 'alert-success' : 'alert-danger') . '">';
                    echo ($loginMatch ? '✅' : '❌') . ' Test de login: ' . ($loginMatch ? 'EXITOSO' : 'FALLIDO');
                    echo '</div>';
                } else {
                    echo '<div class="alert alert-danger">❌ UPDATE falló</div>';
                    echo '<pre>' . print_r($stmt->errorInfo(), true) . '</pre>';
                }
            } catch (Exception $e) {
                echo '<div class="alert alert-danger">❌ Error: ' . $e->getMessage() . '</div>';
            }
        }
        
        // Formulario de prueba
        echo '<form method="POST" class="mt-3">';
        echo '<div class="row">';
        echo '<div class="col-md-6">';
        echo '<label>User ID:</label>';
        echo '<input type="number" name="user_id" class="form-control" value="1" required>';
        echo '</div>';
        echo '<div class="col-md-6">';
        echo '<label>Nueva Contraseña:</label>';
        echo '<input type="text" name="test_password_value" class="form-control" value="test' . time() . '" required>';
        echo '</div>';
        echo '</div>';
        echo '<button type="submit" name="test_password" class="btn btn-primary mt-3">🧪 Probar Actualización</button>';
        echo '</form>';
        echo '</div>';
        
        // 6. VERIFICAR LOGS
        echo '<div class="test-section">';
        echo '<h3>📝 6. Logs del Sistema</h3>';
        
        $logFile = 'C:/xampp/apache/logs/error.log';
        if (file_exists($logFile)) {
            echo '<div class="alert alert-success">✅ Archivo de logs encontrado</div>';
            
            // Leer últimas 50 líneas
            $lines = file($logFile);
            $lastLines = array_slice($lines, -50);
            
            // Filtrar líneas relevantes
            $relevantLines = array_filter($lastLines, function($line) {
                return stripos($line, 'RESET PASSWORD') !== false || 
                       stripos($line, 'LOGIN DEBUG') !== false;
            });
            
            if (!empty($relevantLines)) {
                echo '<div class="alert alert-info">';
                echo '<strong>Últimos logs relevantes:</strong><br>';
                echo '<pre style="max-height: 300px; overflow-y: auto;">';
                echo htmlspecialchars(implode('', $relevantLines));
                echo '</pre>';
                echo '</div>';
            } else {
                echo '<div class="alert alert-warning">⚠️ No se encontraron logs recientes de RESET PASSWORD o LOGIN</div>';
            }
        } else {
            echo '<div class="alert alert-warning">⚠️ Archivo de logs no encontrado en: ' . $logFile . '</div>';
        }
        echo '</div>';
        
        // 7. RECOMENDACIONES
        echo '<div class="test-section">';
        echo '<h3>💡 7. Recomendaciones</h3>';
        
        echo '<div class="alert alert-primary">';
        echo '<strong>Para aplicar cambios correctamente:</strong><br><br>';
        echo '1️⃣ <strong>Limpiar cache del navegador:</strong><br>';
        echo '   • Presiona <code>Ctrl + Shift + Delete</code><br>';
        echo '   • Selecciona "Cache" y "Cookies"<br>';
        echo '   • Limpia todo<br><br>';
        
        echo '2️⃣ <strong>Forzar recarga:</strong><br>';
        echo '   • Presiona <code>Ctrl + F5</code> (Windows)<br>';
        echo '   • O <code>Cmd + Shift + R</code> (Mac)<br><br>';
        
        echo '3️⃣ <strong>Usar modo incógnito:</strong><br>';
        echo '   • <code>Ctrl + Shift + N</code> (Chrome)<br>';
        echo '   • <code>Ctrl + Shift + P</code> (Firefox)<br><br>';
        
        echo '4️⃣ <strong>Verificar versiones:</strong><br>';
        echo '   • Todos los archivos JS/CSS deben tener <code>?v=2.0.0</code><br>';
        echo '   • Si no, actualizar manualmente en index.html<br><br>';
        
        echo '5️⃣ <strong>Reiniciar Apache:</strong><br>';
        echo '   • En XAMPP Control Panel<br>';
        echo '   • Stop → Start en Apache<br>';
        echo '</div>';
        echo '</div>';
        ?>
        
        <div class="text-center mt-4">
            <a href="index.html" class="btn btn-primary">🏠 Volver al Sistema</a>
            <button onclick="location.reload()" class="btn btn-secondary">🔄 Recargar Diagnóstico</button>
        </div>
    </div>
</body>
</html>
