# Paquete de base de datos

Este paquete centraliza el esquema de Prisma y los comandos para manejar la base de datos del acortador.

## Requisitos

- PostgreSQL disponible (local o gestionado).
- Definir `DATABASE_URL` en un archivo `.env` (puedes copiar `.env.example`).

## Comandos

- `npm install`: instala Prisma y el cliente.
- `npm run generate`: genera el cliente de Prisma para ser consumido desde el backend.
- `npm run migrate:dev`: crea la primer migracion (`init`) en desarrollo (usa `DATABASE_URL`).
- `npm run migrate:deploy`: aplica las migraciones en entornos productivos/CI.
- `npm run studio`: abre Prisma Studio para inspeccionar datos manualmente.

## Integracion con el backend

1. Instala este paquete en el backend mediante workspaces (`npm install @url-shortener/database` desde la raiz).
2. Dentro del backend importa el cliente generado (`import { PrismaClient } from "@url-shortener/database";`).
3. Sustituye el repositorio en memoria por operaciones contra Prisma (`prisma.url.findUnique`, `prisma.url.create`, etc.).

Puedes adaptar `schema.prisma` si necesitas campos adicionales (expiracion, usuario creador, etc.). Ejecuta `npm run migrate:dev -- --name <nombre>` para generar nuevas migraciones versionadas.
