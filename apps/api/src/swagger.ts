const userRequestSchema = {
  type: "object",
  required: ["userName", "phone", "userEmail", "aadhaarNumber", "localAddress", "hometownAddress", "profilePhotoUrl"],
  properties: {
    userName: { type: "string", example: "Rohit Jain" },
    phone: { type: "string", example: "9876543210" },
    userEmail: { type: "string", format: "email", example: "rohit@example.com" },
    aadhaarNumber: { type: "string", example: "123456789012" },
    localAddress: { type: "string", example: "Bengaluru, Karnataka" },
    hometownAddress: { type: "string", example: "Jaipur, Rajasthan" },
    profilePhotoUrl: { type: "string", format: "uri", example: "https://example.com/photo.jpg" }
  }
};

export const swaggerDocument = {
  openapi: "3.0.3",
  info: {
    title: "Rent App API",
    version: "1.0.0"
  },
  servers: [
    {
      url: "http://localhost:4000"
    }
  ],
  paths: {
    "/health": {
      get: {
        summary: "Health check",
        tags: ["System"],
        responses: {
          "200": {
            description: "Service health",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                    service: { type: "string", example: "api" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/users": {
      post: {
        summary: "Create user",
        tags: ["Users"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: userRequestSchema
            }
          }
        },
        responses: {
          "201": {
            description: "User created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "User saved successfully" }
                  }
                }
              }
            }
          },
          "500": {
            description: "Internal server error"
          }
        }
      }
    }
  }
} as const;