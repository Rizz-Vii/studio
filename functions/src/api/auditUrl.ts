
import * as logger from "firebase-functions/logger";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import type { onCall, HttpsError } from "firebase-functions/v2/https";
import { auditUrl, AuditUrlInput, AuditUrlOutput } from "@/ai/flows/seo-audit.js";

export const auditUrlHandler: Parameters<typeof onCall<AuditUrlInput>>[0] = async (req) => {
    if (!req.auth) {
        logger.warn("Unauthenticated access attempt to auditUrl");
        throw new (await import('firebase-functions/v2/https')).https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }

    const userId = req.auth.uid;
    const { url } = req.data;

    if (!url) {
        logger.warn("auditUrl called without 'url' argument.");
        throw new (await import('firebase-functions/v2/https')).https.HttpsError('invalid-argument', 'The function must be called with a "url" argument.');
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
        await db.collection("users").doc(userId).collection("audits").add(auditData);

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
        const { HttpsError } = await import('firebase-functions/v2/https');
        if (error instanceof HttpsError) {
            throw error;
        }
        if (error instanceof Error) {
            throw new HttpsError('internal', `An internal error occurred during the SEO audit: ${error.message}`);
        } else {
            throw new HttpsError('internal', "An unexpected error occurred.");
        }
    }
};
