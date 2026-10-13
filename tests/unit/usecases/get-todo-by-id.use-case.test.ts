import { describe, expect, it } from 'vitest'
import { Todo } from '../../../src/domain/entities/Todo.js'
import { ApplicationError } from '../../../src/domain/errors/ApplicationError.js'
import { GetTodoByIdUseCase } from '../../../src/usecases/todo/GetTodoByIdUseCase.js'
import {
  asTodoRepository,
  createRepositoryMock,
} from '../../support/repository-mock.js'

describe('GetTodoByIdUseCase', () => {
  it('throws synchronously when the id is empty', () => {
    const repository = createRepositoryMock()
    const useCase = new GetTodoByIdUseCase(asTodoRepository(repository))

    expect(() => useCase.execute({ id: '' })).toThrow(ApplicationError)
    expect(repository.getById).not.toHaveBeenCalled()
  })

  it('delegates to repository.getById', async () => {
    const repository = createRepositoryMock()
    const todo = Todo.create({ id: 'id-1', name: 'buy milk' })
    repository.getById.mockResolvedValue(todo)
    const useCase = new GetTodoByIdUseCase(asTodoRepository(repository))

    await expect(useCase.execute({ id: 'id-1' })).resolves.toBe(todo)
    expect(repository.getById).toHaveBeenCalledWith('id-1')
  })
})
