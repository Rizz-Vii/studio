/**
 * Enhanced Keyword Research Data Service
 * 
 * Comprehensive data service for keyword research with real-time updates
 * 
 * Generated: July 31, 2025
 * Integration: Firestore collections → Keyword Tool components
 */

import {
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    doc,
    getDoc,
    addDoc,
    updateDoc,
    onSnapshot,
    Timestamp,
    QuerySnapshot,
    DocumentData
} from "firebase/firestore";
import { db } from "@/lib/firebase/index";

// Keyword Research Interfaces
export interface KeywordData {
    id: string;
    userId: string;
    keyword: string;
    searchVolume: number;
    difficulty: number;
    competition: 'low' | 'medium' | 'high';
    cpc: number;
    trend: 'rising' | 'stable' | 'declining';
    seasonality?: Array<{ month: string; volume: number; }>;
    relatedKeywords: string[];
    longtailVariations: string[];
    questions: string[];
    intent: 'informational' | 'commercial' | 'transactional' | 'navigational';
    topicalRelevance: number;
    opportunities: string[];
    serp: {
        results: Array<{
            title: string;
            url: string;
            position: number;
            domain: string;
        }>;
        features: string[];
    };
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface KeywordResearchProject {
    id: string;
    userId: string;
    name: string;
    seedKeywords: string[];
    targetCountry: string;
    targetLanguage: string;
    industry: string;
    status: 'active' | 'completed' | 'archived';
    keywords: KeywordData[];
    totalKeywords: number;
    averageDifficulty: number;
    totalSearchVolume: number;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface KeywordAnalytics {
    totalKeywords: number;
    totalSearchVolume: number;
    averageDifficulty: number;
    competitionBreakdown: {
        low: number;
        medium: number;
        high: number;
    };
    intentBreakdown: {
        informational: number;
        commercial: number;
        transactional: number;
        navigational: number;
    };
    trendAnalysis: {
        rising: number;
        stable: number;
        declining: number;
    };
    topOpportunities: KeywordData[];
    recentSearches: KeywordData[];
}

class KeywordDataService {

    /**
     * Get comprehensive keyword analytics for user
     */
    static async getKeywordAnalytics(userId: string): Promise<KeywordAnalytics> {
        console.log(`🔍 Fetching keyword analytics for user: ${userId}`);

        try {
            const keywordsQuery = query(
                collection(db, 'keywordResearch'),
                where('userId', '==', userId),
                orderBy('createdAt', 'desc'),
                limit(200)
            );

            const snapshot = await getDocs(keywordsQuery);
            const keywords = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as KeywordData[];

            // Calculate analytics
            const totalKeywords = keywords.length;
            const totalSearchVolume = keywords.reduce((sum, k) => sum + (k.searchVolume || 0), 0);
            const averageDifficulty = keywords.length > 0
                ? keywords.reduce((sum, k) => sum + (k.difficulty || 0), 0) / keywords.length
                : 0;

            // Competition breakdown
            const competitionBreakdown = {
                low: keywords.filter(k => k.competition === 'low').length,
                medium: keywords.filter(k => k.competition === 'medium').length,
                high: keywords.filter(k => k.competition === 'high').length,
            };

            // Intent breakdown
            const intentBreakdown = {
                informational: keywords.filter(k => k.intent === 'informational').length,
                commercial: keywords.filter(k => k.intent === 'commercial').length,
                transactional: keywords.filter(k => k.intent === 'transactional').length,
                navigational: keywords.filter(k => k.intent === 'navigational').length,
            };

            // Trend analysis
            const trendAnalysis = {
                rising: keywords.filter(k => k.trend === 'rising').length,
                stable: keywords.filter(k => k.trend === 'stable').length,
                declining: keywords.filter(k => k.trend === 'declining').length,
            };

            // Top opportunities (high volume, low competition)
            const topOpportunities = keywords
                .filter(k => k.competition === 'low' && k.searchVolume > 1000)
                .sort((a, b) => (b.searchVolume || 0) - (a.searchVolume || 0))
                .slice(0, 10);

            // Recent searches
            const recentSearches = keywords.slice(0, 10);

            return {
                totalKeywords,
                totalSearchVolume,
                averageDifficulty: Math.round(averageDifficulty),
                competitionBreakdown,
                intentBreakdown,
                trendAnalysis,
                topOpportunities,
                recentSearches
            };

        } catch (error) {
            console.error('Error fetching keyword analytics:', error);
            throw error;
        }
    }

    /**
     * Search keywords with filters
     */
    static async searchKeywords(
        userId: string,
        filters: {
            keyword?: string;
            minVolume?: number;
            maxDifficulty?: number;
            competition?: string;
            intent?: string;
            trend?: string;
        },
        limitCount: number = 50
    ): Promise<KeywordData[]> {
        console.log(`🔎 Searching keywords with filters:`, filters);

        try {
            let keywordsQuery = query(
                collection(db, 'keywordResearch'),
                where('userId', '==', userId),
                orderBy('searchVolume', 'desc'),
                limit(limitCount)
            );

            const snapshot = await getDocs(keywordsQuery);
            let keywords = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as KeywordData[];

            // Apply client-side filters (in production, these would be server-side)
            if (filters.keyword) {
                keywords = keywords.filter(k =>
                    k.keyword.toLowerCase().includes(filters.keyword!.toLowerCase())
                );
            }

            if (filters.minVolume) {
                keywords = keywords.filter(k => (k.searchVolume || 0) >= filters.minVolume!);
            }

            if (filters.maxDifficulty) {
                keywords = keywords.filter(k => (k.difficulty || 0) <= filters.maxDifficulty!);
            }

            if (filters.competition) {
                keywords = keywords.filter(k => k.competition === filters.competition);
            }

            if (filters.intent) {
                keywords = keywords.filter(k => k.intent === filters.intent);
            }

            if (filters.trend) {
                keywords = keywords.filter(k => k.trend === filters.trend);
            }

            return keywords.slice(0, limitCount);
        } catch (error) {
            console.error('Error searching keywords:', error);
            throw error;
        }
    }

    /**
     * Add new keyword research
     */
    static async addKeywordResearch(
        userId: string,
        keywordData: Partial<KeywordData>
    ): Promise<string> {
        console.log(`➕ Adding keyword research for: ${keywordData.keyword}`);

        try {
            const docRef = await addDoc(collection(db, 'keywordResearch'), {
                userId,
                ...keywordData,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            });

            return docRef.id;
        } catch (error) {
            console.error('Error adding keyword research:', error);
            throw error;
        }
    }

    /**
     * Generate keyword suggestions from seed keyword
     */
    static async generateKeywordSuggestions(
        userId: string,
        seedKeyword: string,
        targetCountry: string = 'US'
    ): Promise<KeywordData[]> {
        console.log(`🌱 Generating suggestions for seed keyword: ${seedKeyword}`);

        try {
            // In production, this would call actual keyword research APIs
            // For now, generate realistic mock data
            const suggestions = this.generateMockKeywordSuggestions(seedKeyword, userId);

            // Save suggestions to database
            const savePromises = suggestions.map(suggestion =>
                this.addKeywordResearch(userId, suggestion)
            );

            await Promise.all(savePromises);

            return suggestions;
        } catch (error) {
            console.error('Error generating keyword suggestions:', error);
            throw error;
        }
    }

    /**
     * Subscribe to real-time keyword updates
     */
    static subscribeToKeywordUpdates(
        userId: string,
        callback: (keywords: KeywordData[]) => void
    ): () => void {
        console.log(`🔄 Setting up keyword updates subscription for user: ${userId}`);

        const keywordsQuery = query(
            collection(db, 'keywordResearch'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(100)
        );

        return onSnapshot(keywordsQuery, (snapshot) => {
            const keywords = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as KeywordData[];

            callback(keywords);
        });
    }

    // Private helper methods

    private static generateMockKeywordSuggestions(
        seedKeyword: string,
        userId: string
    ): KeywordData[] {
        const baseVariations = [
            `${seedKeyword} tool`,
            `${seedKeyword} software`,
            `best ${seedKeyword}`,
            `${seedKeyword} guide`,
            `${seedKeyword} tutorial`,
            `${seedKeyword} tips`,
            `${seedKeyword} strategy`,
            `${seedKeyword} examples`,
            `how to ${seedKeyword}`,
            `${seedKeyword} for beginners`,
            `${seedKeyword} vs`,
            `${seedKeyword} free`,
            `${seedKeyword} online`,
            `${seedKeyword} service`,
            `${seedKeyword} agency`
        ];

        const intents: Array<'informational' | 'commercial' | 'transactional' | 'navigational'> =
            ['informational', 'commercial', 'transactional', 'navigational'];

        const competitions: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];
        const trends: Array<'rising' | 'stable' | 'declining'> = ['rising', 'stable', 'declining'];

        return baseVariations.slice(0, 10).map((keyword, index) => ({
            id: `temp-${Date.now()}-${index}`,
            userId,
            keyword,
            searchVolume: Math.floor(Math.random() * 10000) + 500,
            difficulty: Math.floor(Math.random() * 100) + 1,
            competition: competitions[Math.floor(Math.random() * competitions.length)],
            cpc: Math.round((Math.random() * 5 + 0.5) * 100) / 100,
            trend: trends[Math.floor(Math.random() * trends.length)],
            relatedKeywords: [
                `${keyword} comparison`,
                `${keyword} reviews`,
                `${keyword} pricing`
            ],
            longtailVariations: [
                `best ${keyword} for small business`,
                `${keyword} with advanced features`,
                `affordable ${keyword} solution`
            ],
            questions: [
                `What is the best ${keyword}?`,
                `How much does ${keyword} cost?`,
                `How to choose ${keyword}?`
            ],
            intent: intents[Math.floor(Math.random() * intents.length)],
            topicalRelevance: Math.floor(Math.random() * 40) + 60,
            opportunities: [
                'Low competition opportunity',
                'High search volume potential',
                'Strong commercial intent'
            ],
            serp: {
                results: [
                    {
                        title: `Best ${keyword} Solutions`,
                        url: `https://example.com/${keyword.replace(/\s+/g, '-')}`,
                        position: 1,
                        domain: 'example.com'
                    }
                ],
                features: ['featured_snippet', 'people_also_ask']
            },
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        }));
    }
}

export { KeywordDataService };
