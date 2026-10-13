export type PgConfig = {
  host: string
  port: number
  user: string
  password: string
  database: string
  poolMax: number
  ssl: { rejectUnauthorized: boolean } | undefined
}

export type AppEnv = {
  port: number
  pg: PgConfig
  grpc: GrpcConfig
}

export type GrpcConfig = {
  port: number
  tls: { certPath: string; keyPath: string } | undefined
}

function required(source: NodeJS.ProcessEnv, name: string): string {
  const value = source[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

function toPositiveNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export function loadEnv(source: NodeJS.ProcessEnv = process.env): AppEnv {
  const certPath = source.GRPC_TLS_CERT
  const keyPath = source.GRPC_TLS_KEY

  return {
    port: toPositiveNumber(source.PORT, 3000),
    pg: {
      host: required(source, 'PGHOST'),
      port: toPositiveNumber(source.PGPORT, 5432),
      user: required(source, 'PGUSER'),
      password: required(source, 'PGPASSWORD'),
      database: required(source, 'PGDATABASE'),
      poolMax: toPositiveNumber(source.PGPOOL_MAX, 10),
      ssl: source.PGSSL === 'true' ? { rejectUnauthorized: true } : undefined,
    },
    grpc: {
      port: toPositiveNumber(source.GRPC_PORT, 50051),
      tls: certPath && keyPath ? { certPath, keyPath } : undefined,
    },
  }
}

export const env = loadEnv()
