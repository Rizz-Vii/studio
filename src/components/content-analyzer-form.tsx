
'use client';

import type { AnalyzeContentInput, AnalyzeContentOutput } from '@/ai/flows/content-optimization';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2, BookOpen, CheckCircle, BarChart2, Target } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, PolarRadiusAxis } from 'recharts';
import { Progress } from "@/components/ui/progress";

const formSchema = z.object({
  content: z.string().min(50, { message: 'Content must be at least 50 characters long.' }),
  targetKeywords: z.string().min(3, { message: 'Target keywords must be at least 3 characters long.' }),
});

type ContentAnalyzerFormValues = z.infer<typeof formSchema>;

interface ContentAnalyzerFormProps {
  onSubmit: (values: AnalyzeContentInput) => Promise<void>;
  isLoading: boolean;
  analysisResult: AnalyzeContentOutput | null;
  error: string | null;
}

const getProgressColor = (score: number) => {
  if (score > 85) return "bg-green-500";
  if (score > 60) return "bg-yellow-500";
  return "bg-red-500";
};

export default function ContentAnalyzerForm({ onSubmit, isLoading, analysisResult, error }: ContentAnalyzerFormProps) {
  const form = useForm<ContentAnalyzerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: '',
      targetKeywords: '',
    },
  });

  const resultsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (analysisResult || error) {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [analysisResult, error]);


  async function handleFormSubmit(values: ContentAnalyzerFormValues) {
    await onSubmit(values as AnalyzeContentInput);
  }

  const chartData = analysisResult ? [
    { subject: 'Readability', score: analysisResult.readabilityScore, fullMark: 100 },
    { subject: 'Keywords', score: analysisResult.keywordScore, fullMark: 100 },
    { subject: 'Semantics', score: analysisResult.semanticScore, fullMark: 100 },
  ] : [];

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">Optimize Your Content</CardTitle>
          <CardDescription className="font-body">
            Paste your content and target keywords to get AI-powered optimization suggestions.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-body">Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste your article, blog post, or page content here..."
                        className="min-h-[200px] font-body"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription className="font-body">
                      The text content you want to analyze.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="targetKeywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-body">Target Keywords</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., SEO best practices, content marketing"
                        {...field}
                        className="font-body"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription className="font-body">
                      Comma-separated list of keywords you are targeting.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="font-body w-full sm:w-auto">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Analyze Content
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <div ref={resultsRef}>
        {isLoading && (
          <Card className="shadow-md mt-8">
           <CardContent className="p-6 flex items-center justify-center">
              <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
              <p className="font-body text-muted-foreground">Analyzing content...</p>
            </CardContent>
          </Card>
       )}

        {error && (
          <Card className="shadow-md border-destructive mt-8">
            <CardHeader>
              <CardTitle className="text-destructive font-headline">Analysis Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-body text-destructive-foreground">{error}</p>
            </CardContent>
          </Card>
        )}

        {analysisResult && (
          <Card className="shadow-lg mt-8">
            <CardHeader>
              <CardTitle className="font-headline">Analysis Results</CardTitle>
              <CardDescription className="font-body">This analysis provides a holistic view of your content's quality. Use the suggestions to improve your scores and increase your chances of ranking.</CardDescription>
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
        )}
      </div>
    </div>
  );
}
