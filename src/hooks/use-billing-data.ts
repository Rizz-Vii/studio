/**
 * Billing Data Hooks
 * 
 * Custom React hooks for billing and subscription management
 * 
 * Generated: July 31, 2025
 * Integration: Billing components → Stripe real-time data
 */

import { useState, useEffect, useCallback } from "react";
import { BillingDataService, type BillingData, type BillingAnalytics, type PlanFeatures } from "@/lib/services/billing-data.service";

// Hook for user billing data
export const useBillingData = (userId: string | null) => {
    const [billing, setBilling] = useState<BillingData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        console.log(`💳 Setting up billing subscription for user: ${userId}`);
        setLoading(true);
        setError(null);

        // Initial data fetch
        BillingDataService.getUserBillingData(userId)
            .then((billingData) => {
                setBilling(billingData);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching billing data:", err);
                setError("Failed to load billing information");
                setLoading(false);
            });

        // Set up real-time subscription
        const unsubscribe = BillingDataService.subscribeToUserBillingData(
            userId,
            (updatedBilling) => {
                console.log("💳 Billing data updated in real-time");
                setBilling(updatedBilling);
                setError(null);
            }
        );

        return () => {
            console.log("🔄 Cleaning up billing subscription");
            unsubscribe();
        };
    }, [userId]);

    const refresh = useCallback(async () => {
        if (!userId) return;

        setLoading(true);
        try {
            const freshBilling = await BillingDataService.getUserBillingData(userId);
            setBilling(freshBilling);
            setError(null);
        } catch (err) {
            console.error("Error refreshing billing data:", err);
            setError("Failed to refresh billing data");
        } finally {
            setLoading(false);
        }
    }, [userId]);

    return { billing, loading, error, refresh };
};

// Hook for subscription management
export const useSubscription = (userId: string | null) => {
    const { billing, loading, error } = useBillingData(userId);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [portalLoading, setPortalLoading] = useState(false);

    const createCheckoutSession = useCallback(async (
        priceId: string,
        successUrl?: string,
        cancelUrl?: string
    ) => {
        if (!userId) return null;

        setCheckoutLoading(true);
        try {
            const session = await BillingDataService.createCheckoutSession(
                userId,
                priceId,
                successUrl || `${window.location.origin}/billing?session_id={CHECKOUT_SESSION_ID}`,
                cancelUrl || `${window.location.origin}/pricing`
            );

            // Redirect to Stripe Checkout
            window.location.href = session.url;

            return session;
        } catch (err) {
            console.error("Error creating checkout session:", err);
            throw err;
        } finally {
            setCheckoutLoading(false);
        }
    }, [userId]);

    const openCustomerPortal = useCallback(async (returnUrl?: string) => {
        if (!userId) return;

        setPortalLoading(true);
        try {
            const portal = await BillingDataService.createPortalSession(
                userId,
                returnUrl || window.location.origin
            );

            // Open Stripe Customer Portal
            window.location.href = portal.url;
        } catch (err) {
            console.error("Error opening customer portal:", err);
            throw err;
        } finally {
            setPortalLoading(false);
        }
    }, [userId]);

    const currentPlan = billing?.subscription?.plan || 'free';
    const planFeatures = BillingDataService.getUserPlanFeatures(currentPlan);

    return {
        subscription: billing?.subscription,
        paymentMethods: billing?.paymentMethods || [],
        invoices: billing?.invoices || [],
        usage: billing?.usage,
        currentPlan,
        planFeatures,
        loading,
        error,
        checkoutLoading,
        portalLoading,
        createCheckoutSession,
        openCustomerPortal
    };
};

