# Guia para agentes IA (Antigravity, Cursor, Claude Code, etc.)

Este documento te explica como instalar, configurar y trabajar sobre **FlowSoftware** desde un IDE asistido por IA.

---

## 1. Identidad del proyecto

- **Nombre:** FlowSoftware
- **Tipo:** SaaS de automatizacion de WhatsApp con chatbot IA
- **Idioma UI:** Espanol
- **Arquitectura:** Monorepo pnpm (workspaces)

## 2. Stack tecnico

| Capa | Tecnologia |
|---|---|
| Gestor paquetes | **pnpm 9** (NO usar npm ni yarn — el `preinstall` hook lo bloquea) |
| Frontend | React 18 + Vite + TailwindCSS + shadcn/ui + wouter + React Query |
| Backend | Express 5 + TypeScript (compilado a ESM con esbuild) |
| Base de datos | PostgreSQL + Drizzle ORM |
| WhatsApp | Baileys (`@whiskeysockets/baileys`) — WhatsApp Web via QR |
| IA chatbot | Groq API (modelo `llama-3.3-70b-versatile`) |
| Auth | JWT (`jsonwebtoken`) + bcryptjs |
| Cliente API tipado | Generado por **Orval** desde OpenAPI |

## 3. Estructura del monorepo

```
.
├── artifacts/
│   ├── api-server/        Backend Express
│   │   ├── src/routes/    Endpoints REST
│   │   ├── src/services/  Logica de negocio (whatsappProvider, groqClient...)
│   │   └── src/middlewares/
│   ├── whatsapp-saas/     Frontend React + Vite
│   │   ├── src/pages/     Paginas (Landing, Login, Dashboard, WhatsApp, Chatbot, etc.)
│   │   ├── src/components/
│   │   └── src/contexts/  AuthContext
│   └── mockup-sandbox/    Sandbox de prototipos (NO se despliega)
├── lib/
│   ├── db/                Schema Drizzle + cliente Postgres
│   │   └── src/schema/    Tablas (users, contacts, chatbotConfig, etc.)
│   ├── api-spec/          openapi.yaml + config Orval
│   ├── api-client-react/  Cliente generado (hooks React Query) — NO editar a mano
│   └── api-zod/           Validadores Zod generados — NO editar a mano
├── install.sh / install.bat
├── SETUP.md               Guia para humanos
└── package.json
```

## 4. Instalacion (que debes ejecutar)

```bash
# 1. Instalar dependencias
pnpm install

# 2. Crear archivo .env en la raiz con:
cat > .env <<EOF
DATABASE_URL=postgresql://USUARIO:PASS@localhost:5432/flowsoftware
SESSION_SECRET=string-aleatorio-de-minimo-32-caracteres
GROQ_API_KEY=gsk_...
PORT=8080
NODE_ENV=development
EOF

# 3. Crear base de datos Postgres (si es local)
createdb flowsoftware

# 4. Aplicar esquema
pnpm run db:push

# 5. Arrancar dev (API + frontend en paralelo)
pnpm run dev
```

URL local: **http://localhost:8080**
Login admin: `admin@flowsoftware.app` / `Admin2024!` (auto-seed al arrancar el servidor).

## 5. Comandos clave

| Comando | Que hace |
|---|---|
| `pnpm install` | Instala todo el monorepo |
| `pnpm run dev` | Arranca api-server + frontend en paralelo |
| `pnpm run db:push` | Sincroniza schema Drizzle a Postgres |
| `pnpm --filter @workspace/api-server run dev` | Solo backend |
| `pnpm --filter @workspace/whatsapp-saas run dev` | Solo frontend |
| `pnpm --filter @workspace/api-spec run codegen` | Regenera cliente API + Zod desde `openapi.yaml` |
| `pnpm run typecheck` | Verifica tipos TypeScript |
| `pnpm run build` | Build de produccion |

## 6. Reglas estrictas para edicion

### 6.1 Cliente API tipado

- **Fuente de verdad:** `lib/api-spec/openapi.yaml`
- Cuando agregues/modifiques un endpoint:
  1. Edita `openapi.yaml`
  2. Implementa la ruta en `artifacts/api-server/src/routes/*.ts`
  3. Ejecuta `pnpm --filter @workspace/api-spec run codegen`
  4. Usa los hooks generados en el frontend (`useGet*`, `useCreate*`, etc.) desde `@workspace/api-client-react`

### 6.2 Base de datos

- Schema en `lib/db/src/schema/*.ts`
- Tras editar el schema: `pnpm run db:push`
- Para data seed inicial: `artifacts/api-server/src/services/seed.ts` (corre al arrancar)

### 6.3 WhatsApp (Baileys)

