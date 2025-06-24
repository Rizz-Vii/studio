// src/components/serp-view-form.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertTriangle, Construction } from 'lucide-react';
import { useRef, useEffect } from 'react';

const formSchema = z.object({
  keyword: z.string().min(2, { message: 'Please enter a keyword.' }),
});

type FormValues = z.infer<typeof formSchema>;

interface SerpViewFormProps {
  onSubmit: (values: FormValues) => Promise<void>;
  isLoading: boolean;
  results: any | null; // Replace 'any' with actual result type when available
  error: string | null;
}

export default function SerpViewForm({ onSubmit, isLoading, results, error }: SerpViewFormProps) {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { keyword: '' },
    });

    const resultsRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (results || error) {
            resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [results, error]);

    return (
        <div className="space-y-6">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="font-headline">SERP Visualizer</CardTitle>
                    <CardDescription className="font-body">Enter a keyword to see a simulated Search Engine Results Page.</CardDescription>
                </CardHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <CardContent>
                            <FormField
                                control={form.control}
                                name="keyword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Keyword</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., best seo tools 2025" {...field} disabled={isLoading} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Visualize SERP
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>

            <div ref={resultsRef}>
                {isLoading && (
                    <Card className="mt-8">
                        <CardContent className="p-6 text-center">
                            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                            <p className="mt-2 text-muted-foreground">Fetching search results...</p>
                        </CardContent>
                    </Card>
                )}
                {error && (
                    <Card className="mt-8 border-amber-500">
                        <CardHeader>
                            <CardTitle className="text-amber-600 font-headline flex items-center gap-2"><Construction /> Under Development</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>{error}</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
