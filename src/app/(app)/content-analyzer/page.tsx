// src/app/(app)/content-analyzer/page.tsx
'use client';

import { useState } from 'react';
import ContentAnalyzerForm from '@/components/content-analyzer-form';
import type { AnalyzeContentInput, AnalyzeContentOutput } from '@/ai/flows/content-optimization';
import { analyzeContent } from '@/ai/flows/content-optimization';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function ContentAnalyzerPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeContentOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: AnalyzeContentInput) => {
    setIsLoading(true);
    setAnalysisResult(null);
    setError(null);
    try {
      const result = await analyzeContent(values);
      setAnalysisResult(result);
      if (user) {
        const userActivitiesRef = collection(db, 'users', user.uid, 'activities');
        await addDoc(userActivitiesRef, {
            type: 'Content Analysis',
            tool: 'Content Analyzer',
            timestamp: serverTimestamp(),
            details: {
                targetKeywords: values.targetKeywords,
                overallScore: result.overallScore,
                readabilityScore: result.readabilityScore,
                keywordScore: result.keywordScore,
                semanticScore: result.semanticScore,
            },
            resultsSummary: `Analyzed content for keywords: "${values.targetKeywords}". Overall Score: ${result.overallScore}/100.`
        });
      }
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <ContentAnalyzerForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        analysisResult={analysisResult}
        error={error}
      />
    </div>
  );
}
