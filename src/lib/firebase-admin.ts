import * as admin from "firebase-admin";
import type { ServiceAccount } from "firebase-admin";
import serviceAccount from "./rankpilot-h3jpc-firebase-adminsdk-fbsvc-e21851e6bb.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as ServiceAccount),
});

// Export Firebase Admin services for use in other parts of your application
export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
