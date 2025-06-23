
'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import useProtectedRoute from '@/hooks/useProtectedRoute';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, KeyRound, ScanText, Users, ListChecks, Activity, BookText } from "lucide-react";
import { format, formatDistanceToNow } from 'date-fns';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

// Interface for user activity from Firestore
interface UserActivity {
  id: string;
  type: string;
  tool: string;
  timestamp: any; // Firestore Timestamp
  details?: any;
  resultsSummary?: string;
}

// Grouped activities state type
type GroupedActivities = Record<string, UserActivity[]>;

// Configuration for each tool
const toolConfig: Record<string, { icon: React.ElementType; color: string }> = {
  "SEO Audit": { icon: ListChecks, color: "text-blue-500" },
  "Keyword Tool": { icon: KeyRound, color: "text-green-500" },
  "Content Analyzer": { icon: ScanText, color: "text-purple-500" },
  "Competitor Analysis": { icon: Users, color: "text-orange-500" },
  "Content Brief": { icon: BookText, color: "text-indigo-500" },
  "Default": { icon: Activity, color: "text-gray-500" },
};

// Chart configuration for Recharts
const chartConfig = {
  score: { label: "Score", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;

// Main component for the Activity Page
export default function ActivityPage() {
  const { user, loading: authLoading } = useProtectedRoute();
  const [groupedActivities, setGroupedActivities] = useState<GroupedActivities>({});
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      if (user) {
        setLoadingData(true);
        const activitiesRef = collection(db, "users", user.uid, "activities");
        const q = query(activitiesRef, orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);

        const fetchedActivities = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as UserActivity));

        const grouped = fetchedActivities.reduce((acc, activity) => {
          const tool = activity.tool || "Other";
          if (!acc[tool]) {
            acc[tool] = [];
          }
          acc[tool].push(activity);
          return acc;
        }, {} as GroupedActivities);

        setGroupedActivities(grouped);
        setLoadingData(false);
      }
    };

    if (!authLoading) {
      fetchActivities();
    }
  }, [user, authLoading]);

  if (authLoading || loadingData) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Define a mapping of tool names to their respective summary components
  const toolSummaryComponents: Record<string, React.FC<{ activities: UserActivity[] }>> = {
    "SEO Audit": SeoAuditSummary,
    "Content Analyzer": ContentAnalyzerSummary,
    "Keyword Tool": KeywordToolSummary,
    "Competitor Analysis": CompetitorAnalysisSummary,
    "Content Brief": ContentBriefSummary,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-headline font-semibold text-foreground">Activity Dashboard</h1>
       <p className="text-muted-foreground font-body">Review your recent activity, track trends, and see how you're using our SEO tools.</p>
      {Object.keys(groupedActivities).length > 0 ? (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {Object.entries(groupedActivities).map(([tool, activities]) => {
            const ToolSummary = toolSummaryComponents[tool];
            return (
              <ToolActivityCard key={tool} tool={tool} activities={activities}>
                {ToolSummary && <ToolSummary activities={activities} />}
              </ToolActivityCard>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-10 text-center">
            <h3 className="text-xl font-headline mb-2">No Activity Yet</h3>
            <p className="font-body text-muted-foreground">Start using the tools to see your activity here.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ----- Individual Tool Cards and Summaries -----

// Generic card wrapper for each tool
const ToolActivityCard: React.FC<{
  tool: string;
  activities: UserActivity[];
  children?: React.ReactNode;
}> = ({ tool, activities, children }) => {
  const config = toolConfig[tool] || toolConfig["Default"];
  const Icon = config.icon;

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Icon className={`h-6 w-6 ${config.color}`} />
          {tool}
        </CardTitle>
        <CardDescription>{activities.length} recent activities</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        {children}
        <div>
          <h4 className="font-semibold text-sm mb-2">Recent Logs:</h4>
          <ul className="space-y-3">
            {activities.slice(0, 5).map((activity) => (
              <li key={activity.id} className="text-xs text-muted-foreground font-body flex gap-2">
                <span className="font-semibold text-foreground whitespace-nowrap">
                  {formatDistanceToNow(activity.timestamp.toDate(), { addSuffix: true })}:
                </span>
                <span className="truncate" title={activity.resultsSummary}>
                  {activity.resultsSummary ?? 'Activity performed.'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

// Summary component for SEO Audit
const SeoAuditSummary: React.FC<{ activities: UserActivity[] }> = ({ activities }) => {
  const auditData = activities
    .map(a => ({
      score: a.details?.overallScore,
      date: a.timestamp.toDate(),
    }))
    .filter(a => typeof a.score === 'number')
    .reverse();

  if (auditData.length === 0) return null;

  const avgScore = Math.round(auditData.reduce((sum, a) => sum + a.score, 0) / auditData.length);
  
  return (
    <div className="space-y-3">
      <div>
        <div className="flex justify-between items-center mb-1">
            <span className="font-semibold text-sm">Average Score</span>
            <span className="font-bold text-lg text-blue-500">{avgScore}/100</span>
        </div>
        <Progress value={avgScore} indicatorClassName={avgScore > 80 ? "bg-green-500" : avgScore > 60 ? "bg-yellow-500" : "bg-red-500"} />
      </div>
      {auditData.length > 1 && (
         <div className="h-[100px] w-full">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer>
                <LineChart data={auditData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} />
                  <XAxis dataKey="date" tickFormatter={(time) => format(time, 'MMM d')} className="text-xs"/>
                  <YAxis domain={[0, 100]} className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent indicator="line" labelFormatter={(label, payload) => `${format(label, 'PPp')}`} formatter={(value) => `${value}/100`} />} />
                  <Line type="monotone" dataKey="score" stroke="var(--color-score)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
         </div>
      )}
    </div>
  );
};


// Summary for Content Analyzer
const ContentAnalyzerSummary: React.FC<{ activities: UserActivity[] }> = ({ activities }) => {
    const scores = activities
        .map(a => a.details?.overallScore)
        .filter(score => typeof score === 'number');

    if (scores.length === 0) return null;

    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-sm">Average Content Score</span>
                <span className="font-bold text-lg text-purple-500">{avgScore}/100</span>
            </div>
            <Progress value={avgScore} indicatorClassName={avgScore > 80 ? "bg-green-500" : avgScore > 60 ? "bg-yellow-500" : "bg-red-500"} />
        </div>
    );
};

// Summary for Keyword Tool
const KeywordToolSummary: React.FC<{ activities: UserActivity[] }> = ({ activities }) => {
    const topics = activities
        .map(a => a.details?.topic)
        .filter(Boolean);

    if (topics.length === 0) return null;
    
    const topicCounts = topics.reduce((acc, topic) => {
        acc[topic] = (acc[topic] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const topTopics = Object.entries(topicCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    return (
        <div>
            <h4 className="font-semibold text-sm mb-2">Top Searched Topics:</h4>
            <div className="flex flex-wrap gap-2">
                {topTopics.map(([topic, count]) => (
                    <Badge key={topic} variant="secondary">{topic} ({count})</Badge>
                ))}
            </div>
        </div>
    );
};

// Summary for Competitor Analysis
const CompetitorAnalysisSummary: React.FC<{ activities: UserActivity[] }> = ({ activities }) => {
    const competitors = activities
        .flatMap(a => a.details?.competitorUrls || [])
        .filter(Boolean);
        
    if (competitors.length === 0) return null;
    
    const competitorCounts = competitors.reduce((acc, url) => {
        try {
            const hostname = new URL(url).hostname;
            acc[hostname] = (acc[hostname] || 0) + 1;
        } catch (e) {
            // Ignore invalid URLs
        }
        return acc;
    }, {} as Record<string, number>);
    
    const topCompetitors = Object.entries(competitorCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);
        
    return (
         <div>
            <h4 className="font-semibold text-sm mb-2">Most Analyzed Competitors:</h4>
            <ul className="space-y-1">
                {topCompetitors.map(([hostname, count]) => (
                     <li key={hostname} className="text-xs flex justify-between">
                        <span>{hostname}</span>
                        <span className="font-bold">{count} times</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};


// Summary for Content Brief
const ContentBriefSummary: React.FC<{ activities: UserActivity[] }> = ({ activities }) => {
    const keywords = activities
        .map(a => a.details?.keyword)
        .filter(Boolean);

    if (keywords.length === 0) return null;
    
    const keywordCounts = keywords.reduce((acc, keyword) => {
        acc[keyword] = (acc[keyword] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const topKeywords = Object.entries(keywordCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    return (
        <div>
            <h4 className="font-semibold text-sm mb-2">Recent Briefs Generated For:</h4>
            <div className="flex flex-wrap gap-2">
                {topKeywords.map(([keyword]) => (
                    <Badge key={keyword} variant="outline">{keyword}</Badge>
                ))}
            </div>
        </div>
    );
};
