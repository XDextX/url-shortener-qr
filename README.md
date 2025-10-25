# URL Shortener QR - Monorepo

Monorepo con tres workspaces: backend (Express + TypeScript), frontend (React + Vite) y un paquete compartido de acceso a datos (SQLite por defecto con soporte para drivers modulares).

## Workspaces

- `apps/backend`: API REST que acorta URLs, genera QR y redirige (`GET /:code`).
- `apps/frontend`: SPA que consume la API y muestra el QR generado.
- `packages/database`: utilidades compartidas para conectarse a SQLite y mantener el esquema.

## Requisitos

- Node.js >= 18
- npm >= 9

## Instalacion inicial

```bash
npm install
```

### Variables de entorno

- Backend: `cp apps/backend/.env.example apps/backend/.env` y ajusta `PORT`, `BASE_URL` y `DATABASE_URL` si apuntas a otra ruta de base de datos.
- Frontend: `cp apps/frontend/.env.example apps/frontend/.env` y define `VITE_API_BASE_URL`.
- Base de datos: `cp packages/database/.env.example packages/database/.env`. Puedes definir `DATABASE_DRIVER` (por defecto `sqlite`) y `DATABASE_URL` en funcion del driver elegido.

### Base de datos (SQLite embebido)

```bash
npm run build           # compila database, backend y frontend
```

La primera vez que inicies el backend con SQLite local, `ensureDatabase()` creara el archivo y la tabla necesarios. Para apuntar a otra ruta (por ejemplo una carpeta compartida o `:memory:`) cambia `DATABASE_URL`.

## Scripts desde la raiz

- `npm run dev`: ejecuta backend (`tsx watch`) y frontend (`vite`) en paralelo.
- `npm run dev:backend` / `npm run dev:frontend`: servicios individuales.
- `npm run build`: compila los tres workspaces.
- `npm run lint`: ESLint sobre el monorepo.
- `npm run test`: tests del backend (Vitest + Supertest).

## Base de datos

El paquete `@url-shortener/database` expone:

- Registro de drivers modulares mediante `registerDatabaseDriver(name, factory)` y seleccion dinamica con `DATABASE_DRIVER` o `setDatabaseDriver()`.
- Inicializacion automatica del esquema con `ensureDatabase()` (el driver `sqlite` crea tabla e indices si no existen).
- Helpers listos para usar: `insertUrl`, `findUrlByCode`, `incrementUrlHits`, `removeAllUrls` y `getDatabase()` (devuelve la conexion nativa del driver activo).
- Configuracion mediante `DATABASE_URL` (acepta rutas absolutas o relativas, el prefijo `file:` o `:memory:` para entornos efimeros) u opciones propias del driver que registres.

Si necesitas ampliar el modelo (por ejemplo agregar expiracion o propietario), edita los helpers en `packages/database/src/index.ts` y aplica los cambios correspondientes en el backend.

## Estructura

```
url-shortener-qr/
|- apps/
|  |- backend/
|  |  |- src/
|  |  |- tests/
|  |  `- package.json
|  `- frontend/
|     |- src/
|     |- public/
|     `- package.json
|- packages/
|  `- database/
|     |- src/
|     `- package.json
|- docs/
|  `- architecture.md
|- package.json
|- .eslintrc.cjs
|- .eslintignore
`- .gitignore
```

## Proximos pasos sugeridos

1. Agregar nuevos campos al modelo (expiracion, etiquetas, propietario) y actualizar las consultas en `packages/database`.
2. Registrar un driver adicional (p. ej. Postgres) que implemente las mismas operaciones para entornos escalados.
3. Exponer estadisticas (ej. `hits`) en endpoints y reflejar las metricas en el frontend.
4. Configurar pipelines de despliegue (backend en Railway/Fly.io, frontend en Vercel) compartiendo la misma base o replicando SQLite.
5. Integrar autenticacion y un panel administrativo para gestionar URLs.
