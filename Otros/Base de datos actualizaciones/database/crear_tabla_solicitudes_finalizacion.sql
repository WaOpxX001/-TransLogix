-- Crear tabla para solicitudes de finalización de viajes
CREATE TABLE IF NOT EXISTS solicitudes_finalizacion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    viaje_id INT NOT NULL,
    transportista_id INT NOT NULL,
    estado ENUM('pendiente', 'aprobada', 'rechazada') DEFAULT 'pendiente',
    fecha_solicitud DATETIME NOT NULL,
    fecha_respuesta DATETIME NULL,
    aprobado_por INT NULL,
    motivo_rechazo TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (viaje_id) REFERENCES viajes(id) ON DELETE CASCADE,
    FOREIGN KEY (transportista_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (aprobado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_viaje_estado (viaje_id, estado),
    INDEX idx_transportista (transportista_id),
    INDEX idx_fecha_solicitud (fecha_solicitud)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Agregar columna motivo_rechazo_finalizacion a la tabla viajes si no existe
ALTER TABLE viajes 
ADD COLUMN IF NOT EXISTS motivo_rechazo_finalizacion TEXT NULL COMMENT 'Motivo del rechazo de finalización del viaje';
