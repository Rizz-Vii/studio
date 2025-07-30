// src/app/(app)/competitors/page.tsx
"use client";

import CompetitorAnalysisForm from "@/components/competitor-analysis-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import LoadingScreen from "@/components/ui/loading-screen";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { ACTIVITY_TYPES, TOOL_NAMES } from "@/lib/activity-types";
import { db } from "@/lib/firebase";
import type { NeuroSEOAnalysisRequest, NeuroSEOReport } from "@/lib/neuroseo";
import { TimeoutError } from "@/lib/timeout";
import { cn } from "@/lib/utils";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, BarChart3, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

const RankingsChart = ({
  rankings,
}: {
  rankings: CompetitorAnalysisOutput["rankings"];
}) => {
  if (!rankings || rankings.length === 0) return null;

  const firstKeywordData = rankings[0];
  const competitorUrls = Object.keys(firstKeywordData).filter(
    (k) => k !== "keyword" && k !== "yourRank"
  );

  const chartData = [
    {
      name: "Your Site",
      rank:
        typeof firstKeywordData.yourRank?.rank === "number"
          ? firstKeywordData.yourRank.rank
          : 101,
      fill: "hsl(var(--chart-1))",
    },
    ...competitorUrls.map((url, index) => {
      const competitorData = (firstKeywordData as any)[String(url)];
      return {
        name: new URL(String(url)).hostname,
        rank:
          typeof competitorData?.rank === "number" ? competitorData.rank : 101,
        fill: `hsl(var(--chart-${(index % 5) + 2}))`,
      };
    }),
  ];

  const chartConfig: ChartConfig = chartData.reduce((acc, item) => {
    acc[item.name] = { label: item.name, color: item.fill };
    return acc;
  }, {} as ChartConfig);

  return (
    <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <BarChart3 />
          Ranking Comparison for "{firstKeywordData.keyword}"
        </CardTitle>
        <CardDescription>
          Lower bars are better. Ranks of 101 indicate "N/A" or rank &gt; 100.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ left: 20, right: 20 }}
            >
              <CartesianGrid horizontal={false} />
              <YAxis
                dataKey="name"
                type="category"
                width={120}
                tickLine={false}
                axisLine={false}
                stroke="hsl(var(--foreground))"
                className="text-xs"
              />
              <XAxis
                dataKey="rank"
                type="number"
                domain={[0, 101]}
                reversed={true}
              />
              <ChartTooltip
                cursor={false}
                content={(props) => <ChartTooltipContent {...props} />}
              />
              <Bar dataKey="rank" radius={5} key="rank-bar" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

