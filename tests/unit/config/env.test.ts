import { describe, expect, it } from 'vitest'
import { loadEnv } from '../../../src/infrastructure/config/env.js'

const baseEnv = {
  PGHOST: 'localhost',
  PGPORT: '5432',
  PGUSER: 'todo',
  PGPASSWORD: 'secret',
  PGDATABASE: 'todo',
}

describe('loadEnv', () => {
  it('builds the config from the environment', () => {
    const env = loadEnv({
      ...baseEnv,
      PORT: '8080',
      PGPOOL_MAX: '20',
      PGSSL: 'true',
    })

    expect(env).toEqual({
      port: 8080,
      pg: {
        host: 'localhost',
        port: 5432,
        user: 'todo',
        password: 'secret',
        database: 'todo',
        poolMax: 20,
        ssl: { rejectUnauthorized: true },
      },
      grpc: { port: 50051, tls: undefined },
      otel: {
        tracesEndpoint: 'http://localhost:4317',
        logsEndpoint: 'http://localhost:4317',
        metricsPort: 9464,
      },
      nodeEnv: 'development',
    })
  })

  it('falls back to defaults when optional variables are absent', () => {
    const env = loadEnv({ ...baseEnv })

    expect(env.port).toBe(3000)
    expect(env.pg.port).toBe(5432)
    expect(env.pg.poolMax).toBe(10)
    expect(env.pg.ssl).toBeUndefined()
    expect(env.otel.metricsPort).toBe(9464)
    expect(env.otel.tracesEndpoint).toBe('http://localhost:4317')
    expect(env.nodeEnv).toBe('development')
  })

  it('throws when a required variable is missing', () => {
    expect(() => loadEnv({ ...baseEnv, PGHOST: '' })).toThrow(/PGHOST/)
  })

  it('falls back when a numeric variable is invalid', () => {
    const env = loadEnv({ ...baseEnv, PORT: 'not-a-number' })

    expect(env.port).toBe(3000)
  })
})
