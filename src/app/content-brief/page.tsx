
// src/app/content-brief/page.tsx
'use client';

import ContentBriefForm from '@/components/content-brief-form';
import { useState } from 'react';
import useProtectedRoute from '@/hooks/useProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import type { ContentBriefInput, ContentBriefOutput } from '@/ai/flows/content-brief';
import { generateContentBrief } from '@/ai/flows/content-brief';
import LoadingScreen from '@/components/ui/loading-screen';

export default function ContentBriefPage() {
  const { user, loading: authLoading } = useProtectedRoute();
  const { user: currentUser } = useAuth();

  const [briefResult, setBriefResult] = useState<ContentBriefOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (authLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return null;
  }

  const handleGenerateBrief = async (values: ContentBriefInput) => {
    setIsLoading(true);
    setBriefResult(null);
    setError(null);

    if (!currentUser) {
      setError("Authentication error. Please try logging in again.");
      setIsLoading(false);
      return;
    }

    try {
      const aiResult = await generateContentBrief(values);
      setBriefResult(aiResult);

      const activitiesCollectionRef = collection(db, "users", currentUser.uid, "activities");
      await addDoc(activitiesCollectionRef, {
        type: "content_brief_generation",
        tool: "Content Brief",
        timestamp: serverTimestamp(),
        details: {
          keyword: values.keyword,
        },
        resultsSummary: `Generated content brief for keyword: "${values.keyword}".`,
      });

    } catch (err: any) {
      console.error("Error generating content brief:", err.message);
      setError("Failed to generate content brief.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-headline font-semibold text-foreground">AI Content Brief Generator</h1>
      <p className="text-muted-foreground font-body">Create comprehensive, SEO-optimized content briefs in seconds to guide your writing team and ensure content ranks effectively.</p>
      <ContentBriefForm
        onSubmit={handleGenerateBrief}
        isLoading={isLoading}
        briefResult={briefResult}
        error={error}
      />
    </div>
  );
}
