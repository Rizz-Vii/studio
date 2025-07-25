"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TeamReportsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-purple-600" />
          <div>
            <h1 className="text-3xl font-bold">Team Reports</h1>
            <p className="text-muted-foreground">
              Analytics and insights for your team performance
            </p>
          </div>
        </div>
        <Button className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Generate Report
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Team Analytics Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">
                  Advanced Reporting Coming Soon
                </h3>
                <p className="max-w-md mx-auto">
                  Comprehensive team analytics, performance metrics, and
                  detailed reporting features will be available in the next
                  update.
                </p>
              </div>

              <div className="flex items-center justify-center gap-6 pt-6 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span>Performance metrics</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Team insights</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Time tracking</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
