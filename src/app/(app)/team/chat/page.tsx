"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Users, Send } from "lucide-react";

export default function TeamChatPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <MessageCircle className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Team Chat</h1>
          <p className="text-muted-foreground">
            Collaborate with your team in real-time
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Communication Hub
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center py-12 text-muted-foreground">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">
                  Team Chat Coming Soon
                </h3>
                <p className="max-w-md mx-auto">
                  Real-time messaging, file sharing, and team collaboration
                  features will be available in the next update.
                </p>
              </div>

              <div className="flex items-center justify-center gap-4 pt-6 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Send className="h-4 w-4" />
                  <span>Instant messaging</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Team channels</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
