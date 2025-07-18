import { initializeApp } from "firebase-admin/app";
import { onCall, HttpsOptions } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";

// Initialize Firebase Admin SDK first
initializeApp();
logger.info("Firebase Admin SDK initialized successfully");

// Set options for better cold start performance
const httpsOptions: HttpsOptions = {
  timeoutSeconds: 60,
  memory: "256MiB",
  minInstances: 0,
  region: "australia-southeast2", // Explicitly set region for consistency
};

// Global error handler for unhandled promises
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Health check function to confirm functions are working correctly
export const healthCheck = onCall(httpsOptions, async (request) => {
  try {
    logger.info("Health check function called", {
      auth: request.auth ? "authenticated" : "unauthenticated",
      timestamp: new Date().toISOString(),
    });

    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      runtime: "Node.js v" + process.version,
      region: httpsOptions.region,
    };
  } catch (error) {
    logger.error("Health check function failed:", error);
    throw new Error("Health check failed");
  }
});

// Export AI-powered functions
// Temporarily disabled for deployment testing
// export * from "./api/keyword-suggestions";
// export * from "./api/audit";
// export * from "./api/analyze-content";

// Export Stripe payment functions
export * from "./stripe";

// Export email functions
export * from "./email";
