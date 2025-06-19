// src/components/keyword-tool-form.tsx
'use client';

import type { SuggestKeywordsInput, SuggestKeywordsOutput } from '@/ai/flows/keyword-suggestions';
import { suggestKeywords } from '@/ai/flows/keyword-suggestions';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState, useTransition } from 'react';
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

export default function KeywordToolForm() {
  const [isPending, startTransition] = useTransition();
  const [keywordsResult, setKeywordsResult] = useState<SuggestKeywordsOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<KeywordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
      includeLongTailKeywords: false,
    },
  });

  async function onSubmit(values: KeywordFormValues) {
    setKeywordsResult(null);
    startTransition(async () => {
      try {
        const result = await suggestKeywords(values as SuggestKeywordsInput);
        setKeywordsResult(result);
      } catch (error) {
        console.error('Error suggesting keywords:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to generate keyword suggestions. Please try again.",
        });
      }
    });
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
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">Discover Keywords</CardTitle>
          <CardDescription className="font-body">
            Enter a topic to get AI-powered keyword suggestions.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-body">Topic</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., sustainable gardening, AI in marketing" {...field} className="font-body" />
                    </FormControl>
                    <FormDescription className="font-body">
                      What topic do you want keywords for?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="includeLongTailKeywords"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-body">
                        Include Long-Tail Keywords
                      </FormLabel>
                      <FormDescription className="font-body">
                        Get more specific, longer keyword phrases. The AI will determine if it's appropriate.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isPending} className="font-body w-full sm:w-auto">
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Suggest Keywords
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {isPending && (
        <Card className="shadow-md">
          <CardContent className="p-6 flex items-center justify-center">
            <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
            <p className="font-body text-muted-foreground">Generating suggestions...</p>
          </CardContent>
        </Card>
      )}

      {keywordsResult && keywordsResult.keywords.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="font-headline">Suggested Keywords</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(keywordsResult.keywords.join(', '))} className="font-body">
                <Copy className="mr-2 h-4 w-4" /> Copy All
              </Button>
            </div>
            <CardDescription className="font-body">
              Here are some keywords related to "{form.getValues('topic')}".
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {keywordsResult.keywords.map((keyword, index) => (
                <li key={index} className="p-3 bg-secondary rounded-md text-secondary-foreground font-body text-sm shadow-sm">
                  {keyword}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      {keywordsResult && keywordsResult.keywords.length === 0 && (
         <Card className="shadow-md">
          <CardContent className="p-6">
            <p className="font-body text-muted-foreground text-center">No keywords found for this topic. Try a different one.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
