/**
 * Enhanced Keyword Research Hooks
 * 
 * Custom React hooks for keyword research with real-time data
 * 
 * Generated: July 31, 2025
 * Integration: Keyword Tool components → Firestore real-time data
 */

import { useState, useEffect, useCallback } from "react";
import { KeywordDataService, type KeywordData, type KeywordAnalytics } from "@/lib/services/keyword-data.service";

// Hook for real-time keyword analytics
export const useKeywordAnalytics = (userId: string | null) => {
    const [analytics, setAnalytics] = useState<KeywordAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        console.log(`🔍 Loading keyword analytics for user: ${userId}`);
        setLoading(true);
        setError(null);

        KeywordDataService.getKeywordAnalytics(userId)
            .then((analyticsData) => {
                setAnalytics(analyticsData);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching keyword analytics:", err);
                setError("Failed to load keyword analytics");
                setLoading(false);
            });
    }, [userId]);

    const refresh = useCallback(async () => {
        if (!userId) return;

        setLoading(true);
        try {
            const freshAnalytics = await KeywordDataService.getKeywordAnalytics(userId);
            setAnalytics(freshAnalytics);
            setError(null);
        } catch (err) {
            console.error("Error refreshing keyword analytics:", err);
            setError("Failed to refresh analytics");
        } finally {
            setLoading(false);
        }
    }, [userId]);

    return { analytics, loading, error, refresh };
};

// Hook for keyword search with filters
export const useKeywordSearch = (userId: string | null) => {
    const [keywords, setKeywords] = useState<KeywordData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalResults, setTotalResults] = useState(0);

    const searchKeywords = useCallback(async (
        filters: {
            keyword?: string;
            minVolume?: number;
            maxDifficulty?: number;
            competition?: string;
            intent?: string;
            trend?: string;
        },
        limitCount: number = 50
    ) => {
        if (!userId) return;

        setLoading(true);
        setError(null);

        try {
            const results = await KeywordDataService.searchKeywords(userId, filters, limitCount);
            setKeywords(results);
            setTotalResults(results.length);
        } catch (err) {
            console.error("Error searching keywords:", err);
            setError("Failed to search keywords");
            setKeywords([]);
            setTotalResults(0);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const clearResults = useCallback(() => {
        setKeywords([]);
        setTotalResults(0);
        setError(null);
    }, []);

    return {
        keywords,
        loading,
        error,
        totalResults,
        searchKeywords,
        clearResults
    };
};

// Hook for keyword suggestions generation
export const useKeywordSuggestions = (userId: string | null) => {
    const [suggestions, setSuggestions] = useState<KeywordData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateSuggestions = useCallback(async (
        seedKeyword: string,
        targetCountry: string = 'US'
    ) => {
        if (!userId || !seedKeyword.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const newSuggestions = await KeywordDataService.generateKeywordSuggestions(
                userId,
                seedKeyword.trim(),
                targetCountry
            );
            setSuggestions(newSuggestions);
        } catch (err) {
            console.error("Error generating keyword suggestions:", err);
            setError("Failed to generate suggestions");
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const clearSuggestions = useCallback(() => {
        setSuggestions([]);
        setError(null);
    }, []);

    return {
        suggestions,
        loading,
        error,
        generateSuggestions,
        clearSuggestions
    };
};

// Hook for real-time keyword updates
export const useKeywordUpdates = (userId: string | null) => {
    const [keywords, setKeywords] = useState<KeywordData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        console.log(`🔄 Setting up keyword updates subscription for user: ${userId}`);
        setLoading(true);
        setError(null);

        const unsubscribe = KeywordDataService.subscribeToKeywordUpdates(
            userId,
            (updatedKeywords) => {
                console.log("🔍 Keywords updated in real-time");
                setKeywords(updatedKeywords);
                setError(null);
                setLoading(false);
            }
        );

        return () => {
            console.log("🔄 Cleaning up keyword subscription");
            unsubscribe();
        };
    }, [userId]);

    const addKeyword = useCallback(async (keywordData: Partial<KeywordData>) => {
        if (!userId) return null;

        try {
            const keywordId = await KeywordDataService.addKeywordResearch(userId, keywordData);
            console.log(`➕ Added keyword: ${keywordData.keyword}`);
            return keywordId;
        } catch (err) {
            console.error("Error adding keyword:", err);
            setError("Failed to add keyword");
            return null;
        }
    }, [userId]);

    return { keywords, loading, error, addKeyword };
};

// Hook for keyword competition analysis
export const useKeywordCompetition = () => {
    const [analysis, setAnalysis] = useState<{
        competitors: Array<{
            domain: string;
            strength: number;
            ranking: number;
            backlinks: number;
            authority: number;
        }>;
        difficulty: number;
        opportunity: 'high' | 'medium' | 'low';
        recommendations: string[];
    } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const analyzeCompetition = useCallback(async (keyword: string) => {
        if (!keyword.trim()) return;

        setLoading(true);
        setError(null);

        try {
            // Mock competition analysis - in production would call real SERP APIs
            const mockAnalysis = {
                competitors: [
                    {
                        domain: 'competitor1.com',
                        strength: 85,
                        ranking: 1,
                        backlinks: 1250,
                        authority: 72
                    },
                    {
                        domain: 'competitor2.com',
                        strength: 78,
                        ranking: 2,
                        backlinks: 890,
                        authority: 68
                    },
                    {
                        domain: 'competitor3.com',
                        strength: 71,
                        ranking: 3,
                        backlinks: 654,
                        authority: 63
                    }
                ],
                difficulty: Math.floor(Math.random() * 50) + 40,
                opportunity: (Math.random() > 0.6 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low') as 'high' | 'medium' | 'low',
                recommendations: [
                    'Focus on long-tail variations with lower competition',
                    'Create comprehensive, high-quality content',
                    'Build topical authority in related areas',
                    'Optimize for user intent and experience signals'
                ]
            };

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            setAnalysis(mockAnalysis);
        } catch (err) {
            console.error("Error analyzing competition:", err);
            setError("Failed to analyze competition");
            setAnalysis(null);
        } finally {
            setLoading(false);
        }
    }, []);

    const clearAnalysis = useCallback(() => {
        setAnalysis(null);
        setError(null);
    }, []);

    return {
        analysis,
        loading,
        error,
        analyzeCompetition,
        clearAnalysis
    };
};
