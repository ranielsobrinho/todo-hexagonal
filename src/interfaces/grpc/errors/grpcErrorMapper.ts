import { status, type StatusObject } from '@grpc/grpc-js'
import { ApplicationError } from '../../../domain/errors/ApplicationError.js'

const STATUS_BY_CODE: Record<string, status> = {
  VALIDATION_ERROR: status.INVALID_ARGUMENT,
  NOT_FOUND: status.NOT_FOUND,
}

export function toGrpcError(error: unknown): Partial<StatusObject> {
  if (error instanceof ApplicationError) {
    return {
      code: STATUS_BY_CODE[error.code] ?? status.FAILED_PRECONDITION,
      details: error.message,
    }
  }

  return { code: status.INTERNAL, details: 'Internal Server Error' }
}
