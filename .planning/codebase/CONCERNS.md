# Concerns & Technical Debt

## 🔴 High Priority

### 1. Default JWT Secret in Code
**File:** `backend/src/config/env.ts` (line 27)
```typescript
JWT_SECRET: process.env.JWT_SECRET || "default_development_secret_key_change_in_prod",
```
The fallback secret is a readable string. If `JWT_SECRET` is not set in production, tokens will be signed with a weak, predictable key. This should fail loudly in production rather than silently using a default.

### 2. No Rate Limiting
**Affected routes:** `/api/auth/register`, `/api/auth/login`
No rate limiting middleware is configured. Auth endpoints are vulnerable to brute-force attacks and credential stuffing. Consider `express-rate-limit` or similar.

### 3. No Input Sanitization
Controller inputs are validated for presence but not sanitized for XSS or injection beyond SQL parameterization. While SQL injection is mitigated by parameterized queries, output encoding is not applied to user-supplied strings (colony names, addresses, descriptions) before they are rendered in the frontend.

### 4. Missing `getMyListings` Service Method
**File:** `backend/src/controllers/listings.controller.ts` (line 319)
The controller calls `ListingsService.getMyListings(landlordId)`, but **this method does not exist** in `listings.service.ts`. The listings routes file also does not define a `/my` route, but the frontend `Dashboard.tsx` (root-level) fetches from `/api/listings/my`. This is a broken feature.

### 5. Duplicate Dashboard Components
**Files:**
- `frontend/src/pages/Dashboard/index.tsx` (30 lines — compact version used by router)
- `frontend/src/pages/Dashboard.tsx` (81 lines — full version with listings grid, not imported)

Two Dashboard components exist. The router imports `Dashboard/index.tsx` (compact), while `Dashboard.tsx` (full version with "Your Listed Rooms" grid) is orphaned. This creates confusion about which is the intended dashboard.

---

## 🟡 Medium Priority

### 6. SAS URL Expiry (5 Years)
**File:** `backend/src/services/blob.service.ts` (line 64)
```typescript
export const generateReadSasUrl = (blobId: string, expiresInHours = 24 * 365 * 5): string => {
```
Default SAS URL expiry is ~5 years. This is excessive and creates long-lived access tokens. Consider shorter expiry with on-demand regeneration.

### 7. `createRequire` Hack for Azure SDK
**File:** `backend/src/services/blob.service.ts` (lines 1–23)
```typescript
const require = createRequire(import.meta.url);
const { BlobServiceClient, ... } = require("@azure/storage-blob") as { ... };
```
Uses CommonJS `require` via `createRequire` to import the Azure SDK, casting all types to `any`. This bypasses TypeScript type checking for all Azure Blob operations. Should use proper ESM imports.

### 8. Monolithic Page Components
Several pages are large, monolithic components with no decomposition:
- `AddListing/index.tsx` — 24KB, handles form state, photo upload, geocoding, submission
- `Listings/index.tsx` — 17KB, handles filters, pagination, listing display
- `listings.service.ts` — 28KB, handles all listing CRUD + photo resolution

These should be broken into smaller, focused components/functions.

### 9. Hardcoded API URL in Dashboard.tsx
**File:** `frontend/src/pages/Dashboard.tsx` (line 20)
```typescript
fetch("http://localhost:5000/api/listings/my", { credentials: "include" })
```
Uses hardcoded `localhost:5000` instead of the `apiFetch` utility or `VITE_API_URL` env var. Won't work in any non-local environment.

### 10. Unsafe Type Casting with `(req as any)`
**File:** `backend/src/controllers/listings.controller.ts` (lines 95, 253, 313)
```typescript
const landlordId = (req as any).user?.id || req.body.landlordId;
```
Despite `req.user` being properly typed via `auth.middleware.ts` global declaration, the controller still uses `(req as any)` casting and falls back to `req.body.landlordId`, which bypasses authentication.

---

## 🟢 Low Priority

### 11. No Database Migration Runner
SQL files in `database/` are numbered but there's no migration runner or version tracking. Migrations are presumably run manually. Consider a tool like `node-mssql-migrate` or custom migration tracking.

### 12. Mixed Lockfile Issue
**Backend directory contains:**
- `bun.lock` (Bun lockfile)
- `package-lock.json` (npm lockfile)

Having both can cause dependency confusion. Should standardize on one package manager.

### 13. Uploads Directory is Unused at Runtime
**File:** `backend/src/index.ts` (lines 15–19)
The server creates and serves an `uploads/` directory for static files, but all photo uploads go directly to Azure Blob Storage. The local `uploads/` directory and static file serving may be dead code.

### 14. No Pagination for `getMyListings`
The `getMyListings` controller (and the orphaned Dashboard.tsx) fetches all landlord listings without pagination. For landlords with many listings, this will degrade performance.

### 15. Database Schema Has Two `002_*` Migration Files
```
002_create_users.sql
002_alter_users_table.sql
```
Both share the `002` prefix, creating ambiguity about execution order. The alter script was likely added later and should have been `010_*` or similar.

---

## Security Notes

| Area | Status |
|------|--------|
| SQL Injection | ✅ Mitigated (parameterized queries) |
| XSS | ⚠️ No output encoding |
| CSRF | ⚠️ SameSite=lax cookies (partial protection) |
| Brute Force | ❌ No rate limiting |
| Secret Management | ⚠️ Fallback hardcoded JWT secret |
| File Uploads | ✅ Image-only filter, 8MB limit |
| CORS | ✅ Restricted to CLIENT_URL origin |
| Headers | ✅ Helmet security headers |
| Password Storage | ✅ bcrypt with salt (10 rounds) |
