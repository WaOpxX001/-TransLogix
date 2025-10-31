-- TransportePro Database Schema
-- Base de datos: transporte_pro

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

-- Tabla de rutas/viajes
CREATE TABLE viajes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehiculo_id INT NOT NULL,
    conductor_id INT NOT NULL,
    origen VARCHAR(200) NOT NULL,
    destino VARCHAR(200) NOT NULL,
    fecha_salida DATETIME NOT NULL,
    fecha_llegada DATETIME NULL,
    kilometraje_inicial INT,
    kilometraje_final INT,
    estado ENUM('programado', 'en_curso', 'completado', 'cancelado') DEFAULT 'programado',
    observaciones TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id) ON DELETE CASCADE,
    FOREIGN KEY (conductor_id) REFERENCES usuarios(id) ON DELETE CASCADE
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

-- Datos de ejemplo
INSERT INTO usuarios (nombre, email, password, telefono, licencia, rol) VALUES
('Administrador Principal', 'admin@transporte.com', 'admin123', '555-0001', NULL, 'admin'),
('Supervisor General', 'supervisor@transporte.com', 'super123', '555-0002', NULL, 'supervisor'),
('Juan Díaz', 'juan@transporte.com', '12345', '555-0123', 'CDL-A-2024', 'transportista'),
('María López', 'maria@transporte.com', '12345', '555-0456', 'CDL-B-2023', 'transportista'),
('Carlos Ruiz', 'carlos@transporte.com', '12345', '555-0789', 'CDL-A-2022', 'transportista');

INSERT INTO vehiculos (placa, tipo, marca, modelo, año, kilometraje, estado) VALUES
('ABC-123', 'camion', 'Volvo', 'FH16', 2022, 45230, 'operativo'),
('DEF-456', 'camion', 'Kenworth', 'T680', 2021, 67890, 'operativo'),
('GHI-789', 'van', 'Mercedes', 'Sprinter', 2023, 12450, 'operativo'),
('JKL-012', 'pickup', 'Ford', 'F-150', 2020, 89000, 'mantenimiento'),
('MNO-345', 'trailer', 'Freightliner', 'Cascadia', 2019, 125000, 'fuera_servicio');

-- Asignar vehículos a transportistas
UPDATE vehiculos SET usuario_asignado = 3 WHERE placa = 'ABC-123';
UPDATE vehiculos SET usuario_asignado = 4 WHERE placa = 'GHI-789';
UPDATE vehiculos SET usuario_asignado = 5 WHERE placa = 'DEF-456';

INSERT INTO gastos (usuario_id, vehiculo_id, tipo, fecha, monto, kilometraje, litros, numero_factura, descripcion, estado) VALUES
(3, 1, 'combustible', '2025-01-08', 850.00, 45230, 120.5, 'FAC-2341', 'Carga completa de combustible', 'aprobado'),
(4, 3, 'mantenimiento', '2025-01-07', 2300.00, 12450, NULL, 'FAC-2342', 'Cambio de aceite y filtros', 'pendiente'),
(5, 2, 'peaje', '2025-01-06', 150.00, 67890, NULL, 'FAC-2343', 'Peajes autopista México-Guadalajara', 'aprobado'),
(3, 1, 'comida', '2025-01-05', 280.00, 45200, NULL, 'FAC-2344', 'Alimentación durante viaje largo', 'aprobado'),
(4, 3, 'multa', '2025-01-04', 500.00, 12400, NULL, 'MULTA-001', 'Exceso de velocidad', 'rechazado');

INSERT INTO mantenimientos (vehiculo_id, tipo_mantenimiento, descripcion, fecha_mantenimiento, costo, kilometraje_actual, proximo_mantenimiento_km, taller, estado) VALUES
(1, 'Cambio de aceite', 'Cambio de aceite y filtro de motor', '2025-01-01', 450.00, 45000, 50000, 'Taller Volvo Oficial', 'completado'),
(2, 'Revisión general', 'Revisión completa del sistema de frenos', '2025-01-15', 1200.00, 67500, 75000, 'Taller Kenworth', 'programado'),
(4, 'Reparación motor', 'Reparación de falla en motor', '2025-01-10', 3500.00, 89000, 95000, 'Taller Ford', 'en_proceso');

-- Crear vistas útiles para reportes
CREATE VIEW vista_gastos_resumen AS
SELECT 
    g.id,
    g.fecha,
    g.tipo,
    g.monto,
    g.estado,
    u.nombre as transportista,
    v.placa,
    v.marca,
    v.modelo
FROM gastos g
JOIN usuarios u ON g.usuario_id = u.id
JOIN vehiculos v ON g.vehiculo_id = v.id;

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
    u.nombre as conductor_asignado
FROM vehiculos v
LEFT JOIN usuarios u ON v.usuario_asignado = u.id;

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
