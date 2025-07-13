import * as admin from "firebase-admin";
import type { ServiceAccount } from "firebase-admin";
import * as dotenv from "dotenv";
import testConfig from "../../test.config.json";

// Load environment variables
dotenv.config({ path: ".env.test" });

const serviceAccount: ServiceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID as string,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n"
  ) as string,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL as string,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Export Firebase Admin services for use in other parts of your application
export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
