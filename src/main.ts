import { env } from './infrastructure/config/env.js'
import { pool } from './infrastructure/database/pool.js'
import { makeTodoControllers } from './interfaces/http/factories/controllers/makeTodoControllers.js'
import { buildServer } from './interfaces/http/server.js'

const app = buildServer(makeTodoControllers())

try {
  await pool.query('SELECT 1')
} catch (error) {
  app.log.error({ err: error }, 'failed to connect to the database')
  await pool.end()
  process.exit(1)
}

const port = env.port

try {
  await app.listen({ port, host: '0.0.0.0' })
} catch (error) {
  app.log.error(error)
  process.exit(1)
}

const shutdown = async (signal: string): Promise<void> => {
  app.log.info(`received ${signal}, shutting down`)
  await app.close()
  await pool.end()
  process.exit(0)
}

process.on('SIGINT', () => void shutdown('SIGINT'))
process.on('SIGTERM', () => void shutdown('SIGTERM'))
