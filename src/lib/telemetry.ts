"use client";

/**
 * Telemetry utility that can be safely imported in both server and client components.
 * This utility disables OpenTelemetry in the browser and provides a consistent API
 * for both environments.
 */

export type TelemetryProvider = {
  start: () => void;
  shutdown: () => Promise<void>;
  isActive: boolean;
};

// Safe no-op implementation for client components
const noopProvider: TelemetryProvider = {
  start: () => {},
  shutdown: async () => {},
  isActive: false,
};

// Singleton instance accessible across the application
let telemetryInstance: TelemetryProvider = noopProvider;

/**
 * Get the telemetry provider singleton.
 * In the browser, this always returns the no-op implementation.
 */
export function getTelemetryProvider(): TelemetryProvider {
  return telemetryInstance;
}

/**
 * Safe way to initialize telemetry.
 * This is a no-op in the browser and only loads modules in server context.
 */
export async function initTelemetry(): Promise<TelemetryProvider> {
  // We're in the browser, return the no-op provider
  if (typeof window !== "undefined") {
    return noopProvider;
  }

  // Only continue in a server context
  // Uses dynamic import to prevent bundling issues
  try {
    // Always disable telemetry during development to avoid build issues
    if (
      process.env.NODE_ENV !== "production" ||
      process.env.DISABLE_TELEMETRY === "true"
    ) {
      console.log("Telemetry disabled in non-production mode");
      return noopProvider;
    }

    // Safely attempt to load the server telemetry module
    try {
      // This will only execute in a server context in production
      const serverTelemetry = await import("./server-telemetry");
      if (
        serverTelemetry &&
        typeof serverTelemetry.createTelemetryProvider === "function"
      ) {
        telemetryInstance = serverTelemetry.createTelemetryProvider();
        return telemetryInstance;
      }
    } catch (importError) {
      console.warn(
        "Unable to import server telemetry module, falling back to no-op provider:",
        importError
      );
    }

    return noopProvider;
  } catch (error) {
    console.error("Failed to initialize telemetry:", error);
    return noopProvider;
  }
}

/**
 * Custom span for measuring performance.
 * Safe to use in both client and server code.
 */
export function createSpan(name: string, fn: () => any): any {
  // In the browser, just execute the function
  if (typeof window !== "undefined") {
    return fn();
  }

  // In server, we'll try to use OpenTelemetry if available
  try {
    const startTime = performance.now();
    const result = fn();
    const duration = performance.now() - startTime;

    // Log span information in development
    if (process.env.NODE_ENV === "development") {
      console.log(`Span: ${name}, duration: ${duration.toFixed(2)}ms`);
    }

    return result;
  } catch (error) {
    console.error(`Error in span ${name}:`, error);
    throw error;
  }
}
