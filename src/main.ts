import { ServerCredentials } from '@grpc/grpc-js'
import { env } from './infrastructure/config/env.js'
import { pool } from './infrastructure/database/pool.js'
import { makeTodoHandlers } from './interfaces/grpc/factories/makeTodoHandlers.js'
import { buildGrpcServer } from './interfaces/grpc/server.js'
import { makeTodoControllers } from './interfaces/http/factories/controllers/makeTodoControllers.js'
import { buildServer } from './interfaces/http/server.js'
import { readFileSync } from 'node:fs'

const app = await buildServer(makeTodoControllers())

const grpcCredentials = env.grpc.tls
  ? ServerCredentials.createSsl(
      null,
      [
        {
          private_key: readFileSync(env.grpc.tls.keyPath),
          cert_chain: readFileSync(env.grpc.tls.certPath),
        },
      ],
      false,
    )
  : ServerCredentials.createInsecure()

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

const grpcServer = buildGrpcServer(makeTodoHandlers())
grpcServer.bindAsync(
  `0.0.0.0:${env.grpc.port}`,
  grpcCredentials,
  (err, port) => {
    if (err) {
      app.log.error(err)
      process.exit(1)
    }

    app.log.info(`gRPC listening on ${port}`)
  },
)

const shutdown = async (signal: string): Promise<void> => {
  app.log.info(`received ${signal}, shutting down`)
  await app.close()
  await new Promise<void>((resolve) => grpcServer.tryShutdown(() => resolve()))
  await pool.end()
  process.exit(0)
}

process.on('SIGINT', () => void shutdown('SIGINT'))
process.on('SIGTERM', () => void shutdown('SIGTERM'))
