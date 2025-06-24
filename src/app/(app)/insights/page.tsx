// src/app/(app)/insights/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { generateInsights } from '@/ai/flows/generate-insights';
import type { GenerateInsightsOutput } from '@/ai/flows/generate-insights';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, AlertTriangle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import LoadingScreen from '@/components/ui/loading-screen';

export default function InsightsPage() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [insights, setInsights] = useState<GenerateInsightsOutput['insights']>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInsights = async () => {
            if (!user) {
                setIsLoading(false);
                return;
            }

            try {
                // 1. Fetch last 10 activities
                const activitiesRef = collection(db, "users", user.uid, "activities");
                const q = query(activitiesRef, orderBy("timestamp", "desc"), limit(10));
                const querySnapshot = await getDocs(q);

                // Convert Firestore Timestamps and other complex objects to plain objects
                // before passing to the server function.
                const activities = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    // We only need the fields defined in the ActivitySchema for the AI flow.
                    return {
                        type: data.type,
                        tool: data.tool,
                        details: data.details,
                        resultsSummary: data.resultsSummary,
                    };
                });

                if (activities.length === 0) {
                    setInsights([]);
                    setIsLoading(false);
                    return;
                }

                // 2. Generate insights
                const result = await generateInsights({ activities });
                setInsights(result.insights);

            } catch (e: any) {
                setError(e.message || 'An unexpected error occurred.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchInsights();
    }, [user]);

    const priorityColors: { [key: string]: string } = {
        'High': 'bg-red-500',
        'Medium': 'bg-yellow-500',
        'Low': 'bg-green-500',
    };

    if (isLoading) {
        return <LoadingScreen text="Generating personalized insights..." />;
    }
    
    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-headline">Actionable Insights</h1>
                <p className="text-muted-foreground font-body">AI-generated recommendations based on your recent activity.</p>
            </div>

            {error && (
                <Card className="shadow-lg border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive font-headline flex items-center gap-2">
                           <AlertTriangle /> Error Generating Insights
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="font-body text-destructive-foreground">{error}</p>
                    </CardContent>
                </Card>
            )}

            {!error && insights.length === 0 && (
                <Card className="shadow-lg text-center">
                    <CardContent className="p-10">
                        <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-xl font-headline mb-2">No Insights Yet</h3>
                        <p className="font-body text-muted-foreground">Use the tools in the sidebar to perform some SEO tasks. We'll analyze your activity and provide personalized recommendations here.</p>
                    </CardContent>
                </Card>
            )}

            {!error && insights.length > 0 && (
                <div className="space-y-4">
                    {insights.map(insight => (
                        <Card key={insight.id} className="shadow-md hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="font-headline">{insight.title}</CardTitle>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <div className={`h-3 w-3 rounded-full ${priorityColors[insight.priority]}`}></div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{insight.priority} Priority</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <CardDescription>
                                    <Badge variant="outline" className="mr-2">{insight.category}</Badge>
                                    Impact: <Badge variant="secondary">{insight.estimatedImpact}</Badge>
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="font-body text-muted-foreground">{insight.description}</p>
                            </CardContent>
                            {insight.actionLink && insight.actionText && (
                                <CardFooter>
                                    <Button asChild>
                                        <Link href={insight.actionLink}>
                                            {insight.actionText} <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </CardFooter>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