- Toda la logica esta en `artifacts/api-server/src/services/whatsappProvider.ts`
- Sesiones por usuario se guardan en `.whatsapp-auth/<userId>/`
- Endpoints: `POST /api/whatsapp/connect`, `POST /api/whatsapp/reconnect` (limpia sesion + nuevo QR), `POST /api/whatsapp/disconnect`, `GET /api/whatsapp/status`, `GET /api/whatsapp/contacts`

### 6.4 Frontend

- Rutas en `artifacts/whatsapp-saas/src/App.tsx` (wouter)
- Llamadas al API: SIEMPRE via hooks de `@workspace/api-client-react` (nunca fetch crudo, salvo `customFetch` exportado tambien desde ese paquete para casos especiales)
- BASE_URL: usa `import.meta.env.BASE_URL` (Vite); el cliente API ya esta configurado en `App.tsx` con `setBaseUrl`

### 6.5 Convenciones de codigo

- TypeScript strict en todo el monorepo
- Usar alias `@/` dentro de `whatsapp-saas` (apunta a `src/`)
- Componentes shadcn/ui en `src/components/ui/` — no reinventar
- TailwindCSS con tema dark + verde neon (primary)
- Iconos: `lucide-react`
- Sin acentos en strings UI nuevas (mantener consistencia con el resto)

## 7. Variables de entorno

| Variable | Obligatoria | Descripcion |
|---|---|---|
| `DATABASE_URL` | si | URL Postgres (con `?sslmode=require` si es cloud) |
| `SESSION_SECRET` | si | Clave para firmar JWT (>= 32 chars aleatorios) |
| `GROQ_API_KEY` | si (para IA) | API key de Groq para chatbot |
| `PORT` | no | Puerto del api-server (default 8080) |
| `NODE_ENV` | no | `development` / `production` |

## 8. Endpoints principales (referencia rapida)

| Metodo | Ruta | Descripcion |
|---|---|---|
| POST | `/api/auth/register` | Registro |
| POST | `/api/auth/login` | Login (devuelve JWT) |
| GET | `/api/auth/me` | Usuario actual |
| GET | `/api/dashboard/stats` | Stats panel |
| GET/POST/PUT/DELETE | `/api/contacts` | CRUD contactos |
| GET/PUT | `/api/chatbot/config` | Config IA |
| POST | `/api/chatbot/test` | Probar respuesta IA |
| GET/POST | `/api/training/*` | Entrenamiento IA (niches, qa, knowledge) |
| GET/POST | `/api/whatsapp/*` | Conexion WhatsApp |
| GET | `/api/conversations` | Listado conversaciones |
| GET/POST | `/api/conversations/:contactId/messages` | Chat en vivo |

## 9. Errores comunes y como resolverlos

- **`Use pnpm instead`** al ejecutar `npm install`: el monorepo bloquea npm/yarn por el `preinstall` hook. Usar pnpm siempre.
- **`Cannot find module '@workspace/...'`**: Ejecutar `pnpm install` desde la raiz para crear los enlaces de workspace.
- **QR de WhatsApp no aparece**: el frontend ya tiene un boton "Generar QR nuevo" que llama a `POST /api/whatsapp/reconnect`. Backend borra archivos en `.whatsapp-auth/<userId>/` y arranca sesion limpia.
- **Cambios en `openapi.yaml` no se reflejan en frontend**: ejecutar `pnpm --filter @workspace/api-spec run codegen`.
- **Errores de typecheck en `api-server` con Baileys/qrcode/groq**: hay tipos laxos; no bloquean ejecucion. Si bloquean tu CI, anadir `// @ts-expect-error` puntual o `declare module 'qrcode';` en un `.d.ts`.

## 10. Seguridad / despliegue

- Cambia el password admin tras primer login
- Genera un `SESSION_SECRET` nuevo en produccion
- Sirve detras de HTTPS (Caddy/Nginx) — Baileys requiere conexion estable saliente a WhatsApp
- Carpeta `.whatsapp-auth/` debe ser persistente entre reinicios del backend (no la borres en deploy)
- Ya esta excluida de git via `.gitignore`

## 11. Que NO debes hacer

- NO uses npm ni yarn
- NO edites archivos en `lib/api-client-react/src/generated/` ni `lib/api-zod/src/generated/` (se sobreescriben)
- NO commitees `.env`, `.whatsapp-auth/`, `node_modules/`, `dist/`
- NO crees nuevos artifacts a mano (usa los scripts internos del monorepo si es necesario)
- NO cambies el gestor de paquetes a npm aunque el usuario lo pida — explicale que rompe el workspace

---

Si tienes dudas sobre la arquitectura mira primero `replit.md` y `SETUP.md` en la raiz.
