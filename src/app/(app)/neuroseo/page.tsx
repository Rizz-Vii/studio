"use client";

import React from "react";
import NeuroSEODashboard from "@/components/NeuroSEODashboard";
import { motion } from "framer-motion";
import { TutorialAccess } from "@/components/tutorials/TutorialAccess";

export default function NeuroSEOPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto space-y-8"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold font-headline">
              NeuroSEO™ Suite
            </h1>
            <p className="text-muted-foreground">
              AI-powered content analysis and optimization platform
            </p>
          </div>
        </div>
        <TutorialAccess
          feature="neuroseo"
          title="Learn NeuroSEO™"
          description="Master AI-powered SEO analysis with our comprehensive tutorials."
        />
      </div>

      <NeuroSEODashboard />
    </motion.div>
  );
}
