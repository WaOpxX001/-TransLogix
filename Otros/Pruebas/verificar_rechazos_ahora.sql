-- Ver TODAS las solicitudes (incluyendo rechazadas)
SELECT 
    id,
    viaje_id,
    transportista_id,
    estado,
    fecha_solicitud,
    fecha_respuesta,
    dias_bloqueo,
    fecha_desbloqueo,
    motivo_denegacion,
    aprobado_por
FROM solicitudes_viajes
ORDER BY fecha_solicitud DESC
LIMIT 20;

-- Ver específicamente las rechazadas
SELECT 
    id,
    viaje_id,
    transportista_id,
    estado,
    dias_bloqueo,
    fecha_desbloqueo,
    motivo_denegacion,
    DATEDIFF(fecha_desbloqueo, NOW()) as dias_restantes
FROM solicitudes_viajes
WHERE estado = 'rechazada'
ORDER BY fecha_respuesta DESC;

-- Ver si hay alguna solicitud pendiente ahora mismo
SELECT COUNT(*) as total_pendientes FROM solicitudes_viajes WHERE estado = 'pendiente';

-- Ver si hay alguna solicitud rechazada ahora mismo
SELECT COUNT(*) as total_rechazadas FROM solicitudes_viajes WHERE estado = 'rechazada';
