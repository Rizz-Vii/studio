// src/app/(app)/link-view/page.tsx
'use client';

import { useState } from 'react';
import type { LinkAnalysisInput, LinkAnalysisOutput } from '@/ai/flows/link-analysis';
import { analyzeLinks } from '@/ai/flows/link-analysis';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import LinkAnalysisForm from '@/components/link-analysis-form';

export default function LinkViewPage() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<LinkAnalysisOutput | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (values: LinkAnalysisInput) => {
        setIsLoading(true);
        setResults(null);
        setError(null);
        try {
            const result = await analyzeLinks(values);
            setResults(result);

            if (user) {
                const userActivitiesRef = collection(db, 'users', user.uid, 'activities');
                await addDoc(userActivitiesRef, {
                    type: 'Link Analysis',
                    tool: 'Link View',
                    timestamp: serverTimestamp(),
                    details: values,
                    resultsSummary: `Analyzed backlinks for ${values.url}. Found ${result.summary.totalBacklinks} links.`
                });
            }
        } catch (e: any) {
            setError(e.message || 'An unexpected error occurred during link analysis.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <LinkAnalysisForm
                onSubmit={handleSubmit}
                isLoading={isLoading}
                results={results}
                error={error}
            />
        </div>
    );
}
