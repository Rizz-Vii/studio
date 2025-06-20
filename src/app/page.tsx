'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChartBig, Users, Activity, TrendingUp, CheckCircle, AlertTriangle, TrafficCone, Link as LinkIcon, ScanText } from "lucide-react";
import useProtectedRoute from '@/hooks/useProtectedRoute';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore'; // Import doc and getDoc

interface MetricCardProps {
  title: string;
  value: string;
  description?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}
interface UserActivity {
  query: string;
  tool: string;
  timestamp: any; // Firestore Timestamp
  details: any; // Details of the activity
  resultsSummary?: string; // Optional summary
}
interface DashboardProfileData {
    displayName?: string;
    targetWebsite?: string;
    primaryKeywords?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, description, icon: Icon, trend, trendValue }) => {
  const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground';
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
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
  const seoMetrics = [
    { title: "Overall SEO Score", value: "85/100", description: "Based on recent audit", icon: CheckCircle, trend: 'up', trendValue: '+5 pts since last week' },
    { title: "Tracked Keywords", value: "1,250", description: "45 in Top 3", icon: BarChartBig, trend: 'up', trendValue: '+120 keywords' },
    { title: "Organic Traffic", value: "12,403", description: "Last 30 days", icon: TrafficCone, trend: 'down', trendValue: '-2.5% vs previous period' },
    { title: "Referring Domains", value: "320", description: "Total unique domains", icon: LinkIcon, trend: 'up', trendValue: '+15 new domains' },
    { title: "Critical Issues", value: "5", description: "From technical audit", icon: AlertTriangle, trend: 'neutral', trendValue: '2 fixed this week' },
    { title: "Content Performance", value: "7.8/10", description: "Average content score", icon: ScanText, trend: 'up', trendValue: '+0.3 pts average' },
  ];
  const { user, loading: authLoading } = useProtectedRoute();
  const { user: currentUser } = useAuth();

  const [dashboardProfile, setDashboardProfile] = useState<DashboardProfileData | null>(null);
  const [recentActivities, setRecentActivities] = useState<UserActivity[]>([]); // Change from recentSearches
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
        const recentActivitiesQuery = query(activitiesCollectionRef, orderBy("timestamp", "desc"), limit(5)); // Fetch last 5 activities
        const activitiesSnapshot = await getDocs(recentActivitiesQuery);
        const activitiesData = activitiesSnapshot.docs.map(doc => doc.data() as UserActivity);
        setRecentActivities(activitiesData); // Set recentActivities

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

  }, [authLoading, currentUser]); // Rerun effect when auth state changes

  if (authLoading || loadingData) {
    return <div>Loading dashboard...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!user) {
      return null; // Redirect handled by useProtectedRoute
  }
  return (
   <div className="p-4 md:p-6 lg:p-8">
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


      {/* Display Recent Activity */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Recent Activity</h2>
        {recentActivities.length > 0 ? (
          <ul className="space-y-2">
            {recentActivities.map((activity, index) => (
              <li key={index} className="p-3 border rounded bg-gray-50">
                <strong>{activity.tool}:</strong> {activity.type} on {activity.timestamp ? new Date(activity.timestamp.toDate()).toLocaleString() : 'N/A'}
                {/* You can display details or summary here */}
                {activity.details?.query && <p className="text-sm text-gray-600">Query: {activity.details.query}</p>}
                {activity.resultsSummary && <p className="text-sm text-gray-600">Summary: {activity.resultsSummary}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p>No recent activity yet. Try using the tools!</p>
        )}
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {seoMetrics.map((metric) => (
          <MetricCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            description={metric.description}
            icon={metric.icon}
            trend={metric.trend as 'up' | 'down' | 'neutral' | undefined}
            trendValue={metric.trendValue}
          />
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
            <p className="text-xs text-muted-foreground pt-2 font-body">Top 3: 45 | Top 10: 150 | Top 50: 600</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Recent Activity</CardTitle>
            <CardDescription className="font-body">Latest updates and alerts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start space-x-3">
              <Activity className="h-5 w-5 text-primary mt-1" />
              <div>
                <p className="text-sm font-medium font-body">New keyword "AI SEO tools" entered Top 10.</p>
                <p className="text-xs text-muted-foreground font-body">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
              <div>
                <p className="text-sm font-medium font-body">Technical audit completed for example.com.</p>
                <p className="text-xs text-muted-foreground font-body">1 day ago</p>
              </div>
            </div>
             <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-1" />
              <div>
                <p className="text-sm font-medium font-body">High bounce rate detected on /blog/article-1.</p>
                <p className="text-xs text-muted-foreground font-body">3 days ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
