// Script de debugging para verificar la carga de viajes
console.log('🔍 DEBUG: Verificando carga de información de usuario...');

// Verificar sessionStorage
const userStr = sessionStorage.getItem('currentUser');
if (userStr) {
    const user = JSON.parse(userStr);
    console.log('✅ Usuario en sessionStorage:', {
        id: user.id,
        name: user.name,
        role: user.role
    });
    
    // Simular la lógica de restricciones
    if (user.role === 'transportista') {
        console.log('🚛 TRANSPORTISTA detectado - Deberían aplicarse restricciones');
        console.log('❌ Ocultar: Botón Nuevo Viaje, Filtro Transportista');
        console.log('✅ Mostrar: Solo botón Ver Detalles');
    } else {
        console.log('👨‍💼 ADMIN/SUPERVISOR detectado - Vista completa');
        console.log('✅ Mostrar: Todos los botones y filtros');
    }
} else {
    console.log('❌ No hay usuario en sessionStorage');
}

// Verificar elementos del DOM
setTimeout(() => {
    console.log('🔍 Verificando elementos DOM...');
    
    const btnNuevoViaje = document.getElementById('btnNuevoViaje');
    const filterTransportista = document.getElementById('filterTransportista');
    const cardTitle = document.querySelector('#viajesSection .card-title');
    
    console.log('DOM Elements:', {
        btnNuevoViaje: btnNuevoViaje ? 'Existe' : 'No existe',
        btnNuevoViajeVisible: btnNuevoViaje ? (btnNuevoViaje.style.display !== 'none' ? 'Visible' : 'Oculto') : 'N/A',
        filterTransportista: filterTransportista ? 'Existe' : 'No existe',
        filterTransportistaVisible: filterTransportista ? (filterTransportista.parentElement.style.display !== 'none' ? 'Visible' : 'Oculto') : 'N/A',
        cardTitle: cardTitle ? cardTitle.innerHTML : 'No existe'
    });
}, 1000);
