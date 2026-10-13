import type { CreateTodoHandler } from '../controllers/CreateTodoHandler.js'
import type { TodoServiceServer } from '../generated/proto/todo.js'
import type { GetTodoByIdHandler } from '../controllers/GetTodoByIdHandler.js'
import type { ListTodosHandler } from '../controllers/ListTodosHandler.js'

export type TodoServiceDependencies = {
  createTodoHandler: CreateTodoHandler
  getTodoByIdHandler: GetTodoByIdHandler
  listTodosHandler: ListTodosHandler
}

export function buildTodoService(
  deps: TodoServiceDependencies,
): TodoServiceServer {
  return {
    createTodo: deps.createTodoHandler.handle,
    getTodoById: deps.getTodoByIdHandler.handle,
    listTodos: deps.listTodosHandler.handle,
  }
}
