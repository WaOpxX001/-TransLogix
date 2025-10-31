# 🔧 Arreglar Errores de Base de Datos

## ❌ Problema

Los logs de Railway muestran errores:
```
error handling handler errorhandled request
SQLSTATE[42S22]: Column not found
```

Esto significa que faltan columnas en tu base de datos.

---

## ✅ Solución

### Opción 1: Ejecutar SQL en Railway

1. **Abre Railway**
   - Ve a tu proyecto
   - Haz clic en tu base de datos MySQL

2. **Abre la pestaña "Data"**
   - Haz clic en "Query"

3. **Copia y pega este SQL:**

```sql
-- Agregar columnas faltantes en usuarios
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS ultimo_acceso DATETIME NULL,
ADD COLUMN IF NOT EXISTS activo TINYINT(1) DEFAULT 1,
ADD COLUMN IF NOT EXISTS fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP;

-- Agregar columnas faltantes en vehiculos
ALTER TABLE vehiculos 
ADD COLUMN IF NOT EXISTS kilometraje INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS año INT NULL,
ADD COLUMN IF NOT EXISTS ultimo_servicio DATE NULL;

-- Agregar columnas faltantes en gastos
ALTER TABLE gastos 
ADD COLUMN IF NOT EXISTS litros DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS usuario_id INT NULL,
ADD COLUMN IF NOT EXISTS vehiculo_id INT NULL;

-- Agregar columnas faltantes en viajes
ALTER TABLE viajes 
ADD COLUMN IF NOT EXISTS transportista_id INT NULL,
ADD COLUMN IF NOT EXISTS vehiculo_id INT NULL,
ADD COLUMN IF NOT EXISTS fecha_completado DATETIME NULL;

-- Actualizar datos existentes
UPDATE usuarios SET activo = 1 WHERE activo IS NULL;
UPDATE usuarios SET fecha_registro = NOW() WHERE fecha_registro IS NULL;
```

4. **Ejecuta el SQL**
   - Haz clic en "Run"

---

### Opción 2: Usar phpMyAdmin (si tienes acceso)

1. Abre phpMyAdmin
2. Selecciona tu base de datos
3. Ve a la pestaña "SQL"
4. Pega el SQL de arriba
5. Haz clic en "Ejecutar"

---

### Opción 3: Importar el archivo SQL completo

Si prefieres, puedes importar el archivo `transporte_pro.sql` completo que ya tienes en tu proyecto. Esto recreará todas las tablas con las columnas correctas.

**En Railway:**
1. Ve a tu base de datos MySQL
2. Haz clic en "Data" → "Import"
3. Sube el archivo `transporte_pro.sql`
4. Haz clic en "Import"

**⚠️ ADVERTENCIA:** Esto borrará todos los datos existentes.

---

## 🧪 Verificar que Funciona

Después de ejecutar el SQL:

1. **Verifica los logs de Railway**
   - Ve a "Deployments" → "View Logs"
   - Ya NO deben aparecer errores de "Column not found"

2. **Prueba tu plataforma**
   - Abre tu plataforma
   - Inicia sesión
   - Verifica que carguen los datos

---

## 📋 Columnas que se Agregan

### Tabla `usuarios`:
- `ultimo_acceso` - Fecha del último acceso
- `activo` - Si el usuario está activo (1) o inactivo (0)
- `fecha_registro` - Fecha de registro del usuario

### Tabla `vehiculos`:
- `kilometraje` - Kilometraje del vehículo
- `año` - Año del vehículo
- `ultimo_servicio` - Fecha del último servicio

### Tabla `gastos`:
- `litros` - Litros de combustible
- `usuario_id` - ID del usuario que registró el gasto
- `vehiculo_id` - ID del vehículo

### Tabla `viajes`:
- `transportista_id` - ID del transportista
- `vehiculo_id` - ID del vehículo
- `fecha_completado` - Fecha de completado del viaje

---

## ✅ Resultado

Después de ejecutar el SQL:
- ✅ No más errores en los logs
- ✅ La plataforma carga correctamente
- ✅ Todos los datos se muestran

---

**Tiempo:** 5 minutos  
**Dificultad:** Fácil  
**Requiere:** Acceso a la base de datos de Railway
