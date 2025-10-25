# Agents Guide

Este repositorio se mantiene con apoyo de asistentes automatizados. Usa esta guia rapida para coordinar tareas con agentes (humanos o IA) sin perder contexto.

## Flujo sugerido

1. **Define el objetivo**  
   Abre un issue o deja una nota en la conversacion describiendo el cambio que deseas (ej. agregar un driver nuevo de base de datos o extender el frontend).

2. **Prepara el entorno**  
   - Instala dependencias con `npm install`.  
   - Ejecuta `npm run build` o `npm run test` segun corresponda.  
   - Variables relevantes:  
     - `DATABASE_DRIVER` (por defecto `sqlite`).  
     - `DATABASE_URL` (ruta del archivo o cadena de conexion segun el driver).

3. **Colabora con el agente**  
   - Pide cambios concretos (p. ej. “añade soporte Postgres implementando un nuevo driver”).  
   - Revisa la salida de los comandos y prueba localmente antes de confirmar.

4. **Valida y entrega**  
   - Verifica formato y lint si aplica.  
   - Ejecuta `npm --workspace @url-shortener/backend run test` para asegurarte de que el backend sigue estable.  
   - Genera commits descriptivos siguiendo el patron convencional (`tipo(scope): descripcion`).

## Extender la base de datos

El paquete `@url-shortener/database` permite registrar drivers modulares:

```ts
import { registerDatabaseDriver } from "@url-shortener/database";

registerDatabaseDriver("postgres", async () => ({
  ensure: async () => { /* preparar schema */ },
  insert: async (input) => { /* insertar */ },
  findByCode: async (code) => { /* buscar */ },
  incrementHits: async (code) => { /* incrementar */ },
  clear: async () => { /* limpiar */ },
  getConnection: async () => { /* devuelve cliente nativo */ }
}));
```

Configura el nuevo driver con `DATABASE_DRIVER=postgres` y las credenciales necesarias.

## Buenas practicas

- Mantener los PRs pequeños y auto-contenidos facilita la revision.  
- Actualiza la documentacion (`README.md`, `docs/architecture.md`) siempre que cambies comportamientos visibles.  
- Al cerrar una tarea, incluye resultados de pruebas relevantes en la descripcion del commit o PR.
