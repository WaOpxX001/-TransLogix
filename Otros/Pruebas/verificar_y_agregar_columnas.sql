-- Verificar si las columnas existen
SHOW COLUMNS FROM solicitudes_viajes LIKE 'dias_bloqueo';
SHOW COLUMNS FROM solicitudes_viajes LIKE 'fecha_desbloqueo';
SHOW COLUMNS FROM solicitudes_viajes LIKE 'motivo_denegacion';

-- Si NO existen, ejecuta esto:
ALTER TABLE solicitudes_viajes 
ADD COLUMN IF NOT EXISTS dias_bloqueo INT DEFAULT 10,
ADD COLUMN IF NOT EXISTS fecha_desbloqueo DATETIME NULL,
ADD COLUMN IF NOT EXISTS motivo_denegacion TEXT NULL;

-- Verificar que se agregaron
DESCRIBE solicitudes_viajes;

-- Ver todas las solicitudes rechazadas
SELECT 
    id,
    viaje_id,
    transportista_id,
    estado,
    dias_bloqueo,
    fecha_desbloqueo,
    motivo_denegacion,
    fecha_respuesta
FROM solicitudes_viajes
WHERE estado = 'rechazada'
ORDER BY fecha_respuesta DESC;
