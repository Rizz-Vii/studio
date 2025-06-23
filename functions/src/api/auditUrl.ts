import * as logger from "firebase-functions/logger";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import type { onCall } from "firebase-functions/v2/https";

import { auditUrl, AuditUrlInput, AuditUrlOutput } from "@/ai/flows/seo-audit.js";

export const auditUrlHandler: Parameters<typeof onCall>[0] = async (request) => {
    // Handle preflight request for CORS
    if (request.method === 'OPTIONS') {
        return;
    }

    if (!request.auth) {
        logger.warn("Unauthenticated access attempt to auditUrl");
        throw new Error("Unauthorized");
    }

    const userId = request.auth.uid;
    const { url } = request.data as AuditUrlInput;

    if (!url) {
        logger.warn("auditUrl called without 'url' argument.");
        throw new Error("The function must be called with a 'url' argument.");
    }

    try {
        const result: AuditUrlOutput = await auditUrl({ url });

        const auditData = {
            userId,
            url,
            ...result,
            createdAt: Timestamp.now(),
        };

        const db = getFirestore();
        const auditRef = db.collection("audits").doc(); // Create a new document reference
        
        await db.collection("users").doc(userId).collection("audits").doc(auditRef.id).set(auditData);

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
             throw new Error(`An internal error occurred during the SEO audit. ${error.message}`);
        } else {
             throw new Error("An unexpected error occurred.");
        }
    }
};
