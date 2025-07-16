import { ErrorReporting } from "@google-cloud/error-reporting";
import { logger } from "firebase-functions";

// Initialize Error Reporting
const errors = new ErrorReporting({
  reportMode: "always",
  serviceContext: {
    service: "rankpilot",
    version: process.env.npm_package_version || "unknown",
  },
});

export interface ErrorDetails {
  code?: string;
  message: string;
  stack?: string;
  context?: Record<string, any>;
}

interface ErrorContext {
  user?: string;
  httpRequest?: {
    method?: string;
    url?: string;
    userAgent?: string;
    referrer?: string;
    responseStatusCode?: number;
    remoteIp?: string;
  };
  [key: string]: any;
}

export function logError(error: Error | ErrorDetails, context?: ErrorContext) {
  // Log to Firebase Functions logger
  logger.error("Error occurred:", {
    error:
      error instanceof Error
        ? {
            message: error.message,
            stack: error.stack,
            ...context,
          }
        : error,
    context,
  });

  // Report to Error Reporting
  if (error instanceof Error) {
    errors.report(error);
  } else {
    const errorInstance = new Error(error.message);
    if (error.stack) {
      errorInstance.stack = error.stack;
    }
    errors.report(errorInstance);
  }
}

export function wrapAsync<T>(fn: (...args: any[]) => Promise<T>) {
  return async (...args: any[]): Promise<T> => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(
        error instanceof Error ? error : { message: "Unknown error occurred" }
      );
      throw error;
    }
  };
}

// Example usage:
// export const myFunction = functions.https.onRequest(wrapAsync(async (req, res) => {
//   // Your function logic here
// }));
