<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Test Password Direct</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light p-5">
    <div class="container">
        <div class="card">
            <div class="card-header bg-primary text-white">
                <h4>🔐 Test Password - Directo a Base de Datos</h4>
            </div>
            <div class="card-body">
                <?php
                require_once 'config.php';
                
                echo "<h5>Test 1: Conexión a Base de Datos</h5>";
                try {
                    $db = new Database();
                    $conn = $db->getConnection();
                    echo "<div class='alert alert-success'>✅ Conexión exitosa</div>";
                } catch (Exception $e) {
                    echo "<div class='alert alert-danger'>❌ Error: " . $e->getMessage() . "</div>";
                    exit;
                }
                
                echo "<h5>Test 2: Listar Usuarios</h5>";
                $stmt = $conn->query("SELECT id, nombre, email, password FROM usuarios LIMIT 5");
                $users = $stmt->fetchAll();
                
                echo "<table class='table table-bordered'>";
                echo "<tr><th>ID</th><th>Nombre</th><th>Email</th><th>Password</th></tr>";
                foreach ($users as $user) {
                    echo "<tr>";
                    echo "<td>" . $user['id'] . "</td>";
                    echo "<td>" . $user['nombre'] . "</td>";
                    echo "<td>" . $user['email'] . "</td>";
                    echo "<td>" . substr($user['password'], 0, 20) . "...</td>";
                    echo "</tr>";
                }
                echo "</table>";
                
                // Test de actualización
                if (isset($_POST['test_update'])) {
                    $testId = intval($_POST['user_id']);
                    $testPassword = $_POST['new_password'];
                    
                    echo "<h5>Test 3: Actualizar Contraseña</h5>";
                    echo "<div class='alert alert-info'>";
                    echo "User ID: " . $testId . "<br>";
                    echo "New Password: " . $testPassword . "<br>";
                    echo "</div>";
                    
                    $stmt = $conn->prepare("UPDATE usuarios SET password = ? WHERE id = ?");
                    $result = $stmt->execute([$testPassword, $testId]);
                    
                    if ($result) {
                        echo "<div class='alert alert-success'>✅ UPDATE ejecutado</div>";
                        
                        // Verificar
                        $verifyStmt = $conn->prepare("SELECT password FROM usuarios WHERE id = ?");
                        $verifyStmt->execute([$testId]);
                        $savedPassword = $verifyStmt->fetchColumn();
                        
                        echo "<div class='alert alert-info'>";
                        echo "Password guardada: " . $savedPassword . "<br>";
                        echo "Match: " . ($savedPassword === $testPassword ? '✅ YES' : '❌ NO') . "<br>";
                        echo "</div>";
                        
                        // Test de login
                        echo "<h5>Test 4: Verificar Login</h5>";
                        $loginStmt = $conn->prepare("SELECT * FROM usuarios WHERE id = ?");
                        $loginStmt->execute([$testId]);
                        $user = $loginStmt->fetch();
                        
                        $passwordMatch = ($testPassword === $user['password']);
                        
                        echo "<div class='alert " . ($passwordMatch ? 'alert-success' : 'alert-danger') . "'>";
                        echo "Login test: " . ($passwordMatch ? '✅ SUCCESS' : '❌ FAILED') . "<br>";
                        echo "Password en DB: " . $user['password'] . "<br>";
                        echo "Password probada: " . $testPassword . "<br>";
                        echo "</div>";
                    } else {
                        echo "<div class='alert alert-danger'>❌ UPDATE falló</div>";
                        echo "<pre>" . print_r($stmt->errorInfo(), true) . "</pre>";
                    }
                }
                ?>
                
                <hr>
                
                <h5>Probar Actualización</h5>
                <form method="POST">
                    <div class="mb-3">
                        <label>User ID:</label>
                        <input type="number" name="user_id" class="form-control" value="1" required>
                    </div>
                    <div class="mb-3">
                        <label>Nueva Contraseña:</label>
                        <input type="text" name="new_password" class="form-control" value="test123" required>
                    </div>
                    <button type="submit" name="test_update" class="btn btn-primary">
                        🧪 Probar Actualización
                    </button>
                </form>
            </div>
        </div>
    </div>
</body>
</html>
