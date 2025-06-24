// src/app/(app)/dashboard/page.tsx
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
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
  Rocket
} from "lucide-react";
import { useEffect, useState, useRef, useCallback } from 'react';
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
import Link from 'next/link';

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
  analyses: { label: "Analyses", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;


// ----- HELPER & SUMMARY COMPONENTS -----

const getProgressColor = (score: number) => {
    if (score > 85) return "bg-success";
    if (score > 60) return "bg-warning";
    return "bg-destructive";
};

const SeoAuditSummary: React.FC<{ activities: UserActivity[] }> = ({ activities }) => {
    const auditData = activities
        .map(a => ({
            score: a.details?.overallScore,
            date: a.timestamp.toDate(),
        }))
        .filter(a => typeof a.score === 'number')
        .reverse();

    if (auditData.length === 0) return <p className="text-sm text-muted-foreground font-body">No recent SEO audits.</p>;

    const avgScore = Math.round(auditData.reduce((sum, a) => sum + a.score, 0) / auditData.length);
  
    return (
        <div className="space-y-4">
            <div className="flex justify-around text-center border-b pb-3">
                <div>
                    <p className="text-2xl font-bold font-headline">{activities.length}</p>
                    <p className="text-xs text-muted-foreground font-body">Audits</p>
                </div>
                <div>
                    <p className="text-2xl font-bold font-headline">{avgScore}</p>
                    <p className="text-xs text-muted-foreground font-body">Avg Score</p>
                </div>
            </div>
            {auditData.length > 1 && (
                <div style={{ aspectRatio: '16 / 9' }}>
                    <ChartContainer config={chartConfig}>
                        <ResponsiveContainer>
                            <LineChart data={auditData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} />
                                <XAxis dataKey="date" tickFormatter={(time) => format(time, 'MMM d')} className="text-xs font-body"/>
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
    const scores = activities.map(a => a.details).filter(Boolean);

    if (scores.length === 0) {
        return <p className="text-sm text-muted-foreground font-body">No recent content analyses.</p>;
    }
    
    const calculateAverage = (key: string) => {
        const relevantScores = scores.map(s => s[key]).filter(v => typeof v === 'number');
        if (relevantScores.length === 0) return 0;
        return Math.round(relevantScores.reduce((a, b) => a + b, 0) / relevantScores.length);
    }
    
    const avgOverall = calculateAverage('overallScore');
    const avgReadability = calculateAverage('readabilityScore');
    const avgKeywords = calculateAverage('keywordScore');
    const avgSemantics = calculateAverage('semanticScore');

    return (
         <div className="space-y-4">
            <div className="flex justify-around text-center border-b pb-3">
                <div>
                    <p className="text-2xl font-bold font-headline">{activities.length}</p>
                    <p className="text-xs text-muted-foreground font-body">Analyses</p>
                </div>
                <div>
                    <p className="text-2xl font-bold font-headline">{avgOverall}</p>
                    <p className="text-xs text-muted-foreground font-body">Avg Score</p>
                </div>
            </div>
            
            <motion.div 
                className="space-y-3 pt-2"
                initial="hidden"
                animate="visible"
                variants={{
                    visible: { transition: { staggerChildren: 0.1 } },
                    hidden: {},
                }}
            >
                <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold font-body text-muted-foreground">Readability</span>
                        <span className="font-body">{avgReadability > 0 ? `${avgReadability}/100` : 'N/A'}</span>
                    </div>
                    <Progress value={avgReadability} indicatorClassName={getProgressColor(avgReadability)} />
                </motion.div>
                <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}>
                     <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold font-body text-muted-foreground">Keywords</span>
                        <span className="font-body">{avgKeywords > 0 ? `${avgKeywords}/100` : 'N/A'}</span>
                    </div>
                    <Progress value={avgKeywords} indicatorClassName={getProgressColor(avgKeywords)} />
                </motion.div>
                <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold font-body text-muted-foreground">Semantics</span>
                        <span className="font-body">{avgSemantics > 0 ? `${avgSemantics}/100` : 'N/A'}</span>
                    </div>
                    <Progress value={avgSemantics} indicatorClassName={getProgressColor(avgSemantics)} />
                </motion.div>
            </motion.div>
        </div>
    );
};

const KeywordToolSummary: React.FC<{ activities: UserActivity[] }> = ({ activities }) => {
    const topics = activities
        .map(a => a.details?.topic)
        .filter(Boolean);

    if (topics.length === 0) return <p className="text-sm text-muted-foreground font-body">No recent keyword research.</p>;
    
    const topicCounts = topics.reduce((acc, topic) => {
        acc[topic] = (acc[topic] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const topTopics = Object.entries(topicCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    return (
        <div>
            <h4 className="font-semibold text-sm mb-2 font-body">Top Searched Topics:</h4>
            <div className="flex flex-wrap gap-2">
                {topTopics.map(([topic, count]) => (
                    <Badge key={topic} variant="secondary" className="transition-transform hover:scale-105 font-body">{topic} ({count})</Badge>
                ))}
            </div>
        </div>
    );
};

const CompetitorAnalysisSummary: React.FC<{ activities: UserActivity[] }> = ({ activities }) => {
    const competitors = activities
        .flatMap(a => a.details?.competitorUrls || a.details?.competitors || [])
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
                <p className="text-sm text-muted-foreground font-body">No recent competitor analyses.</p>
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
            <h4 className="font-semibold text-sm mb-2 font-body">Most Analyzed Competitors:</h4>
            <div className="flex flex-wrap gap-2">
                {topCompetitors.map(([competitor, count]) => (
                    <Badge key={competitor} variant="secondary" className="transition-transform hover:scale-105 font-body">{competitor} ({count})</Badge>
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

    const [[index, direction], setPage] = useState([0, 0]);

    const wrappedIndex = (idx: number) => {
        return (idx % uniqueBriefs.length + uniqueBriefs.length) % uniqueBriefs.length;
    };

    const slide = useCallback((newDirection: number) => {
        setPage(([prevIndex, prevDirection]) => [prevIndex + newDirection, newDirection]);
    }, []);


    useEffect(() => {
        if (uniqueBriefs.length <= 4) return;

        const interval = setInterval(() => {
            slide(1); // Auto-slide next
        }, 5000); // Rotate every 5 seconds
        return () => clearInterval(interval);
    }, [uniqueBriefs.length, slide]);

    if (uniqueBriefs.length === 0) {
        return <p className="text-sm text-muted-foreground font-body">Generate a content brief to see suggestions here.</p>;
    }
    
    const getVisibleBriefs = () => {
        const total = uniqueBriefs.length;
        if (total <= 4) return uniqueBriefs;
        
        const items: ContentBrief[] = [];
        for (let i = 0; i < 4; i++) {
            items.push(uniqueBriefs[wrappedIndex(index + i)]);
        }
        return items;
    }

    const sliderVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? '100%' : '-100%',
            opacity: 0,
            scale: 1,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1,
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? '100%' : '-100%',
            opacity: 0,
            scale: 1,
        }),
    };

    return (
        <div>
            <h4 className="font-semibold text-sm mb-2 font-body">Relevant Briefs For You:</h4>
            <div className="relative h-[250px] overflow-hidden">
                 {uniqueBriefs.length > 4 && (
                    <Button variant="ghost" size="icon" className="absolute left-0 top-1/2 -translate-y-1/2 z-10" onClick={() => slide(-1)}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                 )}
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={index}
                        className="absolute inset-0 flex items-center justify-center space-x-2"
                        custom={direction}
                        variants={sliderVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 240, damping: 30 },
                            opacity: { duration: 0.2 }
                        }}
                    >
                    {getVisibleBriefs().map((brief) => (
                        <Link href="/content-brief" key={brief.id} className="block hover:no-underline">
                            <Card className="h-full w-[160px] flex flex-col shadow-md bg-muted/50 hover:bg-muted transition-colors overflow-hidden cursor-pointer">
                                <CardHeader className="p-3 pb-2">
                                    <CardTitle className="text-sm font-bold font-headline truncate" title={brief.title}>{brief.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-3 pt-0 flex-grow space-y-2 text-left">
                                    <Badge variant="secondary" className="font-body">{brief.primaryKeyword}</Badge>
                                    <div className="text-xs">
                                        <span className="font-semibold font-body">Intent:</span> <span className="font-body">{brief.searchIntent}</span>
                                    </div>
                                </CardContent>
                                <CardFooter className="p-3 pt-0">
                                    <div className="w-full">
                                        <span className="text-xs text-muted-foreground font-body">SEO Score: {brief.seoScore}</span>
                                        <Progress value={parseInt(brief.seoScore.split('/')[0])} className="h-2 mt-1" indicatorClassName={parseInt(brief.seoScore.split('/')[0]) > 80 ? "bg-green-500" : parseInt(brief.seoScore.split('/')[0]) > 60 ? "bg-yellow-500" : "bg-red-500"} />
                                    </div>
                                </CardFooter>
                            </Card>
                        </Link>
                    ))}
                    </motion.div>
                </AnimatePresence>
                 {uniqueBriefs.length > 4 && (
                    <Button variant="ghost" size="icon" className="absolute right-0 top-1/2 -translate-y-1/2 z-10" onClick={() => slide(1)}>
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

    if (domains.length === 0) return <p className="text-sm text-muted-foreground font-body">No recent link analyses.</p>;
    
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
            <h4 className="font-semibold text-sm mb-2 font-body">Most Analyzed Domains:</h4>
            <div className="flex flex-wrap gap-2">
                {topDomains.map(([domain, count]) => (
                    <Badge key={domain} variant="secondary" className="transition-transform hover:scale-105 font-body">{domain} ({count})</Badge>
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
  const { user: currentUser, profile } = useAuth();
  
  const [groupedActivities, setGroupedActivities] = useState<GroupedActivities>({});
  const [loadingData, setLoadingData] = useState(true);

  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  useEffect(() => {
    const fetchActivities = async () => {
      if (currentUser) {
        setLoadingData(true);
        const activitiesRef = collection(db, "users", currentUser.uid, "activities");
        const q = query(activitiesRef, orderBy("timestamp", "desc"));
        try {
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
        } catch (error) {
            console.error("Error fetching activities:", error);
        } finally {
            setLoadingData(false);
        }
      } else {
          setGroupedActivities({});
          setLoadingData(false);
      }
    };
    fetchActivities();
  }, [currentUser]);

  if (loadingData) {
      return <LoadingScreen />
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-headline font-semibold text-foreground">
        Welcome, {profile?.displayName || currentUser?.email}!
      </h1>
      <p className="text-muted-foreground font-body">Here's your SEO command center. Monitor key metrics and review your activity across all tools.</p>
      
      {Object.keys(groupedActivities).length > 0 ? (
        <motion.div 
            className="grid gap-6 md:grid-cols-1 lg:grid-cols-2"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
          {Object.entries(groupedActivities).map(([tool, activities]) => {
            const ToolSummary = toolSummaryComponents[tool];
            const config = toolConfig[tool] || toolConfig["Default"];
            const Icon = config.icon;

            return (
                <motion.div key={tool} variants={itemVariants}>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Card className="shadow-lg flex flex-col cursor-pointer h-full">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="font-headline flex items-center gap-2">
                                            <Icon className={`h-6 w-6 ${config.color}`} />
                                            {tool}
                                        </CardTitle>
                                        <Badge variant="outline" className="text-xs font-body">{activities.length} {activities.length === 1 ? 'Activity' : 'Activities'}</Badge>
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
                                <DialogDescription className="font-body">A detailed log of your recent activity using this tool.</DialogDescription>
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
                                                                {format(activity.timestamp.toDate(), 'PPp')}
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
                </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <Card className="shadow-lg">
          <CardContent className="p-10 text-center">
            <h3 className="text-xl font-headline mb-2">No Activity Yet</h3>
            <p className="font-body text-muted-foreground">Start using the tools to see your activity summary here.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
