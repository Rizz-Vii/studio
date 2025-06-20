// src/app/keyword-tool/page.tsx
'use client';

import KeywordToolForm from '@/components/keyword-tool-form';
import { useState } from 'react';
import useProtectedRoute from '@/hooks/useProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import type { SuggestKeywordsInput, SuggestKeywordsOutput } from '@/ai/flows/keyword-suggestions'; // Import AI types
import { suggestKeywords } from '@/ai/flows/keyword-suggestions'; // Import AI flow

export default function KeywordToolPage() {
  const { user, loading: authLoading } = useProtectedRoute();
  const { user: currentUser } = useAuth();

  const [results, setResults] = useState<SuggestKeywordsOutput | null>(null); // Use AI output type
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (authLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  // This function will be passed down to the form component
  const handleKeywordSearch = async (values: SuggestKeywordsInput) => {
    setIsLoading(true);
    setResults(null);
    setError(null); // Clear previous errors

    if (!currentUser) {
        console.error("No authenticated user to save activity.");
        setIsLoading(false);
        setError("Authentication error. Please try logging in again.");
        return;
    }

    try {
      // **Call the AI flow**
      const aiResult = await suggestKeywords(values);
      setResults(aiResult);

      // **Save the user activity to Firestore**
      const activitiesCollectionRef = collection(db, "users", currentUser.uid, "activities");
      await addDoc(activitiesCollectionRef, {
        type: "keyword_search",
        tool: "Keyword Tool",
        timestamp: serverTimestamp(),
        details: { // Details of the search
            topic: values.topic,
            includeLongTailKeywords: values.includeLongTailKeywords,
            // Add other relevant search parameters here
        },
        resultsSummary: aiResult.keywords.slice(0, 5).join(', ') + (aiResult.keywords.length > 5 ? '...' : ''), // Save a summary of keywords
      });

    } catch (err: any) {
      console.error("Error performing search or saving activity:", err.message);
      setError("Failed to perform search or save activity.");
      // Display an error message (you can use a toast here)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-4">AI Keyword Tool</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>} {/* Display errors */}
      <KeywordToolForm
        onSubmit={handleKeywordSearch} // Pass the search handler
        isLoading={isLoading} // Pass loading state
        results={results} // Pass results
      />
      {/* The form component will now handle displaying the results */}
    </div>
  );
}
