# FlowSoftware

## Overview

WhatsApp automation SaaS platform with AI chatbot — a pnpm workspace monorepo with a landing page, multi-user panel, REST API, and PostgreSQL database.

## Stack

- **Monorepo**: pnpm workspaces
- **Node.js**: 24
- **Frontend**: React + Vite + Tailwind CSS (dark mode, neon green accents)
- **Backend**: Express 5 + JWT auth (bcrypt passwords)
- **Database**: PostgreSQL + Drizzle ORM
- **API codegen**: Orval (OpenAPI → React Query hooks)
- **AI bot**: Groq chat completions via `GROQ_API_KEY`
- **Language**: Spanish UI

## Artifacts

- **`artifacts/whatsapp-saas`** — React+Vite SaaS panel + landing page (preview `/`)
- **`artifacts/api-server`** — Express REST API (port 8080, preview `/api`)

## Required Environment Variables

| Variable | Required | Default | Notes |
|---|---|---|---|
| `DATABASE_URL` | ✅ | — | PostgreSQL connection string (Replit DB) |
| `SESSION_SECRET` | ✅ | — | JWT signing secret |
| `GROQ_API_KEY` | ✅ | — | Groq API key for AI chatbot |
| `ADMIN_EMAIL` | optional | `admin@whatsbot.app` | Admin user email |
| `ADMIN_PASSWORD` | optional | `Admin2024!` | Admin user initial password |
| `ADMIN_NAME` | optional | `Administrador` | Admin user display name |
| `PORT` | auto | — | Set by Replit runtime |

## Admin User Seeding

- On every API server startup, it checks if any admin user exists in the database.
- If no admin exists, it creates one using `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` env vars (or the defaults above).
- Set these env vars before first deployment to customize the admin credentials.
- Admin can then create all real client accounts from the `/admin/users` panel.

## Demo Access

- Demo sessions are created from the landing/login pages via `POST /api/auth/demo`.
- Demo accounts are temporary, empty by default, use role `demo`, expire after 30 minutes.
- When a demo session expires: WhatsApp socket is closed, local auth directory is removed, and the user record is deleted (cascade deletes all related records).
- The API cleans expired demo users: on new demo creation, on authenticated requests, on server startup, and via a periodic 1-minute cleanup job.

## Admin Access

- Real customer accounts are created from the admin-only panel at `/admin/users`.
- Public registration is disabled; customers receive credentials created by an admin.
- Admin APIs are protected by JWT authentication plus `role = admin`.
- The admin panel creates accounts with auto-generated passwords and shows them once to copy.

## Pages

### Landing (public)
- `/` — Marketing landing page: hero, benefits, how-it-works, features. No pricing, no demo explanations.

### Panel (requires login)
- `/login` — Login (includes demo button)
- `/register` — Private registration notice; real accounts are admin-created
- `/dashboard` — Stats, recent activity
- `/whatsapp` — QR connect/disconnect
- `/contacts` — CRUD contacts with tags
- `/messages` — Bulk messaging with anti-spam delay and contact selector
- `/chatbot` — Bot toggle + system prompt + welcome/fallback messages
- `/training` — Upload training documents (txt/pdf)
- `/chat` — Live chat with conversation history
- `/settings` — Profile, password change, session management
- `/admin/users` — Admin-only: create and list user accounts

## Database Tables

- `users` — Multi-user auth with roles (admin, user, demo)
- `contacts` — Contact management with tags array
- `message_logs` — Outbound message history with status tracking
- `chatbot_configs` — Per-user bot configuration (auto-created on first access)
- `whatsapp_sessions` — Connection state per user
- `training_documents` — Bot knowledge base documents
- `conversations` — Contact conversation threads
- `conversation_messages` — Individual messages within conversations

## Key Commands

- `pnpm --filter @workspace/db run push` — Push DB schema changes to database
- `pnpm --filter @workspace/api-spec run codegen` — Regenerate API hooks from OpenAPI spec
- `pnpm run typecheck` — Full typecheck
- `pnpm run build` — Build all packages

## Architecture Notes

- JWT tokens stored in localStorage as `auth_token`
- `setAuthTokenGetter` / `setBaseUrl` called in `App.tsx` → `ApiSetup` component
- WhatsApp uses real WhatsApp Web session through QR linking (Baileys library)
- Auth state stored under `.whatsapp-auth/` in the api-server directory (gitignored)
- Bulk messaging uses `inArray` from Drizzle ORM to correctly query contacts by ID array
- Global Express error handler returns JSON (not HTML) for all unhandled errors
- Chatbot auto-responds to incoming WhatsApp messages using Groq (llama-3.1-8b-instant)
- Dark mode is default (CSS variables in `index.css`)
- Responsive layout: desktop sidebar, mobile top bar with dropdown
