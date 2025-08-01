"use client";

import NeuroSEODashboard from "@/components/NeuroSEODashboard";
import { TutorialAccess } from "@/components/tutorials/TutorialAccess";
import { useAuth } from "@/context/AuthContext";
import { useNeuroSEODashboard } from "@/hooks/use-neuroseo-data";
import LoadingScreen from "@/components/ui/loading-screen";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function NeuroSEOPage() {
  const { user } = useAuth();
  const { data, loading, error, refresh } = useNeuroSEODashboard(user?.uid || null);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <main className="max-w-7xl mx-auto space-y-8 pt-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refresh}
              className="ml-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto space-y-8 pt-6">
      {/* Page Title - DevLast Task 8: Accessibility & Semantics */}
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold font-headline text-primary mb-2">
          NeuroSEO™ Dashboard
        </h1>
        <p className="text-muted-foreground font-body text-lg">
          Advanced AI-powered SEO analysis with 6 intelligent engines for comprehensive optimization.
        </p>
        {data && (
          <div className="mt-4 flex justify-center gap-6 text-sm text-muted-foreground">
            <span>{data.totalAnalyses} Total Analyses</span>
            <span>{data.completedAnalyses} Completed</span>
            <span>Avg Score: {data.averageScore}/100</span>
          </div>
        )}
      </header>

      <div className="flex justify-end mb-6">
        <TutorialAccess
          feature="neuroseo"
          title="Learn NeuroSEO™"
          description="Master AI-powered SEO analysis with our comprehensive tutorials."
        />
      </div>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <NeuroSEODashboard />
      </motion.section>
    </main>
  );
}
