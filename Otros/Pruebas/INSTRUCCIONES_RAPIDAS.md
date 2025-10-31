# ⚡ Instrucciones Rápidas - Solución Hosting

## 🎯 Problema
No cargan los datos después del login (error 404 en las peticiones a la API)

## ✅ Solución Aplicada
Se corrigieron las rutas de la API y la configuración de la base de datos

## 📦 Archivos a Subir

### Opción 1: Subir TODO el proyecto
```bash
# Si usas Git (Railway/Heroku)
git add .
git commit -m "Fix: Corregir rutas de API"
git push origin main
```

### Opción 2: Subir solo los archivos modificados (FTP/cPanel)

**Carpeta `assets/js/` (8 archivos):**
- dashboard.js
- vehiculos.js
- transportistas.js
- viajes_simple.js
- gastos_new.js
- reportes.js
- roles.js
- performance-utils.js

**Carpeta `api/` (5 archivos):**
- config.php
- dashboard/data_no_filter.php
- vehiculos/list.php
- vehiculos/delete.php
- transportistas/list.php
- test_connection.php ⭐ (nuevo)

**Raíz del proyecto (1 archivo):**
- .htaccess ⭐ (nuevo)

## ⚙️ Configuración del Hosting

### Si usas cPanel/Hostinger/otro hosting:
1. Ve a "Variables de Entorno" o "PHP Variables"
2. Agrega estas variables:
   ```
   MYSQLHOST = tu-host-mysql (ej: localhost o mysql.tudominio.com)
   MYSQLDATABASE = nombre-de-tu-base-de-datos
   MYSQLUSER = tu-usuario-mysql
   MYSQLPASSWORD = tu-contraseña-mysql
   MYSQLPORT = 3306
   ```

### Si usas Railway:
✅ No necesitas configurar nada, las variables ya están configuradas automáticamente

## 🧪 Verificación

1. **Prueba la conexión a la base de datos:**
   ```
   https://tu-dominio.com/api/test_connection.php
   ```
   Debe mostrar: `{"success": true, ...}`

2. **Limpia la caché del navegador:**
   - Presiona `Ctrl + Shift + R` (Windows/Linux)
   - Presiona `Cmd + Shift + R` (Mac)

3. **Inicia sesión:**
   - Ve a tu plataforma
   - Inicia sesión con tus credenciales
   - Verifica que carguen todos los datos

## ✅ Resultado Esperado

Después de aplicar los cambios:
- ✅ Dashboard muestra estadísticas
- ✅ Vehículos carga la lista
- ✅ Transportistas carga la lista
- ✅ Viajes carga la lista
- ✅ Gastos carga la lista
- ✅ Reportes funciona
- ✅ Roles y Permisos funciona

## 🆘 Si Aún No Funciona

1. **Abre la consola del navegador (F12)**
   - Ve a la pestaña "Console"
   - Busca errores en rojo
   - Copia el error y búscalo en Google

2. **Verifica la pestaña Network (F12)**
   - Ve a la pestaña "Network"
   - Recarga la página
   - Busca peticiones con error 404 o 500
   - Haz clic en ellas para ver más detalles

3. **Verifica el archivo de prueba:**
   ```
   https://tu-dominio.com/api/test_connection.php
   ```
   Si muestra error, revisa las variables de entorno

4. **Verifica los logs de error:**
   - cPanel: "Error Log"
   - Railway: "Deployments" → "View Logs"

## 📞 Contacto

Si necesitas más ayuda, proporciona:
1. La URL de tu plataforma
2. Captura de pantalla de la consola del navegador (F12)
3. Captura de pantalla de la pestaña Network (F12)
4. El resultado de `https://tu-dominio.com/api/test_connection.php`

---

**Tiempo estimado:** 10-15 minutos
**Dificultad:** Fácil
**Requiere reinicio:** No (solo limpiar caché del navegador)
