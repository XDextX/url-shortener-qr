# Arquitectura propuesta

## Capas

- **Rutas (`src/routes`)**: definen los endpoints HTTP y delegan la lógica.
- **Controladores (`src/controllers`)**: validan peticiones y orquestan servicios.
- **Servicios (`src/services`)**: encapsulan la lógica de negocio, combinan repositorios y utilidades.
- **Repositorios (`src/repositories`)**: manejan la persistencia (in-memory por defecto).
- **Utilidades (`src/utils`)**: helpers genéricos como generadores de QR.
- **Configuración (`src/config`)**: carga de variables de entorno y settings compartidos.

## Flujo principal

1. El cliente envía una URL larga al endpoint `POST /api/v1/urls`.
2. El servicio genera un código corto (`nanoid`), lo almacena y construye la URL corta.
3. Se genera un QR (base64) que representa la URL corta y se devuelve junto con el código.
4. `GET /api/v1/urls/:code` permite recuperar la URL original y el QR asociado.

## Frontend

- SPA en React + Vite (`frontend/`) que consume la API.
- Formulario para solicitar `POST /api/v1/urls` y renderizar resultado con QR.
- Configurable mediante `VITE_API_BASE_URL` para apuntar a distintos despliegues.

## Próximos pasos

- Sustituir el repositorio en memoria por una base de datos (ej. PostgreSQL, Redis, DynamoDB).
- Añadir métricas (clicks, expiración, rate limiting).
- Proveer endpoint de redirección directa (`GET /:code`).
- Añadir autenticación opcional para administración de URLs creadas.
