// src/components/auth-aware-homepage.tsx
"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Users } from "lucide-react";

export function AuthAwareHero() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="text-center py-24">
        <div className="animate-pulse">
          <div className="h-12 bg-muted rounded w-96 mx-auto mb-4"></div>
          <div className="h-6 bg-muted rounded w-64 mx-auto"></div>
        </div>
      </div>
    );
  }

  // Logged-in user version
  if (user) {
    return (
      <motion.section
        className="text-center py-24 max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-bold mb-4">Welcome back! 👋</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Ready to continue optimizing your SEO strategy?
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button size="lg" asChild>
            <Link href="/dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Go to Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>

          <Button size="lg" variant="outline" asChild>
            <Link href="/neuroseo" className="flex items-center gap-2">
              Run NeuroSEO™ Analysis
            </Link>
          </Button>
        </div>

        {/* Quick Stats or Recent Activity */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <div className="p-6 border rounded-lg">
            <div className="text-2xl font-bold text-primary">12</div>
            <div className="text-sm text-muted-foreground">
              Audits This Month
            </div>
          </div>
          <div className="p-6 border rounded-lg">
            <div className="text-2xl font-bold text-primary">85%</div>
            <div className="text-sm text-muted-foreground">Avg SEO Score</div>
          </div>
          <div className="p-6 border rounded-lg">
            <div className="text-2xl font-bold text-primary">47</div>
            <div className="text-sm text-muted-foreground">Issues Fixed</div>
          </div>
        </div>
      </motion.section>
    );
  }

  // Anonymous user version (existing hero)
  return (
    <motion.section
      className="text-center py-24 max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
        AI-First SEO Intelligence for Modern Businesses
      </h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
        RankPilot's NeuroSEO™ Suite delivers enterprise-grade SEO analysis,
        competitor intelligence, and AI-powered optimization recommendations in
        one powerful dashboard.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button size="lg" asChild>
          <Link href="/register" className="flex items-center gap-2">
            Start Free Trial
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/features">View Features</Link>
        </Button>
      </div>
    </motion.section>
  );
}
