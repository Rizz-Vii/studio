/**
 * Enhanced NeuroSEO™ Orchestrator with Caching
 * RankPilot - Advanced AI Service Optimization
 */

import { LRUCache } from 'lru-cache';
import { NeuroSEOSuite } from '../neuroseo';

interface CacheConfig {
    max: number;
    ttl: number; // milliseconds
}

interface NeuroSEORequest {
    urls: string[];
    targetKeywords: string[];
    analysisType: 'comprehensive' | 'competitive' | 'seo-focused' | 'content-focused';
    userPlan: string;
    userId: string;
}interface CachedResult {
    data: any;
    timestamp: number;
    userPlan: string;
}

interface MemoryStats {
    used: number;
    total: number;
    threshold: number;
}

/**
 * Enhanced NeuroSEO™ Orchestrator with intelligent caching and memory optimization
 */
export class EnhancedNeuroSEOOrchestrator {
    private cache: LRUCache<string, CachedResult>;
    private neuroSEO: NeuroSEOSuite;
    private requestQueue: Map<string, Promise<any>>;
    private memoryThreshold: number;
    private cacheConfig: CacheConfig;

    constructor(cacheConfig: CacheConfig = { max: 100, ttl: 30 * 60 * 1000 }) {
        this.cacheConfig = cacheConfig;
        this.cache = new LRUCache({
            max: cacheConfig.max,
            ttl: cacheConfig.ttl,
            dispose: this.onCacheDispose.bind(this),
        });

        this.neuroSEO = new NeuroSEOSuite();
        this.requestQueue = new Map();
        this.memoryThreshold = 100 * 1024 * 1024; // 100MB
    }

    /**
     * Run NeuroSEO™ analysis with intelligent caching
     */
    async runAnalysis(request: NeuroSEORequest): Promise<any> {
        const cacheKey = this.generateCacheKey(request);

        // Check for existing request in progress
        if (this.requestQueue.has(cacheKey)) {
            return this.requestQueue.get(cacheKey);
        }

        // Check cache first
        const cached = this.getCachedResult(cacheKey, request.userPlan);
        if (cached) {
            return cached;
        }

        // Check memory before proceeding
        await this.checkMemoryUsage();

        // Create new analysis promise
        const analysisPromise = this.performAnalysis(request);
        this.requestQueue.set(cacheKey, analysisPromise);

        try {
            const result = await analysisPromise;

            // Cache the result
            this.setCachedResult(cacheKey, result, request.userPlan);

            return result;
        } finally {
            // Remove from queue
            this.requestQueue.delete(cacheKey);
        }
    }

    /**
     * Generate cache key from request parameters
     */
    private generateCacheKey(request: NeuroSEORequest): string {
        const keyData = {
            urls: request.urls.sort(),
            keywords: request.targetKeywords.sort(),
            type: request.analysisType,
        };

        return Buffer.from(JSON.stringify(keyData)).toString('base64');
    }

    /**
     * Get cached result with plan-based validation
     */
    private getCachedResult(cacheKey: string, userPlan: string): any | null {
        const cached = this.cache.get(cacheKey);

        if (!cached) return null;

        // Validate plan compatibility (higher plans can use lower plan cache)
        const planHierarchy = ['free', 'starter', 'agency', 'enterprise', 'admin'];
        const cachedPlanIndex = planHierarchy.indexOf(cached.userPlan);
        const requestPlanIndex = planHierarchy.indexOf(userPlan);

        if (requestPlanIndex >= cachedPlanIndex) {
            return cached.data;
        }

        return null;
    }

    /**
     * Set cached result with metadata
     */
    private setCachedResult(cacheKey: string, data: any, userPlan: string): void {
        const cachedResult: CachedResult = {
            data,
            timestamp: Date.now(),
            userPlan,
        };

        this.cache.set(cacheKey, cachedResult);
    }

