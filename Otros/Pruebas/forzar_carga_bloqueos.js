// Script para forzar la carga de bloqueos
// Copia y pega esto en la consola del navegador (F12) cuando estés en la página de viajes

(async function() {
    console.log('🔧 INICIANDO DIAGNÓSTICO Y CORRECCIÓN...\n');
    
    // 1. Verificar usuario
    console.log('1️⃣ Verificando usuario...');
    const userStr = sessionStorage.getItem('currentUser');
    if (!userStr) {
        console.error('❌ NO HAY USUARIO EN sessionStorage');
        console.log('⚠️ SOLUCIÓN: Debes iniciar sesión primero');
        console.log('   1. Ve a la página principal');
        console.log('   2. Inicia sesión como transportista');
        console.log('   3. Vuelve a esta página');
        return;
    }
    
    const user = JSON.parse(userStr);
    console.log('✅ Usuario encontrado:', user);
    const userId = user.id || user.user_id;
    console.log('   ID:', userId);
    console.log('   Nombre:', user.name || user.nombre);
    console.log('   Rol:', user.role || user.user_role);
    
    // 2. Verificar ViajesManager
    console.log('\n2️⃣ Verificando ViajesManager...');
    if (typeof window.ViajesManager === 'undefined') {
        console.error('❌ ViajesManager NO EXISTE');
        console.log('⚠️ SOLUCIÓN: Recarga la página con Ctrl+F5');
        return;
    }
    console.log('✅ ViajesManager existe');
    
    // 3. Verificar viajes cargados
    console.log('\n3️⃣ Verificando viajes...');
    if (!window.ViajesManager.viajes || window.ViajesManager.viajes.length === 0) {
        console.error('❌ No hay viajes cargados');
        console.log('⚠️ Esperando a que se carguen...');
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    console.log('✅ Viajes cargados:', window.ViajesManager.viajes?.length || 0);
    
    // 4. Forzar carga de solicitudes
    console.log('\n4️⃣ Forzando carga de solicitudes y bloqueos...');
    try {
        await window.ViajesManager.cargarSolicitudesPendientes();
        console.log('✅ Solicitudes cargadas:', window.ViajesManager.solicitudesPendientes?.length || 0);
        
        // Mostrar detalles
        if (window.ViajesManager.solicitudesPendientes && window.ViajesManager.solicitudesPendientes.length > 0) {
            console.log('\n📋 DETALLES DE SOLICITUDES:');
            window.ViajesManager.solicitudesPendientes.forEach(s => {
                console.log(`\n   Viaje ${s.viaje_id}:`);
                console.log(`   - Tiene solicitud: ${s.tiene_solicitud}`);
                console.log(`   - Bloqueado: ${s.bloqueado}`);
                if (s.bloqueado) {
                    console.log(`   - Días restantes: ${s.dias_restantes}`);
                    console.log(`   - Días totales: ${s.dias_bloqueo_total}`);
                    console.log(`   - Fecha desbloqueo: ${s.fecha_desbloqueo}`);
                    console.log(`   - Motivo: ${s.motivo_rechazo}`);
                }
            });
        }
    } catch (error) {
        console.error('❌ Error cargando solicitudes:', error);
    }
    
    // 5. Verificar bloqueos específicos
    console.log('\n5️⃣ Verificando bloqueos por viaje...');
    const viajesPendientes = window.ViajesManager.viajes.filter(v => v.estado === 'pendiente');
    console.log(`   Viajes pendientes: ${viajesPendientes.length}`);
    
    for (const viaje of viajesPendientes) {
        const bloqueo = window.ViajesManager.verificarBloqueoViaje(viaje.id);
        if (bloqueo && bloqueo.bloqueado) {
            console.log(`\n   🔒 VIAJE ${viaje.id} ESTÁ BLOQUEADO:`);
            console.log(`      Días restantes: ${bloqueo.dias_restantes}`);
            console.log(`      Motivo: ${bloqueo.motivo_rechazo}`);
        }
    }
    
    // 6. Probar API directamente
    console.log('\n6️⃣ Probando API directamente...');
    if (viajesPendientes.length > 0) {
        const viajeId = viajesPendientes[0].id;
        const url = `/LogisticaFinal/api/viajes/verificar_solicitud.php?viaje_id=${viajeId}&user_id=${userId}`;
        console.log(`   URL: ${url}`);
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            console.log('   Respuesta:', data);
            
            if (data.bloqueado) {
                console.log(`   🔒 API reporta: BLOQUEADO por ${data.dias_restantes} días`);
            } else if (data.tiene_solicitud) {
                console.log(`   ⏳ API reporta: SOLICITUD PENDIENTE`);
            } else {
                console.log(`   ✅ API reporta: DISPONIBLE`);
            }
        } catch (error) {
            console.error('   ❌ Error en API:', error);
        }
    }
    
    // 7. Forzar re-renderizado
    console.log('\n7️⃣ Forzando re-renderizado de viajes...');
    try {
        window.ViajesManager.mostrarViajes();
        console.log('✅ Viajes re-renderizados');
    } catch (error) {
        console.error('❌ Error re-renderizando:', error);
    }
    
    console.log('\n✅ DIAGNÓSTICO COMPLETADO');
    console.log('\n📝 RESUMEN:');
    console.log(`   Usuario: ${user.name || user.nombre} (ID: ${userId})`);
    console.log(`   Viajes: ${window.ViajesManager.viajes?.length || 0}`);
    console.log(`   Solicitudes: ${window.ViajesManager.solicitudesPendientes?.length || 0}`);
    
    const bloqueados = window.ViajesManager.solicitudesPendientes?.filter(s => s.bloqueado) || [];
    if (bloqueados.length > 0) {
        console.log(`   🔒 Bloqueos activos: ${bloqueados.length}`);
        console.log('\n⚠️ Si no ves el contador en la interfaz:');
        console.log('   1. Verifica que estés viendo los viajes del transportista correcto');
        console.log('   2. Limpia el caché del navegador (Ctrl+Shift+Delete)');
        console.log('   3. Recarga con Ctrl+F5');
    } else {
        console.log('   ℹ️ No hay bloqueos activos para este usuario');
    }
})();
