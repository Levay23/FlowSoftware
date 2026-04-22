@echo off
REM FlowSoftware - Local install script (Windows)
setlocal

echo ==========================================
echo   FlowSoftware - Instalacion local
echo ==========================================

REM 1. Verify Node.js
where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js no esta instalado.
  echo Descargalo desde: https://nodejs.org/  ^(version 20 o superior^)
  exit /b 1
)
echo [OK] Node.js detectado
node -v

REM 2. Verify / install pnpm
where pnpm >nul 2>nul
if errorlevel 1 (
  echo Instalando pnpm globalmente...
  call npm install -g pnpm@9
)
echo [OK] pnpm detectado
pnpm -v

REM 3. Install dependencies
echo.
echo Instalando dependencias del monorepo...
call pnpm install
if errorlevel 1 (
  echo [ERROR] Fallo la instalacion de dependencias.
  exit /b 1
)

REM 4. Create .env if missing
if not exist ".env" (
  echo.
  echo Creando archivo .env de ejemplo...
  (
    echo # === FlowSoftware - variables de entorno ===
    echo DATABASE_URL=postgresql://USUARIO:PASSWORD@localhost:5432/flowsoftware
    echo SESSION_SECRET=cambia-esto-por-una-cadena-aleatoria-larga
    echo GROQ_API_KEY=tu_api_key_de_groq_aqui
    echo PORT=8080
    echo NODE_ENV=development
  ) > .env
  echo [OK] Archivo .env creado. EDITALO con tus credenciales reales antes de continuar.
  echo.
  echo       Edita .env y luego ejecuta:  install.bat
  echo.
  exit /b 0
)

REM 5. Push DB schema
echo.
echo Aplicando esquema de base de datos...
call pnpm --filter @workspace/db run push
if errorlevel 1 (
  echo [AVISO] No se pudo aplicar el esquema. Verifica DATABASE_URL en .env
)

echo.
echo ==========================================
echo   Instalacion completa
echo ==========================================
echo.
echo Para iniciar el proyecto en local ejecuta:
echo     pnpm run dev
echo.
echo Luego abre: http://localhost:8080
echo.
echo Login admin por defecto:
echo     Email:    admin@flowsoftware.app
echo     Password: Admin2024!
echo.
endlocal
