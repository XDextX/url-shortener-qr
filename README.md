# URL Shortener QR - Monorepo

Monorepo con tres workspaces: backend (Express + TypeScript), frontend (React + Vite) y un paquete de base de datos (Prisma con SQLite por defecto).

## Workspaces

- `apps/backend`: API REST que acorta URLs, genera QR y redirige (`GET /:code`).
- `apps/frontend`: SPA que consume la API y muestra el QR generado.
- `packages/database`: esquema Prisma, cliente compartido y utilidades de migracion.

## Requisitos

- Node.js >= 18
- npm >= 9

## Instalacion inicial

```bash
npm install
```

### Variables de entorno

- Backend: `cp apps/backend/.env.example apps/backend/.env` y ajusta `PORT`, `BASE_URL` y `DATABASE_URL` si usas otro motor.
- Frontend: `cp apps/frontend/.env.example apps/frontend/.env` y define `VITE_API_BASE_URL`.
- Base de datos: `cp packages/database/.env.example packages/database/.env` (usa SQLite en `packages/database/prisma/dev.db` por defecto).

### Prisma (generacion y migraciones)

```bash
npm run db:migrate      # aplica migraciones (opcional en el modo SQLite integrado)
npm run db:generate     # genera el cliente compartido
npm run build           # compila database, backend y frontend (incluye generate)
```

En desarrollos locales con SQLite puedes omitir `db:migrate`; el backend ejecuta `ensureDatabase()` y crea la tabla si no existe. Para motores administrados (Postgres, MySQL, etc.) actualiza `DATABASE_URL` y usa `npm run db:deploy`.

## Scripts desde la raiz

- `npm run dev`: ejecuta backend (`tsx watch`) y frontend (`vite`) en paralelo.
- `npm run dev:backend` / `npm run dev:frontend`: servicios individuales.
- `npm run build`: compila los tres workspaces.
- `npm run lint`: ESLint sobre el monorepo.
- `npm run test`: tests del backend (Vitest + Supertest).
- `npm run db:studio`: abre Prisma Studio con la base configurada.

## Base de datos

El paquete `@url-shortener/database` expone:

- Esquema Prisma (`Url` con `code`, `originalUrl`, `hits`, timestamps).
- Cliente reutilizable: `import { prisma, ensureDatabase } from "@url-shortener/database";`.
- Scripts `generate`, `migrate:dev`, `migrate:deploy`, `clean` y `studio`.
- Inicializacion automatica en SQLite mediante `ensureDatabase()` (crea tabla e indices si no existen).

Modifica `schema.prisma` para agregar campos (expiracion, propietario, etc.). Despues ejecuta `npm run db:generate` y, si tu motor lo permite, crea nuevas migraciones con `npm run db:migrate -- --name <nombre>`.

## Estructura

```
url-shortener-qr/
├─ apps/
│  ├─ backend/
│  │  ├─ src/
│  │  ├─ tests/
│  │  └─ package.json
│  └─ frontend/
│     ├─ src/
│     ├─ public/
│     └─ package.json
├─ packages/
│  └─ database/
│     ├─ prisma/
│     ├─ src/
│     └─ package.json
├─ docs/
│  └─ architecture.md
├─ package.json
├─ .eslintrc.cjs
├─ .eslintignore
└─ .gitignore
```

## Proximos pasos sugeridos

1. Agregar nuevos campos al modelo (expiracion, etiquetas, propietario) y generar migraciones acordes.
2. Exponer estadisticas (ej. `hits`) en endpoints y reflejar las metricas en el frontend.
3. Configurar pipelines de despliegue (backend en Railway/Fly.io, frontend en Vercel) compartiendo la misma base externa.
4. Integrar autenticacion y un panel administrativo para gestionar URLs.
