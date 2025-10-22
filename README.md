# URL Shortener QR

Servicio base en Node.js + TypeScript para acortar URLs y generar codigos QR listos para compartir.

## Caracteristicas

- API REST con Express y arquitectura por capas (routes, controllers, services, repositories).
- Generacion de codigos cortos unicos usando `nanoid`.
- Creacion de QR en formato `data:image/png` con la libreria `qrcode`.
- Configuracion centralizada mediante variables de entorno.
- Pruebas unitarias iniciales con Vitest.

## Requisitos

- Node.js >= 18
- npm >= 9

## Instalacion

```bash
npm install
```

## Scripts principales

- `npm run dev`: levanta backend y frontend en paralelo (ts-node-dev + Vite).
- `npm run dev:backend`: ejecuta solo la API en modo watch.
- `npm run dev:frontend`: ejecuta solo la SPA con Vite.
- `npm run build`: compila TypeScript a JavaScript (carpeta `dist`).
- `npm start`: ejecuta la version compilada.
- `npm test`: corre la suite de Vitest.
- `npm run lint`: corre ESLint sobre backend y frontend (`.ts` y `.tsx`).

## Variables de entorno

Copia el archivo `.env.example` y renombralo a `.env`, luego ajusta los valores segun el entorno:

```bash
cp .env.example .env
```

Variables disponibles:

- `PORT`: puerto en el que arrancara el servidor (3000 por defecto).
- `BASE_URL`: URL base que se usa para construir los short links.

## Estructura del proyecto

```
url-shortener-qr/
├─ src/
│  ├─ app.ts
│  ├─ server.ts
│  ├─ config/
│  ├─ controllers/
│  ├─ repositories/
│  ├─ routes/
│  ├─ services/
│  └─ utils/
├─ tests/
├─ frontend/
│  ├─ index.html
│  ├─ package.json
│  ├─ src/
│  └─ vite.config.ts
├─ docs/
├─ package.json
├─ tsconfig.json
├─ .env.example
└─ README.md
```

Consulta `docs/architecture.md` para una vision mas detallada del diseno y proximos pasos sugeridos.

## Ejecutar backend y frontend

### 1. Backend (una sola vez)

```bash
npm install
cp .env.example .env
```

Ajusta `PORT` y `BASE_URL` si es necesario.

### 2. Frontend (una sola vez)

```bash
cd frontend
npm install
cp .env.example .env
```

Revisa `VITE_API_BASE_URL` (por defecto `http://localhost:3000`) y `VITE_PORT`.

### 3. Levantar todo con un comando

En la raiz:

```bash
npm run dev
```

Este script ejecuta en paralelo:
- Backend: `ts-node-dev` en el puerto definido en `.env`.
- Frontend: Vite en `http://localhost:5173` (o el valor de `VITE_PORT`).

La SPA quedara disponible en `http://localhost:5173` y consumira la API automaticamente.

## Proximos pasos sugeridos

1. Implementar persistencia real (PostgreSQL, Redis, DynamoDB) en el repositorio.
2. Agregar endpoint de redireccion directa (`GET /:code`) y metricas de uso.
3. Anadir manejo de usuarios y autenticacion para administrar URLs creadas.
4. Automatizar despliegues e infraestructura (Dockerfile, CI/CD).
