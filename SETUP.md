# FlowSoftware — Guia de instalacion local

Plataforma SaaS de automatizacion de WhatsApp con chatbot IA.

## Requisitos previos

- **Node.js 20+** (https://nodejs.org)
- **pnpm 9+** (se instala automaticamente con el script)
- **PostgreSQL 14+** (local o remoto: Neon, Supabase, Railway...)
- **Cuenta de Groq** para la IA: https://console.groq.com (gratis, da una API key)

## Instalacion rapida

### Linux / macOS

```bash
chmod +x install.sh
./install.sh
```

### Windows

```cmd
install.bat
```

El script:
1. Verifica que tengas Node.js y pnpm
2. Instala todas las dependencias del monorepo
3. Crea un archivo `.env` de ejemplo
4. Aplica el esquema de la base de datos

## Configuracion del archivo .env

Despues de la primera ejecucion edita `.env` con tus datos reales:

```env
DATABASE_URL=postgresql://usuario:password@localhost:5432/flowsoftware
SESSION_SECRET=cualquier-string-aleatorio-largo-de-minimo-32-caracteres
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PORT=8080
NODE_ENV=development
```

### Crear la base de datos PostgreSQL local

```bash
# Con psql instalado:
createdb flowsoftware
# o:
psql -U postgres -c "CREATE DATABASE flowsoftware;"
```

Luego vuelve a ejecutar `./install.sh` (o `pnpm run db:push`) para crear las tablas.

## Iniciar el proyecto

```bash
pnpm run dev
```

Esto arranca **api-server** (puerto 8080) y **frontend web** (puerto asignado por Vite) en paralelo.

Abre en tu navegador: **http://localhost:8080**

## Cuenta administrador por defecto

- **Email:** `admin@flowsoftware.app`
- **Password:** `Admin2024!`

(Se crea automaticamente al iniciar el server por primera vez. Cambia la contrasena despues.)

## Estructura del proyecto

```
.
├── artifacts/
│   ├── api-server/       # Backend Express + Baileys (WhatsApp Web) + Groq IA
│   └── whatsapp-saas/    # Frontend React + Vite (panel SaaS)
├── lib/
│   ├── db/               # Drizzle ORM + esquema Postgres
│   ├── api-spec/         # OpenAPI spec
│   ├── api-client-react/ # Cliente generado (React Query)
│   └── api-zod/          # Validadores generados
├── install.sh            # Instalador Linux/macOS
├── install.bat           # Instalador Windows
└── package.json
```

## Comandos utiles

| Comando | Descripcion |
|---|---|
| `pnpm run dev` | Inicia API + frontend en paralelo |
| `pnpm run db:push` | Sincroniza el esquema de BD |
| `pnpm run build` | Compila todo para produccion |
| `pnpm run typecheck` | Verifica tipos TypeScript |

## Conectar WhatsApp

1. Inicia el panel y haz login
2. Ve a la seccion **WhatsApp**
3. Haz clic en **Conectar WhatsApp** para generar el QR
4. En tu telefono: WhatsApp → Configuracion → Dispositivos vinculados → Vincular un dispositivo
5. Escanea el QR

Si el QR queda atascado o quieres cambiar de numero usa el boton **Generar QR nuevo** (limpia la sesion antigua).

## Solucion de problemas

**El QR no aparece o esta atascado**
Boton "Generar QR nuevo" en la pantalla de WhatsApp. Borra archivos de sesion y crea uno limpio.

**Error de conexion a la base de datos**
Verifica que `DATABASE_URL` en `.env` apunta a un Postgres accesible. Para servicios cloud (Neon, Supabase) suele necesitar `?sslmode=require` al final.

**El chatbot IA no responde**
Asegurate de tener `GROQ_API_KEY` valida en `.env` y de haber configurado el chatbot desde la seccion **Chatbot IA** del panel.

**Puerto 8080 ocupado**
Cambia `PORT=8080` en `.env` por otro puerto libre.

## Despliegue en produccion

Para produccion ejecuta:

```bash
pnpm run build
NODE_ENV=production node artifacts/api-server/dist/index.mjs
```

Sirve los archivos estaticos de `artifacts/whatsapp-saas/dist/` con cualquier servidor web (Nginx, Caddy, etc.) o haz que el api-server los sirva.
