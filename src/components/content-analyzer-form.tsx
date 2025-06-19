// src/components/content-analyzer-form.tsx
'use client';

import type { AnalyzeContentInput, AnalyzeContentOutput } from '@/ai/flows/content-optimization';
import { analyzeContent } from '@/ai/flows/content-optimization';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { useToast } from '@/hooks/use-toast';
import { Loader2, BookOpen, CheckCircle, BarChart2 } from 'lucide-react';

const formSchema = z.object({
  content: z.string().min(50, { message: 'Content must be at least 50 characters long.' }),
  targetKeywords: z.string().min(3, { message: 'Target keywords must be at least 3 characters long.' }),
});

type ContentAnalyzerFormValues = z.infer<typeof formSchema>;

export default function ContentAnalyzerForm() {
  const [isPending, startTransition] = useTransition();
  const [analysisResult, setAnalysisResult] = useState<AnalyzeContentOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<ContentAnalyzerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: '',
      targetKeywords: '',
    },
  });

  async function onSubmit(values: ContentAnalyzerFormValues) {
    setAnalysisResult(null);
    startTransition(async () => {
      try {
        const result = await analyzeContent(values as AnalyzeContentInput);
        setAnalysisResult(result);
      } catch (error) {
        console.error('Error analyzing content:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to analyze content. Please try again.",
        });
      }
    });
  }

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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                      <Input placeholder="e.g., SEO best practices, content marketing" {...field} className="font-body" />
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
              <Button type="submit" disabled={isPending} className="font-body w-full sm:w-auto">
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Analyze Content
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {isPending && (
         <Card className="shadow-md">
          <CardContent className="p-6 flex items-center justify-center">
            <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
            <p className="font-body text-muted-foreground">Analyzing content...</p>
          </CardContent>
        </Card>
      )}

      {analysisResult && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Analysis Results</CardTitle>
            <div className="flex items-center space-x-2 pt-2">
              <Progress value={analysisResult.overallScore} className="w-[60%]" />
              <span className="text-sm font-medium font-body text-primary">{analysisResult.overallScore}/100</span>
            </div>
            <CardDescription className="font-body">
              Overall content score and detailed suggestions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible defaultValue="readability" className="w-full">
              <AccordionItem value="readability">
                <AccordionTrigger className="font-body hover:no-underline">
                  <div className="flex items-center">
                    <BookOpen className="mr-2 h-5 w-5 text-primary" /> Readability Suggestions
                  </div>
                </AccordionTrigger>
                <AccordionContent className="font-body text-sm p-2 bg-secondary/30 rounded-md">
                  {analysisResult.readabilitySuggestions}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="keyword-density">
                <AccordionTrigger className="font-body hover:no-underline">
                   <div className="flex items-center">
                    <BarChart2 className="mr-2 h-5 w-5 text-primary" /> Keyword Density Suggestions
                  </div>
                </AccordionTrigger>
                <AccordionContent className="font-body text-sm p-2 bg-secondary/30 rounded-md">
                  {analysisResult.keywordDensitySuggestions}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="semantic-relevance">
                <AccordionTrigger className="font-body hover:no-underline">
                   <div className="flex items-center">
                    <CheckCircle className="mr-2 h-5 w-5 text-primary" /> Semantic Relevance Suggestions
                  </div>
                </AccordionTrigger>
                <AccordionContent className="font-body text-sm p-2 bg-secondary/30 rounded-md">
                  {analysisResult.semanticRelevanceSuggestions}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
