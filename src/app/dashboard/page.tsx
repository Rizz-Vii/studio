
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  KeyRound,
  ScanText,
  Users,
  ListChecks,
  Activity,
  BookText,
  Link as LinkIcon,
  ChevronLeft, 
  ChevronRight,
} from "lucide-react";
import useProtectedRoute from '@/hooks/useProtectedRoute';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import LoadingScreen from '@/components/ui/loading-screen';
import { format, formatDistanceToNow } from 'date-fns';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { dummyContentBriefs, ContentBrief } from '@/lib/dummy-data';


// ----- TYPES AND CONFIGS -----

interface UserActivity {
  id: string;
  type: string;
  tool: string;
  timestamp: any; // Firestore Timestamp
  details?: any;
  resultsSummary?: string;
}

type GroupedActivities = Record<string, UserActivity[]>;

const toolConfig: Record<string, { icon: React.ElementType; color: string }> = {
  "SEO Audit": { icon: ListChecks, color: "text-blue-500" },
  "Keyword Tool": { icon: KeyRound, color: "text-green-500" },
  "Content Analyzer": { icon: ScanText, color: "text-purple-500" },
  "Competitor Analysis": { icon: Users, color: "text-orange-500" },
  "Content Brief": { icon: BookText, color: "text-indigo-500" },
  "Link View": { icon: LinkIcon, color: "text-teal-500" },
  "Default": { icon: Activity, color: "text-gray-500" },
};

const chartConfig = {
  score: { label: "Score", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;


// ----- HELPER & SUMMARY COMPONENTS -----

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
         <div className="aspect-video w-full">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer>
                <LineChart data={auditData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} />
                  <XAxis dataKey="date" tickFormatter={(time) => format(time, 'MMM d')} className="text-xs"/>
                  <YAxis domain={[0, 100]} className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent indicator="line" labelFormatter={(label) => format(new Date(label), 'PPp')} formatter={(value) => `${value}/100`} />} />
                  <Line type="monotone" dataKey="score" stroke="var(--color-score)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
         </div>
      )}
    </div>
  );
};

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
                    <Badge key={topic} variant="secondary" className="transition-transform hover:scale-105">{topic} ({count})</Badge>
                ))}
            </div>
        </div>
    );
};

