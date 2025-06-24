// src/app/(app)/seo-audit/page.tsx
'use client';

import { useState } from 'react';
import type { AuditUrlInput, AuditUrlOutput } from '@/ai/flows/seo-audit';
import { auditUrl } from '@/ai/flows/seo-audit';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import SeoAuditForm from '@/components/seo-audit-form';

export default function SeoAuditPage() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<AuditUrlOutput | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (values: AuditUrlInput) => {
        setIsLoading(true);
        setResults(null);
        setError(null);
        try {
            const result = await auditUrl(values);
            setResults(result);

            if (user) {
                const userActivitiesRef = collection(db, 'users', user.uid, 'activities');
                await addDoc(userActivitiesRef, {
                    type: 'SEO Audit',
                    tool: 'SEO Audit',
                    timestamp: serverTimestamp(),
                    details: { 
                        url: values.url,
                        overallScore: result.overallScore,
                    },
                    resultsSummary: `Audited ${values.url}. Overall Score: ${result.overallScore}/100.`
                });
            }
        } catch (e: any) {
            setError(e.message || 'An unexpected error occurred during the audit.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <SeoAuditForm
                onSubmit={handleSubmit}
                isLoading={isLoading}
                results={results}
                error={error}
            />
        </div>
    );
}
