-- Primero eliminar la tabla si existe para empezar limpio
DROP TABLE IF EXISTS viaje_ubicaciones;
DROP TABLE IF EXISTS viajes;

-- Crear la tabla viajes con la estructura correcta
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
    INDEX idx_transportista (transportista_id),
    INDEX idx_vehiculo (vehiculo_id),
    INDEX idx_estado (estado),
    INDEX idx_fecha (fecha_programada)
);
