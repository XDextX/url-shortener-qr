# URL Shortener QR

Servicio base en Node.js + TypeScript para acortar URLs y generar códigos QR listos para compartir.

## Características

- API REST con Express y arquitectura por capas (routes, controllers, services, repositories).
- Generación de códigos cortos únicos usando `nanoid`.
- Creación de QR en formato `data:image/png` con la librería `qrcode`.
- Configuración centralizada mediante variables de entorno.
- Pruebas unitarias iniciales con Vitest.

## Requisitos

- Node.js ≥ 18
- npm ≥ 9

## Instalación

```bash
npm install
```

## Scripts principales

- `npm run dev`: levanta el servidor en modo watch con `ts-node-dev`.
- `npm run build`: compila TypeScript a JavaScript (carpeta `dist`).
- `npm start`: ejecuta la versión compilada.
- `npm test`: corre la suite de Vitest.
- `npm run lint`: ejecuta ESLint sobre los archivos `.ts`.

## Variables de entorno

Copiar el archivo `.env.example` y renombrarlo a `.env`, luego ajustar los valores según el entorno:

```bash
cp .env.example .env
```

Variables disponibles:

- `PORT`: puerto en el que arrancará el servidor (3000 por defecto).
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
├─ docs/
├─ package.json
├─ tsconfig.json
├─ .env.example
└─ README.md
```

Consulta `docs/architecture.md` para una visión más detallada del diseño y próximos pasos sugeridos.

## Próximos pasos sugeridos

1. Implementar persistencia real (PostgreSQL, Redis, DynamoDB) en el repositorio.
2. Agregar endpoint de redirección directa (`GET /:code`) y métricas de uso.
3. Crear un frontend (Astro, React, etc.) que consuma la API y muestre el QR.
4. Automatizar despliegues e infraestructura (Dockerfile, CI/CD).
