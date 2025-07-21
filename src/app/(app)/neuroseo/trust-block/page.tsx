"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Fingerprint, Zap, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function TrustBlockPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Fingerprint className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">TrustBlock™</h1>
          <p className="text-muted-foreground">E-A-T optimization and content authenticity</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                TrustBlock™ is currently in development
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                Comprehensive E-A-T (Expertise, Authoritativeness, Trustworthiness) analysis 
                and optimization to enhance content credibility and search rankings.
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold">Planned Features:</h3>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• E-A-T (Expertise, Authoritativeness, Trustworthiness) auditing</li>
              <li>• Content credibility assessment and fact-checking</li>
              <li>• Compliance verification (GDPR, accessibility, content policies)</li>
              <li>• Trust signal detection and authority scoring</li>
              <li>• Author profile analysis and verification</li>
            </ul>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button asChild>
              <Link href="/neuroseo">
                Back to NeuroSEO™ Dashboard
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">
                Main Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
