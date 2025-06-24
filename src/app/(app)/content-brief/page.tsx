// src/app/(app)/content-brief/page.tsx
'use client';

import { useState } from 'react';
import ContentBriefForm from '@/components/content-brief-form';
import type { ContentBriefInput, ContentBriefOutput } from '@/ai/flows/content-brief';
import { generateContentBrief } from '@/ai/flows/content-brief';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function ContentBriefPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [briefResult, setBriefResult] = useState<ContentBriefOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: ContentBriefInput) => {
    setIsLoading(true);
    setBriefResult(null);
    setError(null);
    try {
      const result = await generateContentBrief(values);
      setBriefResult(result);

      if (user) {
        const userActivitiesRef = collection(db, 'users', user.uid, 'activities');
        await addDoc(userActivitiesRef, {
            type: 'Content Brief Generation',
            tool: 'Content Brief',
            timestamp: serverTimestamp(),
            details: {
                keyword: values.keyword,
                title: result.title,
            },
            resultsSummary: `Generated content brief for keyword: "${values.keyword}".`
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
      <ContentBriefForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        briefResult={briefResult}
        error={error}
      />
    </div>
  );
}
