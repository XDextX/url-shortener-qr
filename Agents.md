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

## Documentar el codigo

- Prefiere comentarios TSDoc (/** ... */) para describir contratos, servicios y funciones expuestas.
- Documenta entradas y salidas relevantes, asi como comportamiento especial o efectos secundarios que impacten otros componentes.
- Cuando agregues configuraciones o comandos nuevos, actualiza esta guia o la documentacion asociada para mantener el contexto.
- Evita comentarios obvios; enfocate en explicar el 'por que' y los detalles que no sean evidentes de inmediato.

## Pruebas por componente

- Cada componente o unidad nueva debe ir acompaA�ada de su bateria de pruebas (unitarias o de integracion segun aplique).  
- MantA�n las suites existentes actualizadas cuando cambies comportamientos.  
- Si no puedes cubrir un caso con pruebas automatizadas, anota la razon y las verificaciones manuales realizadas.

## Internacionalizacion (i18n)

- El frontend usa `i18next` y `react-i18next` inicializados en `src/i18n/`. Usa `AppI18nProvider` para envolver cualquier nuevo arbol de componentes.
- Registra nuevos textos en `src/i18n/resources/<lang>/common.json` y accede a ellos con `useTranslation`. Evita hardcodear strings visibles.
- `LanguageSwitcher` ya gestiona el cambio de idioma; reutilizalo o crea variantes siguiendo el mismo patron.
- Para pruebas, usa el helper `renderWithI18n` ubicado en `src/tests/render-with-i18n.tsx` y fija el idioma segun el escenario.
