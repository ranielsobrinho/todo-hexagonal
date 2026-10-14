import { vi } from 'vitest'
import type { TodoRepository } from '../../src/domain/repositories/ITodoRepository.js'

export type MockedTodoRepository = {
  save: ReturnType<typeof vi.fn>
  getById: ReturnType<typeof vi.fn>
  list: ReturnType<typeof vi.fn>
  update: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
  finish: ReturnType<typeof vi.fn>
}

export function createRepositoryMock(): MockedTodoRepository {
  return {
    save: vi.fn(),
    getById: vi.fn(),
    list: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    finish: vi.fn(),
  }
}

export function asTodoRepository(mock: MockedTodoRepository): TodoRepository {
  return mock as unknown as TodoRepository
}
