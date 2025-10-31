-- Script para agregar la columna viaje_id a la tabla gastos
-- Este script es seguro de ejecutar múltiples veces (no falla si la columna ya existe)

-- Agregar columna viaje_id si no existe
SET @dbname = DATABASE();
SET @tablename = 'gastos';
SET @columnname = 'viaje_id';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' INT NULL AFTER vehiculo_id, ADD INDEX idx_viaje_id (viaje_id), ADD FOREIGN KEY (viaje_id) REFERENCES viajes(id) ON DELETE SET NULL')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Verificar que la columna se agregó correctamente
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_KEY
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'gastos'
    AND COLUMN_NAME = 'viaje_id';
