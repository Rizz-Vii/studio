// src/components/content-analyzer-form.tsx
'use client';

import type { AnalyzeContentInput } from '@/ai/flows/content-optimization';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  content: z.string().min(50, { message: 'Content must be at least 50 characters long.' }),
  targetKeywords: z.string().min(3, { message: 'Target keywords must be at least 3 characters long.' }),
});

type ContentAnalyzerFormValues = z.infer<typeof formSchema>;

interface ContentAnalyzerFormProps {
  onSubmit: (values: AnalyzeContentInput) => Promise<void>;
  isLoading: boolean;
}

export default function ContentAnalyzerForm({ onSubmit, isLoading }: ContentAnalyzerFormProps) {
  const form = useForm<ContentAnalyzerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: '',
      targetKeywords: '',
    },
  });

  async function handleFormSubmit(values: ContentAnalyzerFormValues) {
    await onSubmit(values as AnalyzeContentInput);
  }

  return (
    <Card className="h-full">
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
  );
}
