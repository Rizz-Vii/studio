import * as logger from "firebase-functions/logger";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import type { onRequest } from "firebase-functions/v2/https";
import cors from "cors";

import { auditUrl, AuditUrlInput, AuditUrlOutput } from "@/ai/flows/seo-audit.js";

const corsMiddleware = cors({ origin: true });

export const auditUrlHandler: Parameters<typeof onRequest>[1] = (req, res) => {
    corsMiddleware(req, res, async () => {
        if (req.method !== 'POST') {
            res.status(405).send('Method Not Allowed');
            return;
        }

        const idToken = req.headers.authorization?.split('Bearer ')[1];
        if (!idToken) {
            logger.warn("Unauthenticated access attempt to auditUrl");
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        
        let decodedToken;
        try {
            decodedToken = await getAuth().verifyIdToken(idToken);
        } catch (error) {
            logger.error("Error verifying ID token:", error);
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const userId = decodedToken.uid;
        const { url } = req.body as AuditUrlInput;

        if (!url) {
            logger.warn("auditUrl called without 'url' argument.");
            res.status(400).json({ error: "The function must be called with a 'url' argument." });
            return;
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
            const auditRef = db.collection("audits").doc();
            
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
            
            res.status(200).json(result);
        } catch (error) {
            logger.error("Error during SEO audit:", error);
            if (error instanceof Error) {
                res.status(500).json({ error: `An internal error occurred during the SEO audit: ${error.message}`});
            } else {
                res.status(500).json({ error: "An unexpected error occurred." });
            }
        }
    });
};
