-- Script para crear la tabla de solicitudes de viajes
USE transporte_pro;

-- Crear tabla solicitudes_viajes si no existe
CREATE TABLE IF NOT EXISTS solicitudes_viajes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    viaje_id INT NOT NULL,
    transportista_id INT NOT NULL,
    estado ENUM('pendiente', 'aprobada', 'rechazada') DEFAULT 'pendiente',
    fecha_solicitud DATETIME NOT NULL,
    fecha_respuesta DATETIME NULL,
    respondido_por INT NULL,
    motivo_rechazo TEXT NULL,
    observaciones TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (viaje_id) REFERENCES viajes(id) ON DELETE CASCADE,
    FOREIGN KEY (transportista_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (respondido_por) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_viaje_id (viaje_id),
    INDEX idx_transportista_id (transportista_id),
    INDEX idx_estado (estado),
    INDEX idx_fecha_solicitud (fecha_solicitud)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verificar que la tabla se creó correctamente
SELECT 
    'Tabla solicitudes_viajes creada/verificada correctamente' AS mensaje,
    COUNT(*) AS total_solicitudes
FROM solicitudes_viajes;
