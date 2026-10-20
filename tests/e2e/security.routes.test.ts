import type { FastifyInstance } from 'fastify'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { API_PREFIX } from '../../src/interfaces/http/routes/apiRoutes.js'
import { buildTestApp } from '../support/build-test-app.js'
import { FakeTodoRepository } from '../support/fake-todo-repository.js'

describe('security hardening', () => {
  describe('security headers', () => {
    let app: FastifyInstance

    beforeEach(async () => {
      app = await buildTestApp(new FakeTodoRepository())
      await app.ready()
    })

    afterEach(async () => {
      await app.close()
    })

    it('sets the helmet security headers', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `${API_PREFIX}/todos`,
      })

      expect(response.headers['x-content-type-options']).toBe('nosniff')
      expect(response.headers['x-frame-options']).toBe('SAMEORIGIN')
      expect(response.headers['strict-transport-security']).toBeDefined()
      expect(response.headers['content-security-policy']).toBeDefined()
    })
  })

  describe('rate limiting', () => {
    let app: FastifyInstance

    beforeEach(async () => {
      app = await buildTestApp(new FakeTodoRepository(), {
        rateLimit: { max: 2, timeWindow: '1 minute' },
      })
      await app.ready()
    })

    afterEach(async () => {
      await app.close()
    })

    it('responds 429 once the limit is exceeded', async () => {
      const request = { method: 'GET' as const, url: `${API_PREFIX}/todos` }

      const first = await app.inject(request)
      const second = await app.inject(request)
      const third = await app.inject(request)

      expect(first.statusCode).toBe(200)
      expect(second.statusCode).toBe(200)
      expect(third.statusCode).toBe(429)
    })
  })
})
