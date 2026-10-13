import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { ApplicationError } from '../../../domain/errors/ApplicationError.js'

const STATUS_BY_CODE: Record<string, number> = {
  VALIDATION_ERROR: 400,
  NOT_FOUND: 404,
}

export function httpErrorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply,
): void {
  if (error.validation) {
    reply.status(400).send({
      error: 'ValidationError',
      message: error.message,
    })
    return
  }

  if (error instanceof ApplicationError) {
    reply.status(STATUS_BY_CODE[error.code] ?? 422).send({
      error: error.code,
      message: error.message,
    })
    return
  }

  request.log.error({ err: error }, 'unhandled error')
  reply.status(500).send({
    error: 'InternalServerError',
    message: 'Internal Server Error',
  })
}
