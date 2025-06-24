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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Users, AlertTriangle, BarChart3 } from 'lucide-react';
import type { CompetitorAnalysisInput, CompetitorAnalysisOutput } from '@/ai/flows/competitor-analysis';
import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingScreen from '@/components/ui/loading-screen';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { ChartContainer, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';

const formSchema = z.object({
  yourUrl: z.string().url({ message: 'Please enter a valid URL for your website.' }),
  competitorUrls: z.string().min(1, { message: 'Please enter at least one competitor URL.' }),
  keywords: z.string().min(1, { message: 'Please enter at least one keyword.' }),
});

type FormValues = z.infer<typeof formSchema>;

interface CompetitorAnalysisFormProps {
  onSubmit: (values: CompetitorAnalysisInput) => Promise<void>;
  isLoading: boolean;
  results: CompetitorAnalysisOutput | null;
  error: string | null;
}


const RankingsChart = ({ rankings }: { rankings: CompetitorAnalysisOutput['rankings']}) => {
    if (!rankings || rankings.length === 0) return null;

    const firstKeywordData = rankings[0];
    const competitorUrls = Object.keys(firstKeywordData).filter(k => k !== 'keyword' && k !== 'yourRank');
    
    const chartData = [
        { name: 'Your Site', rank: typeof firstKeywordData.yourRank?.rank === 'number' ? firstKeywordData.yourRank.rank : 101, fill: 'hsl(var(--chart-1))' },
        ...competitorUrls.map((url, index) => {
            const competitorData = (firstKeywordData as any)[url];
            return {
                name: new URL(url).hostname,
                rank: typeof competitorData?.rank === 'number' ? competitorData.rank : 101,
                fill: `hsl(var(--chart-${(index % 5) + 2}))`
            };
        })
    ];
    
    const chartConfig: ChartConfig = chartData.reduce((acc, item) => {
        acc[item.name] = { label: item.name, color: item.fill };
        return acc;
    }, {} as ChartConfig);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><BarChart3/>Ranking Comparison for "{firstKeywordData.keyword}"</CardTitle>
                <CardDescription>Lower bars are better. Ranks of 101 indicate "N/A" or rank > 100.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                        <CartesianGrid horizontal={false} />
                        <YAxis dataKey="name" type="category" width={120} tickLine={false} axisLine={false} stroke="hsl(var(--foreground))" className="text-xs" />
                        <XAxis dataKey="rank" type="number" domain={[0, 101]} reversed={true} />
                        <RechartsTooltip cursor={false} content={<ChartTooltipContent />} />
                        <Bar dataKey="rank" layout="vertical" radius={5} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
};


export default function CompetitorAnalysisForm({ onSubmit, isLoading, results, error }: CompetitorAnalysisFormProps) {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            yourUrl: '',
            competitorUrls: '',
            keywords: '',
        },
    });

    const resultsRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (results || error) {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [results, error]);

    function handleFormSubmit(values: FormValues) {
        const submissionValues: CompetitorAnalysisInput = {
            yourUrl: values.yourUrl,
            competitorUrls: values.competitorUrls.split(',').map(url => url.trim()).filter(url => url),
            keywords: values.keywords.split(',').map(kw => kw.trim()).filter(kw => kw),
        };
        onSubmit(submissionValues);
    }
    
    const competitorHeaders = results ? Array.from(new Set(results.rankings.flatMap(r => Object.keys(r).filter(k => k !== 'keyword' && k !== 'yourRank')))) : [];

    return (
        <div className="space-y-6">
            <Card>
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
                                            <Input placeholder="https://yourwebsite.com" {...field} disabled={isLoading} />
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
                                            <Textarea placeholder="https://competitor1.com, https://competitor2.com" {...field} disabled={isLoading} />
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

            <div ref={resultsRef}>
                {isLoading && <LoadingScreen text="Analyzing rankings..." />}
                <AnimatePresence>
                    {error && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <Card className="mt-8 border-destructive">
                                <CardHeader>
                                    <CardTitle className="text-destructive font-headline flex items-center gap-2"><AlertTriangle /> Analysis Failed</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p>{error}</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                    {results && (
                        <motion.div 
                            className="space-y-6 mt-8"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <RankingsChart rankings={results.rankings} />

                            <Card>
                                <CardHeader>
                                    <CardTitle className="font-headline flex items-center gap-2"><Users /> Keyword Rankings Data</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Keyword</TableHead>
                                                <TableHead className="text-center">Your Rank</TableHead>
                                                {competitorHeaders.map(url => (
                                                    <TableHead key={url} className="text-center truncate" title={url}>{new URL(url).hostname}</TableHead>
                                                ))}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {results.rankings.map((item) => (
                                                <TableRow key={item.keyword}>
                                                    <TableCell className="font-medium">{item.keyword}</TableCell>
                                                    <TableCell className="text-center">{item.yourRank?.rank ?? 'N/A'}</TableCell>
                                                    {competitorHeaders.map(url => (
                                                        <TableCell key={url} className="text-center">
                                                            {(item as any)[url]?.rank ?? 'N/A'}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="font-headline">Content Gap Opportunities</CardTitle>
                                    <CardDescription>Keywords where competitors rank well but you don't.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {results.contentGaps.length > 0 ? (
                                    <ul className="list-disc pl-5 space-y-2">
                                        {results.contentGaps.map((gap, index) => (
                                            <li key={index}>{gap}</li>
                                        ))}
                                    </ul>
                                    ) : (
                                        <p className="text-muted-foreground">No significant content gaps found. Great job!</p>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
