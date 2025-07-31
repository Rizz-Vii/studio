/**
 * Advanced Tier-Based Rate Limiting
 * Sophisticated rate limiting with user tiers, burst allowances, and intelligent throttling
 */

import { HttpsError } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import { StructuredLogger } from "./structured-logger";

export interface TierLimits {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
    burstAllowance: number;
    aiTokensPerDay: number;
    concurrentRequests: number;
    priority: number; // Higher number = higher priority
}

export interface RateLimitConfig {
    [tier: string]: TierLimits;
}

export interface RateLimitEntry {
    requests: Array<{ timestamp: number; tokens?: number }>;
    burstUsed: number;
    lastReset: number;
    concurrentCount: number;
    blockedUntil: number;
}

export class TierBasedRateLimit {
  private static limits: RateLimitConfig = {
    free: {
      requestsPerMinute: 5,
      requestsPerHour: 50,
      requestsPerDay: 200,
      burstAllowance: 3,
      aiTokensPerDay: 10000,
      concurrentRequests: 1,
      priority: 1
    },
    starter: {
      requestsPerMinute: 20,
      requestsPerHour: 300,
      requestsPerDay: 2000,
      burstAllowance: 10,
      aiTokensPerDay: 100000,
      concurrentRequests: 3,
      priority: 2
    },
    agency: {
      requestsPerMinute: 60,
      requestsPerHour: 1000,
      requestsPerDay: 10000,
      burstAllowance: 30,
      aiTokensPerDay: 500000,
      concurrentRequests: 10,
      priority: 3
    },
    enterprise: {
      requestsPerMinute: 200,
      requestsPerHour: 5000,
      requestsPerDay: 50000,
      burstAllowance: 100,
      aiTokensPerDay: 2000000,
      concurrentRequests: 50,
      priority: 4
    },
    admin: {
      requestsPerMinute: 1000,
      requestsPerHour: 10000,
      requestsPerDay: 100000,
      burstAllowance: 500,
      aiTokensPerDay: 10000000,
      concurrentRequests: 100,
      priority: 5
    }
  };

  private static userLimits = new Map<string, RateLimitEntry>();
  private static globalStats = {
    totalRequests: 0,
    blockedRequests: 0,
    burstRequestsUsed: 0
  };

