@echo off
echo ========================================
echo Sistema de Finalizacion de Viajes
echo Instalador de Base de Datos
echo ========================================
echo.

REM Configuracion de MySQL
set MYSQL_USER=root
set MYSQL_PASS=
set MYSQL_DB=logistica_db
set MYSQL_PATH=C:\xampp\mysql\bin\mysql.exe

echo Verificando MySQL...
if not exist "%MYSQL_PATH%" (
    echo ERROR: No se encontro MySQL en %MYSQL_PATH%
    echo Por favor, ajusta la ruta en este archivo .bat
    pause
    exit /b 1
)

echo.
echo Ejecutando script SQL...
echo.

"%MYSQL_PATH%" -u %MYSQL_USER% %MYSQL_DB% < database\crear_tabla_solicitudes_finalizacion.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo INSTALACION EXITOSA!
    echo ========================================
    echo.
    echo La tabla 'solicitudes_finalizacion' ha sido creada.
    echo El sistema de finalizacion de viajes esta listo para usar.
    echo.
) else (
    echo.
    echo ========================================
    echo ERROR EN LA INSTALACION
    echo ========================================
    echo.
    echo Verifica:
    echo 1. Que MySQL este corriendo
    echo 2. Que el usuario y password sean correctos
    echo 3. Que la base de datos 'logistica_db' exista
    echo.
)

pause
