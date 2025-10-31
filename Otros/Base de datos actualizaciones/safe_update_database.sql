-- Script seguro para actualizar la base de datos
-- Verifica si las columnas existen antes de agregarlas

-- 1. Agregar columna estado a usuarios (solo si no existe)
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'transporte_pro' 
     AND TABLE_NAME = 'usuarios' 
     AND COLUMN_NAME = 'estado') = 0,
    'ALTER TABLE usuarios ADD COLUMN estado ENUM(''activo'', ''inactivo'', ''suspendido'') DEFAULT ''activo'' AFTER rol',
    'SELECT ''Columna estado ya existe en usuarios'' as mensaje'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. Crear tabla viajes si no existe
CREATE TABLE IF NOT EXISTS viajes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transportista_id INT NOT NULL,
    vehiculo_id INT NOT NULL,
    origen VARCHAR(200) NOT NULL,
    origen_estado VARCHAR(100),
    origen_municipio VARCHAR(100),
    origen_lugar VARCHAR(200),
    destino VARCHAR(200) NOT NULL,
    destino_estado VARCHAR(100),
    destino_municipio VARCHAR(100),
    destino_lugar VARCHAR(200),
    fecha_salida DATETIME NOT NULL,
    fecha_llegada DATETIME,
    distancia DECIMAL(10,2),
    costo DECIMAL(10,2),
    estado ENUM('programado', 'en_curso', 'completado', 'cancelado') DEFAULT 'programado',
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transportista_id) REFERENCES usuarios(id),
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id)
);

-- 3. Agregar columnas a vehiculos (solo si no existen)
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'transporte_pro' 
     AND TABLE_NAME = 'vehiculos' 
     AND COLUMN_NAME = 'tipo') = 0,
    'ALTER TABLE vehiculos ADD COLUMN tipo VARCHAR(50) DEFAULT ''vehiculo'' AFTER modelo',
    'SELECT ''Columna tipo ya existe en vehiculos'' as mensaje'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 4. Insertar datos de ejemplo para transportistas
INSERT IGNORE INTO usuarios (id, nombre, email, password, rol, estado, activo) VALUES
(2, 'Juan Pérez', 'juan.perez@transport.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'transportista', 'activo', 1),
(3, 'María González', 'maria.gonzalez@transport.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'transportista', 'activo', 1),
(4, 'Carlos López', 'carlos.lopez@transport.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'transportista', 'activo', 1);

-- 5. Insertar datos de ejemplo para vehículos
INSERT IGNORE INTO vehiculos (id, marca, modelo, placa, estado) VALUES
(1, 'Volvo', 'FH16', 'ABC-123', 'operativo'),
(2, 'Scania', 'R450', 'DEF-456', 'operativo'),
(3, 'Mercedes', 'Actros', 'GHI-789', 'mantenimiento');

-- 6. Mostrar resultados
SELECT 'Script ejecutado correctamente' as mensaje;
SELECT COUNT(*) as total_transportistas FROM usuarios WHERE rol = 'transportista';
SELECT COUNT(*) as total_vehiculos FROM vehiculos;
