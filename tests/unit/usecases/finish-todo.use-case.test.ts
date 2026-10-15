import { describe, expect, it } from 'vitest'
import { FinishTodoUseCase } from '../../../src/usecases/todo/FinishTodoUseCase.js'
import {
  asTodoRepository,
  createRepositoryMock,
} from '../../support/repository-mock.js'

describe('FinishTodoUseCase', () => {
  it('delegates to repository.finish', async () => {
    const repository = createRepositoryMock()
    repository.finish.mockResolvedValue(undefined)
    const useCase = new FinishTodoUseCase(asTodoRepository(repository))

    await expect(useCase.execute('id-1')).resolves.toBeUndefined()
    expect(repository.finish).toHaveBeenCalledWith('id-1')
  })
})
