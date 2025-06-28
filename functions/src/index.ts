import { initializeApp } from "firebase-admin/app";
import { onCall, HttpsOptions } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";

// Add logging to debug initialization issues
logger.info("Starting Firebase Functions initialization");

// Initialize Firebase Admin SDK
try {
  initializeApp();
  logger.info("Firebase Admin SDK initialized successfully");
} catch (error) {
  logger.error("Error initializing Firebase Admin SDK:", error);
  // Continue anyway - the error may be that it's already initialized
}

// Set options for better cold start performance
const httpsOptions: HttpsOptions = {
  timeoutSeconds: 60,
  memory: "256MiB",
  minInstances: 0,
};

// Health check function to confirm functions are working correctly
export const healthCheck = onCall(httpsOptions, async () => {
  logger.info("Health check function called");
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
    runtime: "Node.js v" + process.version,
  };
});

export * from "./api/keyword-suggestions";
export * from "./api/audit";
export * from "./api/analyze-content";
