import type { CreateTodoContract } from '../../../domain/contracts/todo/CreateTodoContract.js'
import { toGrpcError } from '../errors/grpcErrorMapper.js'
import type { FailedTodo, TodoServiceServer } from '../generated/proto/todo.js'

type TodosStream = Parameters<TodoServiceServer['createTodosStream']>[0]

export class CreateTodosStreamHandler {
  constructor(private readonly createTodoUseCase: CreateTodoContract) {}

  handle: TodoServiceServer['createTodosStream'] = (call) => {
    let pending: Promise<void> = Promise.resolve()

    call.on('data', (request) => {
      pending = pending.then(() => this.createOne(call, request.name))
    })

    call.on('end', async () => {
      await pending
      call.end()
    })
  }

  private async createOne(call: TodosStream, name: string): Promise<void> {
    try {
      await this.createTodoUseCase.execute({ name })
    } catch (error) {
      const { details } = toGrpcError(error)

      call.write({
        name,
        reason: details ?? 'Unknown error',
      } satisfies FailedTodo)
    }
  }
}
