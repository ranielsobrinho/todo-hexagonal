import { describe, expect, it } from 'vitest'
import { Todo } from '../../../src/domain/entities/Todo.js'
import { UpdateTodoUseCase } from '../../../src/usecases/todo/UpdateTodoUseCase.js'
import {
  asTodoRepository,
  createRepositoryMock,
} from '../../support/repository-mock.js'

describe('UpdateTodoUseCase', () => {
  it('throws VALIDATION_ERROR when the id is empty', async () => {
    const repository = createRepositoryMock()
    const useCase = new UpdateTodoUseCase(asTodoRepository(repository))

    await expect(
      useCase.execute({ id: '', name: 'buy milk' }),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' })
    expect(repository.update).not.toHaveBeenCalled()
  })

  it('throws VALIDATION_ERROR when the name is empty', async () => {
    const repository = createRepositoryMock()
    const useCase = new UpdateTodoUseCase(asTodoRepository(repository))

    await expect(
      useCase.execute({ id: 'id-1', name: '' }),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' })
    expect(repository.update).not.toHaveBeenCalled()
  })

  it('delegates to repository.update', async () => {
    const repository = createRepositoryMock()
    const todo = Todo.create({ id: 'id-1', name: 'renamed' })
    repository.update.mockResolvedValue(todo)
    const useCase = new UpdateTodoUseCase(asTodoRepository(repository))

    await expect(
      useCase.execute({ id: 'id-1', name: 'renamed' }),
    ).resolves.toBe(todo)
    expect(repository.update).toHaveBeenCalledWith('id-1', { name: 'renamed' })
  })
})
