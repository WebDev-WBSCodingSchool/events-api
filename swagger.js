import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.1",
  info: {
    title: "Node.js Express API",
    description: "API for CRUD operations on various models",
    version: "1.0.0",
  },
};

const generateSwaggerPaths = (modelName) => ({
  [`/api/${modelName}`]: {
    post: {
      summary: `Create a new ${modelName}`,
      tags: [modelName],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: `#/components/request/${modelName}`,
            },
          },
        },
      },
      responses: {
        201: {
          description: `${modelName} created`,
          content: {
            "application/json": {
              schema: {
                $ref: `#/components/response/${modelName}`,
              },
            },
          },
        },
      },
    },
    get: {
      summary: `Get all ${modelName}`,
      tags: [modelName],
      parameters: [
        {
          in: "query",
          name: "page",
          required: false,
          schema: {
            type: "integer",
            minimum: 1,
            default: 1,
          },
          description: "The page number to retrieve.",
        },
        {
          in: "query",
          name: "limit",
          required: false,
          schema: {
            type: "integer",
            minimum: 1,
            default: 10,
          },
          description: "The number of items per page.",
        },
      ],
      responses: {
        200: {
          description: `List of ${modelName}`,
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  $ref: `#/components/response/${modelName}`,
                },
              },
            },
          },
        },
      },
    },
  },
  [`/api/${modelName}/{id}`]: {
    get: {
      summary: `Get ${modelName} by ID`,
      tags: [modelName],
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: {
            type: "string",
          },
        },
      ],
      responses: {
        200: {
          description: `${modelName} details`,
          content: {
            "application/json": {
              schema: {
                $ref: `#/components/response/${modelName}`,
              },
            },
          },
        },
        404: {
          description: `${modelName} not found`,
        },
      },
    },
    put: {
      summary: `Update ${modelName} by ID`,
      tags: [modelName],
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: {
            type: "string",
          },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: `#/components/request/${modelName}`,
            },
          },
        },
      },
      responses: {
        200: {
          description: `${modelName} updated`,
          content: {
            "application/json": {
              schema: {
                $ref: `#/components/response/${modelName}`,
              },
            },
          },
        },
        404: {
          description: `${modelName} not found`,
        },
      },
    },
    delete: {
      summary: `Delete ${modelName} by ID`,
      tags: [modelName],
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: {
            type: "string",
          },
        },
      ],
      responses: {
        204: {
          description: `${modelName} deleted`,
        },
        404: {
          description: `${modelName} not found`,
        },
      },
    },
  },
});

const options = (port) => ({
  swaggerDefinition: {
    ...swaggerDefinition,
    servers: [
      {
        url: `http://localhost:${port}`,
        description: "Local server",
      },
    ],
    paths: {
      ...generateSwaggerPaths("users"),
      ...generateSwaggerPaths("events"),
      "/api/events/upcoming": {
        get: {
          summary: `Get all upcoming events`,
          tags: ["events"],
          responses: {
            200: {
              description: `List of upcoming events`,
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      $ref: `#/components/schemas/events`,
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/auth/login": {
        post: {
          summary: "User login",
          tags: ["auth"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    email: {
                      type: "string",
                      format: "email",
                      example: "user@example.com",
                    },
                    password: {
                      type: "string",
                      format: "password",
                      example: "password123",
                    },
                  },
                  required: ["email", "password"],
                },
              },
            },
          },
          responses: {
            200: {
              description: "Successful login",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      token: {
                        type: "string",
                        description: "JWT token",
                        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                      },
                      payload: {
                        type: "object",
                        description: "JWT payload",
                        properties: {
                          id: {
                            type: "integer",
                            example: "1",
                          },
                          email: {
                            type: "string",
                            format: "email",
                            example: "user@example.com",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            403: {
              description: "Forbidden. Invalid email or password",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: {
                        type: "string",
                        example: "Invalid email or password.",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/auth/profile": {
        get: {
          summary: "Get logged-in user profile",
          tags: ["auth"],
          security: [
            {
              bearerAuth: [],
            },
          ],
          responses: {
            200: {
              description: "Logged-in user's profile",
              content: {
                "application/json": {
                  schema: { $ref: `#/components/response/users` },
                },
              },
            },
            403: {
              description: "Unauthorized. Invalid or missing token.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: {
                        type: "string",
                        example: "Forbidden",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        users: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
            password: { type: "string", format: "password" },
            isActive: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
          required: ["email", "password"],
        },
        events: {
          type: "object",
          properties: {
            id: { type: "integer" },
            title: { type: "string" },
            description: { type: "string" },
            date: { type: "string", format: "date-time" },
            location: { type: "string" },
            latitude: { type: "number", format: "float" },
            longitude: { type: "number", format: "string" },
            organizerId: { type: "number", format: "integers" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
          required: ["title", "date", "organizerId"],
        },
      },
      request: {
        users: {
          type: "object",
          properties: {
            name: { type: "string" },
            email: { type: "string", format: "email" },
            password: { type: "string", format: "password" },
            isActive: { type: "boolean" },
          },
        },
        events: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            date: { type: "string", format: "date-time" },
            location: { type: "string" },
            latitude: { type: "number", format: "float" },
            longitude: { type: "number", format: "string" },
            organizerId: { type: "number", format: "integers" },
          },
        },
      },

      response: {
        users: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
            isActive: { type: "boolean" },
            password: { type: "string", format: "password" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        events: {
          type: "object",
          properties: {
            id: { type: "integer" },
            title: { type: "string" },
            description: { type: "string" },
            date: { type: "string", format: "date-time" },
            location: { type: "string" },
            latitude: { type: "number", format: "float" },
            longitude: { type: "number", format: "string" },
            organizerId: { type: "number", format: "integers" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
      },
    },
  },
  apis: [],
});

export const setupSwagger = (app, port) => {
  const swaggerSpec = swaggerJsdoc(options(port));
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};