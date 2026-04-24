# Technology Stack

## Languages & Runtime

| Component | Technology | Version |
|-----------|-----------|---------|
| Backend Runtime | **Bun** | latest |
| Backend Language | **TypeScript** (strict mode) | ~5.x |
| Frontend Language | **TypeScript** | ~5.9.3 |
| Database Schema | **T-SQL** (SQL Server) | — |

## Backend Framework & Dependencies

### Core Framework
- **Express v5.2.1** — HTTP server framework
  - Entry point: `backend/src/index.ts`
  - Runs via `bun run --watch src/index.ts` (dev mode)

### Runtime Middleware
| Package | Purpose |
|---------|---------|
| `helmet` v8.1 | Security headers |
| `cors` v2.8 | Cross-origin requests (origin: `CLIENT_URL`, credentials: true) |
| `morgan` v1.10 | HTTP request logging (dev format) |
| `cookie-parser` v1.4 | Cookie parsing for JWT auth |
| `multer` v1.4.5-lts.2 | Multipart file uploads (memory storage, 8MB limit) |

### Data & Auth
| Package | Purpose |
|---------|---------|
| `mssql` v12.2 | Azure SQL Server driver (connection pooling) |
| `bcryptjs` v3.0 | Password hashing (salt rounds: 10) |
| `jsonwebtoken` v9.0 | JWT token generation & verification |

### Cloud Services
| Package | Purpose |
|---------|---------|
| `@azure/storage-blob` v12.28 | Azure Blob Storage (image uploads, SAS URL generation) |

### Type Definitions (devDependencies)
- `@types/bcryptjs`, `@types/bun`, `@types/cookie-parser`, `@types/cors`
- `@types/express`, `@types/jsonwebtoken`, `@types/multer`, `@types/morgan`, `@types/mssql`

## Frontend Framework & Dependencies

### Core Framework
- **React v19.2** — UI library
- **Vite v5.4** — Build tool and dev server
  - Plugin: `@vitejs/plugin-react` v4.3
  - Config: `frontend/vite.config.ts`

### UI & Routing
| Package | Purpose |
|---------|---------|
| `react-router-dom` v7.13 | Client-side routing (BrowserRouter) |
| `lucide-react` v1.7 | Icon library |

### Dev Tooling
| Package | Purpose |
|---------|---------|
| `eslint` v9.39 | Linting |
| `eslint-plugin-react-hooks` | React hooks rules |
| `eslint-plugin-react-refresh` | Fast refresh linting |
| `typescript-eslint` v8.57 | TypeScript ESLint integration |

## Database

- **Azure SQL Server** (Microsoft SQL Server, cloud-hosted)
- Driver: `mssql` with connection pooling (max: 10, idle timeout: 30s)
- Schema migrations: Sequential numbered SQL files in `database/`
- Lookup tables use `TINYINT` identity PKs for compact FKs

## Configuration

### Environment Variables (`backend/.env.example`)
```
PORT, NODE_ENV, CLIENT_URL
DB_SERVER, DB_NAME, DB_USER, DB_PASSWORD, DB_PORT
GOOGLE_MAPS_API_KEY
JWT_SECRET
AZURE_STORAGE_CONNECTION_STRING
AZURE_STORAGE_ACCOUNT_NAME, AZURE_STORAGE_ACCOUNT_KEY
AZURE_STORAGE_CONTAINER_NAME
```

### TypeScript Configuration
- **Backend** (`backend/tsconfig.json`): ESNext target, bundler module resolution, strict mode, no emit
- **Frontend** (`frontend/tsconfig.app.json`, `frontend/tsconfig.node.json`): Separate configs for app and Node contexts

## Build & Run Scripts

### Backend
| Script | Command |
|--------|---------|
| `dev` | `bun run --watch src/index.ts` |
| `start` | `bun run src/index.ts` |

### Frontend
| Script | Command |
|--------|---------|
| `dev` | `vite` |
| `build` | `tsc -b && vite build` |
| `lint` | `eslint .` |
| `preview` | `vite preview` |

## Fonts & Design
- **Outfit** (Google Fonts) — Primary typeface (weights: 300–700)
- CSS custom properties for theming (HSL-based brand colors)
- Dark/light mode via `prefers-color-scheme` media query
