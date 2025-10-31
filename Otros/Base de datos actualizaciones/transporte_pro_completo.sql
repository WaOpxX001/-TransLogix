-- TransportePro Database Schema COMPLETO
-- Base de datos: transporte_pro
-- Versión actualizada con tabla de viajes corregida

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS transporte_pro;
USE transporte_pro;

-- Tabla de usuarios (transportistas, supervisores, administradores)
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    licencia VARCHAR(50),
    rol ENUM('admin', 'supervisor', 'transportista') NOT NULL DEFAULT 'transportista',
    activo BOOLEAN DEFAULT TRUE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso TIMESTAMP NULL
);

-- Tabla de vehículos
CREATE TABLE vehiculos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    placa VARCHAR(20) UNIQUE NOT NULL,
    tipo ENUM('camion', 'van', 'pickup', 'trailer') NOT NULL,
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    año INT NOT NULL,
    kilometraje INT DEFAULT 0,
    estado ENUM('operativo', 'mantenimiento', 'fuera_servicio', 'disponible') DEFAULT 'disponible',
    usuario_asignado INT NULL,
    ultimo_servicio DATE NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_asignado) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Tabla de gastos
CREATE TABLE gastos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    vehiculo_id INT NOT NULL,
    tipo ENUM('combustible', 'mantenimiento', 'peaje', 'multa', 'hospedaje', 'comida', 'otros') NOT NULL,
    fecha DATE NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    kilometraje INT,
    litros DECIMAL(8,2) NULL,
    numero_factura VARCHAR(50),
    descripcion TEXT,
    recibo_imagen VARCHAR(255) NULL,
    estado ENUM('pendiente', 'aprobado', 'rechazado') DEFAULT 'pendiente',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    aprobado_por INT NULL,
    fecha_aprobacion TIMESTAMP NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id) ON DELETE CASCADE,
    FOREIGN KEY (aprobado_por) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Tabla de mantenimientos
CREATE TABLE mantenimientos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehiculo_id INT NOT NULL,
    tipo_mantenimiento VARCHAR(100) NOT NULL,
    descripcion TEXT,
    fecha_mantenimiento DATE NOT NULL,
    costo DECIMAL(10,2),
    kilometraje_actual INT,
    proximo_mantenimiento_km INT,
    taller VARCHAR(100),
    estado ENUM('programado', 'en_proceso', 'completado') DEFAULT 'programado',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id) ON DELETE CASCADE
);

-- Tabla de viajes (ESTRUCTURA ACTUALIZADA)
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
    FOREIGN KEY (transportista_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id) ON DELETE CASCADE
);

-- Tabla para seguimiento de ubicaciones en tiempo real
CREATE TABLE viaje_ubicaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    viaje_id INT NOT NULL,
    latitud DECIMAL(10, 8),
    longitud DECIMAL(11, 8),
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observacion VARCHAR(255),
    FOREIGN KEY (viaje_id) REFERENCES viajes(id) ON DELETE CASCADE
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_gastos_fecha ON gastos(fecha);
CREATE INDEX idx_gastos_usuario ON gastos(usuario_id);
CREATE INDEX idx_gastos_vehiculo ON gastos(vehiculo_id);
CREATE INDEX idx_gastos_tipo ON gastos(tipo);
CREATE INDEX idx_gastos_estado ON gastos(estado);
CREATE INDEX idx_vehiculos_estado ON vehiculos(estado);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
CREATE INDEX idx_usuarios_activo ON usuarios(activo);
CREATE INDEX idx_viajes_estado ON viajes(estado);
CREATE INDEX idx_viajes_fecha ON viajes(fecha_programada);
CREATE INDEX idx_viajes_transportista ON viajes(transportista_id);

-- ============================================
-- DATOS DE EJEMPLO
-- ============================================

