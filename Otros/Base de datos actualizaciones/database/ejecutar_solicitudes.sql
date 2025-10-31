USE transporte_pro;

-- Verificar si la columna ya existe
SET @col_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'transporte_pro' 
    AND TABLE_NAME = 'solicitudes_viajes' 
    AND COLUMN_NAME = 'viaje_id'
);

-- Solo agregar si no existe
SET @sql = IF(@col_exists = 0,
    'ALTER TABLE solicitudes_viajes ADD COLUMN viaje_id INT NULL AFTER id, ADD FOREIGN KEY (viaje_id) REFERENCES viajes(id) ON DELETE CASCADE;',
    'SELECT ''La columna viaje_id ya existe'' AS mensaje;'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'SQL ejecutado correctamente' AS resultado;
