import { vi } from 'vitest'

export function createCallMock(request: unknown): never {
  return { request } as never
}

type AnyCallback = (...args: any[]) => void

export type CallbackMock = ReturnType<typeof vi.fn<AnyCallback>>

export function createCallbackMock(): CallbackMock {
  return vi.fn<AnyCallback>()
}
