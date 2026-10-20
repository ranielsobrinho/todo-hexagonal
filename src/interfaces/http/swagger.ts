import type { FastifyInstance } from 'fastify'

const SWAGGER_OPTIONS = {
  openapi: '3.0.3',
  info: {
    title: 'Todo Hexagonal API',
    version: '1.0.0',
    description:
      'A TODO API that speaks both REST (Fastify) and gRPC, backed by PostgreSQL, on top of a Hexagonal (Ports & Adapters) architecture in TypeScript.',
    contact: {
      name: 'API Support',
      url: 'https://github.com/ranielsobrinho/todo-hexagonal',
    },
    license: { name: 'MIT', url: 'https://opensource.org/licenses/MIT' },
  },
  servers: [
    { url: 'http://localhost:5000', description: 'Development server' },
    { url: 'https://api.example.com', description: 'Production server' },
  ],
  tags: [
    { name: 'todos', description: 'Todo management endpoints' },
    { name: 'health', description: 'Health check endpoint' },
  ],
  paths: {
    '/api/v1/todos': {
      post: {
        tags: ['todos'],
        summary: 'Create a todo',
        operationId: 'createTodo',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateTodoBody' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Todo created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Todo' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '429': { $ref: '#/components/responses/TooManyRequests' },
        },
      },
      get: {
        tags: ['todos'],
        summary: 'List todos',
        operationId: 'listTodos',
        parameters: [
          { $ref: '#/components/parameters/LimitParam' },
          { $ref: '#/components/parameters/OffsetParam' },
          { $ref: '#/components/parameters/DoneParam' },
        ],
        responses: {
          '200': {
            description: 'List of todos',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TodoList' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '429': { $ref: '#/components/responses/TooManyRequests' },
        },
      },
    },
    '/api/v1/todos/{id}': {
      get: {
        tags: ['todos'],
        summary: 'Get a todo by ID',
        operationId: 'getTodoById',
        parameters: [{ $ref: '#/components/parameters/IdParam' }],
        responses: {
          '200': {
            description: 'Todo found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Todo' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '404': { $ref: '#/components/responses/NotFound' },
          '429': { $ref: '#/components/responses/TooManyRequests' },
        },
      },
      put: {
        tags: ['todos'],
        summary: 'Update a todo',
        operationId: 'updateTodo',
        parameters: [{ $ref: '#/components/parameters/IdParam' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateTodoBody' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Todo updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Todo' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '404': { $ref: '#/components/responses/NotFound' },
          '429': { $ref: '#/components/responses/TooManyRequests' },
        },
      },
      delete: {
        tags: ['todos'],
        summary: 'Delete a todo',
        operationId: 'deleteTodo',
        parameters: [{ $ref: '#/components/parameters/IdParam' }],
        responses: {
          '204': { description: 'Todo deleted' },
          '400': { $ref: '#/components/responses/BadRequest' },
          '404': { $ref: '#/components/responses/NotFound' },
          '429': { $ref: '#/components/responses/TooManyRequests' },
        },
      },
    },
    '/api/v1/todos/{id}/finish': {
      patch: {
        tags: ['todos'],
        summary: 'Mark a todo as done',
        operationId: 'finishTodo',
        parameters: [{ $ref: '#/components/parameters/IdParam' }],
        responses: {
          '204': { description: 'Todo marked as done' },
          '400': { $ref: '#/components/responses/BadRequest' },
          '404': { $ref: '#/components/responses/NotFound' },
          '429': { $ref: '#/components/responses/TooManyRequests' },
        },
      },
    },
    '/health': {
      get: {
        tags: ['health'],
        summary: 'Health check',
        operationId: 'healthCheck',
        responses: {
          '200': {
            description: 'Service healthy',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HealthResponse' },
              },
            },
          },
          '503': {
            description: 'Database unavailable',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HealthResponse' },
              },
            },
          },
          '429': { $ref: '#/components/responses/TooManyRequests' },
        },
      },
    },
  },
  components: {
    parameters: {
      IdParam: {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
        description: 'Todo UUID',
      },
      LimitParam: {
        name: 'limit',
        in: 'query',
        schema: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
        description: 'Items per page',
      },
      OffsetParam: {
        name: 'offset',
        in: 'query',
        schema: { type: 'integer', minimum: 0, default: 0 },
        description: 'Items to skip',
      },
      DoneParam: {
        name: 'done',
        in: 'query',
        schema: { type: 'boolean', default: false },
        description: 'Filter by completion',
      },
    },
    schemas: {
      Todo: {
        type: 'object',
        required: ['id', 'name', 'createdAt', 'done'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', maxLength: 255 },
          createdAt: { type: 'string', format: 'date-time' },
          done: { type: 'boolean' },
        },
      },
      TodoList: { type: 'array', items: { $ref: '#/components/schemas/Todo' } },
      CreateTodoBody: {
        type: 'object',
        required: ['name'],
        additionalProperties: false,
        properties: { name: { type: 'string', minLength: 1, maxLength: 255 } },
      },
      UpdateTodoBody: {
        type: 'object',
        required: ['name'],
        additionalProperties: false,
        properties: { name: { type: 'string', minLength: 1, maxLength: 255 } },
      },
      HealthResponse: {
        type: 'object',
        required: ['status', 'database'],
        properties: {
          status: { type: 'string', enum: ['ok', 'error'] },
          database: { type: 'string', enum: ['up', 'down'] },
        },
      },
      ErrorResponse: {
        type: 'object',
        required: ['error', 'message'],
        properties: { error: { type: 'string' }, message: { type: 'string' } },
      },
      EmptyResponse: { type: 'object', description: 'No content (204)' },
    },
    responses: {
      BadRequest: {
        description: 'Bad Request - Validation error',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: {
              error: 'VALIDATION_ERROR',
              message: 'Invalid request body',
            },
          },
        },
      },
      NotFound: {
        description: 'Not Found',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: { error: 'NOT_FOUND', message: 'Todo not found' },
          },
        },
      },
      TooManyRequests: {
        description: 'Too Many Requests - Rate limit exceeded',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: {
              error: 'TOO_MANY_REQUESTS',
              message: 'Rate limit exceeded',
            },
          },
        },
      },
      InternalServerError: {
        description: 'Internal Server Error',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: {
              error: 'INTERNAL_ERROR',
              message: 'An unexpected error occurred',
            },
          },
        },
      },
    },
  },
  externalDocs: {
    description: 'Project repository',
    url: 'https://github.com/ranielsobrinho/todo-hexagonal',
  },
}

export type SwaggerOptions = typeof SWAGGER_OPTIONS

export async function registerSwagger(app: FastifyInstance): Promise<void> {
  const { default: swagger } = await import('@fastify/swagger')
  const { default: swaggerUI } = await import('@fastify/swagger-ui')

  await app.register(swagger, SWAGGER_OPTIONS as any)

  await app.register(swaggerUI, {
    routePrefix: '/swagger',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
    },
    staticCSP: true,
    transformStaticCSP: (header: string) => header,
  })
}

export { SWAGGER_OPTIONS }
