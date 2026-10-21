import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import Fastify, { type FastifyInstance } from 'fastify'
import { httpErrorHandler } from './errors/httpErrorHandler.js'
import {
  apiRoutes,
  API_PREFIX,
  type ApiRoutesOptions,
} from './routes/apiRoutes.js'
import { healthRoutes } from './routes/healthRoutes.js'
import { registerSwagger } from './swagger.js'

export type HttpDependencies = ApiRoutesOptions

export type ServerConfig = {
  logger?: boolean
  rateLimit?: {
    max?: number
    timeWindow?: number | string
  }
}

const BODY_LIMIT_BYTES = 100 * 1024
const CONNECTION_TIMEOUT_MS = 10_000
const KEEP_ALIVE_TIMEOUT_MS = 72_000
const REQUEST_TIMEOUT_MS = 15_000
const DEFAULT_RATE_LIMIT_MAX = 100
const DEFAULT_RATE_LIMIT_WINDOW = '1 minute'

export async function buildServer(
  deps: HttpDependencies,
  config: ServerConfig = {},
): Promise<FastifyInstance> {
  const app = Fastify({
    logger: config.logger ?? true,
    bodyLimit: BODY_LIMIT_BYTES,
    connectionTimeout: CONNECTION_TIMEOUT_MS,
    keepAliveTimeout: KEEP_ALIVE_TIMEOUT_MS,
    requestTimeout: REQUEST_TIMEOUT_MS,
  })

  app.setErrorHandler(httpErrorHandler)
  app.register(helmet, { global: true })
  app.register(rateLimit, {
    max: config.rateLimit?.max ?? DEFAULT_RATE_LIMIT_MAX,
    timeWindow: config.rateLimit?.timeWindow ?? DEFAULT_RATE_LIMIT_WINDOW,
  })

  await registerSwagger(app)

  app.register(apiRoutes, { prefix: API_PREFIX, ...deps })
  app.register(healthRoutes)

  return app
}
