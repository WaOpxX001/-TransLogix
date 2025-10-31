-- Agregar campo viaje_id a la tabla solicitudes_viajes
-- Este campo permite vincular solicitudes de inicio de viajes existentes

ALTER TABLE solicitudes_viajes 
ADD COLUMN viaje_id INT NULL AFTER id,
ADD FOREIGN KEY (viaje_id) REFERENCES viajes(id) ON DELETE CASCADE;

-- Comentario: 
-- Si viaje_id es NULL -> Solicitud de crear un viaje nuevo
-- Si viaje_id tiene valor -> Solicitud de iniciar un viaje existente
