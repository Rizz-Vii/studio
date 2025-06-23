import * as logger from "firebase-functions/logger";
import type { onCall } from "firebase-functions/v2/https";
import { HttpsError } from "firebase-functions/v2/https";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { auditUrl, AuditUrlInput, AuditUrlOutput } from "@/ai/flows/seo-audit.js";

export const auditUrlHandler: Parameters<typeof onCall>[0] = async (request) => {
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "You must be logged in to call this function.");
    }

    const { url } = request.data as AuditUrlInput;
    if (!url) {
        throw new HttpsError("invalid-argument", "The function must be called with a 'url' argument.");
    }

    const userId = request.auth.uid;

    try {
        const result: AuditUrlOutput = await auditUrl({ url });

        // The audit data to be stored
        const auditData = {
            userId,
            url,
            ...result,
            createdAt: Timestamp.now(),
        };

        const db = getFirestore();
        const auditRef = db.collection("audits").doc(); // Create a new document reference
        
        // Store in a user-specific subcollection
        await db.collection("users").doc(userId).collection("audits").doc(auditRef.id).set(auditData);

        // Also save a summary to user's general activities
        const activitiesCollectionRef = db.collection("users").doc(userId).collection("activities");
        await activitiesCollectionRef.add({
          type: "seo_audit",
          tool: "SEO Audit",
          timestamp: Timestamp.now(),
          details: {
            url: url,
            overallScore: result.overallScore,
            criticalIssuesCount: result.items.filter(item => item.status === 'error').length,
            warningIssuesCount: result.items.filter(item => item.status === 'warning').length,
          },
          resultsSummary: `Audit of ${url} completed. Score: ${result.overallScore}/100.`,
        });

        return result;
    } catch (error) {
        logger.error("Error during SEO audit:", error);
        if (error instanceof Error) {
            throw new HttpsError("internal", "An internal error occurred during the SEO audit.", {
                errorMessage: error.message,
            });
        }
        throw new HttpsError("internal", "An unexpected error occurred.");
    }
};
