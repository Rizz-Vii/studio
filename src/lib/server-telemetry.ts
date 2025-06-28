"use server";

/**
 * Server-only telemetry implementation using OpenTelemetry.
 * This file should only be imported dynamically in server contexts.
 */

import type { TelemetryProvider } from "./telemetry";
import { Resource } from "@opentelemetry/resources";
// Define a more specific type for the dynamically imported OpenTelemetry module
// This helps with type checking inside the .then() block
type OpenTelemetryNodeSDKModule = typeof import("@opentelemetry/sdk-node");

/**
 * Create a server-side telemetry provider that integrates with OpenTelemetry.
 * This function should only be called in a server context.
 */
export async function createTelemetryProvider(): Promise<TelemetryProvider> {
  // In development or test, we can return a mock provider
  if (
    process.env.NODE_ENV !== "production" ||
    process.env.DISABLE_TELEMETRY === "true"
  ) {
    console.log("Using mock telemetry provider");
    return createMockProvider();
  }

  return createRealProvider();
}

/**
 * Creates a real OpenTelemetry provider for production use.
 * Only actually loads OpenTelemetry in production to avoid dev issues.
 * Uses dynamic imports to prevent build issues.
 */
function createRealProvider(): TelemetryProvider {
  let sdkInstance: OpenTelemetryNodeSDKModule | null = null;

  try {
    // Dynamically import all necessary OpenTelemetry modules
    import("@opentelemetry/sdk-node")
      .then(async (OpenTelemetry: OpenTelemetryNodeSDKModule) => {
        const { Resource } = await import("@opentelemetry/resources");
        const { SemanticResourceAttributes } = await import(
          "@opentelemetry/semantic-conventions"
        );
        const { getNodeAutoInstrumentations } = await import(
          "@opentelemetry/auto-instrumentations-node"
        );
        const { BatchSpanProcessor, AlwaysOnSampler } = await import(
          "@opentelemetry/sdk-trace-node"
        );
        const { OTLPTraceExporter } = await import(
          "@opentelemetry/exporter-trace-otlp-http"
        );

        // Configuration Variables
        const serviceName =
          process.env.OTEL_SERVICE_NAME || "my-nextjs-server-app";
        const otelCollectorEndpoint =
          process.env.OTEL_COLLECTOR_ENDPOINT ||
          "http://localhost:4318/v1/traces";
        const sampler = new AlwaysOnSampler();

        // Exporter Configuration
        const traceExporter = new OTLPTraceExporter({
          url: otelCollectorEndpoint,
        });

        // Span Processor Configuration
        const spanProcessor = new BatchSpanProcessor(traceExporter);

        // Instrumentations Configuration
        const instrumentations = getNodeAutoInstrumentations();

        // Create and Configure the Node.js SDK
        sdkInstance = new OpenTelemetry.NodeSDK({
          resource: new Resource({
            [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
            [SemanticResourceAttributes.SERVICE_VERSION]:
              process.env.npm_package_version || "unknown",
            [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]:
              process.env.NODE_ENV,
          }),
          sampler,
          spanProcessor,
          instrumentations,
        });

        // Start the SDK
        sdkInstance.start();
        console.log("OpenTelemetry SDK initialized and started in production.");

        // Graceful Shutdown Handling
        process.on("SIGTERM", () => {
          sdkInstance
            .shutdown()
            .then(() =>
              console.log("OpenTelemetry tracing shut down gracefully.")
            )
            .catch((error: Error) =>
              console.error("Error shutting down OpenTelemetry tracing:", error)
            )
            .finally(() => process.exit(0));
        });

        process.on("unhandledRejection", (reason, promise) => {
          console.error("Unhandled Rejection at:", promise, "reason:", reason);
        });

        process.on("uncaughtException", (error) => {
          console.error("Uncaught Exception:", error);
          process.exit(1);
        });
      })
      .catch((err) => {
        console.error(
          "Failed to dynamically import or initialize OpenTelemetry:",
          err
        );
        sdkInstance = createMockProvider();
        sdkInstance.start();
      });

    return {
      start: () => {
        console.log(
          "Telemetry provider requested to start (OpenTelemetry initialization is asynchronous)."
        );
      },
      shutdown: async () => {
        console.log("Shutting down telemetry provider.");
        if (sdkInstance) {
          try {
            await sdkInstance.shutdown();
            console.log(
              "OpenTelemetry SDK shut down successfully via provider."
            );
          } catch (err) {
            console.error(
              "Error shutting down OpenTelemetry SDK via provider:",
              err
            );
          }
        } else {
          console.log(
            "No OpenTelemetry SDK instance to shut down (possibly mock or failed init)."
          );
        }
      },
      isActive: true,
    };
  } catch (error) {
    console.error(
      "Synchronous error during initial OpenTelemetry setup attempt:",
      error
    );
    return createMockProvider();
  }
}

/**
 * Creates a mock telemetry provider that doesn't actually use OpenTelemetry.
 * Useful for development and testing.
 */
function createMockProvider(): TelemetryProvider {
  let active = false;

  return {
    start: () => {
      console.log("Starting mock telemetry provider");
      active = true;
    },
    shutdown: async () => {
      console.log("Shutting down mock telemetry provider");
      active = false;
      await Promise.resolve();
    },
    isActive: active,
  };
}
