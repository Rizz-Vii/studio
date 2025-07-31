/**
 * Silent console utility for Firebase Functions
 * Conditionally suppresses console output during deployment
 */

const isDeployment = process.env.NODE_ENV === "production" || process.env.FIREBASE_DEPLOY === "true";

export const logger = {
  log: (...args: any[]) => {
    if (!isDeployment) {
      console.log(...args);
    }
  },

  warn: (...args: any[]) => {
    if (!isDeployment) {
      console.warn(...args);
    }
  },

  info: (...args: any[]) => {
    if (!isDeployment) {
      console.info(...args);
    }
  },

  error: (...args: any[]) => {
    // Always show errors
    console.error(...args);
  },

  // Deployment-safe logging for critical operations
  deploymentSafe: (...args: any[]) => {
    // Only log during development
    if (!isDeployment) {
      console.log("🚀 [DEV]", ...args);
    }
  }
};

export default logger;
