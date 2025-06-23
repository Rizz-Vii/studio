
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

  const [analysisResult, setAnalysisResult] = useState<AnalyzeContentOutput | null>(null);
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
      setError("Authentication error. Please try logging in again.");
      setIsLoading(false);
      return;
    }

    try {
      const aiResult = await analyzeContent(values);
      setAnalysisResult(aiResult);

      const activitiesCollectionRef = collection(db, "users", currentUser.uid, "activities");
      await addDoc(activitiesCollectionRef, {
        type: "content_analysis",
        tool: "Content Analyzer",
        timestamp: serverTimestamp(),
        details: {
          targetKeywords: values.targetKeywords,
          overallScore: aiResult.overallScore,
        },
        resultsSummary: `Content analysis for "${values.targetKeywords}" completed. Score: ${aiResult.overallScore}/100.`,
      });

    } catch (err: any) {
      console.error("Error performing content analysis or saving activity:", err.message);
      setError("Failed to perform content analysis. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-headline font-semibold text-foreground">Content Optimization Tool</h1>
      <p className="text-muted-foreground font-body">Analyze your content for readability, keyword usage, and semantic relevance to improve its SEO performance.</p>
      <ContentAnalyzerForm
        onSubmit={handleAnalyzeContent}
        isLoading={isLoading}
        analysisResult={analysisResult}
        error={error}
      />
    </div>
  );
}
