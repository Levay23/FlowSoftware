#!/usr/bin/env bash
# FlowSoftware - Local install script (Linux / macOS)
set -e

echo "=========================================="
echo "  FlowSoftware - Instalacion local"
echo "=========================================="

# 1. Verify Node.js
if ! command -v node >/dev/null 2>&1; then
  echo "[ERROR] Node.js no esta instalado."
  echo "Descargalo desde: https://nodejs.org/  (version 20 o superior)"
  exit 1
fi
NODE_MAJOR=$(node -p "process.versions.node.split('.')[0]")
if [ "$NODE_MAJOR" -lt 20 ]; then
  echo "[ERROR] Necesitas Node.js 20 o superior. Tienes: $(node -v)"
  exit 1
fi
echo "[OK] Node.js $(node -v)"

# 2. Verify / install pnpm
if ! command -v pnpm >/dev/null 2>&1; then
  echo "Instalando pnpm globalmente..."
  npm install -g pnpm@9
fi
echo "[OK] pnpm $(pnpm -v)"

# 3. Verify Postgres available
if ! command -v psql >/dev/null 2>&1; then
  echo "[AVISO] PostgreSQL no esta instalado en este equipo."
  echo "        Puedes usar uno remoto (Neon, Supabase, etc.) y poner su URL en .env"
fi

# 4. Install dependencies
echo ""
echo "Instalando dependencias del monorepo..."
pnpm install

# 5. Create .env if missing
if [ ! -f ".env" ]; then
  echo ""
  echo "Creando archivo .env de ejemplo..."
  cat > .env <<EOF
# === FlowSoftware - variables de entorno ===
DATABASE_URL=postgresql://USUARIO:PASSWORD@localhost:5432/flowsoftware
SESSION_SECRET=cambia-esto-por-una-cadena-aleatoria-larga
GROQ_API_KEY=tu_api_key_de_groq_aqui
PORT=8080
NODE_ENV=development
EOF
  echo "[OK] Archivo .env creado. EDITALO con tus credenciales reales antes de continuar."
  echo ""
  echo "      Edita .env y luego ejecuta:  ./install.sh --skip-deps"
  echo ""
  exit 0
fi

# 6. Push DB schema
echo ""
echo "Aplicando esquema de base de datos..."
if pnpm --filter @workspace/db run push 2>/dev/null; then
  echo "[OK] Esquema aplicado"
else
  echo "[AVISO] No se pudo aplicar el esquema. Verifica DATABASE_URL en .env"
fi

echo ""
echo "=========================================="
echo "  Instalacion completa"
echo "=========================================="
echo ""
echo "Para iniciar el proyecto en local ejecuta:"
echo "    pnpm run dev"
echo ""
echo "Luego abre: http://localhost:8080"
echo ""
echo "Login admin por defecto:"
echo "    Email:    admin@flowsoftware.app"
echo "    Password: Admin2024!"
echo ""
