-- Insertar datos de ejemplo para la tabla viajes
-- Ejecutar DESPUÉS de crear la tabla viajes

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
('VJ-001', 'Jalisco', 'Guadalajara', 'Av. López Mateos 2375', 'Ciudad de México', 'Miguel Hidalgo', 'Polanco, Av. Masaryk 111', 1, 1, 'Empresa ABC S.A.', 'Mercancía General', 500.00, '2025-01-12', '08:00:00', 'pendiente', 'Viaje programado para mañana'),
('VJ-002', 'Nuevo León', 'Monterrey', 'Puerto Industrial', 'Jalisco', 'Guadalajara', 'Almacén Norte', 1, 1, 'TechCorp México', 'Electrónicos', 800.00, '2025-01-12', '10:30:00', 'pendiente', 'Carga frágil - manejar con cuidado'),
('VJ-003', 'Guanajuato', 'León', 'Zona Industrial', 'Puebla', 'Puebla', 'Centro Comercial', 1, 1, 'Moda Internacional', 'Textiles', 300.00, '2025-01-11', '06:00:00', 'completado', 'Entrega exitosa, cliente satisfecho');
