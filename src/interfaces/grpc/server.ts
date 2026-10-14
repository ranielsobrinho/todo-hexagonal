import { Server } from '@grpc/grpc-js'
import { buildTodoService } from './routes/todoService.js'
import type { TodoServiceDependencies } from './routes/todoService.js'
import { TodoServiceService } from './generated/proto/todo.js'

export function buildGrpcServer(deps: TodoServiceDependencies): Server {
  const server = new Server()
  server.addService(TodoServiceService, buildTodoService(deps))
  return server
}
