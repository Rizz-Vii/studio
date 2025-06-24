// src/components/competitor-analysis-form.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import type { CompetitorAnalysisInput } from '@/ai/flows/competitor-analysis';

const formSchema = z.object({
  yourUrl: z.string().min(1, { message: 'Please enter your website URL.' }),
  competitorUrls: z.string().min(1, { message: 'Please enter at least one competitor URL.' }),
  keywords: z.string().min(1, { message: 'Please enter at least one keyword.' }),
});

type FormValues = z.infer<typeof formSchema>;

interface CompetitorAnalysisFormProps {
  onSubmit: (values: CompetitorAnalysisInput) => Promise<void>;
  isLoading: boolean;
}

export default function CompetitorAnalysisForm({ onSubmit, isLoading }: CompetitorAnalysisFormProps) {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            yourUrl: '',
            competitorUrls: '',
            keywords: '',
        },
    });

    function handleFormSubmit(values: FormValues) {
        const normalizeUrl = (url: string): string => {
            const trimmed = url.trim();
            if (!trimmed) {
                return "";
            }
            if (!/^(https?:\/\/)/i.test(trimmed)) {
                return `https://${trimmed}`;
            }
            return trimmed;
        };

        const submissionValues: CompetitorAnalysisInput = {
            yourUrl: normalizeUrl(values.yourUrl),
            competitorUrls: values.competitorUrls.split(',').map(normalizeUrl).filter(url => url),
            keywords: values.keywords.split(',').map(kw => kw.trim()).filter(kw => kw),
        };
        onSubmit(submissionValues);
    }

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="font-headline">Competitor Analysis</CardTitle>
                <CardDescription className="font-body">Compare your keyword rankings against your competitors.</CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="yourUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Your URL</FormLabel>
                                    <FormControl>
                                        <Input placeholder="yourwebsite.com" {...field} disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="competitorUrls"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Competitor URLs</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="competitor1.com, competitor2.com" {...field} disabled={isLoading} />
                                    </FormControl>
                                    <FormDescription>Comma-separated list of competitor URLs.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="keywords"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Keywords</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="seo tools, content marketing, ai writing" {...field} disabled={isLoading} />
                                    </FormControl>
                                    <FormDescription>Comma-separated list of keywords to analyze.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Analyze Competitors
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    );
}
