import * as logger from "firebase-functions/logger";
import type { Request, Response } from "firebase-functions";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import cors from "cors";

import { auditUrl, AuditUrlInput, AuditUrlOutput } from "@/ai/flows/seo-audit.js";

const corsMiddleware = cors({ origin: true });

export const auditUrlHandler = (req: Request, res: Response) => {
    corsMiddleware(req, res, async () => {
        // Handle preflight request for CORS
        if (req.method === 'OPTIONS') {
            res.status(204).send('');
            return;
        }

        const authorization = req.headers.authorization;
        if (!authorization || !authorization.startsWith('Bearer ')) {
            logger.warn("Unauthenticated access attempt to auditUrl");
            res.status(403).send("Unauthorized");
            return;
        }

        const idToken = authorization.split('Bearer ')[1];
        let decodedToken;
        try {
            decodedToken = await getAuth().verifyIdToken(idToken);
        } catch (error) {
            logger.error("Error verifying Firebase ID token:", error);
            res.status(403).send("Unauthorized");
            return;
        }

        const userId = decodedToken.uid;
        const { url } = req.body.data as AuditUrlInput;

        if (!url) {
            logger.warn("auditUrl called without 'url' argument.");
            res.status(400).json({ error: { message: "The function must be called with a 'url' argument." } });
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
            
            res.status(200).json({ data: result });
        } catch (error) {
            logger.error("Error during SEO audit:", error);
            if (error instanceof Error) {
                 res.status(500).json({ error: { message: "An internal error occurred during the SEO audit.", errorMessage: error.message }});
            } else {
                 res.status(500).json({ error: { message: "An unexpected error occurred." }});
            }
        }
    });
};
