# 📊 Cómo Exportar tu Base de Datos

Antes de subir a Railway, necesitas exportar tu base de datos local.

---

## Opción 1: Usando phpMyAdmin (Más Fácil)

1. Abre **phpMyAdmin** en tu navegador: `http://localhost/phpmyadmin`
2. Click en tu base de datos **"transporte_pro"** en el menú izquierdo
3. Click en la pestaña **"Exportar"** arriba
4. Selecciona:
   - Método: **Rápido**
   - Formato: **SQL**
5. Click en **"Continuar"**
6. Se descargará un archivo `transporte_pro.sql`

---

## Opción 2: Usando Línea de Comandos

Abre PowerShell o CMD en la carpeta de tu proyecto y ejecuta:

```bash
# Navega a la carpeta de MySQL
cd C:\xampp\mysql\bin

# Exporta la base de datos
.\mysqldump.exe -u root -p transporte_pro > transporte_pro.sql
```

Cuando te pida password, presiona Enter (si no tienes password).

El archivo `transporte_pro.sql` se creará en `C:\xampp\mysql\bin\`

---

## Opción 3: Usando MySQL Workbench

1. Abre **MySQL Workbench**
2. Conecta a tu servidor local
3. Ve a **"Server" → "Data Export"**
4. Selecciona tu base de datos **"transporte_pro"**
5. Selecciona **"Export to Self-Contained File"**
6. Elige dónde guardar el archivo
7. Click en **"Start Export"**

---

## ✅ Verificar el Archivo

Abre el archivo `.sql` con un editor de texto y verifica que contenga:

- `CREATE TABLE` statements
- `INSERT INTO` statements con tus datos
- Estructura de todas tus tablas

---

## 📤 Subir a Railway

Una vez que tengas tu archivo `.sql`, sigue los pasos en **PASOS_RAILWAY.md** para importarlo a Railway.

---

## 💡 Tip

Guarda este archivo `.sql` en un lugar seguro. Es tu backup de la base de datos.
