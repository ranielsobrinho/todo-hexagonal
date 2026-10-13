import { describe, expect, it, vi } from 'vitest'
import type { Pool } from 'pg'
import { ApplicationError } from '../../../src/domain/errors/ApplicationError.js'
import { PgTodoRepository } from '../../../src/infrastructure/repositories/TodoRepository.js'

type QueryMock = ReturnType<typeof vi.fn>

function createPoolMock(): { query: QueryMock; pool: Pool } {
  const query = vi.fn()
  return { query, pool: { query } as unknown as Pool }
}

describe('PgTodoRepository', () => {
  it('save inserts and maps the returned row', async () => {
    const { query, pool } = createPoolMock()
    const createdAt = new Date('2026-01-01T00:00:00.000Z')
    query.mockResolvedValue({
      rows: [
        { id: 'id-1', name: 'buy milk', created_at: createdAt, done: false },
      ],
    })
    const repository = new PgTodoRepository(pool)

    const todo = await repository.save({ name: 'buy milk', done: false })

    expect(query).toHaveBeenCalledOnce()
    expect(query.mock.calls[0][0]).toContain('INSERT INTO todos')
    expect(query.mock.calls[0][1]).toEqual([
      'buy milk',
      expect.any(Date),
      false,
    ])
    expect(todo).toMatchObject({
      id: 'id-1',
      name: 'buy milk',
      createdAt,
      done: false,
    })
  })

  it('getById returns the mapped row', async () => {
    const { query, pool } = createPoolMock()
    const createdAt = new Date('2026-01-01T00:00:00.000Z')
    query.mockResolvedValue({
      rows: [
        { id: 'id-1', name: 'buy milk', created_at: createdAt, done: true },
      ],
    })
    const repository = new PgTodoRepository(pool)

    const todo = await repository.getById('id-1')

    expect(query.mock.calls[0][0]).toContain('WHERE id = $1')
    expect(query.mock.calls[0][1]).toEqual(['id-1'])
    expect(todo).toMatchObject({ id: 'id-1', done: true })
  })

  it('getById throws NOT_FOUND when there is no row', async () => {
    const { query, pool } = createPoolMock()
    query.mockResolvedValue({ rows: [] })
    const repository = new PgTodoRepository(pool)

    await expect(repository.getById('missing')).rejects.toBeInstanceOf(
      ApplicationError,
    )
    await expect(repository.getById('missing')).rejects.toMatchObject({
      code: 'NOT_FOUND',
    })
  })

  it('list maps every row', async () => {
    const { query, pool } = createPoolMock()
    const createdAt = new Date('2026-01-01T00:00:00.000Z')
    query.mockResolvedValue({
      rows: [
        { id: 'id-1', name: 'a', created_at: createdAt, done: false },
        { id: 'id-2', name: 'b', created_at: createdAt, done: true },
      ],
    })
    const repository = new PgTodoRepository(pool)

    const todos = await repository.list()

    expect(query.mock.calls[0][0]).toContain('ORDER BY created_at DESC')
    expect(todos).toHaveLength(2)
    expect(todos[0]).toMatchObject({ id: 'id-1' })
    expect(todos[1]).toMatchObject({ id: 'id-2' })
  })
})