  /**
     * Check if request is allowed and update counters
     */
  static async checkLimit(
    userId: string,
    userTier: string,
    functionName: string,
    options: {
            aiTokens?: number;
            traceId?: string;
            priority?: number;
        } = {}
  ): Promise<{
        allowed: boolean;
        reason?: string;
        retryAfter?: number;
        remainingRequests?: {
            minute: number;
            hour: number;
            day: number;
        };
    }> {
    const { aiTokens = 0, traceId, priority = 0 } = options;

    this.globalStats.totalRequests++;

    // Get tier limits
    const tierLimits = this.limits[userTier];
    if (!tierLimits) {
      logger.warn("Unknown user tier", { userId, userTier, functionName });
      // Default to free tier limits
      const tierLimits = this.limits.free;
    }

    // Get or create user limit entry
    let userEntry = this.userLimits.get(userId);
    if (!userEntry) {
      userEntry = this.createNewEntry();
      this.userLimits.set(userId, userEntry);
    }

    // Check if user is temporarily blocked
    if (Date.now() < userEntry.blockedUntil) {
      this.globalStats.blockedRequests++;

      if (traceId) {
        StructuredLogger.logBusinessEvent(traceId, "rate_limit_blocked", {
          userId,
          userTier,
          functionName,
          reason: "temporarily_blocked",
          blockedUntil: userEntry.blockedUntil
        });
      }

      return {
        allowed: false,
        reason: "temporarily_blocked",
        retryAfter: Math.ceil((userEntry.blockedUntil - Date.now()) / 1000)
      };
    }

    // Clean old requests
    this.cleanOldRequests(userEntry);

    const now = Date.now();
    const oneMinute = 60 * 1000;
    const oneHour = 60 * oneMinute;
    const oneDay = 24 * oneHour;

    // Count requests in different time windows
    const requestsLastMinute = userEntry.requests.filter(
      r => now - r.timestamp < oneMinute
    ).length;

    const requestsLastHour = userEntry.requests.filter(
      r => now - r.timestamp < oneHour
    ).length;

    const requestsLastDay = userEntry.requests.filter(
      r => now - r.timestamp < oneDay
    ).length;

    // Count AI tokens used today
    const tokensToday = userEntry.requests
      .filter(r => now - r.timestamp < oneDay)
      .reduce((sum, r) => sum + (r.tokens || 0), 0);

    // Check concurrent requests
    if (userEntry.concurrentCount >= tierLimits.concurrentRequests) {
      this.globalStats.blockedRequests++;

      if (traceId) {
        StructuredLogger.logBusinessEvent(traceId, "rate_limit_blocked", {
          userId,
          userTier,
          functionName,
          reason: "concurrent_limit",
          currentConcurrent: userEntry.concurrentCount,
          maxConcurrent: tierLimits.concurrentRequests
        });
      }

      return {
        allowed: false,
        reason: "too_many_concurrent_requests",
        retryAfter: 30 // Suggest 30 second retry
      };
    }

    // Check various limits with burst allowance
    const limitChecks = [
      {
        current: requestsLastMinute,
        limit: tierLimits.requestsPerMinute,
        window: "minute",
        retryAfter: 60
      },
      {
        current: requestsLastHour,
        limit: tierLimits.requestsPerHour,
        window: "hour",
        retryAfter: 3600
      },
      {
        current: requestsLastDay,
        limit: tierLimits.requestsPerDay,
        window: "day",
        retryAfter: 86400
      }
    ];

    // Check AI token limits
    if (aiTokens > 0 && tokensToday + aiTokens > tierLimits.aiTokensPerDay) {
      this.globalStats.blockedRequests++;

      if (traceId) {
        StructuredLogger.logBusinessEvent(traceId, "rate_limit_blocked", {
          userId,
          userTier,
          functionName,
          reason: "ai_token_limit",
          tokensRequested: aiTokens,
          tokensUsedToday: tokensToday,
          tokenLimit: tierLimits.aiTokensPerDay
        });
      }

      return {
        allowed: false,
        reason: "ai_token_limit_exceeded",
        retryAfter: this.getTimeUntilReset("day")
      };
    }

    // Check each time window limit
    for (const check of limitChecks) {
      if (check.current >= check.limit) {
        // Check if burst allowance can be used
        const burstAvailable = tierLimits.burstAllowance - userEntry.burstUsed;
        const canUseBurst = burstAvailable > 0 && this.shouldAllowBurst(userTier, priority);

        if (canUseBurst) {
          userEntry.burstUsed++;
          this.globalStats.burstRequestsUsed++;

          if (traceId) {
            StructuredLogger.logBusinessEvent(traceId, "rate_limit_burst_used", {
              userId,
              userTier,
              functionName,
              window: check.window,
              burstRemaining: burstAvailable - 1
            });
          }

          // Allow request but log burst usage
          break;
        } else {
          this.globalStats.blockedRequests++;

          // Implement progressive penalties for repeated violations
          const penalty = this.calculatePenalty(userEntry, userTier);
          if (penalty > 0) {
            userEntry.blockedUntil = Date.now() + penalty;
          }

          if (traceId) {
            StructuredLogger.logBusinessEvent(traceId, "rate_limit_blocked", {
              userId,
              userTier,
              functionName,
              reason: `${check.window}_limit_exceeded`,
              current: check.current,
              limit: check.limit,
              penalty
            });
          }

          return {
            allowed: false,
            reason: `${check.window}_limit_exceeded`,
            retryAfter: check.retryAfter,
            remainingRequests: {
              minute: Math.max(0, tierLimits.requestsPerMinute - requestsLastMinute),
              hour: Math.max(0, tierLimits.requestsPerHour - requestsLastHour),
              day: Math.max(0, tierLimits.requestsPerDay - requestsLastDay)
            }
          };
        }
      }
    }

    // Request is allowed - record it
    userEntry.requests.push({
      timestamp: now,
      tokens: aiTokens
    });
    userEntry.concurrentCount++;

    if (traceId) {
      StructuredLogger.logBusinessEvent(traceId, "rate_limit_allowed", {
        userId,
        userTier,
        functionName,
        requestsLastMinute,
        requestsLastHour,
        requestsLastDay,
        tokensUsed: aiTokens,
        burstUsed: userEntry.burstUsed
      });
    }

    return {
      allowed: true,
      remainingRequests: {
        minute: Math.max(0, tierLimits.requestsPerMinute - requestsLastMinute - 1),
        hour: Math.max(0, tierLimits.requestsPerHour - requestsLastHour - 1),
        day: Math.max(0, tierLimits.requestsPerDay - requestsLastDay - 1)
      }
    };
  }

  /**
     * Mark request as completed (for concurrent tracking)
     */
  static completeRequest(userId: string): void {
    const userEntry = this.userLimits.get(userId);
    if (userEntry && userEntry.concurrentCount > 0) {
      userEntry.concurrentCount--;
    }
  }

