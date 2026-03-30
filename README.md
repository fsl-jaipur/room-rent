# Rent App Monorepo

## Stack
- Turborepo + Bun workspaces
- `apps/web`: Next.js
- `apps/mobile`: Expo
- `apps/api`: Bun + Express
- `packages/shared`: Zod schemas and shared types
- `packages/db`: Prisma + SQL Server

## Quick Start
1. Install dependencies:
   - `bun install` (or `npm install`)
2. Create local settings file:
   - copy `local.settings.example.json` to `local.settings.json`
3. Run everything in parallel:
   - `bun run dev`

## Local JSON Settings
- Root file: `local.settings.json`
- Shape:
  - `Values.DATABASE_URL` (use `sqlserver://host:1433;database=...;user=...;password=...;encrypt=true;trustServerCertificate=false;`)
  - `Values.PORT`
  - `Values.CORS_ORIGIN`

## API
- Health endpoint: `GET http://localhost:4000/health`
- Create user: `POST http://localhost:4000/users`

### User Request Body
```json
{
  "name": "Rohit Jain",
  "phone": "9876543210",
  "email": "rohit@example.com",
  "aadhaarNumber": "123456789012",
  "localAddress": "Bengaluru, Karnataka",
  "hometownAddress": "Jaipur, Rajasthan",
  "profilePhotoUrl": "https://example.com/photo.jpg"
}
```


