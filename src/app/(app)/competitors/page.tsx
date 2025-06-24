// src/app/(app)/competitors/page.tsx
'use client';

import { useState } from 'react';
import type { CompetitorAnalysisInput, CompetitorAnalysisOutput } from '@/ai/flows/competitor-analysis';
import { analyzeCompetitors } from '@/ai/flows/competitor-analysis';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import CompetitorAnalysisForm from '@/components/competitor-analysis-form';

export default function CompetitorsPage() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<CompetitorAnalysisOutput | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (values: CompetitorAnalysisInput) => {
        setIsLoading(true);
        setResults(null);
        setError(null);
        try {
            const result = await analyzeCompetitors(values);
            setResults(result);

            if (user) {
                const userActivitiesRef = collection(db, 'users', user.uid, 'activities');
                await addDoc(userActivitiesRef, {
                    type: 'Competitor Analysis',
                    tool: 'Competitor Analysis',
                    timestamp: serverTimestamp(),
                    details: {
                        yourUrl: values.yourUrl,
                        competitors: values.competitorUrls,
                    },
                    resultsSummary: `Compared ${values.yourUrl} with ${values.competitorUrls.length} competitors.`
                });
            }
        } catch (e: any) {
            setError(e.message || 'An unexpected error occurred during analysis.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <CompetitorAnalysisForm
                onSubmit={handleSubmit}
                isLoading={isLoading}
                results={results}
                error={error}
            />
        </div>
    );
}