  /**
     * Get rate limit status for user
     */
  static getUserStatus(userId: string, userTier: string): {
        tier: string;
        limits: TierLimits;
        usage: {
            requestsLastMinute: number;
            requestsLastHour: number;
            requestsLastDay: number;
            tokensUsedToday: number;
            burstUsed: number;
            concurrentRequests: number;
        };
        resetTimes: {
            nextMinute: number;
            nextHour: number;
            nextDay: number;
        };
    } {
    const tierLimits = this.limits[userTier] || this.limits.free;
    const userEntry = this.userLimits.get(userId);

    if (!userEntry) {
      return {
        tier: userTier,
        limits: tierLimits,
        usage: {
          requestsLastMinute: 0,
          requestsLastHour: 0,
          requestsLastDay: 0,
          tokensUsedToday: 0,
          burstUsed: 0,
          concurrentRequests: 0
        },
        resetTimes: {
          nextMinute: Date.now() + 60000,
          nextHour: Date.now() + 3600000,
          nextDay: Date.now() + 86400000
        }
      };
    }

    this.cleanOldRequests(userEntry);

    const now = Date.now();
    const oneMinute = 60 * 1000;
    const oneHour = 60 * oneMinute;
    const oneDay = 24 * oneHour;

    const requestsLastMinute = userEntry.requests.filter(
      r => now - r.timestamp < oneMinute
    ).length;

    const requestsLastHour = userEntry.requests.filter(
      r => now - r.timestamp < oneHour
    ).length;

    const requestsLastDay = userEntry.requests.filter(
      r => now - r.timestamp < oneDay
    ).length;

    const tokensUsedToday = userEntry.requests
      .filter(r => now - r.timestamp < oneDay)
      .reduce((sum, r) => sum + (r.tokens || 0), 0);

    return {
      tier: userTier,
      limits: tierLimits,
      usage: {
        requestsLastMinute,
        requestsLastHour,
        requestsLastDay,
        tokensUsedToday,
        burstUsed: userEntry.burstUsed,
        concurrentRequests: userEntry.concurrentCount
      },
      resetTimes: {
        nextMinute: Math.ceil((now + oneMinute) / oneMinute) * oneMinute,
        nextHour: Math.ceil((now + oneHour) / oneHour) * oneHour,
        nextDay: Math.ceil((now + oneDay) / oneDay) * oneDay
      }
    };
  }

  /**
     * Get global rate limiting statistics
     */
  static getGlobalStats(): {
        totalRequests: number;
        blockedRequests: number;
        burstRequestsUsed: number;
        blockRate: number;
        activeUsers: number;
        tierDistribution: Record<string, number>;
        } {
    const tierDistribution: Record<string, number> = {};

    // This would normally come from user data, simplified here
    this.userLimits.forEach(() => {
      // In real implementation, get tier from user data
    });

    return {
      ...this.globalStats,
      blockRate: this.globalStats.totalRequests > 0
        ? (this.globalStats.blockedRequests / this.globalStats.totalRequests) * 100
        : 0,
      activeUsers: this.userLimits.size,
      tierDistribution
    };
  }

  /**
     * Reset limits for a user (admin function)
     */
  static resetUserLimits(userId: string): void {
    this.userLimits.delete(userId);
    logger.info("User rate limits reset", { userId });
  }

  /**
     * Create new rate limit entry
     */
  private static createNewEntry(): RateLimitEntry {
    return {
      requests: [],
      burstUsed: 0,
      lastReset: Date.now(),
      concurrentCount: 0,
      blockedUntil: 0
    };
  }

  /**
     * Clean old requests from memory
     */
  private static cleanOldRequests(entry: RateLimitEntry): void {
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);

    entry.requests = entry.requests.filter(r => r.timestamp > oneDayAgo);

    // Reset burst allowance daily
    if (now - entry.lastReset > 24 * 60 * 60 * 1000) {
      entry.burstUsed = 0;
      entry.lastReset = now;
    }
  }

  /**
     * Determine if burst allowance should be used
     */
  private static shouldAllowBurst(userTier: string, priority: number): boolean {
    const tierPriority = this.limits[userTier]?.priority || 1;

    // Higher tier users and higher priority requests get burst allowance
    return tierPriority >= 2 || priority > 0;
  }

  /**
     * Calculate penalty for repeated violations
     */
  private static calculatePenalty(entry: RateLimitEntry, userTier: string): number {
    const tierPriority = this.limits[userTier]?.priority || 1;

    // Higher tier users get shorter penalties
    const basePenalty = 60000; // 1 minute
    const tierMultiplier = Math.max(0.1, 1 / tierPriority);

    return basePenalty * tierMultiplier;
  }

  /**
     * Get time until next reset
     */
  private static getTimeUntilReset(window: "minute" | "hour" | "day"): number {
    const now = Date.now();
    const windows = {
      minute: 60 * 1000,
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000
    };

    const windowMs = windows[window];
    return Math.ceil(windowMs - (now % windowMs)) / 1000;
  }
}

// Cleanup old entries every hour
setInterval(() => {
  const now = Date.now();
  const cutoff = now - (24 * 60 * 60 * 1000); // 24 hours ago

  for (const [userId, entry] of TierBasedRateLimit["userLimits"].entries()) {
    if (entry.requests.length === 0 ||
            entry.requests.every(r => r.timestamp < cutoff)) {
      TierBasedRateLimit["userLimits"].delete(userId);
    }
  }
}, 60 * 60 * 1000);
