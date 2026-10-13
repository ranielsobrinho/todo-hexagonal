import type { ListTodosContract } from '../../../../domain/contracts/todo/ListTodosContract.js'
import { ListTodosController } from '../../../controllers/ListTodosController.js'

export function makeListTodosController(
  listTodosUseCase: ListTodosContract,
): ListTodosController {
  return new ListTodosController(listTodosUseCase)
}
