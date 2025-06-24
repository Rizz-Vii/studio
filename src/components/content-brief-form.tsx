// src/components/content-brief-form.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import type { ContentBriefInput } from '@/ai/flows/content-brief';

const formSchema = z.object({
  keyword: z.string().min(3, { message: 'Keyword must be at least 3 characters long.' }),
});

type ContentBriefFormValues = z.infer<typeof formSchema>;

interface ContentBriefFormProps {
  onSubmit: (values: ContentBriefInput) => Promise<void>;
  isLoading: boolean;
}

export default function ContentBriefForm({ onSubmit, isLoading }: ContentBriefFormProps) {
  const form = useForm<ContentBriefFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { keyword: '' },
  });

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-headline">Generate a Content Brief</CardTitle>
        <CardDescription className="font-body">
          Enter a target keyword to generate a comprehensive SEO content brief.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <CardContent>
            <FormField
              control={form.control}
              name="keyword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-body">Target Keyword</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., how to start a podcast"
                      {...field}
                      className="font-body"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription className="font-body">
                    The primary keyword you want to rank for.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="font-body w-full sm:w-auto">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Brief
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
