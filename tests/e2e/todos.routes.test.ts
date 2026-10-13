import { randomUUID } from 'node:crypto'
import type { FastifyInstance } from 'fastify'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { API_PREFIX } from '../../src/interfaces/http/routes/apiRoutes.js'
import { buildTestApp } from '../support/build-test-app.js'
import { FakeTodoRepository } from '../support/fake-todo-repository.js'

describe('todos routes', () => {
  let app: FastifyInstance

  beforeEach(async () => {
    app = buildTestApp(new FakeTodoRepository())
    await app.ready()
  })

  afterEach(async () => {
    await app.close()
  })

  it('POST /todos creates a todo', async () => {
    const response = await app.inject({
      method: 'POST',
      url: `${API_PREFIX}/todos`,
      payload: { name: 'buy milk' },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject({
      name: 'buy milk',
      done: false,
    })
    expect(response.json().id).toEqual(expect.any(String))
  })

  it('POST /todos returns 400 when name is missing', async () => {
    const response = await app.inject({
      method: 'POST',
      url: `${API_PREFIX}/todos`,
      payload: {},
    })

    expect(response.statusCode).toBe(400)
  })

  it('GET /todos/:id returns the created todo', async () => {
    const created = await app.inject({
      method: 'POST',
      url: `${API_PREFIX}/todos`,
      payload: { name: 'buy milk' },
    })
    const { id } = created.json()

    const response = await app.inject({
      method: 'GET',
      url: `${API_PREFIX}/todos/${id}`,
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toMatchObject({ id, name: 'buy milk', done: false })
  })

  it('GET /todos/:id returns 404 for an unknown id', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `${API_PREFIX}/todos/${randomUUID()}`,
    })

    expect(response.statusCode).toBe(404)
  })

  it('GET /todos lists todos', async () => {
    await app.inject({
      method: 'POST',
      url: `${API_PREFIX}/todos`,
      payload: { name: 'first' },
    })
    await app.inject({
      method: 'POST',
      url: `${API_PREFIX}/todos`,
      payload: { name: 'second' },
    })

    const response = await app.inject({
      method: 'GET',
      url: `${API_PREFIX}/todos`,
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body).toHaveLength(2)
  })

  it('is not served without the version prefix', async () => {
    const response = await app.inject({ method: 'GET', url: '/todos' })
    expect(response.statusCode).toBe(404)
  })
})
