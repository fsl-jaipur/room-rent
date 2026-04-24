# Architecture

## System Overview

**Room-Rent** is a full-stack room rental bridge platform connecting landlords and tenants. It follows a **client-server architecture** with a React SPA frontend and an Express REST API backend, backed by Azure SQL Server and Azure Blob Storage.

```
┌──────────────────┐        ┌──────────────────────┐        ┌────────────────┐
│  React SPA       │  HTTP  │  Express API          │  SQL   │  Azure SQL     │
│  (Vite + React)  │───────▶│  (Bun + Express v5)   │───────▶│  Server        │
│  Port 5173       │  JSON  │  Port 5000            │  TDS   │  (Cloud)       │
└──────────────────┘        └──────┬───────────────┘        └────────────────┘
                                   │
                                   │ REST / SAS
                                   ▼
                            ┌──────────────────┐     ┌──────────────────┐
                            │  Google Maps API  │     │  Azure Blob      │
                            │  (Geocoding)      │     │  Storage         │
                            └──────────────────┘     └──────────────────┘
```

## Architectural Pattern

### Backend: Layered MVC (without Models folder)
```
Routes → Controllers → Services → Database (mssql)
```

| Layer | Responsibility | Location |
|-------|---------------|----------|
| **Routes** | HTTP verb + path mapping, middleware binding | `backend/src/routes/` |
| **Controllers** | Request parsing, validation, response formatting | `backend/src/controllers/` |
| **Services** | Business logic, database queries, external API calls | `backend/src/services/` |
| **Config** | Environment variables, database connection pool | `backend/src/config/` |
| **Middleware** | Auth verification, error handling | `backend/src/middlewares/` |

> **Note:** There is no explicit `models/` layer. TypeScript interfaces are defined inline within service files (e.g., `CreateListingDto`, `ListingItem`).

### Frontend: Page-based SPA
```
main.tsx → BrowserRouter → App.tsx → Routes → Pages
                                        ↑
                                    AuthContext
```

| Layer | Responsibility | Location |
|-------|---------------|----------|
| **Pages** | Route-level components with full page UI | `frontend/src/pages/` |
| **Context** | Global auth state management | `frontend/src/context/` |
| **Lib** | API client utilities | `frontend/src/lib/` |

## Data Flow

### Listing Creation Flow
```
1. Frontend (AddListing page)
   → Collects room details + photos + location
   → Uploads photos to /api/uploads/image (Azure Blob)
   → Submits listing to /api/listings

2. Backend Controller (listings.controller.ts)
   → Validates request body
   → Calls GoogleMapsService for geocoding

3. Backend Service (listings.service.ts)
   → Begins SQL transaction
   → INSERT into dbo.Listings
   → Moves uploaded blobs to listing folder
   → INSERT into dbo.ListingPhotos (JSON format)
   → Commits transaction
```

### Authentication Flow
```
1. Register/Login → POST /api/auth/register or /api/auth/login
2. Backend validates credentials → bcrypt compare
3. JWT signed with { id, email, role } → set as HttpOnly cookie
4. Frontend AuthContext calls GET /api/auth/me on mount
5. Protected routes check AuthContext for user state
```

### Listing Retrieval Flow
```
1. GET /api/listings?page=1&limit=20&filters...
2. Service builds dynamic WHERE clause from filters
3. Joins with lookup tables (FloorLevels, FurnishingTypes, FoodPreferences)
4. OUTER APPLY to get cover photo
5. Resolves photo URLs → SAS URLs via BlobService
6. Returns paginated results with total count
```

## Key Design Decisions

### 1. Dynamic Column Detection
The listings service queries `sys.columns` at runtime to detect available columns before INSERT operations. This provides forward compatibility as the schema evolves (e.g., optional columns like `BedType`, `PropertyTypeId`).

### 2. JSON Photo Storage
Rather than one row per photo, photos are stored as a JSON object per listing in `ListingPhotos.PhotoUrl`, grouped by type (`Exterior`, `Room`). The service layer handles parsing and SAS URL resolution.

### 3. Singleton Connection Pool
Database access uses a module-level singleton pool (`backend/src/config/db.ts`), initialized on first call to `getPool()` and shared across all requests.

### 4. Cookie-based JWT Auth
Authentication uses HttpOnly cookies rather than localStorage tokens, providing XSS protection. The `requireAuth` middleware supports both cookie and Bearer header authentication.

### 5. Geocoding Abstraction
Both forward (address → coords) and reverse (coords → address) geocoding are supported, allowing landlords to provide either coordinates or a text address during listing creation.

## Entry Points

| Entry Point | File | Purpose |
|-------------|------|---------|
| Backend server | `backend/src/index.ts` | Express app initialization, middleware, routes |
| Frontend app | `frontend/src/main.tsx` | React root with BrowserRouter + AuthProvider |
| API router | `backend/src/routes/index.ts` | /api/* route registration |
| Database init | `database/001_create_lookup_tables.sql` | First migration script |
