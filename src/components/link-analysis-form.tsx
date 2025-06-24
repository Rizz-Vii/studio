// src/components/link-analysis-form.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Link as LinkIcon, AlertTriangle } from 'lucide-react';
import type { LinkAnalysisInput, LinkAnalysisOutput } from '@/ai/flows/link-analysis';
import { useRef, useEffect } from 'react';

const formSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid URL.' }),
});

type FormValues = z.infer<typeof formSchema>;

interface LinkAnalysisFormProps {
  onSubmit: (values: LinkAnalysisInput) => Promise<void>;
  isLoading: boolean;
  results: LinkAnalysisOutput | null;
  error: string | null;
}

export default function LinkAnalysisForm({ onSubmit, isLoading, results, error }: LinkAnalysisFormProps) {
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
                    <CardTitle className="font-headline">Backlink Analyzer</CardTitle>
                    <CardDescription className="font-body">Enter a URL to discover its backlink profile.</CardDescription>
                </CardHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <CardContent>
                            <FormField
                                control={form.control}
                                name="url"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>URL to Analyze</FormLabel>
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
                                Analyze Backlinks
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
                            <p className="mt-2 text-muted-foreground">Discovering backlinks...</p>
                        </CardContent>
                    </Card>
                )}
                {error && (
                    <Card className="mt-8 border-destructive">
                        <CardHeader>
                            <CardTitle className="text-destructive font-headline flex items-center gap-2"><AlertTriangle /> Analysis Failed</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>{error}</p>
                        </CardContent>
                    </Card>
                )}
                {results && (
                    <Card className="mt-8">
                        <CardHeader>
                            <CardTitle className="font-headline">Backlink Profile</CardTitle>
                            <CardDescription>
                                Found {results.summary.totalBacklinks} backlinks from {results.summary.referringDomains} unique domains.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Referring Domain</TableHead>
                                        <TableHead>Anchor Text</TableHead>
                                        <TableHead className="text-right">Domain Authority</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {results.backlinks.map((link, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium truncate" style={{maxWidth: '200px'}}>
                                                <a href={link.backlinkUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">{link.referringDomain}</a>
                                            </TableCell>
                                            <TableCell className="italic">"{link.anchorText}"</TableCell>
                                            <TableCell className="text-right">{link.domainAuthority}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
