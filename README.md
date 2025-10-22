# URL Shortener QR – Monorepo

Este repositorio ahora organiza backend, frontend y capa de datos dentro de un mismo monorepo basado en workspaces de npm.

## Workspaces

- `apps/backend`: API en Node.js + Express encargada de acortar URLs, generar QR y redirigir (`GET /:code`).
- `apps/frontend`: SPA en React + Vite que consume la API y muestra el QR.
- `packages/database`: esquema Prisma + comandos para gestionar la base de datos (PostgreSQL sugerido).

## Requisitos

- Node.js ≥ 18
- npm ≥ 9
- (Opcional) PostgreSQL para usar el paquete de base de datos.

## Primeros pasos

```bash
npm install          # instala dependencias raíz y de los workspaces
```

### Configurar variables

- Backend: copia `apps/backend/.env.example` a `apps/backend/.env` y ajusta `PORT` / `BASE_URL`.
- Frontend: copia `apps/frontend/.env.example` a `apps/frontend/.env` y define `VITE_API_BASE_URL`.
- Base de datos: copia `packages/database/.env.example` a `packages/database/.env` (define `DATABASE_URL`).

## Scripts desde la raíz

- `npm run dev`: corre backend y frontend en paralelo.
- `npm run dev:backend`: solo backend (`tsx watch`).
- `npm run dev:frontend`: solo frontend (`vite`).
- `npm run build`: construye backend y frontend.
- `npm run lint`: ESLint sobre todo el monorepo.
- `npm run test`: suite de Vitest del backend.

También puedes entrar en cada workspace y usar sus scripts nativos si lo prefieres.

## Base de datos recomendada

El paquete `packages/database` incluye un esquema inicial de Prisma apuntando a PostgreSQL:

- Modelo `Url` con campos `code`, `originalUrl`, `hits`, timestamps y almacenamiento opcional del QR.
- Scripts para generar cliente (`npm run generate`), crear migraciones (`npm run migrate:dev`) y desplegarlas (`npm run migrate:deploy`).
- Se sugiere usar un servicio gestionado (Supabase, Neon, Railway, PlanetScale con gateway Postgres) o contenedor propio.
- El backend debe importar el cliente de Prisma generado desde este paquete para reemplazar el repositorio en memoria.

Puedes adaptar el esquema para agregar expiración, métricas o relación con usuarios antes de correr migraciones.

## Nueva estructura

```
url-shortener-qr/
├─ apps/
│  ├─ backend/
│  │  ├─ src/
│  │  ├─ tests/
│  │  ├─ package.json
│  │  └─ tsconfig.json
│  └─ frontend/
│     ├─ src/
│     ├─ public/
│     ├─ package.json
│     └─ tsconfig.json
├─ packages/
│  └─ database/
│     ├─ prisma/schema.prisma
│     ├─ package.json
│     └─ README.md
├─ docs/
│  └─ architecture.md
├─ package.json
├─ .eslintrc.cjs
├─ .eslintignore
├─ .gitignore
└─ README.md
```

## Próximos pasos sugeridos

1. Reemplazar el repositorio en memoria por Prisma (`@url-shortener/database`) y exponer endpoints que consulten PostgreSQL.
2. Añadir migraciones adicionales para métricas/interacciones y automatizarlas en CI/CD.
3. Configurar pipelines de deploy independientes (ej. backend en Railway/Fly.io, frontend en Vercel) compartiendo el mismo esquema.
4. Incorporar autenticación y dashboards de administración usando la misma base de datos.
