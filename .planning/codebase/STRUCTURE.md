# Project Structure

## Root Directory Layout

```
room-rent/
├── .gitignore                           # Root gitignore
├── database.zip                         # Database schema archive
│
├── backend/                             # Express API (Bun runtime)
│   ├── .env                             # Environment variables (gitignored)
│   ├── .env.example                     # Env var template
│   ├── .gitignore                       # Backend-specific ignores
│   ├── package.json                     # Backend dependencies & scripts
│   ├── bun.lock                         # Bun lockfile
│   ├── package-lock.json                # npm lockfile (alternate)
│   ├── tsconfig.json                    # TypeScript config (strict, ESNext)
│   ├── uploads/                         # Local upload directory (runtime-created)
│   └── src/
│       ├── index.ts                     # ★ Server entry point
│       ├── config/
│       │   ├── db.ts                    # SQL Server connection pool (singleton)
│       │   └── env.ts                   # Environment variable loader
│       ├── controllers/
│       │   ├── auth.controller.ts       # Register, login, logout, me
│       │   └── listings.controller.ts   # CRUD for room listings
│       ├── middlewares/
│       │   ├── auth.middleware.ts        # JWT verification (requireAuth)
│       │   └── errorHandler.ts          # Global error + 404 handler
│       ├── routes/
│       │   ├── index.ts                 # Route aggregator (/api/*)
│       │   ├── auth.routes.ts           # /api/auth/*
│       │   ├── listings.routes.ts       # /api/listings/*
│       │   └── upload.routes.ts         # /api/uploads/*
│       └── services/
│           ├── blob.service.ts          # Azure Blob Storage operations
│           ├── googleMaps.service.ts    # Google Geocoding API wrapper
│           └── listings.service.ts      # ★ Core listing business logic (807 lines)
│
├── frontend/                            # React SPA (Vite)
│   ├── .env                             # VITE_API_URL (gitignored)
│   ├── .gitignore                       # Frontend-specific ignores
│   ├── index.html                       # HTML shell
│   ├── package.json                     # Frontend dependencies & scripts
│   ├── vite.config.ts                   # Vite config (react plugin)
│   ├── tsconfig.json                    # Root TS config
│   ├── tsconfig.app.json                # App-specific TS config
│   ├── tsconfig.node.json               # Node-specific TS config
│   ├── eslint.config.js                 # ESLint configuration
│   ├── public/                          # Static assets
│   └── src/
│       ├── main.tsx                     # ★ React entry (BrowserRouter + StrictMode)
│       ├── App.tsx                      # Route definitions + Protected/Public wrappers
│       ├── index.css                    # ★ Global design system (glassmorphism, tokens)
│       ├── context/
│       │   └── AuthContext.tsx           # Auth state provider (user, login, logout)
│       ├── lib/
│       │   └── api.ts                   # API fetch wrapper (credentials, error handling)
│       ├── pages/
│       │   ├── Login/index.tsx           # Email/password login form
│       │   ├── Register/index.tsx        # Registration form (fullName, email, phone, password)
│       │   ├── Dashboard/index.tsx       # Landlord dashboard (compact version)
│       │   ├── Dashboard.tsx             # Landlord dashboard (full version with listings grid)
│       │   ├── AddListing/index.tsx      # ★ Listing creation wizard (23KB)
│       │   ├── Listings/index.tsx        # ★ Listings browse page with filters (17KB)
│       │   └── ListingDetails/index.tsx  # Single listing detail view (7.5KB)
│       └── assets/                       # Static assets (images, etc.)
│
└── database/                            # SQL Server migration scripts
    ├── 001_create_lookup_tables.sql     # FloorLevels, FurnishingTypes, etc.
    ├── 002_create_users.sql             # Users table with auth fields
    ├── 002_alter_users_table.sql        # Users table modifications
    ├── 003_create_listings.sql          # Listings table with all room fields
    ├── 004_create_photos.sql            # ListingPhotos table
    ├── 005_create_saved_searches_and_favorites.sql  # Saved searches & favorites
    ├── 006_sample_queries.sql           # Example queries for testing
    ├── 007_fix_users_nullable_aadhaar_unique.sql  # Aadhaar constraint fix
    ├── 008_add_blobid_to_listingphotos.sql  # BlobId column addition
    ├── 009_listingphotos_json_storage.sql   # JSON photo storage migration
    └── ER Diagram & walkthrough.md      # Schema documentation with Mermaid diagrams
```

## Key File Sizes (Largest Files)

| File | Size | Significance |
|------|------|-------------|
| `backend/src/services/listings.service.ts` | 28KB (807 lines) | Core business logic — largest file |
| `frontend/src/pages/AddListing/index.tsx` | 24KB | Multi-step listing creation form |
| `frontend/src/pages/Listings/index.tsx` | 17KB | Listing browse page with filters |
| `backend/src/controllers/auth.controller.ts` | 8KB | Auth logic with error handling |
| `frontend/src/pages/ListingDetails/index.tsx` | 7.5KB | Detail view |
| `backend/src/services/blob.service.ts` | 7.4KB | Blob storage operations |

## Naming Conventions

### Files
- **Backend:** `kebab-case.type.ts` (e.g., `auth.controller.ts`, `blob.service.ts`)
- **Frontend pages:** PascalCase directories with `index.tsx` (e.g., `AddListing/index.tsx`)
- **Database:** `NNN_description.sql` (numbered migration order)

### Code
- **TypeScript interfaces:** PascalCase (e.g., `CreateListingDto`, `ListingItem`)
- **Functions:** camelCase (e.g., `getAllListings`, `createSingleListing`)
- **Database columns:** PascalCase (e.g., `ListingId`, `MonthlyRent`)
- **CSS classes:** kebab-case / BEM-like (e.g., `glass-card`, `btn-primary`)

## API Route Structure

```
/api
├── /health                    GET    Health check
├── /auth
│   ├── /register             POST   Create account
│   ├── /login                POST   Login
│   ├── /logout               POST   Clear JWT cookie
│   └── /me                   GET    Current user info (requireAuth)
├── /listings                  (all requireAuth)
│   ├── /                     GET    List all (paginated, filtered)
│   ├── /:listingId           GET    Single listing detail
│   ├── /                     POST   Create single listing
│   └── /bulk                 POST   Create multiple listings
└── /uploads
    └── /image                POST   Upload image to Azure Blob (requireAuth)
```

## Frontend Route Map

| Path | Component | Auth | Description |
|------|-----------|------|-------------|
| `/login` | Login | Public (redirects if logged in) | Email/password login |
| `/register` | Register | Public (redirects if logged in) | Account registration |
| `/` | Redirect | Protected | Redirects to `/listings` |
| `/listings` | ListingsPage | Protected | Browse all listings |
| `/listings/:listingId` | ListingDetailsPage | Protected | View single listing |
| `/dashboard` | Dashboard | Protected | Landlord dashboard |
| `/add-listing` | AddListing | Protected | Create new listing |
