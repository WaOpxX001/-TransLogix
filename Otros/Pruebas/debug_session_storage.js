// Script para debuggear el sessionStorage
console.log('🔍 DEBUGGING SESSION STORAGE');
console.log('============================');

// Mostrar todo el sessionStorage
console.log('📦 Todo el sessionStorage:');
for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    const value = sessionStorage.getItem(key);
    console.log(`  ${key}:`, value);
}

// Verificar específicamente currentUser
const userStr = sessionStorage.getItem('currentUser');
console.log('👤 currentUser raw:', userStr);

if (userStr) {
    try {
        const user = JSON.parse(userStr);
        console.log('👤 currentUser parseado:', user);
        console.log('🔍 Propiedades del usuario:');
        Object.keys(user).forEach(key => {
            console.log(`  ${key}:`, `"${user[key]}"`, `(tipo: ${typeof user[key]})`);
        });
        
        // Verificar específicamente el rol
        console.log('🎭 Análisis del rol:');
        console.log('  user.role:', `"${user.role}"`);
        console.log('  user.role === "admin":', user.role === 'admin');
        console.log('  user.role === "supervisor":', user.role === 'supervisor');
        console.log('  user.role === "transportista":', user.role === 'transportista');
        
        // Verificar si hay espacios o caracteres extraños
        if (user.role) {
            console.log('  Longitud del rol:', user.role.length);
            console.log('  Códigos de caracteres:', Array.from(user.role).map(c => c.charCodeAt(0)));
            console.log('  Rol trimmed:', `"${user.role.trim()}"`);
            console.log('  Rol toLowerCase:', `"${user.role.toLowerCase()}"`);
        }
        
    } catch (error) {
        console.error('❌ Error parseando currentUser:', error);
    }
} else {
    console.log('❌ No hay currentUser en sessionStorage');
}

console.log('============================');
