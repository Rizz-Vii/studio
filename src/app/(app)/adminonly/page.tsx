// src/app/(app)/adminonly/page.tsx
"use client";

import React from "react";
import useAdminRoute from "@/hooks/useAdminRoute";
import LoadingScreen from "@/components/ui/loading-screen";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

export default function AdminOnlyPage() {
  const { user, loading, role } = useAdminRoute();

  if (loading || !user || role !== "admin") {
    return <LoadingScreen fullScreen text="Verifying permissions..." />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-success" />
            Admin Only Area
          </CardTitle>
          <CardDescription className="font-body">
            This page is only accessible to users with the 'admin' role.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="font-body">
            Welcome, Administrator. Here you can manage users, view system-wide
            analytics, and perform other administrative tasks.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
