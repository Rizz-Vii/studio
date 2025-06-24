// src/app/(app)/keyword-tool/page.tsx
'use client';
import { useState } from 'react';
import KeywordToolForm from '@/components/keyword-tool-form';
import type { SuggestKeywordsInput, SuggestKeywordsOutput } from '@/ai/flows/keyword-suggestions';
import { suggestKeywords } from '@/ai/flows/keyword-suggestions';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function KeywordToolPage() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<SuggestKeywordsOutput | null>(null);

    const handleSubmit = async (values: SuggestKeywordsInput) => {
        setIsLoading(true);
        setResults(null);
        try {
            const result = await suggestKeywords(values);
            setResults(result);

            if (user) {
                const userActivitiesRef = collection(db, 'users', user.uid, 'activities');
                await addDoc(userActivitiesRef, {
                    type: 'Keyword Search',
                    tool: 'Keyword Tool',
                    timestamp: serverTimestamp(),
                    details: values,
                    resultsSummary: `Searched for keywords related to "${values.topic}". Found ${result.keywords.length} suggestions.`
                });
            }
        } catch (error) {
            console.error('Error fetching keyword suggestions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <KeywordToolForm 
                onSubmit={handleSubmit}
                isLoading={isLoading}
                results={results}
            />
        </div>
    );
}
