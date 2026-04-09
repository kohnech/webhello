import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

export const setupTelemetry = () => {
  const resource = resourceFromAttributes({
    [SemanticResourceAttributes.SERVICE_NAME]: 'react-app',
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
  });

  // Create and configure OTLP exporter
  const otlpExporter = new OTLPTraceExporter({
    url: 'http://localhost:4319/v1/traces',
    headers: {
      'Origin': 'http://localhost:3000',
      'Access-Control-Request-Headers': 'Content-Type'
    }
  });
  
  // TEMPORARY: Console exporter to bypass CORS
  const consoleExporter = {
    export: (spans, resultCallback) => {
      console.log('Exporting spans:', spans);
      resultCallback({ code: 0 });
    },
    shutdown: () => Promise.resolve()
  };
  
  // Use BatchSpanProcessor for better performance
  const spanProcessor = new BatchSpanProcessor(otlpExporter);

  const provider = new WebTracerProvider({ 
    resource,
    spanProcessors: [spanProcessor]
  });
  
  // Register the provider
  provider.register({
    contextManager: new ZoneContextManager(),
  });

  // Register instrumentations
  registerInstrumentations({
    instrumentations: [
      new DocumentLoadInstrumentation(),
      new FetchInstrumentation({
        // Ignore certain URLs from being instrumented
        ignoreUrls: [/localhost:8090\/sockjs-node/],
        // Add custom headers to your outgoing requests
        propagateTraceHeaderCorsUrls: [
          /.+/g, // Propagate to all URLs, for demo purposes
        ],
      }),
    ],
  });

  console.log('OpenTelemetry initialized successfully');
  
  // Create a test trace to verify connection
  const tracer = provider.getTracer('test-tracer');
  const span = tracer.startSpan('test-span');
  span.setAttributes({
    'test.attribute': 'test-value'
  });
  span.end();
  console.log('Test trace sent');
};