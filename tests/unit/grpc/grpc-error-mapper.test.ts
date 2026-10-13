import { status } from '@grpc/grpc-js'
import { describe, expect, it } from 'vitest'
import { ApplicationError } from '../../../src/domain/errors/ApplicationError.js'
import { toGrpcError } from '../../../src/interfaces/grpc/errors/grpcErrorMapper.js'

describe('toGrpcError', () => {
  it('maps a validation error to INVALID_ARGUMENT', () => {
    expect(
      toGrpcError(new ApplicationError('bad input', 'VALIDATION_ERROR')),
    ).toEqual({
      code: status.INVALID_ARGUMENT,
      details: 'bad input',
    })
  })

  it('maps a not found error to NOT_FOUND', () => {
    expect(toGrpcError(new ApplicationError('missing', 'NOT_FOUND'))).toEqual({
      code: status.NOT_FOUND,
      details: 'missing',
    })
  })

  it('maps any other application error to FAILED_PRECONDITION', () => {
    expect(toGrpcError(new ApplicationError('conflict', 'CONFLICT'))).toEqual({
      code: status.FAILED_PRECONDITION,
      details: 'conflict',
    })
  })

  it('maps unknown errors to INTERNAL', () => {
    expect(toGrpcError(new Error('boom'))).toEqual({
      code: status.INTERNAL,
      details: 'Internal Server Error',
    })
  })
})