const CompetitorResults = ({
  results,
}: {
  results: CompetitorAnalysisOutput;
}) => {
  const competitorHeaders = Array.from(
    new Set(
      results.rankings.flatMap((r) =>
        Object.keys(r).filter((k) => k !== "keyword" && k !== "yourRank")
      )
    )
  );

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <RankingsChart rankings={results.rankings} />

      <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Users /> Keyword Rankings Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Keyword</TableHead>
                <TableHead className="text-center">Your Rank</TableHead>
                {competitorHeaders.map((url) => (
                  <TableHead
                    key={String(url)}
                    className="text-center truncate"
                    title={String(url)}
                  >
                    {new URL(String(url)).hostname}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.rankings.map((item) => (
                <TableRow key={item.keyword}>
                  <TableCell className="font-medium">{item.keyword}</TableCell>
                  <TableCell className="text-center">
                    {item.yourRank?.rank ?? "N/A"}
                  </TableCell>
                  {competitorHeaders.map((url) => (
                    <TableCell key={String(url)} className="text-center">
                      {(item as any)[String(url)]?.rank ?? "N/A"}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="font-headline">
            Content Gap Opportunities
          </CardTitle>
          <CardDescription>
            Keywords where competitors rank well but you don&apos;t.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {results.contentGaps.length > 0 ? (
            <ul className="list-disc pl-5 space-y-2">
              {results.contentGaps.map((gap) => (
                <li key={`gap-${gap.slice(0, 32)}`}>{gap}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">
              No significant content gaps found. Great job!
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function CompetitorsPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<CompetitorAnalysisOutput | null>(null);

  const { user } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<NeuroSEOReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentEngine, setCurrentEngine] = useState<string>("");
  const [completedEngines, setCompletedEngines] = useState<string[]>([]);

  // Form state
  const [yourUrl, setYourUrl] = useState("");
  const [competitorUrls, setCompetitorUrls] = useState("");
  const [targetKeywords, setTargetKeywords] = useState("");

  // Get user subscription tier for feature gating
  const userTier = (user as any)?.subscriptionTier || "free";

  const resultsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (report && !isAnalyzing && resultsRef.current) {
      resultsRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [report, isAnalyzing]);

  // Simulate analysis progress
  useEffect(() => {
    if (isAnalyzing) {
      const engines = ['neuralCrawler', 'aiVisibility', 'trustBlock', 'semanticMap', 'orchestrator'];
      let currentIndex = 0;

      const interval = setInterval(() => {
        if (currentIndex < engines.length) {
          setCurrentEngine(engines[currentIndex]);
          setAnalysisProgress((currentIndex + 1) * 20);
          if (currentIndex > 0) {
            setCompletedEngines(prev => [...prev, engines[currentIndex - 1]]);
          }
          currentIndex++;
        } else {
          setCompletedEngines(prev => [...prev, engines[engines.length - 1]]);
          setCurrentEngine("");
        }
      }, 3000);

      return () => clearInterval(interval);
    } else {
      setAnalysisProgress(0);
      setCurrentEngine("");
      setCompletedEngines([]);
    }
  }, [isAnalyzing]);

  const handleSubmit = async (values: CompetitorAnalysisInput) => {
    // Form values handled by form component

    if (!yourUrl.trim()) {
      setError("Please enter your website URL");
      return;
    }

    if (!competitorUrls.trim()) {
      setError("Please enter at least one competitor URL");
      return;
    }

    if (!user) {
      setError("Please log in to perform competitive analysis");
      return;
    }

    setIsAnalyzing(true);
    setSubmitted(true);
    setError(null);
    setReport(null);

    try {
      const analysisRequest: NeuroSEOAnalysisRequest = {
        urls: [yourUrl.trim()],
        targetKeywords: targetKeywords.split(',').map(k => k.trim()).filter(Boolean),
        competitorUrls: competitorUrls.split(',').map(u => u.trim()).filter(Boolean),
        analysisType: "competitive",
        userPlan: userTier,
        userId: user.uid,
      };

      // Call NeuroSEO™ API
      const response = await fetch('/api/neuroseo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analysisRequest),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const result = await response.json();
      setReport(result);

      if (user) {
        const userActivitiesRef = collection(
          db,
          "users",
          user.uid,
          "activities"
        );
        await addDoc(userActivitiesRef, {
          type: ACTIVITY_TYPES.COMPETITOR_ANALYSIS,
          tool: TOOL_NAMES.COMPETITOR_ANALYSIS,
          timestamp: serverTimestamp(),
          details: {
            yourUrl: yourUrl.trim(),
            competitors: competitorUrls.split(',').map(u => u.trim()).filter(Boolean),
            keywords: targetKeywords.split(',').map(k => k.trim()).filter(Boolean),
          },
          resultsSummary: `NeuroSEO™ competitive analysis completed for ${yourUrl.trim()} vs ${competitorUrls.split(',').length} competitors.`,
        });
      }
    } catch (e: any) {
      if (e instanceof TimeoutError) {
        console.warn("Competitor analysis timed out:", e.message);
        setError(
          "Competitor analysis is taking longer than expected. Please try again later or with fewer competitors."
        );
      } else {
        setError(e.message || "An unexpected error occurred during analysis.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "mx-auto transition-all duration-500",
        submitted ? "max-w-7xl" : "max-w-xl"
      )}
    >
      <div
        className={cn(
          "grid gap-8 transition-all duration-500",
          submitted ? "lg:grid-cols-3" : "lg:grid-cols-1"
        )}
      >
        <motion.div layout className="lg:col-span-1">
          <CompetitorAnalysisForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </motion.div>

        <div className="lg:col-span-2" ref={resultsRef}>
          <AnimatePresence mode="wait">
            {isLoading && (
              <motion.div key="loading">
                <LoadingScreen text="Analyzing rankings..." />
              </motion.div>
            )}
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card className="border-destructive shadow-xl hover:shadow-2xl transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="text-destructive font-headline flex items-center gap-2">
                      <AlertTriangle /> Analysis Failed
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{error}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            {results && (
              <motion.div key="results">
                <CompetitorResults results={results} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
