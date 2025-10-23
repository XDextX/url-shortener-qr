# Arquitectura propuesta

## Capas (apps/backend)

- **Rutas (`apps/backend/src/routes`)**: definen endpoints HTTP y delegan la logica.
- **Controladores (`apps/backend/src/controllers`)**: validan peticiones y orquestan servicios.
- **Servicios (`apps/backend/src/services`)**: encapsulan la logica de negocio y coordinan repositorios/utilidades.
- **Repositorios (`apps/backend/src/repositories`)**: usan Prisma para persistir en SQLite (o el motor configurado).
- **Utilidades (`apps/backend/src/utils`)**: helpers como el generador de codigos QR.
- **Configuracion (`apps/backend/src/config`)**: carga variables de entorno compartidas.

## Flujo principal

1. Cliente envia una URL larga a `POST /api/v1/urls`.
2. El servicio genera un codigo corto (`nanoid`), lo guarda via Prisma y construye la URL corta.
3. Se genera un QR (base64) asociado y se devuelve en la respuesta.
4. `GET /api/v1/urls/:code` recupera la URL original y regenera el QR.
5. `GET /:code` redirige al usuario y registra el hit (`hits` se incrementa en la base de datos).

## Frontend (apps/frontend)

- SPA en React + Vite que consume la API.
- Formulario para crear URLs cortas y visualizar QR/links resultantes.
- Configurable mediante `VITE_API_BASE_URL` para apuntar a distintos ambientes.

## Paquete de base de datos (packages/database)

- Prisma con SQLite por defecto (`DATABASE_URL` configurable a otros motores).
- Exporta el cliente (`prisma`) y `ensureDatabase()` para inicializar la tabla.
- Centraliza el esquema y permite compartirlo con otros servicios (workers, cron, etc.).

## Proximos pasos

- Agregar campos adicionales (expiracion, owner, tags) y generar nuevas migraciones.
- Exponer metricas avanzadas (hits por periodo) y endpoints de estadisticas.
- Integrar autenticacion/roles para administrar URLs creadas.
- Automatizar pipelines CI/CD que ejecuten `lint`, `test` y `db:deploy` antes de desplegar.
