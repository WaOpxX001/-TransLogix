# 🚀 Guía Rápida - Optimización TransLogix

## 📖 Cómo Usar las Nuevas Funcionalidades

### 1. Loading Skeletons

#### Mostrar skeleton mientras cargan datos:
```javascript
// En cualquier función de carga
async function cargarViajes() {
    // 1. Mostrar skeleton
    skeletonHelpers.showViajesSkeleton('viajesContainer', 6);
    
    // 2. Cargar datos
    const viajes = await fetch('/api/viajes/list.php').then(r => r.json());
    
    // 3. Renderizar datos (el skeleton se remueve automáticamente)
    renderViajes(viajes);
}
```

#### Tipos de skeletons disponibles:
```javascript
// Tabla
skeletonHelpers.showTableSkeleton('tableContainer', 10); // 10 filas

// Cards de viajes
skeletonHelpers.showViajesSkeleton('viajesContainer', 6); // 6 cards

// Dashboard
skeletonHelpers.showDashboardSkeleton('dashboardContainer');

// Transportistas
skeletonHelpers.showTransportistasSkeleton('transportistasContainer', 8);

// Cards genéricos
skeletonHelpers.showCardsSkeleton('cardsContainer', 6);
```

---

### 2. Loading Overlay

#### Mostrar overlay de carga:
```javascript
// Mostrar
showLoading('Guardando datos...', 'Por favor espera');

// Hacer operación
await guardarDatos();

// Ocultar
hideLoading();
```

#### Con manejo de errores:
```javascript
try {
    showLoading('Procesando...', 'Esto puede tomar unos segundos');
    await operacionLarga();
    hideLoading();
    alert('¡Éxito!');
} catch (error) {
    hideLoading();
    alert('Error: ' + error.message);
}
```

---

### 3. Cache Inteligente

#### Guardar datos en cache:
```javascript
// Guardar por 5 minutos (default)
cacheManager.set('viajes', viajesData);

// Guardar por 10 minutos
cacheManager.set('viajes', viajesData, 10 * 60 * 1000);

// Guardar por 1 hora
cacheManager.set('viajes', viajesData, 60 * 60 * 1000);
```

#### Obtener datos del cache:
```javascript
async function cargarViajes() {
    // Intentar obtener del cache
    const cached = cacheManager.get('viajes');
    
    if (cached) {
        console.log('✅ Datos del cache');
        renderViajes(cached);
        return;
    }
    
    // Si no hay cache, cargar de API
    console.log('📡 Cargando de API...');
    const viajes = await fetch('/api/viajes/list.php').then(r => r.json());
    
    // Guardar en cache
    cacheManager.set('viajes', viajes);
    
    renderViajes(viajes);
}
```

#### Limpiar cache:
```javascript
// Limpiar un item específico
cacheManager.remove('viajes');

// Limpiar todo el cache (excepto usuario y tema)
cacheManager.clearAll();

// Ver tamaño del cache
console.log('Tamaño del cache:', cacheManager.getCacheSize());
```

---

### 4. Mensajes de Estado

#### Mostrar error:
```javascript
skeletonHelpers.showError('container', 'No se pudieron cargar los datos');
```

#### Mostrar vacío:
```javascript
skeletonHelpers.showEmpty('container', 'No hay viajes disponibles', 'truck');
```

#### Mostrar spinner inline:
```javascript
skeletonHelpers.showInlineSpinner('container', 'lg'); // sm, md, lg
```

---

### 5. Responsive - Clases Útiles

#### Ocultar en móviles:
```html
<div class="d-none-mobile">
    Este contenido no se ve en móviles
</div>
```

#### Solo en landscape:
```html
<div class="landscape-only">
    Solo visible en orientación horizontal
</div>
```

#### Solo en portrait:
```html
<div class="portrait-only">
    Solo visible en orientación vertical
</div>
```

#### Grid responsive automático:
```html
<div class="grid-responsive">
    <div class="card">Card 1</div>
    <div class="card">Card 2</div>
    <div class="card">Card 3</div>
</div>
```

---

### 6. Lazy Loading de Imágenes

#### HTML:
```html
<!-- Usar data-src en lugar de src -->
<img data-src="ruta/imagen.jpg" alt="Descripción" class="lazy-image">
```

El sistema cargará la imagen automáticamente cuando sea visible.

---

### 7. Ejemplo Completo

```javascript
async function cargarYMostrarViajes() {
    const container = 'viajesContainer';
    
    try {
        // 1. Verificar cache
        const cached = cacheManager.get('viajes');
        if (cached) {
            renderViajes(cached);
            return;
        }
        
        // 2. Mostrar skeleton
        skeletonHelpers.showViajesSkeleton(container, 6);
        
        // 3. Cargar datos
        const response = await fetch('/api/viajes/list.php');
        
        if (!response.ok) {
            throw new Error('Error en la API');
        }
        
        const viajes = await response.json();
        
        // 4. Guardar en cache
        cacheManager.set('viajes', viajes, 5 * 60 * 1000); // 5 minutos
        
        // 5. Renderizar
        renderViajes(viajes);
        
        // 6. Remover skeleton
        skeletonHelpers.removeSkeleton(container);
        
    } catch (error) {
        console.error('Error:', error);
        skeletonHelpers.showError(container, 'Error al cargar viajes');
    }
}
```

---

### 8. Mejores Prácticas

#### ✅ DO:
- Usar skeletons para cargas que tomen más de 300ms
- Cachear datos que no cambien frecuentemente
- Usar loading overlay para operaciones largas (>2s)
- Limpiar cache cuando se actualicen datos
- Usar lazy loading para imágenes grandes

#### ❌ DON'T:
- No usar skeletons para operaciones instantáneas
- No cachear datos sensibles o que cambien constantemente
- No olvidar ocultar el loading overlay
- No cargar todas las imágenes al inicio
- No usar cache sin tiempo de expiración

---

### 9. Debugging

#### Ver estado del cache:
```javascript
console.log('Tamaño:', cacheManager.getCacheSize());
console.log('Versión:', cacheManager.version);
```

#### Ver módulos cargados:
```javascript
console.log('Módulos:', lazyLoader.loadedModules);
```

#### Ver skeletons activos:
```javascript
console.log('Skeletons:', skeletonHelpers.skeletons);
```

---

### 10. Compatibilidad

El sistema funciona automáticamente en:
- 📱 Móviles (320px+)
- 📱 Tablets (768px+)
- 💻 Laptops (1024px+)
- 🖥️ Desktops HD (1366px+)
- 🖥️ Full HD (1920px+)
- 🖥️ 2K (2560px+)
- 🖥️ 4K (3840px+)
- 🖥️ 8K (7680px+)

No necesitas hacer nada especial, todo se adapta automáticamente.

---

## 🎯 Tips de Rendimiento

1. **Usa cache para datos estáticos**: Transportistas, vehículos, etc.
2. **Usa skeletons para mejor UX**: El usuario percibe que la app es más rápida
3. **Precarga datos**: Usa `lazyLoader.preloadNextSection()` para precargar
4. **Optimiza imágenes**: Usa formatos modernos (WebP) y compresión
5. **Monitorea el cache**: Limpia periódicamente con `cacheManager.clearAll()`

---

## 📞 Soporte

Si tienes dudas o problemas:
1. Revisa la consola del navegador (F12)
2. Verifica que los archivos estén cargados
3. Comprueba la versión del cache
4. Limpia el cache del navegador si es necesario

---

**¡Listo para usar! 🚀**
