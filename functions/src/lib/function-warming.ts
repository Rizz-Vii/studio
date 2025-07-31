/**
 * Function Warming Strategies
 * Intelligent warming system to minimize cold starts and optimize performance
 */

import { logger } from "firebase-functions";
import { StructuredLogger } from "./structured-logger";
import { MetricsCollector } from "./metrics-collector";

export interface WarmingConfig {
    functionName: string;
    schedule: string; // Cron expression
    timezone: string;
    enabled: boolean;
    warmingUrls: string[];
    expectedResponseTime: number;
    maxRetries: number;
    concurrency: number;
    userTiers: string[]; // Which tiers to warm for
    customHeaders: Record<string, string>;
    predicateWarming: boolean; // Enable predictive warming
}

export interface WarmingSchedule {
    pattern: "hourly" | "business_hours" | "peak_traffic" | "custom";
    intervals: number[]; // Minutes after hour start
    daysOfWeek: number[]; // 0-6, Sunday = 0
    timezone: string;
}

export interface WarmingResult {
    functionName: string;
    url: string;
    timestamp: number;
    responseTime: number;
    statusCode: number;
    success: boolean;
    error?: string;
    userTier: string;
}

export interface TrafficPattern {
    functionName: string;
    hourlyPattern: number[]; // 24 values, requests per hour
    weeklyPattern: number[]; // 7 values, requests per day
    userTierPatterns: Record<string, number[]>;
    lastUpdated: number;
    confidence: number;
}

export class FunctionWarmingManager {
  private static warmingConfigs = new Map<string, WarmingConfig>();
  private static warmingResults: WarmingResult[] = [];
  private static trafficPatterns = new Map<string, TrafficPattern>();
  private static activeWarmingJobs = new Set<string>();

  /**
     * Configure warming for a function
     */
  static configureWarming(config: WarmingConfig): void {
    this.validateWarmingConfig(config);
    this.warmingConfigs.set(config.functionName, config);

    logger.info("Function warming configured", {
      functionName: config.functionName,
      schedule: config.schedule,
      enabled: config.enabled,
      urls: config.warmingUrls.length
    });
  }

  /**
     * Execute warming for a function
     */
  static async warmFunction(
    functionName: string,
    userTier: string = "free",
    traceId?: string
  ): Promise<WarmingResult[]> {
    const config = this.warmingConfigs.get(functionName);
    if (!config || !config.enabled) {
      return [];
    }

    // Check if tier should be warmed
    if (!config.userTiers.includes(userTier) && !config.userTiers.includes("all")) {
      return [];
    }

    // Prevent concurrent warming of same function
    const jobKey = `${functionName}_${userTier}`;
    if (this.activeWarmingJobs.has(jobKey)) {
      logger.debug("Warming already in progress", { functionName, userTier });
      return [];
    }

    this.activeWarmingJobs.add(jobKey);
    const results: WarmingResult[] = [];

    try {
      // Execute warming requests with concurrency control
      const warmingPromises = config.warmingUrls.map(async (url, index) => {
        // Stagger requests to avoid overwhelming
        await this.delay(index * (1000 / config.concurrency));

        return this.executeWarmingRequest(
          functionName,
          url,
          userTier,
          config,
          traceId
        );
      });

      const warmingResults = await Promise.allSettled(warmingPromises);

      warmingResults.forEach((result, index) => {
        if (result.status === "fulfilled" && result.value) {
          results.push(result.value);
        } else {
          logger.warn("Warming request failed", {
            functionName,
            url: config.warmingUrls[index],
            error: result.status === "rejected" ? result.reason : "Unknown error"
          });
        }
      });

      // Store results for analysis
      this.warmingResults.push(...results);
      this.trimWarmingResults();

      if (traceId) {
        StructuredLogger.logBusinessEvent(traceId, "function_warming_completed", {
          functionName,
          userTier,
          requestCount: results.length,
          successRate: results.filter(r => r.success).length / results.length,
          averageResponseTime: results.reduce((sum, r) => sum + r.responseTime, 0) / results.length
        });
      }

    } finally {
      this.activeWarmingJobs.delete(jobKey);
    }

    return results;
  }

  /**
     * Warm all configured functions
     */
  static async warmAllFunctions(userTier: string = "all"): Promise<void> {
    const warmingPromises: Promise<void>[] = [];

    this.warmingConfigs.forEach((config, functionName) => {
      if (config.enabled) {
        warmingPromises.push(
          this.warmFunction(functionName, userTier).then(() => {
            logger.debug("Function warming completed", { functionName, userTier });
          }).catch(error => {
            logger.error("Function warming failed", { functionName, userTier, error });
          })
        );
      }
    });

    await Promise.all(warmingPromises);
  }

