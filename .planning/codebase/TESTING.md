# Testing

## Current State

### Test Framework
**No testing framework is currently configured.** The project has no test files, test dependencies, or test scripts in either the backend or frontend `package.json`.

### Test Files
- **Backend:** No `__tests__/`, `*.test.ts`, or `*.spec.ts` files found
- **Frontend:** No `__tests__/`, `*.test.tsx`, or `*.spec.tsx` files found

### CI/CD
- No CI pipeline configuration found (no `.github/workflows/`, `.gitlab-ci.yml`, `Jenkinsfile`, etc.)
- No pre-commit hooks or lint-staged configuration

## Verification Methods Currently Used

### Manual Testing
- Backend API tested via direct HTTP calls (likely Postman/curl)
- Frontend tested via browser interaction
- Sample query file exists: `database/006_sample_queries.sql`

### Type Checking
- TypeScript strict mode provides compile-time verification
- Frontend: `tsc -b` runs as part of `npm run build`
- Backend: `noEmit: true` — TypeScript is only for type checking (Bun runs TS directly)

### Linting
- Frontend ESLint configured with:
  - `eslint-plugin-react-hooks` — React hooks rules
  - `eslint-plugin-react-refresh` — Fast refresh compliance
  - `typescript-eslint` — TypeScript-aware linting

## Recommended Testing Strategy

### Priority 1: Backend API Tests
- **Framework suggestion:** Vitest or Jest with supertest
- **Critical paths to test:**
  - Auth flow: register → login → me → logout
  - Listing CRUD: create single, create bulk, get all (with filters), get by ID
  - Input validation: missing fields, invalid types, duplicate emails
  - Error handling: invalid tokens, deactivated accounts
  - Photo validation: type limits (2 Room, 1 Exterior)

### Priority 2: Service Unit Tests
- **`listings.service.ts`** — Most complex file (807 lines), high business logic density
  - Dynamic column detection
  - Photo JSON parsing and SAS URL resolution
  - Filter query building
  - Transaction rollback on failure
- **`blob.service.ts`** — Multi-strategy blob resolution
- **`googleMaps.service.ts`** — Response parsing

### Priority 3: Frontend Component Tests
- **Framework suggestion:** Vitest + React Testing Library
- **Critical pages:**
  - Login/Register: form validation, error display, redirect behavior
  - AddListing: multi-step wizard flow, photo upload
  - Listings: filter application, pagination
  - AuthContext: session refresh, logout

### Priority 4: E2E Tests
- **Framework suggestion:** Playwright or Cypress
- **Critical flows:**
  - Full auth cycle (register → login → dashboard)
  - Listing creation with photos
  - Listing browsing with filters
  - Listing detail view