    /**
     * Perform actual NeuroSEO™ analysis
     */
    private async performAnalysis(request: NeuroSEORequest): Promise<any> {
        try {
            // Add performance monitoring
            const startTime = performance.now();

            const result = await this.neuroSEO.runAnalysis({
                urls: request.urls,
                targetKeywords: request.targetKeywords,
                analysisType: request.analysisType,
                userPlan: request.userPlan,
                userId: request.userId,
            });

            const duration = performance.now() - startTime;

            // Log performance metrics
            this.logPerformanceMetrics({
                operation: 'neuroseo_analysis',
                duration,
                requestSize: JSON.stringify(request).length,
                responseSize: JSON.stringify(result).length,
            });

            return result;
        } catch (error) {
            // Log error and provide fallback
            console.error('NeuroSEO Analysis Error:', error);

            // Return cached result if available (any plan)
            const fallbackKey = this.generateCacheKey(request);
            const fallback = this.cache.get(fallbackKey);

            if (fallback) {
                console.warn('Using cached fallback for failed analysis');
                return fallback.data;
            }

            throw error;
        }
    }

    /**
     * Check memory usage and clear cache if needed
     */
    private async checkMemoryUsage(): Promise<void> {
        if (typeof window !== 'undefined' && 'memory' in performance) {
            const memory = (performance as any).memory;
            const memoryStats: MemoryStats = {
                used: memory.usedJSHeapSize,
                total: memory.totalJSHeapSize,
                threshold: this.memoryThreshold,
            };

            if (memoryStats.used > memoryStats.threshold) {
                console.warn('High memory usage detected, clearing cache');
                this.clearOldCache();

                // Force garbage collection if available
                if ('gc' in window) {
                    (window as any).gc();
                }
            }
        }
    }

    /**
     * Clear old cache entries
     */
    private clearOldCache(): void {
        const now = Date.now();
        const maxAge = this.cacheConfig.ttl / 2; // Clear entries older than half TTL

        this.cache.forEach((value: CachedResult, key: string) => {
            if (now - value.timestamp > maxAge) {
                this.cache.delete(key);
            }
        });
    }    /**
     * Handle cache disposal
     */
    private onCacheDispose(value: CachedResult, key: string): void {
        // Log cache eviction for monitoring
        console.debug('Cache entry evicted:', key);
    }

    /**
     * Log performance metrics
     */
    private logPerformanceMetrics(metrics: {
        operation: string;
        duration: number;
        requestSize: number;
        responseSize: number;
    }): void {
        if (typeof window !== 'undefined' && 'gtag' in window) {
            (window as any).gtag('event', 'neuroseo_performance', {
                event_category: 'AI Performance',
                operation: metrics.operation,
                duration: Math.round(metrics.duration),
                request_size: metrics.requestSize,
                response_size: metrics.responseSize,
            });
        }
    }

    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            max: this.cache.max,
            hitRate: this.cache.calculatedSize / this.cache.max,
            memoryUsage: this.cache.calculatedSize,
        };
    }

    /**
     * Clear all cache
     */
    clearCache(): void {
        this.cache.clear();
        this.requestQueue.clear();
    }

    /**
     * Preload analysis for common requests
     */
    async preloadAnalysis(requests: NeuroSEORequest[]): Promise<void> {
        const preloadPromises = requests.map(request =>
            this.runAnalysis(request).catch(error => {
                console.warn('Preload failed for request:', request, error);
            })
        );

        await Promise.allSettled(preloadPromises);
    }
}

/**
 * Global orchestrator instance
 */
export const neuroSEOOrchestrator = new EnhancedNeuroSEOOrchestrator({
    max: 50, // Reduced for production
    ttl: 15 * 60 * 1000, // 15 minutes
});

/**
 * React hook for NeuroSEO™ with caching
 */
export function useNeuroSEO() {
    return {
        runAnalysis: neuroSEOOrchestrator.runAnalysis.bind(neuroSEOOrchestrator),
        getCacheStats: neuroSEOOrchestrator.getCacheStats.bind(neuroSEOOrchestrator),
        clearCache: neuroSEOOrchestrator.clearCache.bind(neuroSEOOrchestrator),
        preloadAnalysis: neuroSEOOrchestrator.preloadAnalysis.bind(neuroSEOOrchestrator),
    };
}
