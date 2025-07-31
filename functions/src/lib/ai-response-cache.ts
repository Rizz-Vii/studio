/**
 * Optimized AI Response Caching System
 * Intelligent caching with TTL, compression, and cache warming
 */

import { logger } from "firebase-functions";
import { StructuredLogger } from "./structured-logger";

export interface CacheEntry<T> {
    data: T;
    expiry: number;
    accessCount: number;
    lastAccessed: number;
    compressed?: boolean;
    metadata: {
        aiModel: string;
        promptHash: string;
        tokens: number;
        createdAt: number;
        userTier: string;
    };
}

export interface CacheConfig {
    defaultTTL: number;
    maxSize: number;
    compressionThreshold: number; // Bytes
    warmingEnabled: boolean;
    tierMultipliers: Record<string, number>;
}

export class AIResponseCache {
  private static cache = new Map<string, CacheEntry<any>>();
  private static config: CacheConfig = {
    defaultTTL: 60 * 60 * 1000, // 1 hour
    maxSize: 1000,
    compressionThreshold: 5000, // 5KB
    warmingEnabled: true,
    tierMultipliers: {
      "free": 0.5,      // 30 minutes
      "starter": 1,     // 1 hour
      "agency": 2,      // 2 hours
      "enterprise": 4,  // 4 hours
      "admin": 8        // 8 hours
    }
  };