const CompetitorAnalysisSummary: React.FC<{ activities: UserActivity[] }> = ({ activities }) => {
    const competitors = activities
        .flatMap(a => a.details?.competitors || [])
        .filter(Boolean)
        .map(url => {
            try {
                return new URL(url).hostname;
            } catch (e) {
                return url.length > 30 ? url.substring(0, 27) + '...' : url;
            }
        });

    if (competitors.length === 0) {
        return (
            <div>
                <p className="text-sm text-muted-foreground">No recent competitor analyses.</p>
            </div>
        );
    }
    
    const competitorCounts = competitors.reduce((acc, competitor) => {
        if(competitor) {
            acc[competitor] = (acc[competitor] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    const topCompetitors = Object.entries(competitorCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    return (
        <div>
            <h4 className="font-semibold text-sm mb-2">Most Analyzed Competitors:</h4>
            <div className="flex flex-wrap gap-2">
                {topCompetitors.map(([competitor, count]) => (
                    <Badge key={competitor} variant="secondary" className="transition-transform hover:scale-105">{competitor} ({count})</Badge>
                ))}
            </div>
        </div>
    );
};

const ContentBriefSummary: React.FC<{ profile: any | null }> = ({ profile }) => {
    const profileKeywords = profile?.primaryKeywords?.split(',').map((k: string) => k.trim().toLowerCase()) || [];
    
    const prioritizedBriefs = [
      ...dummyContentBriefs.filter(brief => profileKeywords.includes(brief.primaryKeyword.toLowerCase())),
      ...dummyContentBriefs.filter(brief => !profileKeywords.includes(brief.primaryKeyword.toLowerCase()))
    ];
    
    const uniqueBriefs = Array.from(new Map(prioritizedBriefs.map(item => [item.id, item])).values());

    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (uniqueBriefs.length <= 3) return;

        const interval = setInterval(() => {
            setIndex(prevIndex => (prevIndex + 1) % uniqueBriefs.length);
        }, 5000); // Rotate every 5 seconds
        return () => clearInterval(interval);
    }, [uniqueBriefs.length]);

    if (uniqueBriefs.length === 0) {
        return <p className="text-sm text-muted-foreground">Generate a content brief to see suggestions here.</p>;
    }

    const slide = (direction: 'next' | 'prev') => {
        const total = uniqueBriefs.length;
        if (direction === 'next') {
            setIndex((prev) => (prev + 1) % total);
        } else {
            setIndex((prev) => (prev - 1 + total) % total);
        }
    };
    
    const getVisibleBriefs = () => {
        const total = uniqueBriefs.length;
        if (total <= 3) return uniqueBriefs;
        
        const items: ContentBrief[] = [];
        for (let i = 0; i < 3; i++) {
            items.push(uniqueBriefs[(index + i) % total]);
        }
        return items;
    }

    const sliderVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 100 : -100,
            opacity: 0,
            scale: 0.8,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1,
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 100 : -100,
            opacity: 0,
            scale: 0.8,
        }),
    };

    return (
        <div>
            <h4 className="font-semibold text-sm mb-2">Relevant Briefs For You:</h4>
            <div className="relative h-28 flex items-center justify-center -mx-2">
                 {uniqueBriefs.length > 3 && (
                    <Button variant="ghost" size="icon" className="absolute left-0 z-10" onClick={() => slide('prev')}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                 )}
                 <div className="flex space-x-2 w-full justify-center">
                    <AnimatePresence initial={false}>
                        {getVisibleBriefs().map((brief, i) => (
                             <motion.div
                                key={`${index}-${brief.id}`}
                                custom={i}
                                variants={sliderVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                                className="w-1/3"
                            >
                                <Card className="h-24 flex items-center justify-center p-2 text-center shadow-md bg-muted/50 hover:bg-muted transition-colors">
                                    <CardContent className="p-0">
                                        <p className="text-xs font-semibold font-body truncate">{brief.title}</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                 </div>
                 {uniqueBriefs.length > 3 && (
                    <Button variant="ghost" size="icon" className="absolute right-0 z-10" onClick={() => slide('next')}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
};

const LinkViewSummary: React.FC<{ activities: UserActivity[] }> = ({ activities }) => {
    const domains = activities
        .map(a => a.details?.url)
        .filter(Boolean)
        .map(url => {
            try {
                return new URL(url).hostname;
            } catch (e) {
                return null;
            }
        })
        .filter(Boolean);

    if (domains.length === 0) return null;
    
    const domainCounts = domains.reduce((acc, domain) => {
        if(domain) {
            acc[domain] = (acc[domain] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    const topDomains = Object.entries(domainCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    return (
        <div>
            <h4 className="font-semibold text-sm mb-2">Most Analyzed Domains:</h4>
            <div className="flex flex-wrap gap-2">
                {topDomains.map(([domain, count]) => (
                    <Badge key={domain} variant="secondary" className="transition-transform hover:scale-105">{domain} ({count})</Badge>
                ))}
            </div>
        </div>
    );
};

const toolSummaryComponents: Record<string, React.FC<{ activities: UserActivity[]; profile?: any | null }>> = {
  "SEO Audit": SeoAuditSummary,
  "Content Analyzer": ContentAnalyzerSummary,
  "Keyword Tool": KeywordToolSummary,
  "Competitor Analysis": CompetitorAnalysisSummary,
  "Content Brief": ContentBriefSummary,
  "Link View": LinkViewSummary,
};


// ----- MAIN COMPONENT -----

export default function DashboardPage() {
  const { user: currentUser, loading: authLoading, profile } = useProtectedRoute();
  
  const [groupedActivities, setGroupedActivities] = useState<GroupedActivities>({});
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      if (currentUser) {
        setLoadingData(true);
        const activitiesRef = collection(db, "users", currentUser.uid, "activities");
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
  }, [currentUser, authLoading]);

  if (authLoading || loadingData) {
    return <LoadingScreen />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-headline font-semibold text-foreground">
        Welcome, {profile?.displayName || currentUser?.email}!
      </h1>
      <p className="text-muted-foreground font-body">Here's your SEO command center. Monitor key metrics and review your activity across all tools.</p>
      
      {Object.keys(groupedActivities).length > 0 ? (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {Object.entries(groupedActivities).map(([tool, activities]) => {
            const ToolSummary = toolSummaryComponents[tool];
            const config = toolConfig[tool] || toolConfig["Default"];
            const Icon = config.icon;

            return (
                <Dialog key={tool}>
                    <DialogTrigger asChild>
                        <Card className="shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col cursor-pointer">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="font-headline flex items-center gap-2">
                                        <Icon className={`h-6 w-6 ${config.color}`} />
                                        {tool}
                                    </CardTitle>
                                    <Badge variant="outline" className="text-xs">{activities.length} {activities.length === 1 ? 'Activity' : 'Activities'}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-grow space-y-4 pt-4">
                                {ToolSummary && <ToolSummary activities={activities} profile={profile} />}
                            </CardContent>
                        </Card>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                        <DialogHeader>
                            <DialogTitle className="font-headline flex items-center gap-2 text-2xl">
                                <Icon className={`h-6 w-6 ${config.color}`} />
                                {tool} Activity Log
                            </DialogTitle>
                            <DialogDescription>A detailed log of your recent activity using this tool.</DialogDescription>
                        </DialogHeader>
                        <div className="max-h-[60vh] overflow-y-auto pr-4">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead>Details</TableHead>
                                        <TableHead className="w-[180px] text-right">Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {activities.map((activity) => (
                                        <TableRow key={activity.id}>
                                            <TableCell className="font-medium font-body">{activity.resultsSummary || activity.type}</TableCell>
                                            <TableCell className="text-right text-muted-foreground font-body">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            {formatDistanceToNow(activity.timestamp.toDate(), { addSuffix: true })}
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            {format(activity.timestamp.toDate(), 'PPpp')}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </DialogContent>
                </Dialog>
            );
          })}
        </div>
      ) : (
        <Card className="shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <CardContent className="p-10 text-center">
            <h3 className="text-xl font-headline mb-2">No Activity Yet</h3>
            <p className="font-body text-muted-foreground">Start using the tools to see your activity summary here.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
