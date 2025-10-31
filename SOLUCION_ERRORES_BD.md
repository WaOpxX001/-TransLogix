# 🔧 Solución - Errores de Base de Datos

## ❌ Error

```
error handling handler errorhandled request
SQLSTATE[42S22]: Column not found
```

## ✅ Solución - Ejecuta UNO POR UNO

### Paso 1: Abre Railway

1. Ve a https://railway.app
2. Abre tu proyecto
3. Haz clic en tu base de datos **MySQL**
4. Haz clic en **"Data"** → **"Query"**

### Paso 2: Ejecuta CADA línea por separado

**⚠️ IMPORTANTE: Ejecuta UNA línea a la vez**

Si una línea da error "Duplicate column", ignórala y continúa con la siguiente.

#### Para la tabla `usuarios`:
```sql
ALTER TABLE usuarios ADD COLUMN ultimo_acceso DATETIME NULL;
```
Ejecuta → Si da error, ignóralo y continúa

```sql
ALTER TABLE usuarios ADD COLUMN activo TINYINT(1) DEFAULT 1;
```
Ejecuta → Si da error, ignóralo y continúa

```sql
ALTER TABLE usuarios ADD COLUMN fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP;
```
Ejecuta → Si da error, ignóralo y continúa

#### Para la tabla `vehiculos`:
```sql
ALTER TABLE vehiculos ADD COLUMN kilometraje INT DEFAULT 0;
```
Ejecuta

```sql
ALTER TABLE vehiculos ADD COLUMN año INT NULL;
```
Ejecuta

```sql
ALTER TABLE vehiculos ADD COLUMN ultimo_servicio DATE NULL;
```
Ejecuta

#### Para la tabla `gastos`:
```sql
ALTER TABLE gastos ADD COLUMN litros DECIMAL(10,2) DEFAULT 0;
```
Ejecuta

```sql
ALTER TABLE gastos ADD COLUMN usuario_id INT NULL;
```
Ejecuta

```sql
ALTER TABLE gastos ADD COLUMN vehiculo_id INT NULL;
```
Ejecuta

#### Para la tabla `viajes`:
```sql
ALTER TABLE viajes ADD COLUMN transportista_id INT NULL;
```
Ejecuta

```sql
ALTER TABLE viajes ADD COLUMN vehiculo_id INT NULL;
```
Ejecuta

```sql
ALTER TABLE viajes ADD COLUMN fecha_completado DATETIME NULL;
```
Ejecuta

#### Actualizar datos:
```sql
UPDATE usuarios SET activo = 1 WHERE activo IS NULL;
```
Ejecuta

```sql
UPDATE usuarios SET fecha_registro = NOW() WHERE fecha_registro IS NULL;
```
Ejecuta

### Paso 3: Verifica

1. Ve a **"Deployments"** → **"View Logs"**
2. Ya NO deben aparecer errores
3. Abre tu plataforma y verifica que funcione

---

## ✅ Resultado

- ✅ No más errores en los logs
- ✅ La plataforma carga correctamente
- ✅ Todos los datos se muestran

**Tiempo:** 10 minutos  
**Nota:** Si una columna ya existe, el error "Duplicate column" es normal, solo continúa con la siguiente.