  /**
     * Update traffic pattern for predictive warming
     */
  static updateTrafficPattern(
    functionName: string,
    requestTimestamp: number,
    userTier: string
  ): void {
    let pattern = this.trafficPatterns.get(functionName);

    if (!pattern) {
      pattern = {
        functionName,
        hourlyPattern: new Array(24).fill(0),
        weeklyPattern: new Array(7).fill(0),
        userTierPatterns: {},
        lastUpdated: Date.now(),
        confidence: 0
      };
      this.trafficPatterns.set(functionName, pattern);
    }

    const date = new Date(requestTimestamp);
    const hour = date.getHours();
    const dayOfWeek = date.getDay();

    // Update hourly pattern
    pattern.hourlyPattern[hour]++;

    // Update weekly pattern
    pattern.weeklyPattern[dayOfWeek]++;

    // Update user tier patterns
    if (!pattern.userTierPatterns[userTier]) {
      pattern.userTierPatterns[userTier] = new Array(24).fill(0);
    }
    pattern.userTierPatterns[userTier][hour]++;

    pattern.lastUpdated = Date.now();

    // Calculate confidence based on data points
    const totalRequests = pattern.hourlyPattern.reduce((sum, count) => sum + count, 0);
    pattern.confidence = Math.min(1.0, totalRequests / 1000); // 100% confidence after 1000 requests
  }

  /**
     * Get predictive warming recommendations
     */
  static getPredictiveWarmingRecommendations(): Array<{
        functionName: string;
        recommendedTime: number;
        userTier: string;
        confidence: number;
        reason: string;
    }> {
    const recommendations: Array<{
            functionName: string;
            recommendedTime: number;
            userTier: string;
            confidence: number;
            reason: string;
        }> = [];

    const now = new Date();
    const currentHour = now.getHours();
    const nextHour = (currentHour + 1) % 24;

    this.trafficPatterns.forEach((pattern, functionName) => {
      const config = this.warmingConfigs.get(functionName);
      if (!config || !config.predicateWarming || pattern.confidence < 0.3) {
        return; // Skip if not configured for predictive warming or low confidence
      }

      // Check if next hour shows higher traffic
      const currentTraffic = pattern.hourlyPattern[currentHour];
      const nextHourTraffic = pattern.hourlyPattern[nextHour];

      if (nextHourTraffic > currentTraffic * 1.5) { // 50% increase threshold
        // Find most active user tier for that hour
        const tierTraffic = Object.entries(pattern.userTierPatterns)
          .map(([tier, hourlyData]) => ({
            tier,
            traffic: hourlyData[nextHour]
          }))
          .sort((a, b) => b.traffic - a.traffic);

        if (tierTraffic.length > 0 && tierTraffic[0].traffic > 0) {
          recommendations.push({
            functionName,
            recommendedTime: new Date().setHours(nextHour, 0, 0, 0),
            userTier: tierTraffic[0].tier,
            confidence: pattern.confidence,
            reason: `Traffic expected to increase ${Math.round((nextHourTraffic / currentTraffic) * 100)}% in next hour`
          });
        }
      }
    });

    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }

  /**
     * Execute predictive warming
     */
  static async executePredictiveWarming(): Promise<void> {
    const recommendations = this.getPredictiveWarmingRecommendations();

    for (const rec of recommendations.slice(0, 5)) { // Limit to top 5 recommendations
      try {
        await this.warmFunction(rec.functionName, rec.userTier);

        logger.info("Predictive warming executed", {
          functionName: rec.functionName,
          userTier: rec.userTier,
          confidence: rec.confidence,
          reason: rec.reason
        });
      } catch (error) {
        logger.error("Predictive warming failed", {
          functionName: rec.functionName,
          error
        });
      }
    }
  }

  /**
     * Get warming statistics
     */
  static getWarmingStats(): {
        totalConfigs: number;
        enabledConfigs: number;
        totalWarmingResults: number;
        averageResponseTime: number;
        successRate: number;
        recentActivity: WarmingResult[];
        topPerformers: Array<{ functionName: string; avgResponseTime: number; successRate: number }>;
        } {
    const enabledConfigs = Array.from(this.warmingConfigs.values()).filter(c => c.enabled);
    const recentResults = this.warmingResults.slice(-50); // Last 50 results

    const totalResponseTime = this.warmingResults.reduce((sum, r) => sum + r.responseTime, 0);
    const successCount = this.warmingResults.filter(r => r.success).length;

    // Calculate per-function performance
    const functionStats = new Map<string, { total: number; success: number; responseTime: number }>();

    this.warmingResults.forEach(result => {
      const stats = functionStats.get(result.functionName) || { total: 0, success: 0, responseTime: 0 };
      stats.total++;
      if (result.success) stats.success++;
      stats.responseTime += result.responseTime;
      functionStats.set(result.functionName, stats);
    });

    const topPerformers = Array.from(functionStats.entries())
      .map(([functionName, stats]) => ({
        functionName,
        avgResponseTime: stats.responseTime / stats.total,
        successRate: stats.success / stats.total
      }))
      .sort((a, b) => {
        // Sort by success rate first, then by response time
        if (Math.abs(a.successRate - b.successRate) > 0.05) {
          return b.successRate - a.successRate;
        }
        return a.avgResponseTime - b.avgResponseTime;
      })
      .slice(0, 10);

    return {
      totalConfigs: this.warmingConfigs.size,
      enabledConfigs: enabledConfigs.length,
      totalWarmingResults: this.warmingResults.length,
      averageResponseTime: this.warmingResults.length > 0 ? totalResponseTime / this.warmingResults.length : 0,
      successRate: this.warmingResults.length > 0 ? successCount / this.warmingResults.length : 0,
      recentActivity: recentResults,
      topPerformers
    };
  }

