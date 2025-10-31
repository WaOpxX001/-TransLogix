# 📱 Guía Visual - Cómo Debe Verse en Móvil

## 🎯 Sidebar Móvil

### Estado Cerrado
```
┌─────────────────────┐
│ ☰                   │ ← Botón de menú visible
│                     │
│   Dashboard         │
│   ┌──────────────┐  │
│   │ Estadísticas │  │
│   └──────────────┘  │
│                     │
│   Gastos Recientes  │
│   ┌──────────────┐  │
│   │ $1,500       │  │
│   │ Ver Editar X │  │ ← 3 botones visibles
│   └──────────────┘  │
│                     │
└─────────────────────┘
```

### Estado Abierto
```
┌──────────┐┌─────────┐
│          ││░░░░░░░░░│ ← Overlay oscuro
│ 🚚 Trans ││░░░░░░░░░│
│   Logix  ││░░░░░░░░░│
│          ││░░░░░░░░░│
│ Usuario  ││░░░░░░░░░│
│ Admin    ││░░░░░░░░░│
│          ││░░░░░░░░░│
│ ▶ Dashb. ││░░░░░░░░░│
│   Gastos ││░░░░░░░░░│
│   Viajes ││░░░░░░░░░│
│   Vehíc. ││░░░░░░░░░│
│   Report.││░░░░░░░░░│
│          ││░░░░░░░░░│
│ [Cerrar] ││░░░░░░░░░│
└──────────┘└─────────┘
   280px      Resto
```

---

## 💰 Sección Gastos (Móvil)

### Tarjeta de Gasto
```
┌─────────────────────────────┐
│ $1,500.00        Aprobado   │
│ 12/10/2025                  │
│                             │
│ Tipo: Combustible           │
│ Vehículo: JKL-112           │
│ Litros: 140.8 L             │
│                             │
│ ┌────┐ ┌────┐ ┌────┐       │
│ │👁 Ver│ │✏️ Ed│ │🗑️ El│       │
│ └────┘ └────┘ └────┘       │
└─────────────────────────────┘
```

**Características:**
- 3 botones en una fila
- Iconos visibles
- Texto abreviado
- Botón "Eliminar" visible

---

## 🚗 Sección Vehículos (Móvil)

### Tarjeta de Vehículo
```
┌─────────────────────────────┐
│ JKL-112      En Operación   │
│ 🚚 Camión                   │
│                             │
│ Marca/Modelo:               │
│ Volvo FH16                  │
│                             │
│ Año: 2025                   │
│ Kilometraje: 12,000 km      │
│                             │
│ ┌────┐ ┌────┐ ┌────┐       │
│ │👁 Ver│ │✏️ Ed│ │🗑️ El│       │
│ └────┘ └────┘ └────┘       │
└─────────────────────────────┘
```

**Características:**
- 3 botones visibles
- Botones "Editar" y "Eliminar" funcionan
- Información completa visible

---

## 📊 Sección Reportes (Móvil)

### Tabla de Reportes
```
┌─────────────────────────────┐
│ Reportes de Gastos          │
│                             │
│ ┌─────────────────────────┐ │
│ │← Scroll horizontal →    │ │
│ │                         │ │
│ │ Fecha | Tipo | Monto   │ │
│ │ 12/10 | Comb | $1,500  │ │
│ │ 11/10 | Mant | $800    │ │
│ │ 10/10 | Comb | $1,200  │ │
│ │                         │ │
│ └─────────────────────────┘ │
│                             │
│ [Generar PDF]               │
└─────────────────────────────┘
```

**Características:**
- Scroll horizontal habilitado
- Tabla completa visible
- Fuente reducida pero legible
- Botones de acción visibles

---

## 🚛 Sección Viajes (Móvil)

### Tarjeta de Viaje
```
┌─────────────────────────────┐
│ Viaje #123      En Progreso │
│                             │
│ Origen: CDMX                │
│ Destino: Guadalajara        │
│                             │
│ Transportista: Juan Pérez   │
│ Vehículo: JKL-112           │
│                             │
│ ┌──────────┐ ┌──────────┐  │
│ │👁 Ver Det│ │✅ Finaliz│  │
│ └──────────┘ └──────────┘  │
└─────────────────────────────┘
```

**Características:**
- Botones en 2 columnas
- Información completa
- Acciones disponibles según estado

---

## 🎨 Colores y Estilos

### Botones
- **Ver:** Azul (`btn-outline-primary`)
- **Editar:** Amarillo (`btn-outline-warning`)
- **Eliminar:** Rojo (`btn-outline-danger`)
- **Aprobar:** Verde (`btn-outline-success`)

### Estados
- **Aprobado:** Verde
- **Pendiente:** Amarillo
- **Rechazado:** Rojo
- **En Progreso:** Azul

---

## 📏 Medidas

### Sidebar
- Ancho: 280px
- Máximo: 85% del viewport
- Animación: 0.3s ease

### Botones
- Altura mínima: 44px (táctil)
- Padding: 8px 10px
- Fuente: 0.75rem - 0.85rem

### Tarjetas
- Padding: 12px
- Margen inferior: 12px
- Border radius: 8px

---

## ✅ Checklist Visual

### Sidebar
- [ ] Botón ☰ visible en esquina superior izquierda
- [ ] Sidebar se abre desde la izquierda
- [ ] Overlay oscuro aparece detrás
- [ ] Sidebar se cierra al hacer clic en overlay
- [ ] Sidebar se cierra al cambiar de sección

### Gastos
- [ ] 3 botones visibles por tarjeta
- [ ] Botón "Eliminar" visible y rojo
- [ ] Iconos visibles en todos los botones
- [ ] Tarjetas completas sin cortes

### Vehículos
- [ ] 3 botones visibles por tarjeta
- [ ] Botones "Editar" y "Eliminar" visibles
- [ ] Información completa visible

### Reportes
- [ ] Tabla con scroll horizontal
- [ ] Todos los datos visibles
- [ ] Botón "Generar PDF" visible
- [ ] Vista previa funcional

### Viajes
- [ ] Tarjetas completas
- [ ] Botones de acción visibles
- [ ] Estados claramente identificados

---

## 🎯 Resultado Final

Tu plataforma debe verse profesional y funcional en todos los dispositivos móviles, con:
- ✅ Navegación fluida
- ✅ Todos los botones accesibles
- ✅ Información completa visible
- ✅ Sin pantallas negras
- ✅ Experiencia de usuario optimizada

**Fecha:** 31 de octubre de 2025  
**Versión:** 2.0  
**Estado:** ✅ Optimizado para móvil
