'use client';
import ContentAnalyzerForm from '@/components/content-analyzer-form';

export default function ContentAnalyzerPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline font-semibold text-foreground">Content Optimization Tool</h1>
      <ContentAnalyzerForm />
    </div>
  );
}
