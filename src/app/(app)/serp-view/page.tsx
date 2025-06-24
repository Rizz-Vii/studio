// src/app/(app)/serp-view/page.tsx
'use client';

import { useState } from 'react';
import SerpViewForm from '@/components/serp-view-form';
// Import flow and types when they are available
// import type { SerpViewInput, SerpViewOutput } from '@/ai/flows/serp-view';
// import { getSerpData } from '@/ai/flows/serp-view';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function SerpViewPage() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    // const [results, setResults] = useState<SerpViewOutput | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (values: { keyword: string }) => {
        setIsLoading(true);
        // setResults(null);
        setError(null);
        try {
            // Placeholder for actual flow call
            console.log("Simulating SERP view for:", values.keyword);
            
            if (user) {
                const userActivitiesRef = collection(db, 'users', user.uid, 'activities');
                await addDoc(userActivitiesRef, {
                    type: 'SERP View',
                    tool: 'SERP View',
                    timestamp: serverTimestamp(),
                    details: values,
                    resultsSummary: `Viewed SERP for keyword: "${values.keyword}".`
                });
            }
            // Temporarily set an error to show feedback
            setError("This feature is currently in development and will be available soon.");

        } catch (e: any) {
            setError(e.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <SerpViewForm
                onSubmit={handleSubmit}
                isLoading={isLoading}
                results={null} // Pass null until implemented
                error={error}
            />
        </div>
    );
}
