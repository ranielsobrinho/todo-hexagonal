import { vi } from 'vitest'

export function createCallMock(request: unknown): never {
  return { request } as never
}

type AnyCallback = (...args: any[]) => void

export type CallbackMock = ReturnType<typeof vi.fn<AnyCallback>>

export function createCallbackMock(): CallbackMock {
  return vi.fn<AnyCallback>()
}

type StreamHandler = (request: unknown) => unknown

export type StreamCallMock = {
  on: ReturnType<typeof vi.fn>
  write: ReturnType<typeof vi.fn>
  end: ReturnType<typeof vi.fn>
  emitData: (request: unknown) => unknown
  emitEnd: () => unknown
}

export function createStreamCallMock(): StreamCallMock {
  const handlers: Record<string, StreamHandler> = {}

  return {
    on: vi.fn((event: string, handler: StreamHandler) => {
      handlers[event] = handler
    }),
    write: vi.fn(),
    end: vi.fn(),
    emitData: (request: unknown) => handlers.data?.(request),
    emitEnd: () => handlers.end?.({}),
  }
}
