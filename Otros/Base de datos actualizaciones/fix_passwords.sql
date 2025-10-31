-- Script para corregir las contraseñas de los usuarios
-- Ejecutar en phpMyAdmin después de seleccionar la base de datos transporte_pro

-- Actualizar contraseñas a texto plano para compatibilidad
UPDATE usuarios SET password = 'admin123' WHERE email = 'admin@transporte.com';
UPDATE usuarios SET password = 'super123' WHERE email = 'supervisor@transporte.com';
UPDATE usuarios SET password = '12345' WHERE email = 'juan@transporte.com';
UPDATE usuarios SET password = '12345' WHERE email = 'maria@transporte.com';
UPDATE usuarios SET password = '12345' WHERE email = 'carlos@transporte.com';

-- Verificar que se actualizaron correctamente
SELECT id, nombre, email, password, rol, activo FROM usuarios;
