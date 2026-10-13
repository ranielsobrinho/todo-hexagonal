import type { FastifyInstance } from 'fastify'
import type { TodoRepository } from '../../src/domain/repositories/ITodoRepository.js'
import { makeTodoControllers } from '../../src/interfaces/http/factories/controllers/makeTodoControllers.js'
import { buildServer } from '../../src/interfaces/http/server.js'

export function buildTestApp(repository: TodoRepository): FastifyInstance {
  return buildServer(makeTodoControllers(repository))
}
