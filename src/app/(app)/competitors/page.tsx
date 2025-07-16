// src/app/(app)/competitors/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import type {
  CompetitorAnalysisInput,
  CompetitorAnalysisOutput,
} from "@/ai/flows/competitor-analysis";
import { analyzeCompetitors } from "@/ai/flows/competitor-analysis";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import CompetitorAnalysisForm from "@/components/competitor-analysis-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, AlertTriangle, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LoadingScreen from "@/components/ui/loading-screen";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { withTimeout, TimeoutError } from "@/lib/timeout";

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
      const competitorData = (firstKeywordData as any)[url];
      return {
        name: new URL(url).hostname,
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
          Ranking Comparison for &quot;{firstKeywordData.keyword}&quot;
        </CardTitle>
        <CardDescription>
          Lower bars are better. Ranks of 101 indicate &quot;N/A&quot; or rank
          &gt; 100.
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
                    key={url}
                    className="text-center truncate"
                    title={url}
                  >
                    {new URL(url).hostname}
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
                    <TableCell key={url} className="text-center">
                      {(item as any)[url]?.rank ?? "N/A"}
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
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<CompetitorAnalysisOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const resultsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (results || error) {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [results, error]);

  const handleSubmit = async (values: CompetitorAnalysisInput) => {
    setIsLoading(true);
    setSubmitted(true);
    setResults(null);
    setError(null);
    try {
      // Try to get real data with timeout
      const result = await withTimeout(
        analyzeCompetitors(values),
        15000, // 15 second timeout
        "Competitor analysis is taking longer than expected."
      );
      setResults(result);

      if (user) {
        const userActivitiesRef = collection(
          db,
          "users",
          user.uid,
          "activities"
        );
        await addDoc(userActivitiesRef, {
          type: "Competitor Analysis",
          tool: "Competitor Analysis",
          timestamp: serverTimestamp(),
          details: {
            yourUrl: values.yourUrl,
            competitors: values.competitorUrls,
          },
          resultsSummary: `Compared ${values.yourUrl} with ${values.competitorUrls.length} competitors.`,
        });
      }
    } catch (e: any) {
      if (e instanceof TimeoutError) {
        console.warn("Competitor analysis timed out:", e.message);
        setError("Competitor analysis is taking longer than expected. Please try again later or with fewer competitors.");
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
