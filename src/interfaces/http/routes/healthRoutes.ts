import type { FastifyPluginAsync } from 'fastify'
import { pool } from '../../../infrastructure/database/pool.js'

const healthResponseSchema = {
  type: 'object',
  required: ['status', 'database'],
  properties: {
    status: { type: 'string' },
    database: { type: 'string' },
  },
} as const

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    '/health',
    {
      schema: {
        response: { 200: healthResponseSchema, 503: healthResponseSchema },
      },
    },
    async (_request, reply) => {
      try {
        await pool.query('SELECT 1')
        await reply.status(200).send({ status: 'ok', database: 'up' })
      } catch {
        await reply.status(503).send({ status: 'error', database: 'down' })
      }
    },
  )
}
