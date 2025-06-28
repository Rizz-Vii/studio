// src/app/(app)/link-view/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import type {
  LinkAnalysisInput,
  LinkAnalysisOutput,
} from "@/ai/flows/link-analysis";
import { analyzeLinks } from "@/ai/flows/link-analysis";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import LinkAnalysisForm from "@/components/link-analysis-form";
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
import { AlertTriangle, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LoadingScreen from "@/components/ui/loading-screen";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

const DomainAuthorityChart = ({
  backlinks,
}: {
  backlinks: LinkAnalysisOutput["backlinks"];
}) => {
  const daRanges = [
    { range: "0-10", count: 0 },
    { range: "11-20", count: 0 },
    { range: "21-30", count: 0 },
    { range: "31-40", count: 0 },
    { range: "41-50", count: 0 },
    { range: "51-60", count: 0 },
    { range: "61-70", count: 0 },
    { range: "71-80", count: 0 },
    { range: "81-90", count: 0 },
    { range: "91-100", count: 0 },
  ];

  backlinks.forEach((link) => {
    const index = Math.floor(link.domainAuthority / 10.01);
    if (daRanges[index]) {
      daRanges[index].count++;
    }
  });

  const chartConfig: ChartConfig = {
    count: { label: "Backlinks", color: "hsl(var(--chart-1))" },
    range: { label: "DA Range" },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <BarChart3 />
          Domain Authority Distribution
        </CardTitle>
        <CardDescription>
          Number of backlinks from domains in each DA range.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart data={daRanges} margin={{ left: -10, right: 10 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="range" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <RechartsTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar dataKey="count" fill="var(--color-count)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

const LinkAnalysisResults = ({ results }: { results: LinkAnalysisOutput }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="space-y-6"
  >
    <DomainAuthorityChart backlinks={results.backlinks} />
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Backlink Profile</CardTitle>
        <CardDescription>
          Found {results.summary.totalBacklinks} backlinks from{" "}
          {results.summary.referringDomains} unique domains.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Referring Domain</TableHead>
              <TableHead>Anchor Text</TableHead>
              <TableHead className="text-right">Domain Authority</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.backlinks.map((link, index) => (
              <TableRow key={index}>
                <TableCell
                  className="font-medium truncate"
                  style={{ maxWidth: "200px" }}
                >
                  <a
                    href={link.backlinkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {link.referringDomain}
                  </a>
                </TableCell>
                <TableCell className="italic">"{link.anchorText}"</TableCell>
                <TableCell className="text-right">
                  {link.domainAuthority}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </motion.div>
);

export default function LinkViewPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<LinkAnalysisOutput | null>(null);
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

  const handleSubmit = async (values: LinkAnalysisInput) => {
    setIsLoading(true);
    setSubmitted(true);
    setResults(null);
    setError(null);
    try {
      const result = await analyzeLinks(values);
      setResults(result);

      if (user) {
        const userActivitiesRef = collection(
          db,
          "users",
          user.uid,
          "activities"
        );
        await addDoc(userActivitiesRef, {
          type: "Link Analysis",
          tool: "Link View",
          timestamp: serverTimestamp(),
          details: values,
          resultsSummary: `Analyzed backlinks for ${values.url}. Found ${result.summary.totalBacklinks} links.`,
        });
      }
    } catch (e: any) {
      setError(
        e.message || "An unexpected error occurred during link analysis."
      );
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
          <LinkAnalysisForm onSubmit={handleSubmit} isLoading={isLoading} />
        </motion.div>

        <div className="lg:col-span-2" ref={resultsRef}>
          <AnimatePresence>
            {isLoading && <LoadingScreen text="Discovering backlinks..." />}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card className="border-destructive">
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
            {results && <LinkAnalysisResults results={results} />}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