  /**
     * Get cached response
     */
  static async get<T>(
    key: string,
    traceId?: string
  ): Promise<T | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      if (traceId) {
        StructuredLogger.logBusinessEvent(traceId, "cache_miss", { key });
      }
      return null;
    }

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      if (traceId) {
        StructuredLogger.logBusinessEvent(traceId, "cache_expired", {
          key,
          age: Date.now() - entry.metadata.createdAt
        });
      }
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();

    if (traceId) {
      StructuredLogger.logBusinessEvent(traceId, "cache_hit", {
        key,
        accessCount: entry.accessCount,
        age: Date.now() - entry.metadata.createdAt,
        userTier: entry.metadata.userTier
      });
    }

    // Decompress if needed
    let data = entry.data;
    if (entry.compressed) {
      data = await this.decompress(entry.data);
    }

    return data;
  }

  /**
     * Store response in cache
     */
  static async set<T>(
    key: string,
    data: T,
    options: {
            aiModel: string;
            promptHash: string;
            tokens: number;
            userTier: string;
            customTTL?: number;
            traceId?: string;
        }
  ): Promise<void> {
    const { aiModel, promptHash, tokens, userTier, customTTL, traceId } = options;

    // Calculate TTL based on user tier
    const tierMultiplier = this.config.tierMultipliers[userTier] || 1;
    const ttl = customTTL || (this.config.defaultTTL * tierMultiplier);

    // Check if we need to compress
    const dataSize = this.estimateSize(data);
    let finalData: any = data;
    let compressed = false;

    if (dataSize > this.config.compressionThreshold) {
      try {
        finalData = await this.compress(data);
        compressed = true;

        if (traceId) {
          StructuredLogger.logBusinessEvent(traceId, "cache_compressed", {
            originalSize: dataSize,
            compressedSize: this.estimateSize(finalData),
            compressionRatio: this.estimateSize(finalData) / dataSize
          });
        }
      } catch (error) {
        logger.warn("Cache compression failed", { error, key });
      }
    }

    const entry: CacheEntry<T> = {
      data: finalData,
      expiry: Date.now() + ttl,
      accessCount: 0,
      lastAccessed: Date.now(),
      compressed,
      metadata: {
        aiModel,
        promptHash,
        tokens,
        createdAt: Date.now(),
        userTier
      }
    };

    // Ensure cache size limit
    await this.ensureCacheSize();

    this.cache.set(key, entry);

    if (traceId) {
      StructuredLogger.logBusinessEvent(traceId, "cache_set", {
        key,
        ttl,
        dataSize,
        compressed,
        userTier,
        tokens
      });
    }

    // Trigger cache warming for popular patterns
    if (this.config.warmingEnabled) {
      this.scheduleWarmingCheck(key, options);
    }
  }

  /**
     * Generate cache key from prompt and parameters
     */
  static generateKey(
    functionName: string,
    prompt: string,
    parameters: Record<string, any> = {}
  ): string {
    const paramStr = JSON.stringify(parameters, Object.keys(parameters).sort());
    const content = `${functionName}:${prompt}:${paramStr}`;

    // Simple hash function
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return `ai_cache_${Math.abs(hash).toString(36)}`;
  }

  /**
     * Get cache statistics
     */
  static getStats(): {
        size: number;
        hitRate: number;
        totalAccesses: number;
        memoryUsage: number;
        topKeys: Array<{ key: string; accessCount: number; userTier: string }>;
        tierDistribution: Record<string, number>;
        } {
    const entries = Array.from(this.cache.entries());
    const totalAccesses = entries.reduce((sum, [, entry]) => sum + entry.accessCount, 0);
    const hits = entries.filter(([, entry]) => entry.accessCount > 0).length;

    const topKeys = entries
      .sort(([, a], [, b]) => b.accessCount - a.accessCount)
      .slice(0, 10)
      .map(([key, entry]) => ({
        key: key.substring(0, 20) + "...",
        accessCount: entry.accessCount,
        userTier: entry.metadata.userTier
      }));

    const tierDistribution: Record<string, number> = {};
    entries.forEach(([, entry]) => {
      const tier = entry.metadata.userTier;
      tierDistribution[tier] = (tierDistribution[tier] || 0) + 1;
    });

    return {
      size: this.cache.size,
      hitRate: totalAccesses > 0 ? (hits / totalAccesses) * 100 : 0,
      totalAccesses,
      memoryUsage: this.estimateMemoryUsage(),
      topKeys,
      tierDistribution
    };
  }

  /**
     * Clear expired entries
     */
  static cleanupExpired(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.info("Cache cleanup completed", {
        entriesRemoved: cleaned,
        remainingEntries: this.cache.size
      });
    }

    return cleaned;
  }

  /**
     * Warm cache with popular queries
     */
  static async warmCache(
    queries: Array<{
            key: string;
            generator: () => Promise<any>;
            priority: number;
        }>
  ): Promise<void> {
    const sortedQueries = queries.sort((a, b) => b.priority - a.priority);

    for (const query of sortedQueries.slice(0, 20)) { // Limit warming
      if (!this.cache.has(query.key)) {
        try {
          const result = await query.generator();
          // Use a simplified set for warming
          this.cache.set(query.key, {
            data: result,
            expiry: Date.now() + this.config.defaultTTL,
            accessCount: 0,
            lastAccessed: Date.now(),
            metadata: {
              aiModel: "warmed",
              promptHash: "warmed",
              tokens: 0,
              createdAt: Date.now(),
              userTier: "system"
            }
          });

          logger.info("Cache warmed", { key: query.key });
        } catch (error) {
          logger.warn("Cache warming failed", { key: query.key, error });
        }
      }
    }
  }

  /**
     * Invalidate cache entries by pattern
     */
  static invalidatePattern(pattern: RegExp): number {
    let invalidated = 0;

    for (const [key] of this.cache.entries()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
        invalidated++;
      }
    }

    logger.info("Cache invalidation completed", {
      pattern: pattern.toString(),
      entriesInvalidated: invalidated
    });

    return invalidated;
  }

  /**
     * Ensure cache doesn't exceed size limit
     */
  private static async ensureCacheSize(): Promise<void> {
    if (this.cache.size < this.config.maxSize) return;

    // Remove LRU entries
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);

    const toRemove = Math.floor(this.config.maxSize * 0.2); // Remove 20%

    for (let i = 0; i < toRemove && i < entries.length; i++) {
      this.cache.delete(entries[i][0]);
    }

    logger.info("Cache size limit enforced", {
      removedEntries: toRemove,
      currentSize: this.cache.size
    });
  }

  /**
     * Schedule cache warming check for popular patterns
     */
  private static scheduleWarmingCheck(key: string, options: any): void {
    // Implement intelligent warming logic
    const entry = this.cache.get(key);
    if (entry && entry.accessCount > 10) {
      // This is a popular entry, consider it for warming
      logger.info("Popular cache entry identified", {
        key: key.substring(0, 20) + "...",
        accessCount: entry.accessCount,
        userTier: entry.metadata.userTier
      });
    }
  }

  /**
     * Estimate object size in bytes
     */
  private static estimateSize(obj: any): number {
    return JSON.stringify(obj).length * 2; // Rough estimate (UTF-16)
  }

  /**
     * Estimate total memory usage
     */
  private static estimateMemoryUsage(): number {
    let total = 0;
    for (const [key, entry] of this.cache.entries()) {
      total += key.length * 2; // Key size
      total += this.estimateSize(entry); // Entry size
    }
    return total;
  }

  /**
     * Simple compression (placeholder - in production, use real compression)
     */
  private static async compress(data: any): Promise<string> {
    // In production, use gzip or similar
    return JSON.stringify(data);
  }

  /**
     * Simple decompression (placeholder)
     */
  private static async decompress(data: string): Promise<any> {
    return JSON.parse(data);
  }
}

// Cleanup expired entries every 10 minutes
setInterval(() => AIResponseCache.cleanupExpired(), 10 * 60 * 1000);
