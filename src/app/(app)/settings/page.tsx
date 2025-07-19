"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import LoadingScreen from "@/components/ui/loading-screen";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  User,
  Shield,
  Bell,
  CreditCard,
  Lock,
  Download,
  Trash2,
  ExternalLink,
} from "lucide-react";
import AccountSettingsForm from "@/components/settings/account-settings-form";
import SecuritySettingsForm from "@/components/settings/security-settings-form";
import NotificationSettingsForm from "@/components/settings/notification-settings-form";
import PrivacySettingsCard from "@/components/settings/privacy-settings-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Get the tab from URL parameters for deep linking
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const defaultTab = searchParams.get('tab') || 'account';

  if (authLoading || !mounted) {
    return <LoadingScreen fullScreen text="Loading settings..." />;
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold font-headline">Account Settings</h1>
          <p className="text-muted-foreground font-body">
            Manage your account preferences, security, and billing settings.
          </p>
        </div>
      </div>

      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Privacy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-6">
          <AccountSettingsForm user={user} profile={profile} />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <SecuritySettingsForm user={user} />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationSettingsForm user={user} profile={profile} />
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Billing & Subscription
              </CardTitle>
              <CardDescription>
                Manage your subscription plan and billing information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="mb-4">
                  <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <h3 className="text-lg font-semibold mb-2">Complete Billing Management</h3>
                  <p className="text-muted-foreground mb-6">
                    Access your full billing dashboard with subscription details, payment history, and plan management.
                  </p>
                </div>
                <Link href="/settings/billing">
                  <Button className="gap-2">
                    <CreditCard className="h-4 w-4" />
                    Go to Billing Dashboard
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <PrivacySettingsCard user={user} profile={profile} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
