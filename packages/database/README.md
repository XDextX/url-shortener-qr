# Paquete de base de datos

Workspace encargado del esquema y cliente Prisma compartidos.

## Requisitos

- Define `DATABASE_URL` en un archivo `.env` (copia `.env.example`). Por defecto apunta a SQLite (`file:./dev.db`) y se crea automáticamente si no existe.
- Para producción puedes cambiar el `provider` de `schema.prisma` y `DATABASE_URL` a Postgres, MySQL, etc.

## Comandos principales

- `npm install`: instala Prisma, TypeScript y dependencias internas.
- `npm run generate`: genera el cliente (queda disponible como dependencia del backend).
- `npm run migrate:dev`: ejecuta las migraciones en desarrollo (cuando uses motores relacionales administrados).
- `npm run migrate:deploy`: aplica migraciones en CI/producción.
- `npm run studio`: abre Prisma Studio.
- `npm run clean`: elimina `dist/` y la base SQLite (`prisma/dev.db`).

En entornos locales donde no puedas ejecutar migraciones (p. ej. SQLite embebido), el backend invoca `ensureDatabase()` para crear la tabla con SQL equivalente.

## Integración con el backend

1. Añade la dependencia en el backend (`"@url-shortener/database": "file:../../packages/database"` ya está configurado).
2. Importa el cliente y helper: `import { prisma, ensureDatabase } from "@url-shortener/database";`.
3. Utiliza los métodos de Prisma (`prisma.url.create`, `prisma.url.findUnique`, etc.) en los repositorios.

Cuando modifiques el esquema, ejecuta `npm run db:generate` desde la raíz (o `npm --workspace @url-shortener/database run generate`) y, si tu motor lo permite, crea nuevas migraciones con `npm run db:migrate -- --name <nombre>`.
