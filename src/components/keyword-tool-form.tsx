// src/components/keyword-tool-form.tsx
'use client';

import type { SuggestKeywordsInput, SuggestKeywordsOutput } from '@/ai/flows/keyword-suggestions';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState, useTransition, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const formSchema = z.object({
  topic: z.string().min(3, { message: 'Topic must be at least 3 characters long.' }),
  includeLongTailKeywords: z.boolean().default(false),
});

type KeywordFormValues = z.infer<typeof formSchema>;

interface KeywordToolFormProps {
  onSubmit: (values: SuggestKeywordsInput) => Promise<void>;
  isLoading: boolean;
  results: SuggestKeywordsOutput | null;
}

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

  async function handleFormSubmit(values: KeywordFormValues) {
      await onSubmit(values as SuggestKeywordsInput);
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: "Copied!", description: "Keywords copied to clipboard." });
    }).catch(err => {
      toast({ variant: "destructive", title: "Copy Failed", description: "Could not copy to clipboard." });
    });
  };

  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Discover Keywords</CardTitle>
          <CardDescription className="font-body">
            Enter a topic to get AI-powered keyword suggestions.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
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
                      <Input placeholder="e.g., sustainable gardening, AI in marketing" {...field} className="font-body" disabled={isLoading} />
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
                        disabled={isLoading}
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
              <Button type="submit" disabled={isLoading} className="font-body w-full sm:w-auto">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Suggest Keywords
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <div ref={resultsRef}>
        {isLoading && (
          <Card className="mt-8">
            <CardContent className="p-6 flex items-center justify-center">
              <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
              <p className="font-body text-muted-foreground">Generating suggestions...</p>
            </CardContent>
          </Card>
        )}
        <AnimatePresence>
            {results && results.keywords.length > 0 && (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="mt-8">
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
                        <motion.div 
                            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                        {results.keywords.map((keyword, index) => (
                            <motion.div key={index} variants={itemVariants}>
                                <Card className="p-4 flex items-center justify-center text-center shadow-md hover:shadow-lg transition-shadow bg-card h-24">
                                    <p className="font-medium font-body">{keyword}</p>
                                </Card>
                            </motion.div>
                        ))}
                        </motion.div>
                    </CardContent>
                </Card>
            </motion.div>
            )}
        </AnimatePresence>

        {results && results.keywords.length === 0 && !isLoading && (
           <Card className="mt-8">
            <CardContent className="p-6">
              <p className="font-body text-muted-foreground text-center">No keywords found for this topic. Try a different one.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
