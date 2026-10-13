import type { FastifyPluginAsync } from 'fastify'
import type { CreateTodoController } from '../../controllers/CreateTodoController.js'
import type { GetTodoByIdController } from '../../controllers/GetTodoByIdController.js'
import type { ListTodosController } from '../../controllers/ListTodosController.js'

export type TodoRoutesOptions = {
  createTodoController: CreateTodoController
  getTodoByIdController: GetTodoByIdController
  listTodosController: ListTodosController
}

const createTodoBodySchema = {
  type: 'object',
  required: ['name'],
  additionalProperties: false,
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 255 },
  },
} as const

const getTodoByIdParamsSchema = {
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: {
    id: { type: 'string', format: 'uuid' },
  },
} as const

const listTodosQuerySchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
    offset: { type: 'integer', minimum: 0, default: 0 },
  },
} as const

const todoResponseSchema = {
  type: 'object',
  required: ['id', 'name', 'createdAt', 'done'],
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    createdAt: { type: 'string' },
    done: { type: 'boolean' },
  },
} as const

const todoListResponseSchema = {
  type: 'array',
  items: todoResponseSchema,
} as const

const createTodoRateLimit = { max: 20, timeWindow: '1 minute' } as const

export const todoRoutes: FastifyPluginAsync<TodoRoutesOptions> = async (
  app,
  { createTodoController, getTodoByIdController, listTodosController },
) => {
  app.post(
    '/todos',
    {
      config: { rateLimit: createTodoRateLimit },
      schema: {
        body: createTodoBodySchema,
        response: { 201: todoResponseSchema },
      },
    },
    createTodoController.handle,
  )
  app.get(
    '/todos',
    {
      schema: {
        querystring: listTodosQuerySchema,
        response: { 200: todoListResponseSchema },
      },
    },
    listTodosController.handle,
  )
  app.get(
    '/todos/:id',
    {
      schema: {
        params: getTodoByIdParamsSchema,
        response: { 200: todoResponseSchema },
      },
    },
    getTodoByIdController.handle,
  )
}
