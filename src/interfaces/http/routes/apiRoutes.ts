import type { FastifyPluginAsync } from 'fastify'
import type { CreateTodoController } from '../../controllers/CreateTodoController.js'
import type { GetTodoByIdController } from '../../controllers/GetTodoByIdController.js'
import type { ListTodosController } from '../../controllers/ListTodosController.js'
import { todoRoutes } from './todoRoutes.js'
import type { FinishTodoController } from '../../controllers/FinishTodoController.js'
import type { DeleteTodoController } from '../../controllers/DeleteTodoController.js'
import type { UpdateTodoController } from '../../controllers/UpdateTodoController.js'

export const API_PREFIX = '/api/v1'

export type ApiRoutesOptions = {
  createTodoController: CreateTodoController
  getTodoByIdController: GetTodoByIdController
  listTodosController: ListTodosController
  finishTodoController: FinishTodoController
  deleteTodoController: DeleteTodoController
  updateTodoController: UpdateTodoController
}

export const apiRoutes: FastifyPluginAsync<ApiRoutesOptions> = async (
  app,
  deps,
) => {
  app.register(todoRoutes, {
    createTodoController: deps.createTodoController,
    getTodoByIdController: deps.getTodoByIdController,
    listTodosController: deps.listTodosController,
    finishTodoController: deps.finishTodoController,
    deleteTodoController: deps.deleteTodoController,
    updateTodoController: deps.updateTodoController,
  })
}
