
import { initializeApp } from "firebase-admin/app";
import { onCall } from "firebase-functions/v2/https";
import { auditUrlHandler } from "./api/auditUrl.js";

// Initialize Firebase Admin SDK
initializeApp();

// Export the auditUrl function as an onCall function
export const auditUrl = onCall(auditUrlHandler);
