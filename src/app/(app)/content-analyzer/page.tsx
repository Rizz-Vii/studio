// src/app/(app)/content-analyzer/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import ContentAnalyzerForm from '@/components/content-analyzer-form';
import type { AnalyzeContentInput, AnalyzeContentOutput } from '@/ai/flows/content-optimization';
import { analyzeContent } from '@/ai/flows/content-optimization';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2, BookOpen, CheckCircle, BarChart2, Target, AlertTriangle } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, PolarRadiusAxis } from 'recharts';
import { Progress } from "@/components/ui/progress";
import LoadingScreen from '@/components/ui/loading-screen';
import { cn } from '@/lib/utils';


const getProgressColor = (score: number) => {
  if (score > 85) return "bg-success";
  if (score > 60) return "bg-warning";
  return "bg-destructive";
};

const AnalysisResults = ({ analysisResult }: { analysisResult: AnalyzeContentOutput }) => {
    const chartData = [
      { subject: 'Readability', score: analysisResult.readabilityScore, fullMark: 100 },
      { subject: 'Keywords', score: analysisResult.keywordScore, fullMark: 100 },
      { subject: 'Semantics', score: analysisResult.semanticScore, fullMark: 100 },
    ];
  
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Analysis Results</CardTitle>
            <CardDescription className="font-body">
              This analysis provides a holistic view of your content's quality. Use the suggestions to improve your scores and increase your chances of ranking.
            </CardDescription>
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <div className="w-full sm:w-1/2">
                <div className="flex items-center space-x-2">
                  <span className="text-4xl font-bold font-headline text-primary">{analysisResult.overallScore}/100</span>
                  <h3 className="font-semibold font-body">Overall Score</h3>
                </div>
                <p className="text-sm text-muted-foreground font-body mt-1">A summary of your content's SEO health.</p>
              </div>
              <div className="w-full sm:w-1/2 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" className="text-xs font-body" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} className="text-xs" />
                    <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible defaultValue="readability" className="w-full">
              <AccordionItem value="readability">
                <AccordionTrigger className="font-body hover:no-underline">
                  <div className="flex w-full items-center justify-between pr-4">
                    <div className="flex items-center">
                      <BookOpen className="mr-2 h-6 w-6 text-primary" /> Readability
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-semibold">{analysisResult.readabilityScore}/100</span>
                      <Progress value={analysisResult.readabilityScore} className="w-32" indicatorClassName={getProgressColor(analysisResult.readabilityScore)} />
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="font-body text-sm p-2 rounded-md">
                  <ul className="list-disc pl-5 space-y-1">
                    {analysisResult.readabilitySuggestions.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="keyword-density">
                <AccordionTrigger className="font-body hover:no-underline">
                  <div className="flex w-full items-center justify-between pr-4">
                    <div className="flex items-center">
                      <Target className="mr-2 h-6 w-6 text-primary" /> Keyword Optimization
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-semibold">{analysisResult.keywordScore}/100</span>
                      <Progress value={analysisResult.keywordScore} className="w-32" indicatorClassName={getProgressColor(analysisResult.keywordScore)} />
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="font-body text-sm p-2 rounded-md">
                  <ul className="list-disc pl-5 space-y-1">
                    {analysisResult.keywordSuggestions.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="semantic-relevance">
                <AccordionTrigger className="font-body hover:no-underline">
                  <div className="flex w-full items-center justify-between pr-4">
                    <div className="flex items-center">
                      <CheckCircle className="mr-2 h-6 w-6 text-primary" /> Semantic Relevance
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-semibold">{analysisResult.semanticScore}/100</span>
                      <Progress value={analysisResult.semanticScore} className="w-32" indicatorClassName={getProgressColor(analysisResult.semanticScore)} />
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="font-body text-sm p-2 rounded-md">
                  <ul className="list-disc pl-5 space-y-1">
                    {analysisResult.semanticSuggestions.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

export default function ContentAnalyzerPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeContentOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const resultsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (analysisResult || error) {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [analysisResult, error]);

  const handleSubmit = async (values: AnalyzeContentInput) => {
    setIsLoading(true);
    setSubmitted(true);
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
    <div className={cn(
        "mx-auto transition-all duration-500",
        submitted ? "max-w-7xl" : "max-w-xl"
    )}>
        <div className={cn(
            "grid gap-8 transition-all duration-500",
            submitted ? "lg:grid-cols-3" : "lg:grid-cols-1"
        )}>
            <motion.div layout className="lg:col-span-1">
                <ContentAnalyzerForm
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                />
            </motion.div>
            
            <div className="lg:col-span-2" ref={resultsRef}>
                <AnimatePresence>
                    {isLoading && <LoadingScreen text="Analyzing content..." />}
                    {error && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <Card className="border-destructive">
                                <CardHeader>
                                    <CardTitle className="text-destructive font-headline flex items-center gap-2"><AlertTriangle /> Analysis Failed</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="font-body text-destructive-foreground">{error}</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                    {analysisResult && <AnalysisResults analysisResult={analysisResult} />}
                </AnimatePresence>
            </div>
        </div>
    </div>
  );
}
