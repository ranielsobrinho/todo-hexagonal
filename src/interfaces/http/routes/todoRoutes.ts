import type { FastifyPluginAsync } from 'fastify'
import type { CreateTodoController } from '../../controllers/CreateTodoController.js'
import type { GetTodoByIdController } from '../../controllers/GetTodoByIdController.js'
import type { ListTodosController } from '../../controllers/ListTodosController.js'
import type { DeleteTodoController } from '../../controllers/DeleteTodoController.js'
import type { FinishTodoController } from '../../controllers/FinishTodoController.js'
import type { UpdateTodoController } from '../../controllers/UpdateTodoController.js'

export type TodoRoutesOptions = {
  createTodoController: CreateTodoController
  getTodoByIdController: GetTodoByIdController
  listTodosController: ListTodosController
  deleteTodoController: DeleteTodoController
  finishTodoController: FinishTodoController
  updateTodoController: UpdateTodoController
}

const createTodoBodySchema = {
  type: 'object',
  required: ['name'],
  additionalProperties: false,
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 255 },
  },
} as const

const updateTodoBodySchema = {
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
    done: { type: 'boolean', default: false },
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

const emptyResponseSchema = {
  type: 'null',
} as const

const createTodoRateLimit = { max: 20, timeWindow: '1 minute' } as const
const updateTodoRateLimit = { max: 40, timeWindow: '1 minute' } as const
const finishTodoRateLimit = { max: 40, timeWindow: '1 minute' } as const
const deleteTodoRateLimit = { max: 20, timeWindow: '1 minute' } as const

export const todoRoutes: FastifyPluginAsync<TodoRoutesOptions> = async (
  app,
  {
    createTodoController,
    getTodoByIdController,
    listTodosController,
    deleteTodoController,
    updateTodoController,
    finishTodoController,
  },
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
  app.delete(
    '/todos/:id',
    {
      config: { rateLimit: deleteTodoRateLimit },
      schema: {
        params: getTodoByIdParamsSchema,
        response: { 204: emptyResponseSchema },
      },
    },
    deleteTodoController.handle,
  )
  app.put(
    '/todos/:id',
    {
      config: { rateLimit: updateTodoRateLimit },
      schema: {
        params: getTodoByIdParamsSchema,
        body: updateTodoBodySchema,
        response: { 200: todoResponseSchema },
      },
    },
    updateTodoController.handle,
  )
  app.patch(
    '/todos/:id/finish',
    {
      config: { rateLimit: finishTodoRateLimit },
      schema: {
        params: getTodoByIdParamsSchema,
        response: { 204: emptyResponseSchema },
      },
    },
    finishTodoController.handle,
  )
}
