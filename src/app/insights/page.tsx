
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Zap, CheckCircle, AlertTriangle, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import useProtectedRoute from '@/hooks/useProtectedRoute';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { generateInsights } from '@/ai/flows/generate-insights';

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

const getPriorityBadgeVariant = (priority: 'High' | 'Medium' | 'Low'): "destructive" | "secondary" | "outline" => {
  if (priority === 'High') return 'destructive';
  if (priority === 'Medium') return 'secondary';
  return 'outline';
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
            // Firestore Timestamps are not serializable, so we remove it.
            // The AI flow doesn't need it anyway.
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
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  if (!user) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-headline font-semibold text-foreground">Actionable Insights</h1>
        <p className="text-muted-foreground font-body">AI-generated recommendations based on your recent activity.</p>
      </div>
      
      {isLoading && (
        <Card className="shadow-md">
          <CardContent className="p-6 flex items-center justify-center">
            <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
            <p className="font-body text-muted-foreground">Generating personalized insights...</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && error && (
          <Card className="shadow-md border-destructive">
             <CardHeader>
                <CardTitle className="text-destructive font-headline flex items-center gap-2"><AlertTriangle /> Error</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="font-body text-destructive-foreground">{error}</p>
            </CardContent>
          </Card>
      )}
      
      {!isLoading && !error && (
        <>
          {insights.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {insights.map(insight => (
                <Card key={insight.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="font-headline text-lg">{insight.title}</CardTitle>
                      <Lightbulb className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={getPriorityBadgeVariant(insight.priority)} className="font-body">{insight.priority} Priority</Badge>
                      <Badge variant="outline" className="font-body">{insight.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground font-body mb-3">{insight.description}</p>
                    <div className="flex items-center text-xs text-muted-foreground font-body">
                      {getImpactIcon(insight.estimatedImpact)}
                      <span className="ml-1">Estimated Impact: {insight.estimatedImpact}</span>
                    </div>
                  </CardContent>
                  {insight.actionLink && insight.actionText && (
                    <CardFooter>
                      <Button asChild variant="outline" size="sm" className="w-full font-body">
                        <Link href={insight.actionLink}>
                            {insight.actionText} <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <Card className="shadow-md">
              <CardContent className="p-10 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-headline mb-2">No Insights Available</h3>
                  <p className="font-body text-muted-foreground">Use the tools to perform some activities, and we'll generate personalized insights for you here.</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
