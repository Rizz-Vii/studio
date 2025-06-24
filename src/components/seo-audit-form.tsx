// src/components/seo-audit-form.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from "@/components/ui/progress";
import { Loader2, AlertTriangle, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import type { AuditUrlInput, AuditUrlOutput } from '@/ai/flows/seo-audit';
import { useRef, useEffect } from 'react';

const formSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid URL.' }),
});

type FormValues = z.infer<typeof formSchema>;

interface SeoAuditFormProps {
  onSubmit: (values: AuditUrlInput) => Promise<void>;
  isLoading: boolean;
  results: AuditUrlOutput | null;
  error: string | null;
}

const statusIcons: { [key: string]: React.ElementType } = {
    good: CheckCircle,
    warning: AlertTriangle,
    error: XCircle,
};

const statusColors: { [key: string]: string } = {
    good: 'text-success',
    warning: 'text-warning',
    error: 'text-destructive',
};

export default function SeoAuditForm({ onSubmit, isLoading, results, error }: SeoAuditFormProps) {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { url: '' },
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
                    <CardTitle className="font-headline">Technical SEO Audit</CardTitle>
                    <CardDescription className="font-body">Enter a URL to run a quick technical and content SEO audit.</CardDescription>
                </CardHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <CardContent>
                            <FormField
                                control={form.control}
                                name="url"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>URL to Audit</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://example.com" {...field} disabled={isLoading} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Run Audit
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
                            <p className="mt-2 text-muted-foreground">Auditing page...</p>
                        </CardContent>
                    </Card>
                )}
                {error && (
                    <Card className="mt-8 border-destructive">
                        <CardHeader>
                             <CardTitle className="text-destructive font-headline flex items-center gap-2"><AlertTriangle /> Audit Failed</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>{error}</p>
                        </CardContent>
                    </Card>
                )}
                {results && (
                    <Card className="mt-8">
                        <CardHeader>
                            <CardTitle className="font-headline">Audit Results</CardTitle>
                            <div className="flex items-center gap-4 pt-2">
                                <span className="text-4xl font-bold text-primary">{results.overallScore}</span>
                                <div className="w-full">
                                    <p className="font-semibold">Overall Score</p>
                                    <Progress value={results.overallScore} className="mt-1" />
                                </div>
                            </div>
                             <CardDescription className="pt-2">{results.summary}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {results.items.map((item) => {
                                    const Icon = statusIcons[item.status] || AlertCircle;
                                    const color = statusColors[item.status] || 'text-muted-foreground';
                                    return (
                                        <div key={item.id} className="flex items-start gap-4">
                                            <Icon className={`mt-1 h-5 w-5 flex-shrink-0 ${color}`} />
                                            <div className="flex-1">
                                                <p className="font-semibold">{item.name}</p>
                                                <p className="text-sm text-muted-foreground">{item.details}</p>
                                            </div>
                                            <span className={`font-semibold text-sm ${color}`}>{item.score}/100</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