  /**
     * Get traffic patterns for analysis
     */
  static getTrafficPatterns(): Map<string, TrafficPattern> {
    return new Map(this.trafficPatterns);
  }

  /**
     * Execute warming request
     */
  private static async executeWarmingRequest(
    functionName: string,
    url: string,
    userTier: string,
    config: WarmingConfig,
    traceId?: string
  ): Promise<WarmingResult> {
    const startTime = Date.now();
    let attempt = 0;

    while (attempt < config.maxRetries) {
      try {
        // Note: In actual implementation, you'd use a proper HTTP client
        // This is a simplified version for demonstration
        const response = await this.makeHttpRequest(url, {
          method: "GET",
          headers: {
            "User-Agent": "RankPilot-Function-Warmer/1.0",
            "X-User-Tier": userTier,
            "X-Warming-Request": "true",
            ...config.customHeaders
          },
          timeout: config.expectedResponseTime * 2
        });

        const responseTime = Date.now() - startTime;
        const success = response.status >= 200 && response.status < 300;

        const result: WarmingResult = {
          functionName,
          url,
          timestamp: Date.now(),
          responseTime,
          statusCode: response.status,
          success,
          userTier
        };

        if (traceId) {
          StructuredLogger.logBusinessEvent(traceId, "function_warming_request", {
            functionName,
            url,
            responseTime,
            statusCode: response.status,
            success,
            userTier,
            attempt: attempt + 1
          });
        }

        return result;

      } catch (error) {
        attempt++;
        if (attempt >= config.maxRetries) {
          const result: WarmingResult = {
            functionName,
            url,
            timestamp: Date.now(),
            responseTime: Date.now() - startTime,
            statusCode: 500,
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
            userTier
          };

          return result;
        }

        // Wait before retry
        await this.delay(1000 * attempt);
      }
    }

    // This should never be reached, but TypeScript requires it
    throw new Error("Unexpected end of warming request execution");
  }

  /**
     * Simple HTTP request helper (replace with actual HTTP client)
     */
  private static async makeHttpRequest(
    url: string,
    options: {
            method: string;
            headers: Record<string, string>;
            timeout: number;
        }
  ): Promise<{ status: number; headers: Record<string, string> }> {
    // This is a placeholder - in real implementation, use fetch or axios
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Request timeout"));
      }, options.timeout);

      // Simulate HTTP request
      setTimeout(() => {
        clearTimeout(timeout);
        resolve({
          status: 200,
          headers: { "content-type": "application/json" }
        });
      }, Math.random() * 1000 + 100); // Random 100-1100ms delay
    });
  }

  /**
     * Delay helper
     */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
     * Validate warming configuration
     */
  private static validateWarmingConfig(config: WarmingConfig): void {
    if (!config.functionName || !config.schedule) {
      throw new Error("Function name and schedule are required");
    }

    if (config.warmingUrls.length === 0) {
      throw new Error("At least one warming URL is required");
    }

    if (config.maxRetries < 1 || config.maxRetries > 5) {
      throw new Error("Max retries must be between 1 and 5");
    }

    if (config.concurrency < 1 || config.concurrency > 10) {
      throw new Error("Concurrency must be between 1 and 10");
    }
  }

  /**
     * Trim warming results to prevent memory issues
     */
  private static trimWarmingResults(): void {
    const MAX_RESULTS = 1000;
    if (this.warmingResults.length > MAX_RESULTS) {
      this.warmingResults = this.warmingResults.slice(-MAX_RESULTS);
    }
  }
}

// Initialize default warming configurations
FunctionWarmingManager.configureWarming({
  functionName: "keyword-suggestions",
  schedule: "0 */6 * * *", // Every 6 hours
  timezone: "Australia/Sydney",
  enabled: true,
  warmingUrls: ["/api/keyword-suggestions?q=test"],
  expectedResponseTime: 3000,
  maxRetries: 2,
  concurrency: 2,
  userTiers: ["starter", "agency", "enterprise"],
  customHeaders: {},
  predicateWarming: true
});

FunctionWarmingManager.configureWarming({
  functionName: "content-analyzer",
  schedule: "0 8,12,16,20 * * *", // Business hours
  timezone: "Australia/Sydney",
  enabled: true,
  warmingUrls: ["/api/content-analyzer"],
  expectedResponseTime: 5000,
  maxRetries: 3,
  concurrency: 1,
  userTiers: ["agency", "enterprise"],
  customHeaders: {},
  predicateWarming: true
});

// Execute predictive warming every 30 minutes
setInterval(() => {
  FunctionWarmingManager.executePredictiveWarming();
}, 30 * 60 * 1000);
