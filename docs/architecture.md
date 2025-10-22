# Arquitectura propuesta

## Capas (apps/backend)

- **Rutas (`apps/backend/src/routes`)**: definen endpoints HTTP y delegan la logica.
- **Controladores (`apps/backend/src/controllers`)**: validan peticiones y orquestan servicios.
- **Servicios (`apps/backend/src/services`)**: encapsulan la logica de negocio, combinan repositorios y utilidades.
- **Repositorios (`apps/backend/src/repositories`)**: actualmente in-memory; deben reemplazarse por Prisma cuando se integre la base de datos.
- **Utilidades (`apps/backend/src/utils`)**: helpers genericos como generadores de QR.
- **Configuracion (`apps/backend/src/config`)**: carga de variables de entorno y settings compartidos.

## Flujo principal

1. El cliente envia una URL larga al endpoint `POST /api/v1/urls`.
2. El servicio genera un codigo corto (`nanoid`), lo almacena y construye la URL corta.
3. Se genera un QR (base64) que representa la URL corta y se devuelve junto con el codigo.
4. `GET /api/v1/urls/:code` permite recuperar la URL original y el QR asociado.
5. `GET /:code` redirige al usuario a la URL original (pensado para navegadores y compartir enlaces).

## Frontend (apps/frontend)

- SPA en React + Vite que consume la API.
- Formulario para solicitar `POST /api/v1/urls` y renderizar resultado con QR.
- Configurable mediante `VITE_API_BASE_URL` para apuntar a distintos despliegues.

## Paquete de base de datos (packages/database)

- Prisma + PostgreSQL administran el modelo `Url` y futuras migraciones.
- El backend debe consumir el cliente generado para reemplazar el almacenamiento en memoria.
- Permite compartir las migraciones entre múltiples servicios (cron jobs, workers, etc.).

## Proximos pasos

- Sustituir el repositorio en memoria por Prisma / PostgreSQL y versionar migraciones.
- Agregar metricas (clicks, expiracion, rate limiting) dentro del esquema.
- Incorporar autenticacion opcional para administracion de URLs creadas.
