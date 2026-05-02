import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { processDetector, resourceFromAttributes } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { env } from './env';

export const sdk = new NodeSDK({
  instrumentations: [new HttpInstrumentation()],
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: env.SERVICE_NAME,
    [ATTR_SERVICE_VERSION]: '1.0',
  }),
  resourceDetectors: [processDetector],
  traceExporter: new ConsoleSpanExporter(),
});