-- Insertar usuarios de ejemplo
INSERT INTO usuarios (nombre, email, password, telefono, licencia, rol, activo) VALUES
('Administrador Principal', 'admin@transporte.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '555-0001', NULL, 'admin', 1),
('Supervisor General', 'supervisor@transporte.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '555-0002', NULL, 'supervisor', 1),
('Juan Díaz', 'juan@transporte.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '555-0123', 'CDL-A-2024', 'transportista', 1),
('María López', 'maria@transporte.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '555-0456', 'CDL-B-2023', 'transportista', 1),
('Carlos Ruiz', 'carlos@transporte.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '555-0789', 'CDL-A-2022', 'transportista', 1);

-- Insertar vehículos de ejemplo
INSERT INTO vehiculos (placa, tipo, marca, modelo, año, kilometraje, estado, usuario_asignado) VALUES
('ABC-123', 'camion', 'Volvo', 'FH16', 2022, 45230, 'operativo', 3),
('DEF-456', 'camion', 'Kenworth', 'T680', 2021, 67890, 'operativo', 5),
('GHI-789', 'van', 'Mercedes', 'Sprinter', 2023, 12450, 'operativo', 4),
('JKL-012', 'pickup', 'Ford', 'F-150', 2020, 89000, 'mantenimiento', NULL),
('MNO-345', 'trailer', 'Freightliner', 'Cascadia', 2019, 125000, 'fuera_servicio', NULL);

-- Insertar gastos de ejemplo
INSERT INTO gastos (usuario_id, vehiculo_id, tipo, fecha, monto, kilometraje, litros, numero_factura, descripcion, estado, aprobado_por, fecha_aprobacion) VALUES
(3, 1, 'combustible', '2025-01-08', 850.00, 45230, 120.5, 'FAC-2341', 'Carga completa de combustible', 'aprobado', 2, '2025-01-08 14:30:00'),
(4, 3, 'mantenimiento', '2025-01-07', 2300.00, 12450, NULL, 'FAC-2342', 'Cambio de aceite y filtros', 'pendiente', NULL, NULL),
(5, 2, 'peaje', '2025-01-06', 150.00, 67890, NULL, 'FAC-2343', 'Peajes autopista México-Guadalajara', 'aprobado', 2, '2025-01-06 16:45:00'),
(3, 1, 'comida', '2025-01-05', 280.00, 45200, NULL, 'FAC-2344', 'Alimentación durante viaje largo', 'aprobado', 2, '2025-01-05 18:20:00'),
(4, 3, 'multa', '2025-01-04', 500.00, 12400, NULL, 'MULTA-001', 'Exceso de velocidad', 'rechazado', 2, '2025-01-04 10:15:00'),
(5, 2, 'combustible', '2025-01-09', 920.00, 68100, 135.2, 'FAC-2345', 'Combustible para ruta larga', 'pendiente', NULL, NULL),
(3, 1, 'hospedaje', '2025-01-03', 450.00, 45100, NULL, 'FAC-2346', 'Hotel durante viaje nocturno', 'aprobado', 2, '2025-01-03 09:30:00');

-- Insertar mantenimientos de ejemplo
INSERT INTO mantenimientos (vehiculo_id, tipo_mantenimiento, descripcion, fecha_mantenimiento, costo, kilometraje_actual, proximo_mantenimiento_km, taller, estado) VALUES
(1, 'Cambio de aceite', 'Cambio de aceite y filtro de motor', '2025-01-01', 450.00, 45000, 50000, 'Taller Volvo Oficial', 'completado'),
(2, 'Revisión general', 'Revisión completa del sistema de frenos', '2025-01-15', 1200.00, 67500, 75000, 'Taller Kenworth', 'programado'),
(4, 'Reparación motor', 'Reparación de falla en motor', '2025-01-10', 3500.00, 89000, 95000, 'Taller Ford', 'en_proceso'),
(3, 'Mantenimiento preventivo', 'Revisión general y cambio de llantas', '2025-01-20', 2800.00, 12000, 20000, 'Taller Mercedes', 'programado'),
(5, 'Reparación mayor', 'Reconstrucción de motor', '2025-01-25', 15000.00, 125000, 135000, 'Taller Especializado', 'programado');

-- Insertar viajes de ejemplo
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
    fecha_inicio,
    fecha_completado,
    estado,
    observaciones
) VALUES 
('VJ-001', 'Jalisco', 'Guadalajara', 'Av. López Mateos 2375', 'Ciudad de México', 'Miguel Hidalgo', 'Polanco, Av. Masaryk 111', 3, 1, 'Empresa ABC S.A.', 'Mercancía General', 500.00, '2025-01-12', '08:00:00', NULL, NULL, 'pendiente', 'Viaje programado para mañana'),
('VJ-002', 'Nuevo León', 'Monterrey', 'Puerto Industrial', 'Jalisco', 'Guadalajara', 'Almacén Norte', 4, 3, 'TechCorp México', 'Electrónicos', 800.00, '2025-01-12', '10:30:00', NULL, NULL, 'pendiente', 'Carga frágil - manejar con cuidado'),
('VJ-003', 'Guanajuato', 'León', 'Zona Industrial', 'Puebla', 'Puebla', 'Centro Comercial', 5, 2, 'Moda Internacional', 'Textiles', 300.00, '2025-01-11', '06:00:00', '2025-01-11 06:15:00', '2025-01-11 14:30:00', 'completado', 'Entrega exitosa, cliente satisfecho'),
('VJ-004', 'Veracruz', 'Veracruz', 'Puerto de Veracruz', 'Yucatán', 'Mérida', 'Centro de Distribución', 3, 1, 'Importadora del Sureste', 'Contenedores', 1200.00, '2025-01-13', '05:00:00', '2025-01-13 05:30:00', NULL, 'en_ruta', 'Viaje en progreso, llegada estimada 18:00'),
('VJ-005', 'Sonora', 'Hermosillo', 'Zona Industrial Norte', 'Baja California', 'Tijuana', 'Maquiladora TecnoMax', 4, 3, 'Electrónicos del Norte', 'Componentes', 650.00, '2025-01-14', '07:30:00', NULL, NULL, 'pendiente', 'Requiere documentación especial para cruce fronterizo'),
('VJ-006', 'Chihuahua', 'Ciudad Juárez', 'Parque Industrial', 'Texas', 'El Paso', 'Warehouse District', 5, 2, 'Cross Border Logistics', 'Autopartes', 900.00, '2025-01-15', '04:00:00', NULL, NULL, 'cancelado', 'Cancelado por problemas aduanales');

-- Insertar ubicaciones de ejemplo para seguimiento
INSERT INTO viaje_ubicaciones (viaje_id, latitud, longitud, observacion) VALUES
(4, 19.173773, -96.134224, 'Salida del puerto de Veracruz'),
(4, 19.543665, -96.910683, 'Paso por Córdoba'),
(4, 19.701400, -101.193600, 'Descanso en Morelia');

-- ============================================
-- VISTAS ÚTILES PARA REPORTES
-- ============================================

-- Vista resumen de gastos
CREATE VIEW vista_gastos_resumen AS
SELECT 
    g.id,
    g.fecha,
    g.tipo,
    g.monto,
    g.estado,
    g.numero_factura,
    u.nombre as transportista,
    v.placa,
    v.marca,
    v.modelo,
    CASE 
        WHEN g.aprobado_por IS NOT NULL THEN 
            (SELECT nombre FROM usuarios WHERE id = g.aprobado_por)
        ELSE NULL 
    END as aprobado_por_nombre
FROM gastos g
JOIN usuarios u ON g.usuario_id = u.id
JOIN vehiculos v ON g.vehiculo_id = v.id;

-- Vista estado de vehículos
CREATE VIEW vista_vehiculos_estado AS
SELECT 
    v.id,
    v.placa,
    v.tipo,
    v.marca,
    v.modelo,
    v.año,
    v.kilometraje,
    v.estado,
    v.ultimo_servicio,
    CASE 
        WHEN v.usuario_asignado IS NOT NULL THEN 
            (SELECT nombre FROM usuarios WHERE id = v.usuario_asignado)
        ELSE 'Sin asignar'
    END as conductor_asignado
FROM vehiculos v;

-- Vista resumen de viajes
CREATE VIEW vista_viajes_resumen AS
SELECT 
    v.id,
    v.numero_viaje,
    v.origen_estado,
    v.origen_municipio,
    v.destino_estado,
    v.destino_municipio,
    v.cliente,
    v.carga_tipo,
    v.carga_peso,
    v.fecha_programada,
    v.hora_programada,
    v.estado,
    u.nombre as transportista,
    vh.placa,
    vh.marca,
    vh.modelo
FROM viajes v
JOIN usuarios u ON v.transportista_id = u.id
JOIN vehiculos vh ON v.vehiculo_id = vh.id;

-- ============================================
-- PROCEDIMIENTOS ALMACENADOS
-- ============================================

-- Procedimiento para aprobar gastos
DELIMITER //
CREATE PROCEDURE AprobarGasto(
    IN gasto_id INT,
    IN supervisor_id INT
)
BEGIN
    UPDATE gastos 
    SET estado = 'aprobado', 
        aprobado_por = supervisor_id, 
        fecha_aprobacion = NOW()
    WHERE id = gasto_id;
END //
DELIMITER ;

-- Procedimiento para rechazar gastos
DELIMITER //
CREATE PROCEDURE RechazarGasto(
    IN gasto_id INT,
    IN supervisor_id INT
)
BEGIN
    UPDATE gastos 
    SET estado = 'rechazado', 
        aprobado_por = supervisor_id, 
        fecha_aprobacion = NOW()
    WHERE id = gasto_id;
END //
DELIMITER ;

-- Procedimiento para iniciar viaje
DELIMITER //
CREATE PROCEDURE IniciarViaje(
    IN viaje_id INT
)
BEGIN
    UPDATE viajes 
    SET estado = 'en_ruta', 
        fecha_inicio = NOW()
    WHERE id = viaje_id AND estado = 'pendiente';
END //
DELIMITER ;

-- Procedimiento para completar viaje
DELIMITER //
CREATE PROCEDURE CompletarViaje(
    IN viaje_id INT
)
BEGIN
    UPDATE viajes 
    SET estado = 'completado', 
        fecha_completado = NOW()
    WHERE id = viaje_id AND estado = 'en_ruta';
END //
DELIMITER ;

-- ============================================
-- FUNCIONES ÚTILES
-- ============================================

-- Función para calcular total de gastos por período
DELIMITER //
CREATE FUNCTION TotalGastosPeriodo(
    fecha_inicio DATE,
    fecha_fin DATE,
    usuario_id INT
) RETURNS DECIMAL(10,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE total DECIMAL(10,2) DEFAULT 0;
    
    SELECT COALESCE(SUM(monto), 0) INTO total
    FROM gastos 
    WHERE fecha BETWEEN fecha_inicio AND fecha_fin
    AND (usuario_id IS NULL OR gastos.usuario_id = usuario_id)
    AND estado = 'aprobado';
    
    RETURN total;
END //
DELIMITER ;

-- Función para obtener kilometraje total de vehículo
DELIMITER //
CREATE FUNCTION KilometrajeVehiculo(
    vehiculo_id INT
) RETURNS INT
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE km INT DEFAULT 0;
    
    SELECT COALESCE(kilometraje, 0) INTO km
    FROM vehiculos 
    WHERE id = vehiculo_id;
    
    RETURN km;
END //
DELIMITER ;

-- ============================================
-- TRIGGERS PARA AUDITORÍA
-- ============================================

-- Trigger para actualizar ultimo_acceso en usuarios
DELIMITER //
CREATE TRIGGER actualizar_ultimo_acceso
AFTER UPDATE ON usuarios
FOR EACH ROW
BEGIN
    IF NEW.password != OLD.password THEN
        UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = NEW.id;
    END IF;
END //
DELIMITER ;

-- Mensaje de confirmación
SELECT 'Base de datos TransportePro creada exitosamente con todas las tablas, datos de ejemplo, vistas, procedimientos y funciones.' as mensaje;
