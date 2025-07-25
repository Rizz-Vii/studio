"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderOpen, Plus, GitBranch, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TeamProjectsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FolderOpen className="h-8 w-8 text-green-600" />
          <div>
            <h1 className="text-3xl font-bold">Team Projects</h1>
            <p className="text-muted-foreground">
              Manage and collaborate on team projects
            </p>
          </div>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Project Management Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center py-12 text-muted-foreground">
                <FolderOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">
                  Project Management Coming Soon
                </h3>
                <p className="max-w-md mx-auto">
                  Advanced project tracking, task management, and team
                  collaboration tools will be available in the next update.
                </p>
              </div>

              <div className="flex items-center justify-center gap-6 pt-6 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <GitBranch className="h-4 w-4" />
                  <span>Project tracking</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Time management</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Plus className="h-4 w-4" />
                  <span>Task creation</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
