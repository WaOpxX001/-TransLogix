-- Script para agregar columnas de días de bloqueo a la tabla solicitudes_viajes
USE transporte_pro;

-- Verificar si la columna dias_bloqueo existe
SET @col_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'transporte_pro' 
    AND TABLE_NAME = 'solicitudes_viajes' 
    AND COLUMN_NAME = 'dias_bloqueo'
);

-- Agregar columna dias_bloqueo si no existe
SET @sql = IF(@col_exists = 0,
    'ALTER TABLE solicitudes_viajes ADD COLUMN dias_bloqueo INT DEFAULT 10 COMMENT ''Número de días que el transportista no podrá solicitar el viaje después del rechazo'';',
    'SELECT ''La columna dias_bloqueo ya existe'' AS mensaje;'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar si la columna fecha_desbloqueo existe
SET @col_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'transporte_pro' 
    AND TABLE_NAME = 'solicitudes_viajes' 
    AND COLUMN_NAME = 'fecha_desbloqueo'
);

-- Agregar columna fecha_desbloqueo si no existe
SET @sql = IF(@col_exists = 0,
    'ALTER TABLE solicitudes_viajes ADD COLUMN fecha_desbloqueo DATETIME NULL COMMENT ''Fecha y hora en que el transportista podrá volver a solicitar el viaje'';',
    'SELECT ''La columna fecha_desbloqueo ya existe'' AS mensaje;'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar si el índice existe
SET @index_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = 'transporte_pro' 
    AND TABLE_NAME = 'solicitudes_viajes' 
    AND INDEX_NAME = 'idx_fecha_desbloqueo'
);

-- Agregar índice si no existe
SET @sql = IF(@index_exists = 0,
    'ALTER TABLE solicitudes_viajes ADD INDEX idx_fecha_desbloqueo (fecha_desbloqueo);',
    'SELECT ''El índice idx_fecha_desbloqueo ya existe'' AS mensaje;'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar que las columnas se agregaron correctamente
SELECT 
    'Columnas agregadas exitosamente' AS mensaje,
    COUNT(*) AS total_solicitudes
FROM solicitudes_viajes;

-- Mostrar estructura de la tabla
DESCRIBE solicitudes_viajes;
