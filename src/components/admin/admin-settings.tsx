"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Database,
  Key,
  Bell,
  Shield,
  Globe,
  Mail,
  Zap,
  ExternalLink,
} from "lucide-react";

export default function AdminSettings() {
  const handleConfigUpdate = (setting: string) => {
    // In a real app, this would update system configurations
    console.log(`Updating ${setting} configuration`);
  };

  return (
    <div className="space-y-6">
      {/* System Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Configuration
          </CardTitle>
          <CardDescription>
            Core system settings and configurations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Maintenance Mode</h4>
              <p className="text-sm text-muted-foreground">
                Put the system in maintenance mode for updates
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800">Active</Badge>
              <Button variant="outline" size="sm">
                Toggle
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">User Registration</h4>
              <p className="text-sm text-muted-foreground">
                Allow new users to register accounts
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800">Enabled</Badge>
              <Button variant="outline" size="sm">
                Disable
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Rate Limiting</h4>
              <p className="text-sm text-muted-foreground">
                API rate limiting for user requests
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800">Active</Badge>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* External Services */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            External Services
          </CardTitle>
          <CardDescription>
            Third-party service integrations and API configurations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Zap className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium">Google AI (Gemini)</h4>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status</span>
                  <Badge className="bg-green-100 text-green-800">
                    Connected
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">API Calls Today</span>
                  <span className="text-sm text-muted-foreground">1,247</span>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Key className="h-4 w-4 mr-2" />
                  Manage API Keys
                </Button>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Mail className="h-5 w-5 text-purple-600" />
                <h4 className="font-medium">Email Service</h4>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Emails Sent Today</span>
                  <span className="text-sm text-muted-foreground">89</span>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure SMTP
                </Button>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Database className="h-5 w-5 text-green-600" />
                <h4 className="font-medium">Firebase Services</h4>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Auth Status</span>
                  <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Firestore Status</span>
                  <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Firebase Console
                </Button>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="h-5 w-5 text-orange-600" />
                <h4 className="font-medium">Security Services</h4>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">reCAPTCHA</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">DDoS Protection</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Shield className="h-4 w-4 mr-2" />
                  Security Settings
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Flags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Feature Flags
          </CardTitle>
          <CardDescription>
            Control feature availability and rollout
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium text-sm">AI Content Generation</h4>
                <p className="text-xs text-muted-foreground">
                  Enable AI-powered content suggestions
                </p>
              </div>
              <Badge className="bg-green-100 text-green-800">Enabled</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium text-sm">Advanced Analytics</h4>
                <p className="text-xs text-muted-foreground">
                  Detailed user behavior tracking
                </p>
              </div>
              <Badge className="bg-green-100 text-green-800">Enabled</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium text-sm">Real-time Collaboration</h4>
                <p className="text-xs text-muted-foreground">
                  Multi-user editing features
                </p>
              </div>
              <Badge variant="outline">Beta</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium text-sm">White-label Options</h4>
                <p className="text-xs text-muted-foreground">
                  Custom branding for agencies
                </p>
              </div>
              <Badge variant="secondary">Coming Soon</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Admin Notifications
          </CardTitle>
          <CardDescription>
            Configure admin alerts and monitoring notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium text-sm">System Alerts</h4>
                <p className="text-xs text-muted-foreground">
                  Critical system errors and downtime
                </p>
              </div>
              <Badge className="bg-green-100 text-green-800">Enabled</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium text-sm">User Activity Alerts</h4>
                <p className="text-xs text-muted-foreground">
                  Unusual user behavior patterns
                </p>
              </div>
              <Badge className="bg-green-100 text-green-800">Enabled</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium text-sm">Performance Alerts</h4>
                <p className="text-xs text-muted-foreground">
                  Response time and resource usage
                </p>
              </div>
              <Badge className="bg-green-100 text-green-800">Enabled</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium text-sm">Security Alerts</h4>
                <p className="text-xs text-muted-foreground">
                  Authentication failures and suspicious activity
                </p>
              </div>
              <Badge className="bg-green-100 text-green-800">Enabled</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
          <CardDescription>
            Current system version and deployment details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Application Version</label>
              <p className="text-sm text-muted-foreground">v2.1.0</p>
            </div>
            <div>
              <label className="text-sm font-medium">Last Deployment</label>
              <p className="text-sm text-muted-foreground">2 hours ago</p>
            </div>
            <div>
              <label className="text-sm font-medium">Environment</label>
              <p className="text-sm text-muted-foreground">Production</p>
            </div>
            <div>
              <label className="text-sm font-medium">Build Number</label>
              <p className="text-sm text-muted-foreground">#1247</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