// Hook for usage tracking
export const useUsageTracking = (userId: string | null) => {
    const { billing } = useBillingData(userId);
    const [checking, setChecking] = useState(false);

    const canPerformAction = useCallback(async (
        action: 'neuroSeoAnalyses' | 'keywordSearches' | 'competitorAnalyses' | 'seoAudits'
    ): Promise<boolean> => {
        if (!userId) return false;

        setChecking(true);
        try {
            const canPerform = await BillingDataService.canUserPerformAction(userId, action);
            return canPerform;
        } catch (err) {
            console.error("Error checking usage limits:", err);
            return false;
        } finally {
            setChecking(false);
        }
    }, [userId]);

    const incrementUsage = useCallback(async (
        action: 'neuroSeoAnalyses' | 'keywordSearches' | 'competitorAnalyses' | 'seoAudits'
    ) => {
        if (!userId) return;

        try {
            await BillingDataService.incrementUsage(userId, action);
            console.log(`📊 Usage incremented for ${action}`);
        } catch (error) {
            console.error("Error incrementing usage:", error);
            throw error;
        }
    }, [userId]);

    const getUsagePercentage = useCallback((
        action: 'neuroSeoAnalyses' | 'keywordSearches' | 'competitorAnalyses' | 'seoAudits'
    ): number => {
        if (!billing?.usage) return 0;

        const current = billing.usage.current[action];
        const limit = billing.usage.limits[action];

        if (limit === -1) return 0; // Unlimited
        if (limit === 0) return 100; // No quota

        return Math.min((current / limit) * 100, 100);
    }, [billing]);

    const isNearLimit = useCallback((
        action: 'neuroSeoAnalyses' | 'keywordSearches' | 'competitorAnalyses' | 'seoAudits',
        threshold: number = 80
    ): boolean => {
        return getUsagePercentage(action) >= threshold;
    }, [getUsagePercentage]);

    return {
        usage: billing?.usage,
        checking,
        canPerformAction,
        incrementUsage,
        getUsagePercentage,
        isNearLimit
    };
};

// Hook for plan features and comparisons
export const usePlanFeatures = () => {
    const [plans] = useState<PlanFeatures[]>(
        Object.values(BillingDataService.PLAN_FEATURES)
    );

    const getPlanFeatures = useCallback((plan: string): PlanFeatures => {
        return BillingDataService.getUserPlanFeatures(plan);
    }, []);

    const comparePlans = useCallback((currentPlan: string, targetPlan: string) => {
        const current = getPlanFeatures(currentPlan);
        const target = getPlanFeatures(targetPlan);

        const improvements = {
            neuroSeoAnalyses: target.features.neuroSeoAnalyses - current.features.neuroSeoAnalyses,
            keywordSearches: target.features.keywordSearches - current.features.keywordSearches,
            competitorAnalyses: target.features.competitorAnalyses - current.features.competitorAnalyses,
            seoAudits: target.features.seoAudits - current.features.seoAudits,
            teamMembers: target.features.teamMembers - current.features.teamMembers,
            newFeatures: {
                prioritySupport: target.features.prioritySupport && !current.features.prioritySupport,
                customReports: target.features.customReports && !current.features.customReports,
                apiAccess: target.features.apiAccess && !current.features.apiAccess,
                whiteLabel: target.features.whiteLabel && !current.features.whiteLabel,
            }
        };

        return improvements;
    }, [getPlanFeatures]);

    return {
        plans,
        getPlanFeatures,
        comparePlans
    };
};

// Hook for billing analytics (admin only)
export const useBillingAnalytics = () => {
    const [analytics, setAnalytics] = useState<BillingAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        console.log('📊 Loading billing analytics');
        setLoading(true);
        setError(null);

        BillingDataService.getBillingAnalytics()
            .then((analyticsData) => {
                setAnalytics(analyticsData);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching billing analytics:", err);
                setError("Failed to load billing analytics");
                setLoading(false);
            });
    }, []);

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            const freshAnalytics = await BillingDataService.getBillingAnalytics();
            setAnalytics(freshAnalytics);
            setError(null);
        } catch (err) {
            console.error("Error refreshing billing analytics:", err);
            setError("Failed to refresh analytics");
        } finally {
            setLoading(false);
        }
    }, []);

    return { analytics, loading, error, refresh };
};
