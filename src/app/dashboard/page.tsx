
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ArrowRight, BarChart3, CheckCircle, AlertTriangle, TrafficCone, Link as LinkIcon, ScanText, Activity } from "lucide-react";
import useProtectedRoute from '@/hooks/useProtectedRoute';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { BarChart, Bar, Line, LineChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";
import LoadingScreen from '@/components/ui/loading-screen';


interface MetricCardProps {
  title: string;
  value: string;
  description?: string;
  icon: React.ElementType;
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

const MetricCard: React.FC<MetricCardProps> = ({ title, value, description, icon: Icon, className, detailedDescription }) => {
  return (
    <Dialog>
        <DialogTrigger asChild>
          <Card className={cn("group shadow-lg hover:shadow-xl hover:bg-accent hover:text-accent-foreground transition-all duration-300 cursor-pointer h-full", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-body group-hover:text-inherit">{title}</CardTitle>
              <Icon className="h-6 w-6 text-muted-foreground group-hover:text-inherit" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-headline group-hover:text-inherit">{value}</div>
              {description && <p className="text-xs text-muted-foreground pt-1 font-body group-hover:text-inherit">{description}</p>}
            </CardContent>
          </Card>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-headline text-2xl">
              <Icon className="h-6 w-6 text-primary" />
              {title}
            </DialogTitle>
            <DialogDescription className="pt-4 font-body text-base">
              {detailedDescription}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
  );
};


const rankingData = [
    { name: 'Top 3', value: 45 },
    { name: 'Top 10', value: 150 },
    { name: 'Top 50', value: 600 },
    { name: '51-100', value: 455 },
];

const trafficData = [
  { month: 'Jan', traffic: 12403, projection: null },
  { month: 'Feb', traffic: 13500, projection: null },
  { month: 'Mar', traffic: 14200, projection: null },
  { month: 'Apr', traffic: 15100, projection: 15100 }, // Start projection from last actual data point
  { month: 'May', traffic: null, projection: 16000 },
  { month: 'Jun', traffic: null, projection: 17200 },
];

const chartConfig = {
  value: { label: "Keywords" },
  traffic: { label: "Traffic", color: "hsl(var(--chart-1))" },
  projection: { label: "Projection", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;

export default function DashboardPage() {
  const [seoMetrics, setSeoMetrics] = useState([
    { title: "Overall SEO Score", value: "N/A", description: "Based on recent audit", icon: CheckCircle, detailedDescription: "This score is a cumulative measure of your site's technical health, content relevance, and backlink authority. It's calculated based on the latest data from our SEO Audit tool. A higher score indicates better overall SEO performance." },
    { title: "Tracked Keywords", value: "N/A", description: "Keywords analyzed", icon: BarChart3, detailedDescription: "This is the total number of unique keywords you have analyzed using our Keyword Tool. Tracking more relevant keywords helps you understand your visibility across a broader range of search queries." },
    { title: "Organic Traffic", value: "N/A", description: "Data from connected analytics", icon: TrafficCone, detailedDescription: "Represents the number of visitors who arrived at your site from a search engine, excluding paid ads. This metric requires connecting your web analytics platform (e.g., Google Analytics). Higher organic traffic is a key indicator of strong SEO." },
    { title: "Referring Domains", value: "N/A", description: "From backlink analysis", icon: LinkIcon, detailedDescription: "The total number of unique domains that have at least one link pointing to your website. A higher number of quality referring domains is a strong signal to search engines that your site is authoritative." },
    { title: "Critical Issues", value: "N/A", description: "From technical audit", icon: AlertTriangle, detailedDescription: "These are high-priority technical problems found during the SEO Audit, such as server errors (5xx), broken critical pages, or major indexing issues. Resolving these should be your top priority." },
    { title: "Content Performance", value: "N/A", description: "Average content score", icon: ScanText, detailedDescription: "This is the average score of all pages analyzed with our Content Optimization tool. It reflects how well your content is optimized for readability, keyword density, and semantic relevance." },
  ]);

  const { user: currentUser, loading: authLoading, profile } = useProtectedRoute();

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
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setDashboardProfile(userDocSnap.data() as DashboardProfileData);
        }

        const activitiesCollectionRef = collection(db, "users", currentUser.uid, "activities");
        const recentActivitiesQuery = query(activitiesCollectionRef, orderBy("timestamp", "desc"), limit(20));
        const activitiesSnapshot = await getDocs(recentActivitiesQuery);
        const activitiesData = activitiesSnapshot.docs.map(doc => doc.data() as UserActivity);
        setRecentActivities(activitiesData.slice(0, 5)); // Show only 5 in the feed

        let totalKeywordsAnalyzed = 0;
        let contentScores: number[] = [];
        const latestAudit = activitiesData.find(act => act.type === 'seo_audit');

        activitiesData.forEach(activity => {
          if (activity.type === 'content_analysis' && activity.details?.overallScore) {
            contentScores.push(activity.details.overallScore);
          } else if (activity.type === 'keyword_search') {
            totalKeywordsAnalyzed++;
          }
        });

        setSeoMetrics(prevMetrics => prevMetrics.map(metric => {
            if (metric.title === "Overall SEO Score" && latestAudit?.details.overallScore) {
                return { ...metric, value: `${latestAudit.details.overallScore}/100` };
            }
            if (metric.title === "Critical Issues" && latestAudit?.details.criticalIssuesCount !== undefined) {
                return { ...metric, value: latestAudit.details.criticalIssuesCount.toString() };
            }
            if (metric.title === "Content Performance" && contentScores.length > 0) {
                const avgScore = contentScores.reduce((a, b) => a + b, 0) / contentScores.length;
                return { ...metric, value: `${Math.round(avgScore)}/100` };
            }
            if (metric.title === "Tracked Keywords" && totalKeywordsAnalyzed > 0) {
                return { ...metric, value: totalKeywordsAnalyzed.toString(), description: "Keyword searches performed" };
            }
            return metric;
        }));

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
    return <LoadingScreen />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!currentUser) {
      return null;
  }
  return (
   <div className="max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-headline font-semibold text-foreground">
        Welcome, {profile?.displayName || currentUser.email}!
      </h1>
      <p className="text-muted-foreground font-body">Here's your SEO command center. Monitor key metrics, review recent activity, and discover AI-powered insights to guide your strategy.</p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {seoMetrics.map((metric) => (
            <MetricCard
              key={metric.title}
              title={metric.title}
              value={metric.value}
              description={metric.description}
              icon={metric.icon}
              className="h-full"
              detailedDescription={metric.detailedDescription}
            />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="shadow-lg lg:col-span-4">
            <CardHeader>
                <CardTitle className="font-headline">Organic Traffic Projection</CardTitle>
                <CardDescription className="font-body">Simulated monthly traffic based on current trends. Connect your analytics for real data.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                  <ResponsiveContainer>
                    <LineChart data={trafficData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} className="text-xs font-body"/>
                      <YAxis tickFormatter={(value) => value.toLocaleString()} className="text-xs" />
                      <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                      <Line type="monotone" dataKey="traffic" stroke="var(--color-traffic)" strokeWidth={2} dot={true} />
                      <Line type="monotone" dataKey="projection" stroke="var(--color-projection)" strokeWidth={2} strokeDasharray="5 5" />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
        <Card className="shadow-lg lg:col-span-3 flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline">Recent Activity</CardTitle>
            <CardDescription className="font-body">Your latest actions across the platform.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 flex-grow">
            {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                    <Dialog key={index}>
                        <DialogTrigger asChild>
                            <div className="group flex items-start space-x-3 p-2 rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors">
                                <Activity className="h-6 w-6 text-primary mt-1 flex-shrink-0 group-hover:text-inherit" />
                                <div className="flex-grow overflow-hidden">
                                    <p className="text-sm font-medium font-body capitalize">
                                        {activity.tool}: {activity.type.replace(/_/g, ' ')}
                                    </p>
                                    <p className="text-xs text-muted-foreground font-body truncate group-hover:text-inherit" title={activity.resultsSummary ?? ''}>
                                        {activity.resultsSummary}
                                    </p>
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

    