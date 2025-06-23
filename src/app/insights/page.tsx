
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Zap, AlertTriangle, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import useProtectedRoute from '@/hooks/useProtectedRoute';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { generateInsights } from '@/ai/flows/generate-insights';
import LoadingScreen from "@/components/ui/loading-screen";

interface Insight {
  id: string;
  title: string;
  description: string;
  category: 'Technical SEO' | 'Content' | 'Link Building' | 'Keywords';
  priority: 'High' | 'Medium' | 'Low';
  estimatedImpact: 'High' | 'Medium' | 'Low';
  actionLink?: string; // Optional link to relevant tool/page
  actionText?: string;
}

const getPriorityBadgeVariant = (priority: 'High' | 'Medium' | 'Low'): "destructive" | "warning" | "secondary" => {
  if (priority === 'High') return 'destructive';
  if (priority === 'Medium') return 'warning';
  return 'secondary';
};

const getImpactIcon = (impact: 'High' | 'Medium' | 'Low') => {
  if (impact === 'High') return <Zap className="h-4 w-4 text-red-500" />;
  if (impact === 'Medium') return <Zap className="h-4 w-4 text-yellow-500" />;
  return <Zap className="h-4 w-4 text-green-500" />;
};


export default function InsightsPage() {
  const { user, loading: authLoading } = useProtectedRoute();
  const { user: currentUser } = useAuth();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndGenerateInsights = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        // 1. Fetch recent activities from Firestore
        const activitiesRef = collection(db, "users", currentUser.uid, "activities");
        const q = query(activitiesRef, orderBy("timestamp", "desc"), limit(20));
        const querySnapshot = await getDocs(q);
        const activities = querySnapshot.docs.map(doc => {
            const data = doc.data();
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { timestamp, ...rest } = data;
            return rest;
        });

        // 2. Call the AI flow with the activities
        if (activities.length > 0) {
            const result = await generateInsights({ activities });
            setInsights(result.insights);
        } else {
            setInsights([]);
        }

      } catch (err: any) {
        console.error("Error generating insights:", err.message);
        setError("Could not generate insights at this time. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      fetchAndGenerateInsights();
    }
  }, [authLoading, currentUser]);


  if (authLoading) {
    return <LoadingScreen />;
  }
  if (!user) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-headline font-semibold text-foreground">Actionable Insights</h1>
            <p className="text-muted-foreground font-body mt-2">AI-generated recommendations based on your recent activity to help you prioritize your SEO tasks.</p>
        </div>
      </div>
      
      {isLoading && (
        <Card className="shadow-lg">
          <CardContent className="p-6 flex items-center justify-center">
            <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
            <p className="font-body text-muted-foreground">Generating personalized insights...</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && error && (
          <Card className="shadow-lg border-destructive">
             <CardHeader>
                <CardTitle className="text-destructive font-headline flex items-center gap-2"><AlertTriangle /> Error</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="font-body">{error}</p>
            </CardContent>
          </Card>
      )}
      
      {!isLoading && !error && (
        <>
          {insights.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {insights.map(insight => (
                <Card key={insight.id} className="shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col p-4 space-y-3">
                    <div className="flex justify-between items-start">
                        <h3 className="font-headline font-semibold text-foreground pr-2">{insight.title}</h3>
                        <Lightbulb className="h-5 w-5 text-primary shrink-0" />
                    </div>
                    <p className="text-sm text-muted-foreground font-body flex-grow">{insight.description}</p>
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                        <Badge variant={getPriorityBadgeVariant(insight.priority)}>{insight.priority}</Badge>
                        <Badge variant="outline">{insight.category}</Badge>
                         <div className="flex items-center text-xs text-muted-foreground font-body gap-1">
                            {getImpactIcon(insight.estimatedImpact)}
                            <span>{insight.estimatedImpact} Impact</span>
                        </div>
                    </div>
                    {insight.actionLink && insight.actionText && (
                        <Button asChild variant="ghost" size="sm" className="w-full justify-start p-0 h-auto text-primary hover:text-primary/90">
                        <Link href={insight.actionLink}>
                            {insight.actionText} <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                        </Button>
                    )}
                </Card>
              ))}
            </div>
          ) : (
             <Card className="shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <CardContent className="p-10 text-center">
                  <Lightbulb className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-headline mb-2">No Insights Yet</h3>
                  <p className="font-body text-muted-foreground">Use the tools to perform some activities, and we'll generate personalized insights for you here.</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

