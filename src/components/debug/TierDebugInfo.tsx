// Debug component to check tier detection
"use client";

import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";

export function TierDebugInfo() {
  const { user, role } = useAuth();
  const { subscription } = useSubscription();

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 bg-background border border-border rounded-lg p-4 text-xs space-y-2 z-50 max-w-xs">
      <div className="font-semibold text-green-600">Debug: Tier Detection</div>
      <div>User: {user?.email}</div>
      <div>Role: {role}</div>
      <div>Subscription Tier: {subscription?.tier}</div>
      <div>Plan Name: {subscription?.planName}</div>
      <div>Status: {subscription?.status}</div>
      <div>User Access Tier: {subscription?.userAccess?.tier}</div>
    </div>
  );
}
