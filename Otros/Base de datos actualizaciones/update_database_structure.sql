-- Script para actualizar la estructura de la base de datos
-- Ejecutar en phpMyAdmin o cliente MySQL

-- 1. Actualizar tabla usuarios - agregar columnas faltantes (sin apellido)
ALTER TABLE usuarios 
ADD COLUMN estado ENUM('activo', 'inactivo', 'suspendido') DEFAULT 'activo' AFTER rol;

-- 2. Actualizar tabla viajes - agregar campos de ubicación detallada
ALTER TABLE viajes 
ADD COLUMN origen_lugar VARCHAR(200) AFTER origen_municipio,
ADD COLUMN destino_lugar VARCHAR(200) AFTER destino_municipio;

-- 3. Actualizar tabla vehiculos - agregar columnas faltantes
ALTER TABLE vehiculos 
ADD COLUMN tipo VARCHAR(50) DEFAULT 'vehiculo' AFTER modelo,
ADD COLUMN año INT(4) AFTER placa,
ADD COLUMN kilometraje INT(11) DEFAULT 0 AFTER año,
ADD COLUMN ultimo_servicio DATE AFTER kilometraje,
ADD COLUMN activo TINYINT(1) DEFAULT 1 AFTER estado,
ADD COLUMN fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER activo;

-- 4. Insertar datos de ejemplo para transportistas si no existen
INSERT IGNORE INTO usuarios (id, nombre, email, password, rol, estado, activo) VALUES
(2, 'Juan Pérez', 'juan.perez@transport.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'transportista', 'activo', 1),
(3, 'María González', 'maria.gonzalez@transport.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'transportista', 'activo', 1),
(4, 'Carlos López', 'carlos.lopez@transport.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'transportista', 'activo', 1),
(5, 'Ana Martínez', 'ana.martinez@transport.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'supervisor', 'activo', 1);

-- 5. Insertar datos de ejemplo para vehículos si no existen
INSERT IGNORE INTO vehiculos (id, marca, modelo, tipo, placa, año, estado, activo) VALUES
(1, 'Volvo', 'FH16', 'camion', 'ABC-123', 2020, 'operativo', 1),
(2, 'Scania', 'R450', 'camion', 'DEF-456', 2019, 'operativo', 1),
(3, 'Mercedes', 'Actros', 'camion', 'GHI-789', 2021, 'mantenimiento', 1),
(4, 'Ford', 'Transit', 'van', 'JKL-012', 2018, 'operativo', 1),
(5, 'Chevrolet', 'Silverado', 'pickup', 'MNO-345', 2020, 'operativo', 1);

-- 6. Verificar las estructuras actualizadas
SELECT 'Estructura usuarios actualizada' as mensaje;
DESCRIBE usuarios;

SELECT 'Estructura vehiculos actualizada' as mensaje;
DESCRIBE vehiculos;

SELECT 'Estructura viajes actualizada' as mensaje;
DESCRIBE viajes;

-- 7. Mostrar datos de prueba
SELECT 'Transportistas disponibles' as mensaje;
SELECT id, nombre, email, rol, estado, activo FROM usuarios WHERE rol = 'transportista';

SELECT 'Vehículos disponibles' as mensaje;
SELECT id, marca, modelo, tipo, placa, año, estado, activo FROM vehiculos;
