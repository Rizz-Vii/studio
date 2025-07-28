// src/app/(app)/seo-audit/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";

import type { AuditUrlInput, AuditUrlOutput } from "@/ai/flows/seo-audit";
import { auditUrl } from "@/ai/flows/seo-audit";
import SeoAuditForm from "@/components/seo-audit-form";
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
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/AuthContext";
import { getDemoData } from "@/lib/demo-data";
import { db } from "@/lib/firebase";
import { TimeoutError, withTimeout } from "@/lib/timeout";
import { cn } from "@/lib/utils";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

const statusIcons: { [key: string]: React.ElementType; } = {
  good: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
};

const statusColors: { [key: string]: string; } = {
  good: "text-success",
  warning: "text-warning",
  error: "text-destructive",
};

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
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

const scoreChartConfig = {
  score: { label: "Score" },
} satisfies ChartConfig;

const imageChartConfig = {
  images: { label: "Images" },
  withAlt: { label: "With Alt Text", color: "hsl(var(--chart-1))" },
  missingAlt: { label: "Missing Alt Text", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

const AuditCharts = ({ items }: { items: AuditUrlOutput["items"]; }) => {
  const chartData = items.map((item) => ({
    name: item.name,
    score: item.score,
    fill:
      item.score > 85
        ? "hsl(var(--chart-1))"
        : item.score > 60
          ? "hsl(var(--chart-2))"
          : "hsl(var(--chart-5))",
  }));

  const imageAuditItem = items.find((item) => item.id === "image-alts");
  let imageData = null;
  if (imageAuditItem) {
    // A simple regex to extract numbers, assuming a format like "Found X images, Y are missing alt text"
    const match = imageAuditItem.details.match(
      /(\d+)\s*images.*(\d+)\s*are\s*missing/
    );
    if (match) {
      const total = parseInt(match[1], 10);
      const missing = parseInt(match[2], 10);
      imageData = [
        { name: "withAlt", value: total - missing },
        { name: "missingAlt", value: missing },
      ];
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Score Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={scoreChartConfig}
            className="h-[250px] w-full"
          >
            <BarChart
              accessibilityLayer
              data={chartData}
              layout="vertical"
              margin={{ left: 10 }}
            >
              <CartesianGrid horizontal={false} />
              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                className="text-xs"
              />
              <XAxis dataKey="score" type="number" hide />
              <ChartTooltip
                cursor={false}
                content={(props) => <ChartTooltipContent {...props} />}
              />
              <Bar dataKey="score" radius={5} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {imageData && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Image Alt Text</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={imageChartConfig}
              className="mx-auto aspect-square h-[200px]"
            >
              <PieChart>
                <ChartTooltip
                  content={(props) => (
                    <ChartTooltipContent {...props} nameKey="name" hideLabel />
                  )}
                />
                <Pie data={imageData} dataKey="value">
                  <Cell key="withAlt" fill="var(--color-withAlt)" />
                  <Cell key="missingAlt" fill="var(--color-missingAlt)" />
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const AuditResults = ({ results }: { results: AuditUrlOutput; }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Audit Results</CardTitle>
        <div className="flex items-center gap-4 pt-2">
          <span className="text-4xl font-bold text-primary">
            {results.overallScore}
          </span>
          <div className="w-full">
            <p className="font-semibold">Overall Score</p>
            <Progress value={results.overallScore} className="mt-1" />
          </div>
        </div>
        <CardDescription className="pt-2">{results.summary}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {results.items.map((item) => {
              const Icon = statusIcons[item.status] || AlertCircle;
              const color =
                statusColors[item.status] || "text-muted-foreground";
              return (
                <motion.div
                  key={item.id}
                  className="flex items-start gap-4"
                  variants={itemVariants}
                >
                  <Icon className={`mt-1 h-5 w-5 flex-shrink-0 ${color}`} />
                  <div className="flex-1">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.details}
                    </p>
                  </div>
                  <span className={`font-semibold text-sm ${color}`}>
                    {item.score}/100
                  </span>
                </motion.div>
              );
            })}
          </motion.div>
          <div>
            <AuditCharts items={results.items} />
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default function SeoAuditPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<AuditUrlOutput | null>(null);
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

  const handleSubmit = async (values: AuditUrlInput) => {
    setIsLoading(true);
    setSubmitted(true);
    setResults(null);
    setError(null);
    try {
      // Try to get real data with timeout
      const result = await withTimeout(
        auditUrl(values),
        15000, // 15 second timeout
        "SEO audit is taking longer than expected. Using demo data instead."
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
          type: "SEO Audit",
          tool: "SEO Audit",
          timestamp: serverTimestamp(),
          details: {
            url: values.url,
            overallScore: result.overallScore,
          },
          resultsSummary: `Audited ${values.url}. Overall Score: ${result.overallScore}/100.`,
        });
      }
    } catch (e: any) {
      if (e instanceof TimeoutError) {
        console.warn("SEO audit timed out, using demo data:", e.message);
        // Use demo data as fallback
        const demoData = getDemoData("seo-audit");
        if (demoData) {
          setResults(demoData);
        } else {
          setError("Analysis timed out and no demo data available.");
        }
      } else {
        setError(e.message || "An unexpected error occurred during the audit.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main
      className={cn(
        "mx-auto transition-all duration-500",
        submitted ? "max-w-7xl" : "max-w-xl"
      )}
    >
      {/* Page Title - DevLast Task 8: Accessibility & Semantics */}
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold font-headline text-primary mb-2">
          SEO Website Audit
        </h1>
        <p className="text-muted-foreground font-body">
          Comprehensive SEO analysis and optimization recommendations for any website.
        </p>
      </header>

      <section
        className={cn(
          "grid gap-8 transition-all duration-500",
          submitted ? "lg:grid-cols-3" : "lg:grid-cols-1"
        )}
      >
        <motion.div layout className="lg:col-span-1">
          <SeoAuditForm onSubmit={handleSubmit} isLoading={isLoading} />
        </motion.div>

        <div className="lg:col-span-2" ref={resultsRef}>
          <AnimatePresence mode="wait">
            {isLoading && (
              <motion.div key="loading">
                <LoadingScreen text="Auditing page..." />
              </motion.div>
            )}
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card className="border-destructive">
                  <CardHeader>
                    <CardTitle className="text-destructive font-headline flex items-center gap-2">
                      <AlertTriangle /> Audit Failed
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
                <AuditResults results={results} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}
