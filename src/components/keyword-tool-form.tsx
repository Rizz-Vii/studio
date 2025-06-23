// src/components/keyword-tool-form.tsx
'use client';

import type { SuggestKeywordsInput, SuggestKeywordsOutput } from '@/ai/flows/keyword-suggestions';
// Remove import for suggestKeywords as it will be called in the page component
// import { suggestKeywords } from '@/ai/flows/keyword-suggestions';

import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState, useTransition, useRef, useEffect } from 'react'; // Keep useTransition if needed for form state transitions
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Copy } from 'lucide-react';

const formSchema = z.object({
  topic: z.string().min(3, { message: 'Topic must be at least 3 characters long.' }),
  includeLongTailKeywords: z.boolean().default(false),
});

type KeywordFormValues = z.infer<typeof formSchema>;

// Define props for the KeywordToolForm component
interface KeywordToolFormProps {
  onSubmit: (values: SuggestKeywordsInput) => Promise<void>; // Function to call on submit
  isLoading: boolean; // Loading state
  results: SuggestKeywordsOutput | null; // Results to display
}

// Accept the props
export default function KeywordToolForm({ onSubmit, isLoading, results }: KeywordToolFormProps) {
  const { toast } = useToast();
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      if (results) {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
  }, [results]);


  const form = useForm<KeywordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
      includeLongTailKeywords: false,
    },
  });

  // Modify onSubmit to call the prop function
  async function handleFormSubmit(values: KeywordFormValues) {
      await onSubmit(values as SuggestKeywordsInput); // Call the prop function
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: "Copied!", description: "Keywords copied to clipboard." });
    }).catch(err => {
      toast({ variant: "destructive", title: "Copy Failed", description: "Could not copy to clipboard." });
    });
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg hover:shadow-2xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="font-headline">Discover Keywords</CardTitle>
          <CardDescription className="font-body">
            Enter a topic to get AI-powered keyword suggestions.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          {/* Call the new handleFormSubmit function */}
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div>
                    <FormLabel className="font-body">Topic</FormLabel>
                      <Input placeholder="e.g., sustainable gardening, AI in marketing" {...field} className="font-body" disabled={isLoading} /> {/* Disable input while loading */}
                      <FormDescription className="font-body">
                      What topic do you want keywords for?
                    </FormDescription>
                    <FormMessage />
                    </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="includeLongTailKeywords"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                    <FormControl>
                    <div className="space-y-1 leading-none">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading} // Disable checkbox while loading
                      />

                      <FormLabel className="font-body">
                        Include Long-Tail Keywords
                      </FormLabel>
                      <FormDescription className="font-body">
                        Get more specific, longer keyword phrases. The AI will determine if it's appropriate.
                      </FormDescription>
                    </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              {/* Use the isLoading prop */}
              <Button type="submit" disabled={isLoading} className="font-body w-full sm:w-auto">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Suggest Keywords
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <div ref={resultsRef}>
        {/* Display loading state using isLoading prop */}
        {isLoading && (
          <Card className="shadow-lg mt-8">
            <CardContent className="p-6 flex items-center justify-center">
              <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
              <p className="font-body text-muted-foreground">Generating suggestions...</p>
            </CardContent>
          </Card>
        )}

        {/* Display results using the results prop */}
        {results && results.keywords.length > 0 && (
          <Card className="shadow-lg hover:shadow-2xl transition-shadow duration-300 mt-8">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="font-headline">Suggested Keywords</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(results.keywords.join(', '))} className="font-body">
                  <Copy className="mr-2 h-4 w-4" /> Copy All
                </Button>
              </div>
              <CardDescription className="font-body">
                Use these keywords to brainstorm content ideas, optimize existing pages, or inform your PPC campaigns. Long-tail keywords often have lower competition and higher conversion rates.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {results.keywords.map((keyword, index) => (
                    <Card key={index} className="p-4 flex items-center justify-center text-center shadow-md hover:shadow-lg transition-shadow bg-card h-24">
                        <p className="font-medium font-body">{keyword}</p>
                    </Card>
                  ))}
                </div>
            </CardContent>
          </Card>
        )}
        {/* Display empty state for results */}
        {results && results.keywords.length === 0 && !isLoading && ( // Add !isLoading condition
           <Card className="shadow-lg hover:shadow-2xl transition-shadow duration-300 mt-8">
            <CardContent className="p-6">
              <p className="font-body text-muted-foreground text-center">No keywords found for this topic. Try a different one.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
