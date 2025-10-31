-- Script SIMPLE para agregar columnas de días de bloqueo
-- Copiar y pegar en phpMyAdmin

USE transporte_pro;

-- Agregar columna dias_bloqueo
ALTER TABLE solicitudes_viajes 
ADD COLUMN dias_bloqueo INT DEFAULT 10 
COMMENT 'Número de días de bloqueo';

-- Agregar columna fecha_desbloqueo
ALTER TABLE solicitudes_viajes 
ADD COLUMN fecha_desbloqueo DATETIME NULL 
COMMENT 'Fecha de desbloqueo';

-- Agregar índice
ALTER TABLE solicitudes_viajes 
ADD INDEX idx_fecha_desbloqueo (fecha_desbloqueo);

-- Verificar
SELECT 'Columnas agregadas exitosamente' AS resultado;
DESCRIBE solicitudes_viajes;
