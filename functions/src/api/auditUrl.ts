
import * as logger from "firebase-functions/logger";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import type { onCall } from "firebase-functions/v2/https";

// Re-define types locally to avoid any imports from the AI flow files for debugging.
interface AuditUrlInput {
  url: string;
}
interface AuditUrlOutput {
  overallScore: number;
  items: {
    id: string;
    name: string;
    score: number;
    details: string;
    status: 'good' | 'warning' | 'error';
  }[];
  summary: string;
}

export const auditUrlHandler: Parameters<typeof onCall<AuditUrlInput>>[0] = async (req) => {
    if (!req.auth) {
        logger.warn("Unauthenticated access attempt to auditUrl");
        throw new (await import('firebase-functions/v2/https')).https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }

    const userId = req.auth.uid;
    const { url } = req.data;
    logger.info(`(Debug) Audit requested for URL: ${url} by user: ${userId}`);

    // Return mock data immediately to test the function call and CORS.
    // This bypasses all Genkit and AI related code.
    const mockResult: AuditUrlOutput = {
        overallScore: 88,
        items: [
            {
                id: "title-tags",
                name: "Title Tags",
                score: 95,
                details: "Mock response: Title is well-optimized.",
                status: 'good',
            },
            {
                id: "meta-descriptions",
                name: "Meta Descriptions",
                score: 80,
                details: "Mock response: Meta description is a bit short.",
                status: 'warning',
            },
            {
              id: 'image-alts', name: 'Image Alt Texts', score: 100, details: 'Mock response: All images have alt text.', status: 'good'
            },
            {
              id: 'broken-links', name: 'Broken Links', score: 100, details: 'Mock response: No broken links found.', status: 'good'
            },
            {
              id: 'site-speed', name: 'Site Speed', score: 75, details: 'Mock response: Site speed is acceptable.', status: 'warning'
            },
            {
              id: 'mobile-friendliness', name: 'Mobile-Friendliness', score: 100, details: 'Mock response: Page is mobile-friendly.', status: 'good'
            }
        ],
        summary: "This is a mock response to confirm the function and CORS are working. The real AI logic has been temporarily disabled for debugging."
    };

    try {
        const db = getFirestore();
        await db.collection("users").doc(userId).collection("audits").add({
            userId,
            url,
            ...mockResult,
            createdAt: Timestamp.now(),
        });

        const activitiesCollectionRef = db.collection("users").doc(userId).collection("activities");
        await activitiesCollectionRef.add({
            type: "seo_audit",
            tool: "SEO Audit",
            timestamp: Timestamp.now(),
            details: {
                url: url,
                overallScore: mockResult.overallScore,
                criticalIssuesCount: mockResult.items.filter(item => item.status === 'error').length,
                warningIssuesCount: mockResult.items.filter(item => item.status === 'warning').length,
            },
            resultsSummary: `(Mock) Audit of ${url} completed. Score: ${mockResult.overallScore}/100.`,
        });
    } catch (dbError) {
        logger.error("Failed to write mock audit to Firestore", dbError);
        // Do not re-throw, to ensure client gets the mock response for debugging.
    }

    return mockResult;
};
