import { initializeApp } from "firebase-admin/app";
import { logger } from "firebase-functions";
import { HttpsOptions, onCall } from "firebase-functions/v2/https";

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
export const systemHealthCheck = onCall(httpsOptions, async (request) => {
  try {
    logger.info("System health check function called", {
      auth: request.auth ? "authenticated" : "unauthenticated",
      timestamp: new Date().toISOString(),
    });

    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      runtime: "Node.js v" + process.version,
      region: httpsOptions.region,
      service: "Firebase Functions v2"
    };
  } catch (error) {
    logger.error("System health check function failed:", error);
    throw new Error("System health check failed");
  }
});

// Export AI-powered functions (optimized - redundant functions removed)
export * from "./api/analyze-content";
export * from "./api/audit";
export * from "./api/production-keyword-suggestions";

// Export performance monitoring functions
export {
  abTestManagement, functionMetrics, performanceDashboard, healthCheck as performanceHealthCheck, realtimeMetrics
} from "./api/performance-dashboard-functions";

// Export Stripe payment functions
export * from "./stripe-webhook";

// Export email functions (selective export to avoid deployment conflicts)
export { sendPaymentReceipt, sendWelcomeEmailFunction } from "./email";
// Note: sendBillingReminder temporarily disabled due to deployment type conflict
