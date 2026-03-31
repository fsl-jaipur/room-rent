# Web App

## Backend Connection

This web app now calls the API controllers in `apps/api`:

- `GET /health`
- `POST /users`
- `GET /users/:userId`
- `PUT /users/:userId`
- `GET /properties`
- `GET /properties/:propertyId`
- `POST /properties`

Set env vars in `.env.local`:

- `NEXT_PUBLIC_API_URL` (example: `http://localhost:4000`)
- `NEXT_PUBLIC_DEFAULT_USER_ID` (optional UUID; needed to create properties if your login flow does not already store `userId`)
