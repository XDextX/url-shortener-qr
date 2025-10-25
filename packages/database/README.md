# Paquete de base de datos

Workspace encargado de exponer una capa minima de acceso a datos con drivers modulares (SQLite por defecto).

## Requisitos

- Define `DATABASE_DRIVER` (opcional, por defecto `sqlite`) y `DATABASE_URL` en un archivo `.env` (copia `.env.example`). Con el driver `sqlite` se usa `file:./data/dev.db` y el archivo se crea automaticamente si no existe.
- Node.js >= 18 (para contar con `randomUUID` y soporte ESM).

## Comandos principales

- `npm install`: instala TypeScript y dependencias internas.
- `npm run build`: compila a `dist/` con declaraciones.
- `npm run clean`: elimina `dist/`.

## API expuesta

```ts
import {
  ensureDatabase,
  findUrlByCode,
  getActiveDatabaseDriverName,
  getDatabase,
  incrementUrlHits,
  insertUrl,
  registerDatabaseDriver,
  removeAllUrls,
  setDatabaseDriver
} from "@url-shortener/database";
```

- `registerDatabaseDriver(name, factory)`: permite registrar un nuevo driver que implemente las operaciones esperadas.
- `setDatabaseDriver(name)` o la variable `DATABASE_DRIVER`: seleccionan el driver activo (por defecto `sqlite`).
- `ensureDatabase()`, `insertUrl`, `findUrlByCode`, `incrementUrlHits`, `removeAllUrls`: helpers de alto nivel independientes del driver.
- `getDatabase()`: devuelve la conexion nativa del driver activo (para `sqlite` es la instancia `sql.js`).
- `getActiveDatabaseDriverName()`: expone el nombre del driver que se esta utilizando.

Los helpers aseguran que el esquema exista antes de ejecutar cada operacion y, en el caso del driver `sqlite`, persisten el archivo de base de datos cuando corresponde.

## Integracion con el backend

El backend importa los helpers anteriores en sus repositorios (`apps/backend/src/repositories`). No es necesario inicializar nada manualmente: basta con llamar a las funciones y el driver seleccionado se encargara de la preparacion.

Si necesitas agregar columnas o tablas, modifica el driver correspondiente (`packages/database/src/sqlite-driver.ts` para el caso actual) y actualiza los puntos de acceso que dependan de esos datos. Para despliegues compartidos, asegurate de aplicar las migraciones o scripts manuales segun el motor elegido.
