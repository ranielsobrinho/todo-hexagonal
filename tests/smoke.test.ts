import { describe, expect, it } from 'vitest'
import { Todo } from '../src/domain/entities/Todo.js'

describe('smoke', () => {
  it('resolves .js specifiers to TypeScript sources', () => {
    expect(Todo).toBeDefined()
  })
})
