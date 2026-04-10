# 🔗 URL Shortener with QR Code

Un servicio fullstack para acortar URLs y generar códigos QR de forma instantánea. Frontend moderno con tema oscuro/claro e internacionalización, backend eficiente con Express.js y almacenamiento SQLite.

> **Status**: ✅ Funcional | 🚀 Pronto en Vercel | 📝 Documentado

---

## ✨ Características

- 🔗 **Acortador de URLs**: Genera códigos cortos y únicos  
- 🎨 **Códigos QR**: QR automático para cada URL acortada  
- 🌍 **Multi-idioma**: Soporte para English y Español (i18n)  
- 🌙 **Tema oscuro/claro**: Personalización por preferencia del usuario  
- ⚡ **Sin autenticación**: Úsalo al instante, sin login  
- 📊 **Contador de hits**: Registra cada redirección  
- 🔄 **Deduplicación**: La misma URL original = mismo código corto  
- 🚀 **Pronto a producción**: Deployment ready para Vercel  

---

## 📋 Tabla de Contenidos

- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Requisitos](#-requisitos-previos)
- [Inicio Rápido](#-inicio-rápido)
- [Desarrollo](#-desarrollo)
- [API REST](#-api-rest)
- [Configuración](#-configuración)
- [Testing](#-testing)
- [Deploy](#-deploy)
- [Troubleshooting](#-troubleshooting)

---

## 🏗️ Estructura del Proyecto

```
url-shortener-qr/
├── apps/
│   ├── backend/              # Express API (TypeScript)
│   │   ├── src/
│   │   │   ├── app.ts        # Configuración Express
│   │   │   ├── server.ts     # Punto de entrada
│   │   │   ├── config/       # Variables de entorno
│   │   │   ├── controllers/  # HTTP Handlers
│   │   │   ├── services/     # Lógica de negocio
│   │   │   ├── repositories/ # Acceso a datos
│   │   │   ├── routes/       # Definición de rutas
│   │   │   └── utils/        # Utilidades (QR, etc)
│   │   ├── tests/            # Tests unitarios
│   │   └── dist/             # Output compilado
│   │
│   ├── frontend/             # React + Vite
│   │   ├── src/
│   │   │   ├── components/   # Componentes React
│   │   │   ├── api/          # Cliente HTTP
│   │   │   ├── theme/        # Sistema de temas
│   │   │   ├── i18n/         # Traducciones
│   │   │   ├── App.tsx       # Componente raíz
│   │   │   └── main.tsx      # Entry point
│   │   ├── dist/             # Output build
│   │   └── vite.config.ts    # Configuración Vite
│
├── packages/
│   └── database/             # Capa BD (sql.js)
│       ├── src/
│       │   ├── index.ts      # API pública
│       │   ├── contracts.ts  # Interfaces
│       │   └── sqlite-driver.ts # Driver SQLite
│       └── data/
│           └── dev.db        # Base de datos
│
├── scripts/
│   └── copy-frontend-dist.mjs # Build script
├── package.json              # Monorepo config
└── README.md                 # Este archivo
```

**Workspaces:**
- `apps/backend`: API REST que acorta URLs, genera QR y redirige (`GET /:code`)
- `apps/frontend`: SPA que consume la API y muestra el QR generado
- `packages/database`: Utilidades compartidas para SQLite con soporte para drivers modulares

---

## 📋 Requisitos Previos

- **Node.js**: v18+
- **npm**: v9+
- **Git**: Para clonar el repositorio

Verifica:
```bash
node --version    # v18.0.0 o superior
npm --version     # v9.0.0 o superior
```

---

## 🚀 Inicio Rápido

### 1. Clonar el repositorio

```bash
git clone https://github.com/xdextx/url-shortener-qr.git
cd url-shortener-qr
```

### 2. Instalar dependencias

```bash
npm install
```

Esto instala automáticamente todas las dependencias del monorepo.

### 3. Configurar variables de entorno

```bash
# Backend
cp apps/backend/.env.example apps/backend/.env

# Frontend
cp apps/frontend/.env.example apps/frontend/.env

# Database
cp packages/database/.env.example packages/database/.env
```

Edita los `.env` según tu entorno (ver [sección Configuración](#-configuración)).

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

Esto inicia:
- **Backend**: http://localhost:3000
- **Frontend**: http://localhost:5173

---

## 🛠️ Desarrollo

### Comandos Disponibles

```bash
# Desarrollo simultáneo (backend + frontend)
npm run dev

# Servicios individuales
npm run dev:backend
npm run dev:frontend

# Build (todo)
npm run build

# Build individual
npm run build:frontend
npm run build:backend
npm run build:database

# Tests
npm run test

# Linting
npm run lint
```

### Workflow típico

```bash
# 1. Inicia el entorno de desarrollo
npm run dev

# 2. Abre http://localhost:5173 en tu navegador

# 3. Haz cambios en el código
# Los cambios se actualizan automáticamente (hot reload)

# 4. Cuando termines, ejecuta tests
npm run test

# 5. Haz commit con mensaje descriptivo
git commit -m "feat: nueva funcionalidad"
```

---

## 🔧 Configuración

### Variables de Entorno

#### Backend (`apps/backend/.env`)

```env
# Puerto del servidor
PORT=3000

# URL base para short URLs generados
BASE_URL=http://localhost:3000

# URL del frontend (para redirecciones)
FRONTEND_URL=http://localhost:5173

# Base de datos
DATABASE_URL=file:./data/dev.db
DATABASE_DRIVER=sqlite
```

**Notas:**
- `BASE_URL` se usa en la tabla de URLs (debe ser igual en producción)
- `FRONTEND_URL` es donde redirige `GET /` si alguien visita la raíz
- La raíz sirve el frontend compilado después del build

#### Frontend (`apps/frontend/.env`)

```env
# URL de la API del backend
VITE_API_BASE_URL=http://localhost:3000

# Puerto de desarrollo
VITE_PORT=5173
```

#### Database (`packages/database/.env`)

```env
# Ruta de la base de datos
DATABASE_URL=file:./data/dev.db

# Driver a usar (sqlite es el default)
DATABASE_DRIVER=sqlite
```

---

## 📡 API REST

### Crear Short URL

**POST** `/api/v1/urls`

Crea un nuevo short URL. Si la URL original ya existe, retorna el código existente.

**Request:**
```bash
curl -X POST http://localhost:3000/api/v1/urls \
  -H "Content-Type: application/json" \
  -d '{"originalUrl":"https://www.example.com/very/long/path"}'
```

**Response:** (201 Created)
```json
{
  "code": "abc123",
  "shortUrl": "http://localhost:3000/abc123",
  "originalUrl": "https://www.example.com/very/long/path",
  "qrCodeDataUrl": "data:image/png;base64,iVBORw0KGgo..."
}
```

### Obtener Short URL

**GET** `/api/v1/urls/:code`

Recupera detalles de un short URL.

```bash
curl http://localhost:3000/api/v1/urls/abc123
```

**Response:** (200 OK)
```json
{
  "code": "abc123",
  "shortUrl": "http://localhost:3000/abc123",
  "originalUrl": "https://www.example.com/very/long/path",
  "qrCodeDataUrl": "data:image/png;base64,..."
}
```

### Redirigir

**GET** `/:code` → Redirige al URL original e incrementa hits

```bash
curl -L http://localhost:3000/abc123
# Redirige a: https://www.example.com/very/long/path
```

### Health Check

**GET** `/health`

```bash
curl http://localhost:3000/health
# {"status":"ok"}
```

---

## 🧪 Testing

### Ejecutar tests

```bash
# Todos los tests
npm run test

# Solo backend
npm --workspace @url-shortener/backend run test

# Watch mode
npm --workspace @url-shortener/backend run test:watch

# Con cobertura
npm run test -- --coverage
```

### Escribir tests

Los tests van en `apps/backend/tests/` y usan **Vitest**:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { createShortUrl } from "../src/services/url.service";

describe("createShortUrl", () => {
  beforeEach(async () => {
    await clearStore(); // Limpia BD antes de cada test
  });

  it("crea un short URL válido", async () => {
    const result = await createShortUrl("https://example.com");
    
    expect(result.originalUrl).toBe("https://example.com");
    expect(result.code).toBeDefined();
    expect(result.qrCodeDataUrl).toContain("data:image/png");
  });
});
```

---

## 📦 Build & Deploy

### Build Local

```bash
npm run build
```

Genera:
- Backend compilado en `apps/backend/dist/`
- Frontend compilado en `apps/frontend/dist/`
- Frontend copiado a `dist/` para servir desde backend

### Ejecutar Build

```bash
npm run build
npm run start   # Usa dist/ del backend
```

El servidor sirve:
- `/api/*` → API del backend
- `/*` → Frontend (SPA)

### Deploy en Vercel

1. **Conectar GitHub a Vercel:**
   ```bash
   npm i -g vercel
   vercel
   ```

2. **Configurar en Vercel Dashboard:**
   - `BASE_URL`: Tu dominio Vercel (ej: `https://mi-app.vercel.app`)
   - `FRONTEND_URL`: Mismo dominio
   - `DATABASE_URL`: Para persistencia, usa `/tmp/prod.db` o una BD remota
   - `VITE_API_BASE_URL`: URL pública del API

3. **Auto-deploy:** Cada push a `main` se deploya automáticamente

**Estructura en Vercel:**
- `/` → Frontend
- `/api/*` → API
- `/:code` → Redirige a URL original

---

## 🎨 Frontend

### Agregar componentes

Los componentes van en `apps/frontend/src/components/`:

```typescript
// Button.tsx
import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  loading?: boolean;
}

export const Button = ({ children, onClick, loading }: ButtonProps) => {
  return (
    <button 
      onClick={onClick} 
      disabled={loading}
      className="px-4 py-2 bg-accent text-white rounded hover:bg-accent/90"
    >
      {loading ? "Cargando..." : children}
    </button>
  );
};
```

### Agregar traducciones

1. Edita `apps/frontend/src/i18n/resources/es/common.json`:
   ```json
   {
     "home": "Inicio",
     "contact": "Contacto"
   }
   ```

2. Usa en componentes:
   ```typescript
   import { useTranslation } from "react-i18next";
   
   const MyComponent = () => {
     const { t } = useTranslation();
     return <h1>{t("home")}</h1>;
   };
   ```

### Agregar idiomas

1. Crea `apps/frontend/src/i18n/resources/[idioma]/common.json`
2. Edita `apps/frontend/src/i18n/provider.tsx`
3. Aparecerá en el selector

---

## 🗄️ Base de Datos

### Cambiar Driver

El proyecto soporta drivers modulares. Para agregar PostgreSQL:

1. Crea `packages/database/src/postgres-driver.ts`
2. Implementa la interfaz `DatabaseDriver`
3. Registra en env: `DATABASE_DRIVER=postgres`

**Drivers disponibles:**
- `sqlite` (default) - En memoria
- PostgreSQL, MySQL (fácil de agregar)

### Inspeccionar BD

```bash
# SQLite CLI
sqlite3 packages/database/data/dev.db ".tables"

# GUI: https://sqlitebrowser.org/
```

**Schema:**
```sql
CREATE TABLE "Url" (
  "id" TEXT PRIMARY KEY,
  "code" TEXT UNIQUE NOT NULL,
  "originalUrl" TEXT UNIQUE NOT NULL,
  "qrSvg" TEXT,
  "hits" INTEGER DEFAULT 0,
  "createdAt" TEXT NOT NULL,
  "updatedAt" TEXT NOT NULL
);

CREATE INDEX "Url_code_key" ON "Url"("code");
CREATE INDEX "Url_originalUrl_key" ON "Url"("originalUrl");
```

---

## 🐛 Troubleshooting

### Port ya en uso

```bash
# Cambiar puerto backend
PORT=3001 npm run dev:backend

# Cambiar puerto frontend (edita .env)
VITE_PORT=5174
```

### Error de CORS

```
Access to XMLHttpRequest blocked by CORS policy
```

**Solución:**
- Frontend: Configura `VITE_API_BASE_URL` correctamente
- Backend: Revisa CORS en `apps/backend/src/app.ts`

### BD corrupta

```bash
rm packages/database/data/dev.db
npm run dev
```

### npm install falla

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Hot reload no funciona

```bash
# Reinicia el dev server
npm run dev
```

---

## 📝 Convenciones

### Commits

```
feat: nueva funcionalidad
fix: corrección de bug
docs: actualización de documentación
style: cambios de formato
refactor: refactorización
test: tests
ci: configuración CI/CD
```

### Branches

```
main       → Producción
develop    → Integración
feature/*  → Nuevas features
fix/*      → Bug fixes
```

### TypeScript

- ✅ Tipado estricto obligatorio
- ❌ No usar `any`
- ✅ Interfaces documentadas
- ✅ Tipos compartidos en `packages/`

---

## 🚀 Próximos Pasos

**MVP Actual:** ✅ Funcional  
**Roadmap:**

- [ ] Admin dashboard con estadísticas
- [ ] Aliases personalizados
- [ ] Autenticación de usuarios
- [ ] Expiración automática de URLs
- [ ] Rate limiting por IP
- [ ] Integración OAuth
- [ ] API key para uso programático
- [ ] Exportar QR en PNG/SVG

---

## 📄 Licencia

MIT

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas!

1. Fork el proyecto
2. Crea una branch: `git checkout -b feature/AmazingFeature`
3. Commit: `git commit -m 'feat: add AmazingFeature'`
4. Push: `git push origin feature/AmazingFeature`
5. Abre un Pull Request

Por favor:
- Sigue las convenciones de código
- Agrega tests para nuevas funcionalidades
- Actualiza el README si es necesario

---

## 📞 Soporte

- **Issues**: Abre un [issue en GitHub](https://github.com/xdextx/url-shortener-qr/issues)
- **Email**: germonramirez@gmail.com

---

## 🙏 Agradecimientos

- [Express.js](https://expressjs.com/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
- [sql.js](https://sql.js.org/)

---

**Made with ❤️ by [German Montero]**

Última actualización: 2026-04-10 | Versión: 0.1.0
