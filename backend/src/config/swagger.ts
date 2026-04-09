import env from "./env";

const apiBaseUrl = `http://localhost:${env.PORT}/api`;

export const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "Rent App API",
    version: "1.0.0",
    description: "API documentation for Rent App backend services.",
  },
  servers: [{ url: apiBaseUrl }],
  tags: [
    { name: "Health", description: "Service health endpoints" },
    { name: "Auth", description: "Authentication and session endpoints" },
    { name: "Profile", description: "User profile endpoints" },
    { name: "Listings", description: "Listing browse and publish endpoints" },
    { name: "Uploads", description: "Image upload endpoints" },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "jwt",
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          error: { type: "string", example: "Unauthorized" },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: {
          "200": {
            description: "Service is healthy",
          },
        },
      },
    },
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["fullName", "email", "phone", "password"],
                properties: {
                  fullName: { type: "string" },
                  role: { type: "string", enum: ["Tenant", "Landlord"] },
                  gender: { type: "string", enum: ["Male", "Female"] },
                  email: { type: "string", format: "email" },
                  phone: { type: "string" },
                  password: { type: "string", format: "password" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Registration successful" },
          "400": { description: "Validation error" },
          "409": { description: "Duplicate account" },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string", format: "password" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Login successful" },
          "401": { description: "Invalid credentials" },
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout current user",
        responses: {
          "200": { description: "Logged out" },
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current user session",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": { description: "Current user" },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/auth/profile": {
      get: {
        tags: ["Profile"],
        summary: "Get profile",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": { description: "Profile fetched" },
          "401": { description: "Unauthorized" },
        },
      },
      post: {
        tags: ["Profile"],
        summary: "Create profile",
        security: [{ cookieAuth: [] }],
        responses: {
          "201": { description: "Profile saved" },
          "401": { description: "Unauthorized" },
        },
      },
      put: {
        tags: ["Profile"],
        summary: "Update profile",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": { description: "Profile updated" },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/listings": {
      get: {
        tags: ["Listings"],
        summary: "Get listings with filters",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", minimum: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100 } },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "minRent", in: "query", schema: { type: "number" } },
          { name: "maxRent", in: "query", schema: { type: "number" } },
          { name: "propertyTypeId", in: "query", schema: { type: "string" }, description: "Comma-separated values" },
          { name: "gender", in: "query", schema: { type: "string" }, description: "Comma-separated Male,Female" },
          { name: "sortBy", in: "query", schema: { type: "string", enum: ["newest", "rent_asc", "rent_desc"] } },
        ],
        responses: {
          "200": { description: "Listings response" },
          "401": { description: "Unauthorized" },
        },
      },
      post: {
        tags: ["Listings"],
        summary: "Create single listing",
        security: [{ cookieAuth: [] }],
        responses: {
          "201": { description: "Listing created" },
          "400": { description: "Bad request" },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/listings/bulk": {
      post: {
        tags: ["Listings"],
        summary: "Create bulk listings",
        security: [{ cookieAuth: [] }],
        responses: {
          "201": { description: "Listings created" },
          "400": { description: "Bad request" },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/listings/{listingId}": {
      get: {
        tags: ["Listings"],
        summary: "Get listing by id",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "listingId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": { description: "Listing details" },
          "404": { description: "Not found" },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/uploads/image": {
      post: {
        tags: ["Uploads"],
        summary: "Upload listing/profile image",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["image"],
                properties: {
                  image: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Image uploaded" },
          "400": { description: "Missing/invalid file" },
          "401": { description: "Unauthorized" },
          "502": { description: "Azure upload failed" },
        },
      },
    },
  },
} as const;

export default swaggerSpec;
