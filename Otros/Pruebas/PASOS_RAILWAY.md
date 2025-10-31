# 🚀 Pasos para Subir a Railway (Super Simple)

## ✅ Ya tienes tu código en GitHub - ¡Perfecto!

Ahora sigue estos pasos:

---

## 📝 Paso 1: Subir los archivos nuevos a GitHub

```bash
git add .
git commit -m "Configurado para Railway"
git push origin main
```

---

## 🌐 Paso 2: Crear proyecto en Railway

1. Ve a **[railway.app](https://railway.app)**
2. Click en **"Login"** (usa tu cuenta de GitHub)
3. Click en **"New Project"**
4. Selecciona **"Deploy from GitHub repo"**
5. Busca y selecciona tu repositorio **"TransLogix"**
6. Railway empezará a construir tu proyecto automáticamente

---

## 🗄️ Paso 3: Agregar Base de Datos MySQL

1. En tu proyecto de Railway, click en **"New"** (botón morado arriba a la derecha)
2. Selecciona **"Database"**
3. Click en **"Add MySQL"**
4. Railway creará una base de datos MySQL automáticamente

**¡Importante!** Railway genera automáticamente estas variables:
- `MYSQLHOST`
- `MYSQLDATABASE`
- `MYSQLUSER`
- `MYSQLPASSWORD`
- `MYSQLPORT`

Tu aplicación ya está configurada para usarlas automáticamente. ✅

---

## 🔐 Paso 4: Agregar Variable JWT_SECRET

1. Click en tu servicio web (el que dice "TransLogix" o similar)
2. Ve a la pestaña **"Variables"**
3. Click en **"New Variable"**
4. Agrega:
   - **Variable Name:** `JWT_SECRET`
   - **Value:** Genera una clave segura (puedes usar este comando):

**En PowerShell:**
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

O simplemente usa algo como: `mi_clave_super_secreta_12345_cambiar_en_produccion`

5. Click en **"Add"**

---

## 📊 Paso 5: Importar tu Base de Datos

### Opción A: Usando MySQL Workbench (Más Fácil)

1. En Railway, click en tu base de datos MySQL
2. Ve a **"Connect"** y copia las credenciales:
   - Host
   - Port
   - Username
   - Password
   - Database

3. Abre **MySQL Workbench**
4. Crea una nueva conexión con esas credenciales
5. Conecta y ve a **"Server" → "Data Import"**
6. Selecciona tu archivo SQL
7. Click en **"Start Import"**

### Opción B: Usando Railway CLI

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Conectar al proyecto
railway link

# Conectar a MySQL y ejecutar
railway run mysql -h $MYSQLHOST -u $MYSQLUSER -p$MYSQLPASSWORD $MYSQLDATABASE < tu_archivo.sql
```

---

## 🎉 Paso 6: Verificar que Funciona

1. En Railway, tu servicio web mostrará una URL (algo como `https://tu-app.up.railway.app`)
2. Click en esa URL o copia y pégala en tu navegador
3. Deberías ver tu aplicación funcionando
4. Prueba hacer login con tus credenciales

---

## 🐛 Si algo no funciona:

### Ver los logs:
1. En Railway, click en tu servicio web
2. Ve a la pestaña **"Deployments"**
3. Click en el deployment más reciente
4. Ve a **"View Logs"**

### Problemas comunes:

**"Error de conexión a base de datos"**
- ✅ Verifica que agregaste MySQL
- ✅ Verifica que importaste tu base de datos
- ✅ Espera 1-2 minutos después de agregar MySQL

**"Error 500"**
- ✅ Revisa los logs
- ✅ Verifica que JWT_SECRET esté configurado
- ✅ Asegúrate de que el código se subió correctamente a GitHub

**"La página no carga"**
- ✅ Espera 2-3 minutos (el primer deploy tarda)
- ✅ Verifica que el deployment diga "Success"
- ✅ Refresca la página

---

## 📋 Checklist Final

- [ ] Código subido a GitHub
- [ ] Proyecto creado en Railway desde GitHub
- [ ] MySQL agregado
- [ ] JWT_SECRET configurado
- [ ] Base de datos importada
- [ ] URL pública funcionando
- [ ] Login probado

---

## 💡 Tips

- El primer deploy tarda 2-5 minutos
- Railway redespliega automáticamente cuando haces push a GitHub
- Puedes ver el uso y costos en el dashboard
- El plan gratuito incluye $5 de crédito mensual

---

## 🎊 ¡Listo!

Tu aplicación TransLogix está en línea y accesible desde cualquier lugar del mundo.

**URL de tu app:** La encontrarás en Railway en la sección de tu servicio web.

---

## 📞 ¿Necesitas ayuda?

- [Documentación Railway](https://docs.railway.app)
- [Discord Railway](https://discord.gg/railway)
- [Video Tutorial](https://www.youtube.com/results?search_query=railway+deploy+php)
