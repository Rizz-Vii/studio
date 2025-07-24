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
      className="max-w-7xl mx-auto space-y-8 pt-6"
    >
      <div className="flex justify-end mb-6">
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
