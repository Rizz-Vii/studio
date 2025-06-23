'use client';
import ContentAnalyzerForm from '@/components/content-analyzer-form';
import { useState } from 'react';
import useProtectedRoute from '@/hooks/useProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import type { AnalyzeContentInput, AnalyzeContentOutput } from '@/ai/flows/content-optimization'; // Import AI types
import { analyzeContent } from '@/ai/flows/content-optimization'; // Import AI flow

export default function ContentAnalyzerPage() {
  const { user, loading: authLoading } = useProtectedRoute();
  const { user: currentUser } = useAuth();

  const [analysisResult, setAnalysisResult] = useState<AnalyzeContentOutput | null>(null); // Use AI output type
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (authLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  const handleAnalyzeContent = async (values: AnalyzeContentInput) => {
    setIsLoading(true);
    setAnalysisResult(null);
    setError(null);

    if (!currentUser) {
      console.error("No authenticated user to save activity.");
      setIsLoading(false);
      setError("Authentication error. Please try logging in again.");
      return;
    }

    try {
      // **Call the AI flow**
      const aiResult = await analyzeContent(values);
      setAnalysisResult(aiResult);

      // **Save the user activity to Firestore**
      const activitiesCollectionRef = collection(db, "users", currentUser.uid, "activities");
      await addDoc(activitiesCollectionRef, {
        type: "content_analysis",
        tool: "Content Analyzer",
        timestamp: serverTimestamp(),
        details: { // Details of the analysis
          // Avoid saving the full content here if it's large
          targetKeywords: values.targetKeywords,
          // Add other relevant analysis parameters here
        },
        resultsSummary: `Score: ${aiResult.overallScore}/100. Suggestions for readability, keywords, relevance.`, // Summarize the results
      });

    } catch (err: any) {
      console.error("Error performing content analysis or saving activity:", err.message);
      setError("Failed to perform content analysis or save activity.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-headline font-semibold text-foreground">Content Optimization Tool</h1>
      <ContentAnalyzerForm
        onSubmit={handleAnalyzeContent} // Pass the handler
        isLoading={isLoading} // Pass loading state
        analysisResult={analysisResult} // Pass results
      />
    </div>
  );
}
