"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getUserSubscription,
  getSubscriptionLimits,
  canAccessFeature,
  getRemainingUsage,
  SubscriptionData,
} from "@/lib/subscription";
import { PlanType } from "@/lib/stripe";

export function useSubscription() {
  const { user, profile } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSubscription() {
      if (!user) {
        setSubscription({ status: "free", tier: "free" });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const subscriptionData = await getUserSubscription(user.uid);
        setSubscription(subscriptionData);
      } catch (err) {
        console.error("Error fetching subscription:", err);
        setError("Failed to load subscription data");
        setSubscription({ status: "free", tier: "free" });
      } finally {
        setLoading(false);
      }
    }

    fetchSubscription();
  }, [user]);

  const hasAccess = (feature: string): boolean => {
    if (!subscription) return false;
    return canAccessFeature(subscription.tier, feature);
  };

  const getLimits = () => {
    if (!subscription) return getSubscriptionLimits("free");
    return getSubscriptionLimits(subscription.tier);
  };

  const getUsageRemaining = (currentUsage: { [key: string]: number }) => {
    if (!subscription) return getRemainingUsage("free", currentUsage);
    return getRemainingUsage(subscription.tier, currentUsage);
  };

  const isActive = subscription?.status === "active";
  const isPremium = subscription?.tier !== "free";
  const isAgency = subscription?.tier === "agency";

  return {
    subscription,
    loading,
    error,
    hasAccess,
    getLimits,
    getUsageRemaining,
    isActive,
    isPremium,
    isAgency,
    refetch: () => {
      if (user) {
        getUserSubscription(user.uid).then(setSubscription);
      }
    },
  };
}
