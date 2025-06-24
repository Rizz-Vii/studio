// src/app/(app)/keyword-tool/page.tsx
'use client';
import { useState, useRef, useEffect } from 'react';
import KeywordToolForm from '@/components/keyword-tool-form';
import type { SuggestKeywordsInput, SuggestKeywordsOutput } from '@/ai/flows/keyword-suggestions';
import { suggestKeywords } from '@/ai/flows/keyword-suggestions';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingScreen from '@/components/ui/loading-screen';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const getProgressColor = (score: number) => {
    if (score > 70) return "bg-destructive";
    if (score > 40) return "bg-warning";
    return "bg-success";
};

const KeywordResults = ({ results }: { results: SuggestKeywordsOutput }) => {
    const { toast } = useToast();

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
          toast({ title: "Copied!", description: "Keywords copied to clipboard." });
        }).catch(err => {
          toast({ variant: "destructive", title: "Copy Failed", description: "Could not copy to clipboard." });
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card>
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
    );
}

export default function KeywordToolPage() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<SuggestKeywordsOutput | null>(null);
    const [submitted, setSubmitted] = useState(false);

    const resultsRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (results) {
            resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [results]);

    const handleSubmit = async (values: SuggestKeywordsInput) => {
        setIsLoading(true);
        setSubmitted(true);
        setResults(null);
        try {
            const result = await suggestKeywords(values);
            setResults(result);

            if (user) {
                const userActivitiesRef = collection(db, 'users', user.uid, 'activities');
                await addDoc(userActivitiesRef, {
                    type: 'Keyword Search',
                    tool: 'Keyword Tool',
                    timestamp: serverTimestamp(),
                    details: values,
                    resultsSummary: `Searched for keywords related to "${values.topic}". Found ${result.keywords.length} suggestions.`
                });
            }
        } catch (error) {
            console.error('Error fetching keyword suggestions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={cn(
            "mx-auto transition-all duration-500",
            submitted ? "max-w-7xl" : "max-w-xl"
        )}>
            <div className={cn(
                "grid gap-8 transition-all duration-500",
                submitted ? "lg:grid-cols-3" : "lg:grid-cols-1"
            )}>
                <motion.div layout className="lg:col-span-1">
                     <KeywordToolForm 
                        onSubmit={handleSubmit}
                        isLoading={isLoading}
                    />
                </motion.div>

                 <div className="lg:col-span-2" ref={resultsRef}>
                    <AnimatePresence>
                        {isLoading && <LoadingScreen text="Generating suggestions..." />}
                        {results && results.keywords.length > 0 && <KeywordResults results={results} />}
                        {results && results.keywords.length === 0 && !isLoading && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                <Card>
                                    <CardContent className="p-6">
                                        <p className="font-body text-muted-foreground text-center">No keywords found for this topic. Try a different one.</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
