-- Script para arreglar la base de datos en Railway
-- Ejecuta cada bloque por separado

-- 1. Agregar columnas en usuarios (ejecuta uno por uno)
ALTER TABLE usuarios ADD COLUMN ultimo_acceso DATETIME NULL;
ALTER TABLE usuarios ADD COLUMN activo TINYINT(1) DEFAULT 1;
ALTER TABLE usuarios ADD COLUMN fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP;

-- 2. Agregar columnas en vehiculos (ejecuta uno por uno)
ALTER TABLE vehiculos ADD COLUMN kilometraje INT DEFAULT 0;
ALTER TABLE vehiculos ADD COLUMN año INT NULL;
ALTER TABLE vehiculos ADD COLUMN ultimo_servicio DATE NULL;

-- 3. Agregar columnas en gastos (ejecuta uno por uno)
ALTER TABLE gastos ADD COLUMN litros DECIMAL(10,2) DEFAULT 0;
ALTER TABLE gastos ADD COLUMN usuario_id INT NULL;
ALTER TABLE gastos ADD COLUMN vehiculo_id INT NULL;

-- 4. Agregar columnas en viajes (ejecuta uno por uno)
ALTER TABLE viajes ADD COLUMN transportista_id INT NULL;
ALTER TABLE viajes ADD COLUMN vehiculo_id INT NULL;
ALTER TABLE viajes ADD COLUMN fecha_completado DATETIME NULL;

-- 5. Actualizar datos existentes
UPDATE usuarios SET activo = 1 WHERE activo IS NULL;
UPDATE usuarios SET fecha_registro = NOW() WHERE fecha_registro IS NULL;
