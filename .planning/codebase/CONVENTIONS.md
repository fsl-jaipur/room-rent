# Coding Conventions

## TypeScript Patterns

### Type Safety
- **Strict mode** enabled in both backend and frontend
- `noUncheckedIndexedAccess: true` in backend (prevents undefined access on arrays/objects)
- Request body types cast with `as { field?: unknown }` pattern and validated with `isNonEmptyString()` guards
- Custom type assertions before use (e.g., `typeof value === "string" && value.trim().length > 0`)

### Type Declaration Style
```typescript
// Interfaces defined at module level in service files
export interface CreateListingDto {
  landlordId: string;
  roomDetails: { ... };
  photos?: { ... }[];
  location: ParsedAddress & { latitude: number; longitude: number };
}

// Controller-local types
type AuthUserRecord = {
  UserId: string;
  Email: string | null;
  Role: string | null;
};
```

### Module Style
- **ES Modules** throughout (`"type": "module"` in both package.json files)
- Import with `.js` extension in backend route/controller files (Bun ESM resolution)
- Named exports for functions, default exports for route/config modules

## Error Handling

### Backend Pattern
```typescript
// Controllers: try-catch with next(error) for propagation
export const getAllListings = async (req, res, next) => {
  try {
    // ... business logic
    res.status(200).json({ items, total });
  } catch (error) {
    next(error);
  }
};

// Auth controller: inline error responses (no next)
export const login = async (req, res) => {
  try {
    // ... auth logic
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
```

### Global Error Handler (`backend/src/middlewares/errorHandler.ts`)
```typescript
// Detects Azure REST errors by name/code
// Returns structured JSON with:
// - success: false
// - message
// - azureCode/azureMessage (for Azure errors)
// - stack (in development mode only)
```

### Frontend Pattern
```typescript
// ApiError class for structured errors
export class ApiError extends Error {
  status: number;
  // thrown when response.ok === false
}

// Component-level error state
const [errorMsg, setErrorMsg] = useState('');
try {
  await apiFetch(...);
} catch (err) {
  const message = err instanceof Error ? err.message : "Operation failed";
  setErrorMsg(message);
}
```

## Database Access Patterns

### Parameterized Queries
All database operations use parameterized inputs — **never** string concatenation:
```typescript
const request = pool.request();
request.input("Email", sql.VarChar, normalizedEmail);
request.input("Phone", sql.VarChar, normalizedPhone);
const result = await request.query("SELECT ... WHERE Email = @Email");
```

### Transaction Pattern
```typescript
const transaction = new sql.Transaction(pool);
await transaction.begin();
try {
  // Multiple operations...
  await transaction.commit();
  return result;
} catch (error) {
  await transaction.rollback();
  throw error;
}
```

### Dynamic Filter Queries
Filters are built dynamically by pushing to `whereClauses[]` array and applying params conditionally:
```typescript
const whereClauses: string[] = ["l.StatusId = 1"];
if (filters.search) {
  whereClauses.push("(l.Colony LIKE @Search ...)");
}
// Later: WHERE ${whereClauses.join(" AND ")}
```

## React / Frontend Patterns

### Component Structure
- **Page components** are the primary building blocks (no shared component library yet)
- Each page is a directory with `index.tsx` (e.g., `pages/Login/index.tsx`)
- No component decomposition within pages — each page is a single monolithic component

### State Management
- **AuthContext** for authentication state (user, loading, setUser, refreshSession, logout)
- **Local state** (useState) for page-specific data
- No global state management library (no Redux, Zustand, etc.)

### Protected Routes
```typescript
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
```

### API Calls
- All API calls go through `apiFetch()` in `frontend/src/lib/api.ts`
- Base URL from `VITE_API_URL` environment variable
- Credentials always included for cookie-based auth
- Auto-sets JSON content type (skips for FormData)

## CSS / Styling Conventions

### Design System (`frontend/src/index.css`)
- **CSS custom properties** for theming (HSL-based brand colors)
- Brand color: Purple (hue 265°)
- Glassmorphism: `backdrop-filter: blur(12px)` on `.glass-card`
- Light/dark theme via `prefers-color-scheme` media query

### CSS Class Vocabulary
| Class | Purpose |
|-------|---------|
| `.glass-card` | Frosted glass card container |
| `.btn`, `.btn-primary`, `.btn-outline`, `.btn-danger` | Button variants |
| `.input-style` | Form input styling |
| `.form-group` | Label + input wrapper |
| `.flex-row`, `.flex-col` | Flex layout helpers |
| `.text-center`, `.mt-4`, `.mb-4`, `.w-full` | Utility classes |
| `.listings-layout`, `.listings-grid` | Listings page layout |

### Inline Styles
Many components use inline `style={}` props for one-off styling. This is used extensively in:
- `AddListing/index.tsx`
- `Listings/index.tsx`
- `Dashboard.tsx`

## Input Validation Patterns

### Backend
- `isNonEmptyString()` utility for string validation
- `normalizeEmail()` — trim + lowercase
- Parsed request body with typed destructuring
- SQL constraint error codes (2627, 2601) caught for duplicate detection
- Photo count limits enforced (max 2 Room, max 1 Exterior per listing)

### Frontend
- HTML5 `required` attribute on form inputs
- Controlled inputs with `useState`
- Error messages displayed inline via state
