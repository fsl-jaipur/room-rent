# External Integrations

## 1. Azure SQL Server (Primary Database)

**Package:** `mssql` v12.2  
**Config:** `backend/src/config/db.ts`

### Connection Details
- Azure-hosted SQL Server (`*.database.windows.net`)
- TLS encryption required (`encrypt: true`)
- Connection pool: max 10, idle timeout 30s, connect timeout 30s
- Singleton pool pattern via `getPool()` / `closePool()`

### Schema Objects
| Table | Purpose |
|-------|---------|
| `dbo.Users` | Landlord/Tenant accounts with password hashes |
| `dbo.Listings` | Room rental listings with geocoded addresses |
| `dbo.ListingPhotos` | Photo metadata (JSON blob storage references) |
| `dbo.FloorLevels` | Lookup: Ground, First, Second, Third, Roof |
| `dbo.FurnishingTypes` | Lookup: Unfurnished, Semi, Fully |
| `dbo.FoodPreferences` | Lookup: Veg Only, Non-Veg Allowed, No Restriction |
| `dbo.ListingStatuses` | Lookup: Active, Paused, Rented, Expired, Deleted |
| `dbo.SavedSearches` | User saved search criteria |
| `dbo.Favorites` | User favorite listings |

### Access Pattern
- All queries use parameterized inputs (`sql.Request.input()`)
- Transactions used for multi-table inserts (listing + photos)
- Dynamic column detection via `sys.columns` for schema flexibility

---

## 2. Azure Blob Storage (Image Storage)

**Package:** `@azure/storage-blob` v12.28  
**Config:** `backend/src/services/blob.service.ts`

### Authentication
Two methods supported (fallback order):
1. Connection string (`AZURE_STORAGE_CONNECTION_STRING`)
2. Account name + key (`AZURE_STORAGE_ACCOUNT_NAME` + `AZURE_STORAGE_ACCOUNT_KEY`)

### Operations
| Method | Description |
|--------|-------------|
| `BlobService.uploadImage(file)` | Upload multer file, returns `{ blobId, blobUrl, accessUrl }` |
| `BlobService.moveBlobToListingFolder(blobId, listingId)` | Moves blob to `listings/{listingId}/` folder |
| `BlobService.blobExists(blobId)` | Check if blob exists |
| `BlobService.findBlobIdByFileName(fileName)` | Search blobs by filename |
| `BlobService.resolveReadableBlobId(input)` | Multi-strategy blob resolution (direct, listing-prefixed, URL-parsed, filename search) |
| `generateReadSasUrl(blobId, expiresInHours)` | Generate read-only SAS URL (default: 5 years) |

### Container Structure
```
{container}/
  ├── {timestamp}-{random}.{ext}     ← temporary uploads
  └── listings/{listingId}/
       └── {timestamp}-{random}.{ext} ← organized by listing
```

### Photo Storage Format
Photos are stored as a JSON object in `ListingPhotos.PhotoUrl`:
```json
{
  "Exterior": [{ "blobId": "listings/xxx/1234.jpg", "url": "https://..." }],
  "Room": [{ "blobId": "listings/xxx/5678.jpg", "url": "https://..." }]
}
```

---

## 3. Google Maps Geocoding API

**Service:** `backend/src/services/googleMaps.service.ts`  
**Auth:** API key via `GOOGLE_MAPS_API_KEY` env var

### Endpoints Used
| Operation | Google API Endpoint |
|-----------|-------------------|
| Reverse geocode (lat/lng → address) | `geocode/json?latlng=...` |
| Forward geocode (address → lat/lng) | `geocode/json?address=...` |

### Parsed Output (`ParsedAddress`)
```typescript
{
  addressLine: string;  // formatted_address
  colony: string;       // sublocality_level_1 / neighborhood
  city: string;         // locality
  state: string;        // administrative_area_level_1
  pincode: string;      // postal_code
}
```

### Usage
- Called during listing creation (single and bulk)
- Either coordinates or address string accepted — only one geocode call per listing group
- Bulk listings share a single geocode result

---

## 4. JWT Authentication (Cookie-based)

**Package:** `jsonwebtoken` v9.0  
**Config:** `backend/src/config/env.ts` (`JWT_SECRET`)

### Token Details
- Payload: `{ id, email, role }`
- Expiry: 7 days
- Storage: HttpOnly cookie named `jwt`
- Cookie settings: `sameSite: lax`, `secure: production only`
- Fallback: `Authorization: Bearer <token>` header

### Middleware
- `requireAuth` (`backend/src/middlewares/auth.middleware.ts`)
- Attaches decoded token to `req.user`
- Used on all listing routes and protected endpoints

---

## 5. Frontend API Client

**File:** `frontend/src/lib/api.ts`

### Configuration
- Base URL from `VITE_API_URL` env var (default: `http://localhost:5000`)
- All requests include `credentials: "include"` for cookie-based auth
- Auto-sets `Content-Type: application/json` (except FormData)
- Custom `ApiError` class with status code
