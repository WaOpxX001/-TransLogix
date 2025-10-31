-- Script para corregir la tabla viajes y agregar las columnas faltantes
-- Ejecutar en phpMyAdmin después de seleccionar la base de datos transporte_pro

-- 1. Eliminar la tabla viajes actual si existe
DROP TABLE IF EXISTS viajes;

-- 2. Crear la tabla viajes con la estructura correcta
CREATE TABLE viajes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_viaje VARCHAR(20) UNIQUE NOT NULL,
    origen_estado VARCHAR(100) NOT NULL,
    origen_municipio VARCHAR(100) NOT NULL,
    origen_direccion TEXT,
    destino_estado VARCHAR(100) NOT NULL,
    destino_municipio VARCHAR(100) NOT NULL,
    destino_direccion TEXT,
    transportista_id INT NOT NULL,
    vehiculo_id INT NOT NULL,
    cliente VARCHAR(200),
    carga_tipo VARCHAR(100),
    carga_peso DECIMAL(10,2),
    fecha_programada DATE NOT NULL,
    hora_programada TIME NOT NULL,
    fecha_inicio DATETIME NULL,
    fecha_completado DATETIME NULL,
    estado ENUM('pendiente', 'en_ruta', 'completado', 'cancelado') DEFAULT 'pendiente',
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (transportista_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id) ON DELETE CASCADE
);

-- 3. Tabla para seguimiento de ubicaciones en tiempo real (opcional)
CREATE TABLE IF NOT EXISTS viaje_ubicaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    viaje_id INT NOT NULL,
    latitud DECIMAL(10, 8),
    longitud DECIMAL(11, 8),
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observacion VARCHAR(255),
    FOREIGN KEY (viaje_id) REFERENCES viajes(id) ON DELETE CASCADE
);

-- 4. Insertar datos de ejemplo
INSERT INTO viajes (
    numero_viaje, 
    origen_estado, 
    origen_municipio, 
    origen_direccion,
    destino_estado, 
    destino_municipio, 
    destino_direccion,
    transportista_id, 
    vehiculo_id, 
    cliente,
    carga_tipo,
    carga_peso,
    fecha_programada, 
    hora_programada, 
    estado,
    observaciones
) VALUES 
('VJ-001', 'Jalisco', 'Guadalajara', 'Av. López Mateos 2375', 'Ciudad de México', 'Miguel Hidalgo', 'Polanco, Av. Masaryk 111', 3, 1, 'Empresa ABC S.A.', 'Mercancía General', 500.00, '2025-01-12', '08:00:00', 'pendiente', 'Viaje programado para mañana'),
('VJ-002', 'Nuevo León', 'Monterrey', 'Puerto Industrial', 'Jalisco', 'Guadalajara', 'Almacén Norte', 4, 2, 'TechCorp México', 'Electrónicos', 800.00, '2025-01-12', '10:30:00', 'pendiente', 'Carga frágil - manejar con cuidado'),
('VJ-003', 'Guanajuato', 'León', 'Zona Industrial', 'Puebla', 'Puebla', 'Centro Comercial', 5, 3, 'Moda Internacional', 'Textiles', 300.00, '2025-01-11', '06:00:00', 'completado', 'Entrega exitosa, cliente satisfecho');

-- 5. Verificar que todo se creó correctamente
SELECT 'Tabla viajes creada correctamente' as mensaje;
DESCRIBE viajes;

SELECT 'Datos de ejemplo insertados' as mensaje;
SELECT * FROM viajes;
