<?php
session_start();

header('Content-Type: text/html; charset=UTF-8');

// Manejar cambio de rol
if (isset($_POST['switch_role'])) {
    require_once 'config.php';
    
    try {
        $db = new Database();
        $conn = $db->getConnection();
        
        $target_role = $_POST['target_role'];
        
        // Buscar un usuario con el rol solicitado
        $stmt = $conn->prepare("SELECT id, nombre, email, rol FROM usuarios WHERE rol = ? AND activo = 1 LIMIT 1");
        $stmt->execute([$target_role]);
        $user = $stmt->fetch();
        
        if ($user) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_role'] = $user['rol'];
            $_SESSION['role'] = $user['rol'];
            $_SESSION['username'] = $user['nombre'];
            
            $message = "✅ Sesión cambiada a: {$user['nombre']} ({$user['rol']})";
        } else {
            $message = "❌ No se encontró usuario con rol: $target_role";
        }
        
    } catch (Exception $e) {
        $message = "❌ Error: " . $e->getMessage();
    }
}

$current_role = $_SESSION['user_role'] ?? $_SESSION['role'] ?? 'No definido';
$current_user = $_SESSION['username'] ?? 'No definido';
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Prueba de Cambio de Roles</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container mt-5">
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header bg-primary text-white">
                        <h4 class="mb-0">🔄 Prueba de Cambio de Roles</h4>
                    </div>
                    <div class="card-body">
                        <?php if (isset($message)): ?>
                            <div class="alert alert-info"><?= $message ?></div>
                        <?php endif; ?>
                        
                        <div class="mb-4">
                            <h5>Estado Actual:</h5>
                            <p><strong>Usuario:</strong> <?= htmlspecialchars($current_user) ?></p>
                            <p><strong>Rol:</strong> <span class="badge bg-secondary"><?= htmlspecialchars($current_role) ?></span></p>
                        </div>
                        
                        <form method="POST" class="mb-4">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label">Cambiar a rol:</label>
                                    <select name="target_role" class="form-select" required>
                                        <option value="">Seleccionar rol...</option>
                                        <option value="admin">👨‍💼 Administrador</option>
                                        <option value="supervisor">👨‍💻 Supervisor</option>
                                        <option value="transportista">🚛 Transportista</option>
                                    </select>
                                </div>
                                <div class="col-md-6 d-flex align-items-end">
                                    <button type="submit" name="switch_role" class="btn btn-warning w-100">
                                        🔄 Cambiar Rol
                                    </button>
                                </div>
                            </div>
                        </form>
                        
                        <div class="d-grid gap-2">
                            <a href="index.html#viajes" class="btn btn-primary btn-lg">
                                🚀 Ir a Sección Viajes
                            </a>
                            <a href="test_session.php" class="btn btn-info" target="_blank">
                                📊 Ver Información de Sesión
                            </a>
                        </div>
                        
                        <div class="mt-4">
                            <h6>Instrucciones:</h6>
                            <ol>
                                <li>Cambia a rol <strong>transportista</strong></li>
                                <li>Ve a la sección viajes</li>
                                <li>Verifica que se oculten botones y filtros</li>
                                <li>Cambia a rol <strong>admin</strong></li>
                                <li>Verifica que aparezcan todos los elementos</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
