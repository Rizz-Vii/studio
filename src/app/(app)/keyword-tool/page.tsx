// src/app/(app)/keyword-tool/page.tsx
"use client";
import { useState, useRef, useEffect } from "react";
import KeywordToolForm from "@/components/keyword-tool-form";
import type {
  SuggestKeywordsInput,
  SuggestKeywordsOutput,
} from "@/ai/flows/keyword-suggestions";
import { suggestKeywords } from "@/ai/flows/keyword-suggestions";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import LoadingState from "@/components/loading-state";
import MobileToolLayout, { MobileToolCard, MobileResultsCard } from "@/components/mobile-tool-layout";
import Breadcrumb from "@/components/breadcrumb";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Copy, Search, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { withTimeout, TimeoutError } from "@/lib/timeout";
import { getDemoData } from "@/lib/demo-data";
import { useFeedbackCollection } from "@/components/performance-feedback";

const getProgressColor = (score: number) => {
  if (score > 70) return "bg-destructive";
  if (score > 40) return "bg-warning";
  return "bg-success";
};

const KeywordResults = ({ results }: { results: SuggestKeywordsOutput }) => {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast({
          title: "Copied!",
          description: "Keywords copied to clipboard.",
        });
      })
      .catch((err) => {
        toast({
          variant: "destructive",
          title: "Copy Failed",
          description: "Could not copy to clipboard.",
        });
      });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Mobile Results */}
      <div className="block md:hidden">
        <MobileResultsCard
          title="Keyword Suggestions"
          subtitle={`${results.keywords.length} keywords found`}
          icon={<Search className="h-5 w-5" />}
          actions={
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                copyToClipboard(
                  results.keywords.map((k) => k.keyword).join(", ")
                )
              }
            >
              <Copy className="h-4 w-4" />
            </Button>
          }
        >
          <div className="space-y-3">
            {results.keywords.map((keyword, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-sm">{keyword.keyword}</span>
                  <div className="text-xs text-gray-500">
                    {keyword.searchVolume.toLocaleString()}/mo
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Progress 
                      value={keyword.difficulty} 
                      className={cn("h-2", getProgressColor(keyword.difficulty))}
                    />
                  </div>
                  <span className="text-xs text-gray-500">
                    {keyword.difficulty}% difficulty
                  </span>
                </div>
              </div>
            ))}
          </div>
        </MobileResultsCard>
      </div>

      {/* Desktop Results */}
      <div className="hidden md:block">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="font-headline">Suggested Keywords</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  copyToClipboard(
                    results.keywords.map((k) => k.keyword).join(", ")
                  )
                }
                className="font-body"
              >
                <Copy className="mr-2 h-4 w-4" /> Copy Keywords
              </Button>
            </div>
            <CardDescription className="font-body">
              Here are keywords related to your topic, with estimated volume and
              ranking difficulty.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Keyword</TableHead>
                  <TableHead className="text-right">Search Volume</TableHead>
                  <TableHead className="w-[150px]">Difficulty</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.keywords.map((keyword, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium font-body">
                      {keyword.keyword}
                    </TableCell>
                    <TableCell className="text-right font-body">
                      {keyword.searchVolume.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Progress
                          value={keyword.difficulty}
                          className={cn("flex-1", getProgressColor(keyword.difficulty))}
                        />
                        <span className="text-sm text-muted-foreground font-body w-8">
                          {keyword.difficulty}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};
export default function KeywordToolPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SuggestKeywordsOutput | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Performance feedback integration
  const { 
    startOperation, 
    endOperation, 
    FeedbackComponent 
  } = useFeedbackCollection('keyword-suggestions');

  const resultsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (results) {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [results]);

  const handleSubmit = async (values: SuggestKeywordsInput) => {
    setIsLoading(true);
    setSubmitted(true);
    setResults(null);
    
    // Start performance monitoring
    startOperation();
    
    try {
      // Try to get real data with timeout
      const result = await withTimeout(
        suggestKeywords(values),
        15000, // 15 second timeout
        "Keyword analysis is taking longer than expected. Using demo data instead."
      );
      setResults(result);

      // End performance monitoring with success
      endOperation(false);

      if (user) {
        const userActivitiesRef = collection(
          db,
          "users",
          user.uid,
          "activities"
        );
        await addDoc(userActivitiesRef, {
          type: "Keyword Search",
          tool: "Keyword Tool",
          timestamp: serverTimestamp(),
          details: values,
          resultsSummary: `Searched for keywords related to "${values.topic}". Found ${result.keywords.length} suggestions.`,
        });
      }
    } catch (error) {
      // End performance monitoring with error
      endOperation(true); // Force show feedback on error
      
      if (error instanceof TimeoutError) {
        console.warn("Keyword analysis timed out, using demo data:", (error as TimeoutError).message);
        // Use demo data as fallback
        const demoData = getDemoData('keyword-tool');
        if (demoData) {
          setResults(demoData);
        }
      } else {
        console.error("Error fetching keyword suggestions:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Breadcrumb />
      </div>
      
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
            <MobileToolCard
              title="Keyword Analysis"
              description="Enter your topic to get keyword suggestions"
              icon={<TrendingUp className="h-5 w-5" />}
            >
              <KeywordToolForm onSubmit={handleSubmit} isLoading={isLoading} />
            </MobileToolCard>
          </motion.div>

          <div className="lg:col-span-2" ref={resultsRef}>
            <AnimatePresence mode="wait">
              {isLoading && (
                <motion.div key="loading">
                  <LoadingState
                    isLoading={true}
                    title="Analyzing Keywords"
                    subtitle="Finding the best keyword opportunities for your content..."
                    tips={[
                      "💡 Long-tail keywords often have less competition",
                      "🎯 Focus on search intent, not just volume",
                      "🤔 Consider user questions and problems",
                      "🔍 Look for keyword gaps in your niche"
                    ]}
                    showTips={true}
                    variant="default"
                  />
                </motion.div>
              )}
              {results && results.keywords.length > 0 && (
                <motion.div key="results">
                  <KeywordResults results={results} />
                </motion.div>
              )}
              {results && results.keywords.length === 0 && !isLoading && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <p className="font-body text-muted-foreground text-center">
                        No keywords found for this topic. Try a different one.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      {/* Performance Feedback Component */}
      {FeedbackComponent}
    </div>
  );
}
