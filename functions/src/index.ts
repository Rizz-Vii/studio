import { initializeApp } from "firebase-admin/app";
import { onRequest } from "firebase-functions/v2/https";
import { auditUrlHandler } from "./api/auditUrl.js";

// Initialize Firebase Admin SDK
initializeApp();

// Export the auditUrl function
export const auditUrl = onRequest({ cors: true }, auditUrlHandler);
