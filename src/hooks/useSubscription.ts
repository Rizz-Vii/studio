import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUserSubscription, SubscriptionData } from "@/lib/subscription";
import { STRIPE_PLANS, FREE_PLAN, PlanType } from "@/lib/stripe";

export interface PlanLimits {
  auditsPerMonth: number;
  keywords: number;
  reports: number;
  competitors: number;
}

export interface SubscriptionInfo extends SubscriptionData {
  planName: string;
  planLimits: PlanLimits;
  features: readonly string[];
  isUnlimited: boolean;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSubscription() {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        const subData = await getUserSubscription(user.uid);

        let planInfo;
        if (subData.tier === "free") {
          planInfo = FREE_PLAN;
        } else {
          planInfo = STRIPE_PLANS[subData.tier as PlanType];
        }

        const subscriptionInfo: SubscriptionInfo = {
          ...subData,
          planName: planInfo.name,
          planLimits: planInfo.limits,
          features: planInfo.features,
          isUnlimited: planInfo.limits.auditsPerMonth === -1,
        };

        setSubscription(subscriptionInfo);
      } catch (error) {
        console.error("Error fetching subscription:", error);
        // Default to free plan on error
        setSubscription({
          status: "free",
          tier: "free",
          planName: FREE_PLAN.name,
          planLimits: FREE_PLAN.limits,
          features: FREE_PLAN.features,
          isUnlimited: false,
        });
      } finally {
        setLoading(false);
      }
    }

    fetchSubscription();
  }, [user?.uid]);

  const canUseFeature = (featureName: string): boolean => {
    if (!subscription) return false;
    if (subscription.isUnlimited) return true;

    // Add specific feature checks based on plan
    const featureMap: Record<string, boolean> = {
      "competitor-analysis": subscription.tier !== "free",
      "unlimited-keywords": subscription.tier === "agency",
      "white-label": subscription.tier === "agency",
      "priority-support": subscription.tier === "agency",
    };

    return featureMap[featureName] ?? true;
  };

  const getRemainingUsage = (
    usageType: keyof PlanLimits,
    currentUsage: number
  ): number => {
    if (!subscription) return 0;
    if (subscription.isUnlimited) return -1; // unlimited

    const limit = subscription.planLimits[usageType];
    return Math.max(0, limit - currentUsage);
  };

  const isAtLimit = (
    usageType: keyof PlanLimits,
    currentUsage: number
  ): boolean => {
    if (!subscription) return true;
    if (subscription.isUnlimited) return false;

    const limit = subscription.planLimits[usageType];
    return currentUsage >= limit;
  };

  return {
    subscription,
    loading,
    canUseFeature,
    getRemainingUsage,
    isAtLimit,
    refetch: async () => {
      if (!user?.uid) return;
      setLoading(true);

      try {
        const subData = await getUserSubscription(user.uid);

        let planInfo;
        if (subData.tier === "free") {
          planInfo = FREE_PLAN;
        } else {
          planInfo = STRIPE_PLANS[subData.tier as PlanType];
        }

        const subscriptionInfo: SubscriptionInfo = {
          ...subData,
          planName: planInfo.name,
          planLimits: planInfo.limits,
          features: planInfo.features,
          isUnlimited: planInfo.limits.auditsPerMonth === -1,
        };

        setSubscription(subscriptionInfo);
      } catch (error) {
        console.error("Error refetching subscription:", error);
      } finally {
        setLoading(false);
      }
    },
  };
}

export function usePlanComparison() {
  const plans = [
    {
      tier: "free" as const,
      name: FREE_PLAN.name,
      price: FREE_PLAN.price.monthly,
      features: FREE_PLAN.features,
      limits: FREE_PLAN.limits,
      popular: false,
    },
    {
      tier: "starter" as const,
      name: STRIPE_PLANS.starter.name,
      price: STRIPE_PLANS.starter.price.monthly,
      features: STRIPE_PLANS.starter.features,
      limits: STRIPE_PLANS.starter.limits,
      popular: true,
    },
    {
      tier: "agency" as const,
      name: STRIPE_PLANS.agency.name,
      price: STRIPE_PLANS.agency.price.monthly,
      features: STRIPE_PLANS.agency.features,
      limits: STRIPE_PLANS.agency.limits,
      popular: false,
    },
  ];

  return { plans };
}
