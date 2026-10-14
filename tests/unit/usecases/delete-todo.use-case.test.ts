import { describe, expect, it } from 'vitest'
import { DeleteTodoUseCase } from '../../../src/usecases/todo/DeleteTodoUseCase.js'
import {
  asTodoRepository,
  createRepositoryMock,
} from '../../support/repository-mock.js'

describe('DeleteTodoUseCase', () => {
  it('delegates to repository.delete', async () => {
    const repository = createRepositoryMock()
    repository.delete.mockResolvedValue(undefined)
    const useCase = new DeleteTodoUseCase(asTodoRepository(repository))

    await expect(useCase.execute('id-1')).resolves.toBeUndefined()
    expect(repository.delete).toHaveBeenCalledWith('id-1')
  })
})
