import Fastify, { type FastifyInstance } from 'fastify'
import { httpErrorHandler } from './errors/httpErrorHandler.js'
import {
  apiRoutes,
  API_PREFIX,
  type ApiRoutesOptions,
} from './routes/apiRoutes.js'
import { healthRoutes } from './routes/healthRoutes.js'

export type HttpDependencies = ApiRoutesOptions

export function buildServer(deps: HttpDependencies): FastifyInstance {
  const app = Fastify({ logger: true })

  app.setErrorHandler(httpErrorHandler)
  app.register(apiRoutes, { prefix: API_PREFIX, ...deps })
  app.register(healthRoutes)

  return app
}
