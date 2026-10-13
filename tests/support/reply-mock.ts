import { vi } from 'vitest'
import type { FastifyReply } from 'fastify'

export type ReplyMock = FastifyReply & {
  status: ReturnType<typeof vi.fn>
  send: ReturnType<typeof vi.fn>
}

export function createReplyMock(): ReplyMock {
  const reply = {
    status: vi.fn(),
    send: vi.fn(),
  }
  reply.status.mockReturnValue(reply)
  reply.send.mockResolvedValue(reply)
  return reply as unknown as ReplyMock
}
