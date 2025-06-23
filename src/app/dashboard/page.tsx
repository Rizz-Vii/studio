
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { BarChartBig, Users, Activity, TrendingUp, CheckCircle, AlertTriangle, TrafficCone, Link as LinkIcon, ScanText, ArrowRight } from "lucide-react";
import useProtectedRoute from '@/hooks/useProtectedRoute';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";


interface MetricCardProps {
  title: string;
  value: string;
  description?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
  detailedDescription: string;
}
interface UserActivity {
  query: string;
  tool: string;
  type: string;
  timestamp: any;
  details: any;
  resultsSummary?: string;
}
interface DashboardProfileData {
    displayName?: string;
    targetWebsite?: string;
    primaryKeywords?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, description, icon: Icon, trend, trendValue, className }) => {
  const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground';
  return (
    <Card className={cn("shadow-lg hover:shadow-xl hover:bg-primary-hover transition-all duration-300", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium font-body">{title}</CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold font-headline">{value}</div>
        {description && <p className="text-xs text-muted-foreground pt-1 font-body">{description}</p>}
        {trend && trendValue && (
          <p className={`text-xs ${trendColor} pt-1 font-body flex items-center`}>
            {trend === 'up' ? <TrendingUp className="h-4 w-4 mr-1" /> : trend === 'down' ? <TrendingUp className="h-4 w-4 mr-1 transform rotate-180" /> : null}
            {trendValue}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default function DashboardPage() {
  const [seoMetrics, setSeoMetrics] = useState([
    { title: "Overall SEO Score", value: "N/A", description: "Based on recent audit", icon: CheckCircle, trend: 'neutral', trendValue: '', detailedDescription: "This score is a cumulative measure of your site's technical health, content relevance, and backlink authority. It's calculated based on the latest data from our SEO Audit tool. A higher score indicates better overall SEO performance." },
    { title: "Tracked Keywords", value: "N/A", description: "Keywords analyzed", icon: BarChartBig, trend: 'neutral', trendValue: '', detailedDescription: "This is the total number of unique keywords you have analyzed using our Keyword Tool. Tracking more relevant keywords helps you understand your visibility across a broader range of search queries." },
    { title: "Organic Traffic", value: "N/A", description: "Data from connected analytics", icon: TrafficCone, trend: 'neutral', trendValue: '', detailedDescription: "Represents the number of visitors who arrived at your site from a search engine, excluding paid ads. This metric requires connecting your web analytics platform (e.g., Google Analytics). Higher organic traffic is a key indicator of strong SEO." },
    { title: "Referring Domains", value: "N/A", description: "From backlink analysis", icon: LinkIcon, trend: 'neutral', trendValue: '', detailedDescription: "The total number of unique domains that have at least one link pointing to your website. A higher number of quality referring domains is a strong signal to search engines that your site is authoritative." },
    { title: "Critical Issues", value: "N/A", description: "From technical audit", icon: AlertTriangle, trend: 'neutral', trendValue: '', detailedDescription: "These are high-priority technical problems found during the SEO Audit, such as server errors (5xx), broken critical pages, or major indexing issues. Resolving these should be your top priority." },
    { title: "Content Performance", value: "N/A", description: "Average content score", icon: ScanText, trend: 'neutral', trendValue: '', detailedDescription: "This is the average score of all pages analyzed with our Content Optimization tool. It reflects how well your content is optimized for readability, keyword density, and semantic relevance." },
  ]);

  const { user, loading: authLoading } = useProtectedRoute();
  const { user: currentUser } = useAuth();

  const [dashboardProfile, setDashboardProfile] = useState<DashboardProfileData | null>(null);
  const [recentActivities, setRecentActivities] = useState<UserActivity[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) {
        setLoadingData(false);
        return;
      }

      try {
        // Fetch user profile data
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setDashboardProfile(userDocSnap.data() as DashboardProfileData);
        }

        // Fetch recent activities
        const activitiesCollectionRef = collection(db, "users", currentUser.uid, "activities");
        const recentActivitiesQuery = query(activitiesCollectionRef, orderBy("timestamp", "desc"), limit(5));
        const activitiesSnapshot = await getDocs(recentActivitiesQuery);
        const activitiesData = activitiesSnapshot.docs.map(doc => doc.data() as UserActivity);
        setRecentActivities(activitiesData);

        // --- Process activities to update metrics ---
        let latestOverallScore: string | undefined;
        let latestContentScore: string | undefined;
        let totalKeywordsAnalyzed = 0;
        let latestReferringDomains: string | undefined;
        let latestCriticalIssues: string | undefined;

        activitiesData.forEach(activity => {
          if (activity.type === 'content_analysis' && activity.resultsSummary) {
             const scoreMatch = activity.resultsSummary.match(/Score: (\d+)\/100/);
             if (scoreMatch && scoreMatch[1]) {
                latestContentScore = `${scoreMatch[1]}/100`;
             }
          } else if (activity.type === 'keyword_search' && activity.details?.topic) {
            totalKeywordsAnalyzed += 1;
          }
        });

        setSeoMetrics(prevMetrics => prevMetrics.map(metric => {
            if (metric.title === "Content Performance" && latestContentScore !== undefined) {
                return { ...metric, value: latestContentScore };
            }
             if (metric.title === "Tracked Keywords" && totalKeywordsAnalyzed > 0) {
                return { ...metric, value: totalKeywordsAnalyzed.toString(), description: "Keyword searches performed" };
            }
            return metric;
        }));
        // --- End processing activities ---

      } catch (err: any) {
        console.error("Error fetching dashboard data:", err.message);
        setError("Error loading dashboard data.");
      } finally {
        setLoadingData(false);
      }
    };

    if (!authLoading && currentUser) {
      fetchData();
    }

  }, [authLoading, currentUser]);

  if (authLoading || loadingData) {
    return <div>Loading dashboard...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!user) {
      return null;
  }
  return (
   <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <h1 className="text-2xl font-bold mb-4">
        Welcome, {dashboardProfile?.displayName || currentUser.email}!
      </h1>

      {/* Display Profile-Relevant Data */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Your SEO Focus</h2>
        {dashboardProfile?.targetWebsite && (
          <p><strong>Target Website:</strong> {dashboardProfile.targetWebsite}</p>
        )}
        {dashboardProfile?.primaryKeywords && (
          <p><strong>Primary Keywords:</strong> {dashboardProfile.primaryKeywords}</p>
        )}
        {!dashboardProfile?.targetWebsite && !dashboardProfile?.primaryKeywords && (
            <p>Go to your Profile to set your SEO focus!</p>
        )}
      </div>

      {/* Display Most Recent Activity */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Most Recent Activity</h2>
        {recentActivities.length > 0 ? (
          <div className="p-3 border rounded bg-gray-50">
            <strong>{recentActivities[0].tool}:</strong> {recentActivities[0].type} on {recentActivities[0].timestamp ? new Date(recentActivities[0].timestamp.toDate()).toLocaleString() : 'N/A'}
            {recentActivities[0].resultsSummary && <p className="text-sm text-gray-600">Summary: {recentActivities[0].resultsSummary}</p>}
          </div>
        ) : (
          <p>No recent activity yet. Try using the tools!</p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {seoMetrics.map((metric) => (
          <Dialog key={metric.title}>
            <DialogTrigger asChild>
              <div className="h-full">
                <MetricCard
                  title={metric.title}
                  value={metric.value}
                  description={metric.description}
                  icon={metric.icon}
                  trend={metric.trend as 'up' | 'down' | 'neutral' | undefined}
                  trendValue={metric.trendValue}
                  className="cursor-pointer h-full"
                  detailedDescription={metric.detailedDescription}
                />
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 font-headline">
                  <metric.icon className="h-6 w-6 text-primary" />
                  {metric.title}
                </DialogTitle>
                <DialogDescription className="pt-4 font-body text-base">
                  {metric.detailedDescription}
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Keyword Ranking Distribution</CardTitle>
            <CardDescription className="font-body">Breakdown of keywords by ranking position.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder for a chart */}
            <div className="h-64 bg-muted rounded-md flex items-center justify-center">
              <BarChartBig className="h-16 w-16 text-muted-foreground" />
              <p className="text-muted-foreground ml-2 font-body">Ranking Distribution Chart Area</p>
            </div>
            {/* This should also be updated with real data */}
            <p className="text-xs text-muted-foreground pt-2 font-body">Top 3: N/A | Top 10: N/A | Top 50: N/A</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline">Recent Activity Feed</CardTitle>
            <CardDescription className="font-body">Latest updates and alerts from your tools.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 flex-grow">
            {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                    <Dialog key={index}>
                        <DialogTrigger asChild>
                            <div className="flex items-start space-x-3 p-2 rounded-md hover:bg-primary-hover cursor-pointer transition-colors">
                                <Activity className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                                <div className="flex-grow overflow-hidden">
                                    <p className="text-sm font-medium font-body capitalize">{activity.tool}: {activity.type.replace(/_/g, ' ')}</p>
                                    <p className="text-xs text-muted-foreground font-body truncate" title={activity.resultsSummary}>
                                        {activity.resultsSummary}
                                    </p>
                                    <p className="text-xs text-muted-foreground font-body">{activity.timestamp ? new Date(activity.timestamp.toDate()).toLocaleString() : 'N/A'}</p>
                                </div>
                            </div>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle className="font-headline flex items-center gap-2">
                                    <Activity className="h-6 w-6 text-primary" />
                                    Activity Details
                                </DialogTitle>
                                <DialogDescription className="font-body pt-2">
                                    Details for your recent activity from {activity.timestamp ? new Date(activity.timestamp.toDate()).toLocaleString() : 'N/A'}.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="font-body space-y-3 py-4">
                                <p><strong>Tool:</strong> {activity.tool}</p>
                                <p><strong>Action:</strong> <span className="capitalize">{activity.type.replace(/_/g, ' ')}</span></p>

                                {activity.type === 'keyword_search' && activity.details && (
                                    <div className="pt-2 border-t mt-2">
                                        <h4 className="font-semibold mb-1">Details</h4>
                                        <p><strong>Topic:</strong> {activity.details.topic}</p>
                                        <p><strong>Included Long-Tail:</strong> {activity.details.includeLongTailKeywords ? 'Yes' : 'No'}</p>
                                    </div>
                                )}
                                {activity.type === 'content_analysis' && activity.details && (
                                    <div className="pt-2 border-t mt-2">
                                        <h4 className="font-semibold mb-1">Details</h4>
                                        <p><strong>Target Keywords:</strong> {activity.details.targetKeywords}</p>
                                    </div>
                                )}
                                {activity.type === 'seo_audit' && activity.details && (
                                    <div className="pt-2 border-t mt-2">
                                        <h4 className="font-semibold mb-1">Details</h4>
                                        <p><strong>Audited URL:</strong> <a href={activity.details.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{activity.details.url}</a></p>
                                        <p><strong>Overall Score:</strong> {activity.details.overallScore}/100</p>
                                        <p><strong>Critical Issues:</strong> {activity.details.criticalIssuesCount}</p>
                                        <p><strong>Warnings:</strong> {activity.details.warningIssuesCount}</p>
                                    </div>
                                )}
                                {activity.resultsSummary && (
                                    <div className="pt-2 border-t mt-2">
                                        <h4 className="font-semibold mb-1">Result Summary</h4>
                                        <p>{activity.resultsSummary}</p>
                                    </div>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                ))
            ) : (
                <p className="text-sm text-muted-foreground font-body text-center pt-4">No recent activity to display.</p>
            )}
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/activity">
                 View All Activity <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
