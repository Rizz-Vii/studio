"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Map, Zap, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function SemanticMapPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Map className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">SemanticMap™</h1>
          <p className="text-muted-foreground">Advanced NLP analysis and topic visualization</p>
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
                SemanticMap™ is currently in development
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                This advanced NLP analysis tool will provide semantic clustering, topic visualization, 
                and comprehensive content mapping for optimal SEO strategy.
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold">Planned Features:</h3>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Advanced NLP analysis with semantic clustering</li>
              <li>• Topic visualization and content mapping</li>
              <li>• Content gap identification and competitive analysis</li>
              <li>• Semantic fingerprinting and relevance scoring</li>
              <li>• Keyword density optimization recommendations</li>
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
