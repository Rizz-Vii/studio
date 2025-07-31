"use client";

import NeuroSEODashboard from "@/components/NeuroSEODashboard";
import { TutorialAccess } from "@/components/tutorials/TutorialAccess";
import { motion } from "framer-motion";

export default function NeuroSEOPage() {
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
