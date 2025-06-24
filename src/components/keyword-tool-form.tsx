// src/components/keyword-tool-form.tsx
'use client';

import type { SuggestKeywordsInput, SuggestKeywordsOutput } from '@/ai/flows/keyword-suggestions';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState, useRef, useEffect } from 'react';
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
import LoadingScreen from '@/components/ui/loading-screen';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';

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

const getProgressColor = (score: number) => {
    if (score > 70) return "bg-destructive";
    if (score > 40) return "bg-warning";
    return "bg-success";
};


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
        {isLoading && <LoadingScreen text="Generating suggestions..." />}
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
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(results.keywords.map(k => k.keyword).join(', '))} className="font-body">
                        <Copy className="mr-2 h-4 w-4" /> Copy Keywords
                        </Button>
                    </div>
                    <CardDescription className="font-body">
                        Here are keywords related to your topic, with estimated volume and ranking difficulty.
                    </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Keyword</TableHead>
                                    <TableHead className="text-right">Search Volume</TableHead>
                                    <TableHead className="w-[150px]">Difficulty</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {results.keywords.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">{item.keyword}</TableCell>
                                        <TableCell className="text-right">{item.searchVolume.toLocaleString()}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Progress value={item.difficulty} className="w-full" indicatorClassName={getProgressColor(item.difficulty)} />
                                                <span className="text-sm font-semibold">{item.difficulty}</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
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
