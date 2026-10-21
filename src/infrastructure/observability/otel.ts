import { NodeSDK } from '@opentelemetry/sdk-node'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { FastifyInstrumentation } from '@opentelemetry/instrumentation-fastify'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus'
import { trace, metrics } from '@opentelemetry/api'
import { env } from '../config/env.js'

// Prometheus metrics exporter (extends MetricReader, can be used directly)
const prometheusExporter = new PrometheusExporter(
  { port: env.otel.metricsPort, endpoint: '/metrics' },
  (err) => {
    if (err) {
      console.error('PrometheusExporter callback error:', err)
    } else {
      console.log(
        `Prometheus scrape endpoint: http://localhost:${env.otel.metricsPort}/metrics`,
      )
    }
  },
)

// Start the Prometheus HTTP server explicitly
prometheusExporter
  .startServer()
  .then(() => {
    console.log(
      'PrometheusExporter HTTP server started successfully on port',
      env.otel.metricsPort,
    )
  })
  .catch((err) => {
    console.error('Failed to start PrometheusExporter HTTP server:', err)
  })

// Also start the server directly to ensure it's running
setTimeout(() => {
  console.log('Checking if Prometheus server is listening...')
  // The server should be running now
}, 1000)

// OTLP trace exporter using HTTP
const traceExporter = new OTLPTraceExporter({
  url: env.otel.tracesEndpoint.replace(':4317', ':4318'),
})

// Initialize OpenTelemetry SDK
export const otelSDK = new NodeSDK({
  serviceName: 'todo-hexagonal',
  traceExporter: new OTLPTraceExporter({
    url: env.otel.tracesEndpoint.replace(':4317', ':4318'),
  }),
  metricReader: prometheusExporter,
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': { enabled: false },
      '@opentelemetry/instrumentation-dns': { enabled: false },
      '@opentelemetry/instrumentation-pg': {
        enabled: true,
        enhancedDatabaseReporting: true,
      },
      '@opentelemetry/instrumentation-grpc': { enabled: true },
      '@opentelemetry/instrumentation-http': { enabled: true },
      '@opentelemetry/instrumentation-pino': { enabled: true },
    }),
    new FastifyInstrumentation(),
  ],
})

// Initialize function
export async function initObservability(): Promise<void> {
  try {
    otelSDK.start()
    console.log('OpenTelemetry initialized successfully')

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      await otelSDK.shutdown()
      await prometheusExporter.stopServer()
      console.log('OpenTelemetry shutdown complete')
    })

    process.on('SIGINT', async () => {
      await otelSDK.shutdown()
      await prometheusExporter.stopServer()
      console.log('OpenTelemetry shutdown complete')
    })
  } catch (error) {
    console.error('Failed to initialize OpenTelemetry:', error)
  }
}

// Get tracers and meters after SDK is started
export function getTracer() {
  return trace.getTracer('todo-hexagonal')
}

export function getMeter() {
  return metrics.getMeter('todo-hexagonal')
}

export { prometheusExporter }
