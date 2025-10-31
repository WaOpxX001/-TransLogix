<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>🔧 Unificar Contraseñas</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-dark text-white p-5">
    <div class="container">
        <h1 class="text-center mb-4">🔧 Unificar Sistema de Contraseñas</h1>
        
        <?php
        if (isset($_POST['unificar'])) {
            require_once 'config.php';
            $db = new Database();
            $conn = $db->getConnection();
            
            echo '<div class="alert alert-info">🔄 Procesando...</div>';
            
            // Obtener todos los usuarios
            $stmt = $conn->query("SELECT id, nombre, email, password FROM usuarios");
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $actualizados = 0;
            $errores = 0;
            
            foreach ($users as $user) {
                // Si la contraseña está hasheada (empieza con $2y$)
                if (strpos($user['password'], '$2y$') === 0) {
                    // Cambiar a contraseña por defecto
                    $newPassword = '12345'; // Contraseña por defecto
                    
                    $updateStmt = $conn->prepare("UPDATE usuarios SET password = ? WHERE id = ?");
                    if ($updateStmt->execute([$newPassword, $user['id']])) {
                        echo '<div class="alert alert-success">';
                        echo '✅ Usuario: ' . $user['nombre'] . ' (' . $user['email'] . ')<br>';
                        echo 'Nueva contraseña: <strong>' . $newPassword . '</strong>';
                        echo '</div>';
                        $actualizados++;
                    } else {
                        echo '<div class="alert alert-danger">❌ Error actualizando: ' . $user['nombre'] . '</div>';
                        $errores++;
                    }
                } else {
                    echo '<div class="alert alert-secondary">';
                    echo '⏭️ Usuario: ' . $user['nombre'] . ' - Ya tiene contraseña en texto plano';
                    echo '</div>';
                }
            }
            
            echo '<div class="alert alert-primary mt-4">';
            echo '<h4>📊 Resumen:</h4>';
            echo 'Actualizados: ' . $actualizados . '<br>';
            echo 'Sin cambios: ' . (count($users) - $actualizados - $errores) . '<br>';
            echo 'Errores: ' . $errores;
            echo '</div>';
            
            echo '<div class="alert alert-warning mt-4">';
            echo '<h5>⚠️ IMPORTANTE:</h5>';
            echo 'Todos los usuarios con contraseñas hasheadas ahora tienen la contraseña: <strong>12345</strong><br>';
            echo 'Pídeles que cambien su contraseña después de hacer login.';
            echo '</div>';
            
        } else {
            ?>
            <div class="card bg-secondary text-white">
                <div class="card-body">
                    <h3>⚠️ ¿Qué hace este script?</h3>
                    <p>Este script convertirá TODAS las contraseñas hasheadas a texto plano.</p>
                    
                    <h4>Usuarios afectados:</h4>
                    <?php
                    require_once 'config.php';
                    $db = new Database();
                    $conn = $db->getConnection();
                    
                    $stmt = $conn->query("SELECT id, nombre, email, password FROM usuarios");
                    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    
                    echo '<ul>';
                    foreach ($users as $user) {
                        if (strpos($user['password'], '$2y$') === 0) {
                            echo '<li class="text-warning">';
                            echo '<strong>' . $user['nombre'] . '</strong> (' . $user['email'] . ') - Contraseña hasheada → Se cambiará a: <code>12345</code>';
                            echo '</li>';
                        } else {
                            echo '<li class="text-success">';
                            echo '<strong>' . $user['nombre'] . '</strong> (' . $user['email'] . ') - Ya está en texto plano';
                            echo '</li>';
                        }
                    }
                    echo '</ul>';
                    ?>
                    
                    <hr>
                    
                    <form method="POST">
                        <div class="alert alert-danger">
                            <strong>⚠️ ADVERTENCIA:</strong><br>
                            Esta acción cambiará las contraseñas de los usuarios con hash.<br>
                            La nueva contraseña será: <strong>12345</strong>
                        </div>
                        
                        <button type="submit" name="unificar" class="btn btn-warning btn-lg w-100">
                            🔧 UNIFICAR CONTRASEÑAS
                        </button>
                    </form>
                </div>
            </div>
            <?php
        }
        ?>
        
        <div class="text-center mt-4">
            <a href="index.html" class="btn btn-primary">🏠 Volver al Sistema</a>
        </div>
    </div>
</body>
</html>
