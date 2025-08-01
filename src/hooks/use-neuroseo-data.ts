/**
 * NeuroSEO™ Real-time Data Hooks
 * 
 * Custom React hooks for NeuroSEO™ real-time data subscriptions
 * 
 * Generated: July 31, 2025
 * Integration: NeuroSEO™ components → Firestore real-time data
 */

import { useState, useEffect, useCallback } from "react";
import { NeuroSEODataService, type NeuroSEODashboardData, type NeuroSEOAnalysis } from "@/lib/services/neuroseo-data.service";

// Hook for real-time NeuroSEO™ dashboard data
export const useNeuroSEODashboard = (userId: string | null) => {
    const [data, setData] = useState<NeuroSEODashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        console.log(`🧠 Setting up NeuroSEO™ dashboard subscription for user: ${userId}`);
        setLoading(true);
        setError(null);

        // Initial data fetch
        NeuroSEODataService.getNeuroSEODashboardData(userId)
            .then((initialData) => {
                setData(initialData);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching NeuroSEO™ dashboard data:", err);
                setError("Failed to load NeuroSEO™ data");
                setLoading(false);
            });

        // Set up real-time subscription
        const unsubscribe = NeuroSEODataService.subscribeToNeuroSEOData(
            userId,
            (updatedData) => {
                console.log("🧠 NeuroSEO™ data updated in real-time");
                setData(updatedData);
                setError(null);
            }
        );

        return () => {
            console.log("🔄 Cleaning up NeuroSEO™ subscription");
            unsubscribe();
        };
    }, [userId]);

    const refresh = useCallback(async () => {
        if (!userId) return;

        setLoading(true);
        try {
            const freshData = await NeuroSEODataService.getNeuroSEODashboardData(userId);
            setData(freshData);
            setError(null);
        } catch (err) {
            console.error("Error refreshing NeuroSEO™ data:", err);
            setError("Failed to refresh data");
        } finally {
            setLoading(false);
        }
    }, [userId]);

    return { data, loading, error, refresh };
};

// Hook for specific NeuroSEO™ engine data
export const useNeuroSEOEngine = (userId: string | null, engine: string) => {
    const [analyses, setAnalyses] = useState<NeuroSEOAnalysis[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId || !engine) {
            setLoading(false);
            return;
        }

        console.log(`🔧 Loading ${engine} analyses for user: ${userId}`);
        setLoading(true);
        setError(null);

        NeuroSEODataService.getAnalysesByEngine(userId, engine)
            .then((engineAnalyses) => {
                setAnalyses(engineAnalyses);
                setLoading(false);
            })
            .catch((err) => {
                console.error(`Error fetching ${engine} analyses:`, err);
                setError(`Failed to load ${engine} data`);
                setLoading(false);
            });
    }, [userId, engine]);

    const startAnalysis = useCallback(async (url: string) => {
        if (!userId) return null;

        try {
            setError(null);
            const analysisId = await NeuroSEODataService.startAnalysis(userId, url, engine);
            console.log(`🚀 Started ${engine} analysis: ${analysisId}`);

            // Refresh analyses list
            const updatedAnalyses = await NeuroSEODataService.getAnalysesByEngine(userId, engine);
            setAnalyses(updatedAnalyses);

            return analysisId;
        } catch (err) {
            console.error(`Error starting ${engine} analysis:`, err);
            setError(`Failed to start ${engine} analysis`);
            return null;
        }
    }, [userId, engine]);

    return { analyses, loading, error, startAnalysis };
};

// Hook for single analysis tracking
export const useNeuroSEOAnalysis = (analysisId: string | null) => {
    const [analysis, setAnalysis] = useState<NeuroSEOAnalysis | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!analysisId) {
            setLoading(false);
            return;
        }

        console.log(`📊 Loading analysis: ${analysisId}`);
        setLoading(true);
        setError(null);

        NeuroSEODataService.getAnalysisResults(analysisId)
            .then((analysisData) => {
                setAnalysis(analysisData);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching analysis results:", err);
                setError("Failed to load analysis");
                setLoading(false);
            });
    }, [analysisId]);

    const refresh = useCallback(async () => {
        if (!analysisId) return;

        setLoading(true);
        try {
            const freshAnalysis = await NeuroSEODataService.getAnalysisResults(analysisId);
            setAnalysis(freshAnalysis);
            setError(null);
        } catch (err) {
            console.error("Error refreshing analysis:", err);
            setError("Failed to refresh analysis");
        } finally {
            setLoading(false);
        }
    }, [analysisId]);

    return { analysis, loading, error, refresh };
};

// Hook for NeuroSEO™ analytics and trends
export const useNeuroSEOAnalytics = (userId: string | null, timeRange: '7d' | '30d' | '90d' = '30d') => {
    const [analytics, setAnalytics] = useState<{
        totalAnalyses: number;
        averageScore: number;
        trendData: Array<{ date: string; score: number; }>;
        enginePerformance: Record<string, number>;
        topRecommendations: string[];
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        console.log(`📈 Loading NeuroSEO™ analytics for ${timeRange} period`);
        setLoading(true);
        setError(null);

        // This would be implemented with more sophisticated analytics queries
        NeuroSEODataService.getNeuroSEODashboardData(userId)
            .then((dashboardData) => {
                // Transform dashboard data into analytics format
                const analyticsData = {
                    totalAnalyses: dashboardData.totalAnalyses,
                    averageScore: dashboardData.averageScore,
                    trendData: dashboardData.scoreTrend.map(item => ({
                        date: item.date,
                        score: item.score
                    })),
                    enginePerformance: {
                        'Neural Crawler': dashboardData.engineStats.neuralCrawler.avgScore,
                        'Semantic Map': dashboardData.engineStats.semanticMap.avgScore,
                        'AI Visibility': dashboardData.engineStats.aiVisibility.avgScore,
                        'Trust Block': dashboardData.engineStats.trustBlock.avgScore,
                        'Rewrite Gen': dashboardData.engineStats.rewriteGen.avgScore,
                        'Orchestrator': dashboardData.engineStats.orchestrator.avgScore
                    },
                    topRecommendations: [
                        'Optimize page load speed for better crawler performance',
                        'Improve semantic content structure',
                        'Enhance brand visibility in AI search results',
                        'Strengthen trust signals and authority markers',
                        'Create more engaging and unique content'
                    ]
                };

                setAnalytics(analyticsData);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching NeuroSEO™ analytics:", err);
                setError("Failed to load analytics");
                setLoading(false);
            });
    }, [userId, timeRange]);

    return { analytics, loading, error };
};
