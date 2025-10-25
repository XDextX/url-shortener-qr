# Arquitectura propuesta

## Capas (apps/backend)

- **Rutas (`apps/backend/src/routes`)**: definen endpoints HTTP y delegan la logica.
- **Controladores (`apps/backend/src/controllers`)**: validan peticiones y orquestan servicios.
- **Servicios (`apps/backend/src/services`)**: encapsulan la logica de negocio y coordinan repositorios/utilidades.
- **Repositorios (`apps/backend/src/repositories`)**: se comunican con el paquete de base de datos, que resuelve el driver configurado (SQLite por defecto).
- **Utilidades (`apps/backend/src/utils`)**: helpers como el generador de codigos QR.
- **Configuracion (`apps/backend/src/config`)**: carga variables de entorno compartidas.

## Flujo principal

1. Cliente envia una URL larga a `POST /api/v1/urls`.
2. El servicio genera un codigo corto (`nanoid`), lo persiste en SQLite y construye la URL corta.
3. Se genera un QR (base64) asociado y se devuelve en la respuesta.
4. `GET /api/v1/urls/:code` recupera la URL original y regenera el QR.
5. `GET /:code` redirige al usuario y registra el hit (`hits` se incrementa en la base de datos).

## Frontend (apps/frontend)

- SPA en React + Vite que consume la API.
- Formulario para crear URLs cortas y visualizar QR/links resultantes.
- Configurable mediante `VITE_API_BASE_URL` para apuntar a distintos ambientes.

## Paquete de base de datos (packages/database)

- Conecta con SQLite por defecto (`DATABASE_DRIVER=sqlite`, `DATABASE_URL` configurable a otras rutas o `:memory:`).
- Permite registrar drivers alternativos para escalar a otros motores manteniendo la misma API (`ensureDatabase`, `insertUrl`, `findUrlByCode`, etc.).
- Centraliza la inicializacion del esquema y la conexion para reutilizarla en workers, cron jobs, etc.

## Proximos pasos

- Agregar campos adicionales (expiracion, owner, tags) y generar nuevas migraciones.
- Exponer metricas avanzadas (hits por periodo) y endpoints de estadisticas.
- Integrar autenticacion/roles para administrar URLs creadas.
- Automatizar pipelines CI/CD que ejecuten `lint`, `test` y `db:deploy` antes de desplegar.
