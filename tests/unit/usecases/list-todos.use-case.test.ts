import { describe, expect, it } from 'vitest'
import { Todo } from '../../../src/domain/entities/Todo.js'
import { ListTodosUseCase } from '../../../src/usecases/todo/ListTodosUseCase.js'
import {
  asTodoRepository,
  createRepositoryMock,
} from '../../support/repository-mock.js'

describe('ListTodosUseCase', () => {
  it('delegates to repository.list', async () => {
    const repository = createRepositoryMock()
    const todos = [Todo.create({ id: 'id-1', name: 'buy milk' })]
    repository.list.mockResolvedValue(todos)
    const useCase = new ListTodosUseCase(asTodoRepository(repository))

    await expect(useCase.execute({ limit: 10, offset: 5 })).resolves.toBe(todos)
    expect(repository.list).toHaveBeenCalledWith({ limit: 10, offset: 5 })
  })
})
