import { Server } from '@grpc/grpc-js'
import { buildTodoService } from './routes/todoService.js'
import type { TodoServiceDependencies } from './routes/todoService.js'
import { TodoServiceService } from './generated/proto/todo.js'

export function buildGrpcServer(deps: TodoServiceDependencies): Server {
  const server = new Server()
  server.addService(TodoServiceService, buildTodoService(deps))
  return server
}

// Helper to bind gRPC server with proper address handling
export async function bindGrpcServer(
  server: Server,
  port: number,
  credentials: any,
): Promise<number> {
  return new Promise((resolve, reject) => {
    // Bind to IPv4 explicitly to avoid IPv6 issues
    server.bindAsync(`0.0.0.0:${port}`, credentials, (err, boundPort) => {
      if (err) {
        // If IPv4 fails, try IPv6
        if (
          err.message.includes('EADDRINUSE') ||
          err.message.includes('EADDRNOTAVAIL')
        ) {
          server.bindAsync(`[::]:${port}`, credentials, (err2, boundPort2) => {
            if (err2) reject(err2)
            else resolve(boundPort2)
          })
        } else {
          reject(err)
        }
      } else {
        resolve(boundPort)
      }
    })
  })
}
