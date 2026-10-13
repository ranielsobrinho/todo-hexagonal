import { describe, expect, it } from 'vitest'
import { ApplicationError } from '../../../src/domain/errors/ApplicationError.js'
import { Todo } from '../../../src/domain/entities/Todo.js'
import { CreateTodoUseCase } from '../../../src/usecases/todo/CreateTodoUseCase.js'
import {
  asTodoRepository,
  createRepositoryMock,
} from '../../support/repository-mock.js'

describe('CreateTodoUseCase', () => {
  it('throws VALIDATION_ERROR when the name is empty', async () => {
    const repository = createRepositoryMock()
    const useCase = new CreateTodoUseCase(asTodoRepository(repository))

    await expect(useCase.execute({ name: '' })).rejects.toMatchObject({
      name: 'ApplicationError',
      code: 'VALIDATION_ERROR',
    })
    expect(repository.save).not.toHaveBeenCalled()
  })

  it('delegates to repository.save with done=false', async () => {
    const repository = createRepositoryMock()
    const todo = Todo.create({ id: 'id-1', name: 'buy milk' })
    repository.save.mockResolvedValue(todo)
    const useCase = new CreateTodoUseCase(asTodoRepository(repository))

    await expect(useCase.execute({ name: 'buy milk' })).resolves.toBe(todo)
    expect(repository.save).toHaveBeenCalledWith({
      name: 'buy milk',
      done: false,
    })
  })
})
