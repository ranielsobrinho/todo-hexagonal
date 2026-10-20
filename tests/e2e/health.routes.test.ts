import { beforeEach, describe, expect, it, vi } from 'vitest'

const { query } = vi.hoisted(() => ({ query: vi.fn() }))

vi.mock('../../src/infrastructure/database/pool.js', () => ({
  pool: { query },
}))

import { buildTestApp } from '../support/build-test-app.js'
import { FakeTodoRepository } from '../support/fake-todo-repository.js'

describe('GET /health', () => {
  beforeEach(() => {
    query.mockReset()
  })

  it('returns 200 when the database responds', async () => {
    query.mockResolvedValue({ rows: [{ '?column?': 1 }] })
    const app = await buildTestApp(new FakeTodoRepository())

    const response = await app.inject({ method: 'GET', url: '/health' })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ status: 'ok', database: 'up' })
    await app.close()
  })

  it('returns 503 when the database fails', async () => {
    query.mockRejectedValue(new Error('connection refused'))
    const app = await buildTestApp(new FakeTodoRepository())

    const response = await app.inject({ method: 'GET', url: '/health' })

    expect(response.statusCode).toBe(503)
    expect(response.json()).toEqual({ status: 'error', database: 'down' })
    await app.close()
  })
})
