/**
 * Function-Level Metrics Collection
 * Comprehensive performance and business metrics tracking
 */

import { logger } from "firebase-functions";

export interface FunctionMetrics {
    functionName: string;
    executionCount: number;
    totalDuration: number;
    averageDuration: number;
    errorCount: number;
    errorRate: number;
    memoryPeak: number;
    lastExecution: number;
    businessMetrics: {
        aiTokensConsumed: number;
        cacheHitRate: number;
        userRequestsByTier: Record<string, number>;
    };
}

export interface MetricDataPoint {
    timestamp: number;
    functionName: string;
    userId: string;
    duration: number;
    memoryUsed: number;
    success: boolean;
    userTier: string;
    businessData?: {
        aiTokensUsed?: number;
        cacheHit?: boolean;
        resultCount?: number;
    };
}

export class MetricsCollector {
  private static metrics = new Map<string, FunctionMetrics>();
  private static dataPoints: MetricDataPoint[] = [];
  private static readonly MAX_DATA_POINTS = 10000;
  private static readonly METRICS_FLUSH_INTERVAL = 5 * 60 * 1000; // 5 minutes

  /**
     * Record function execution metrics
     */
  static recordExecution(data: MetricDataPoint): void {
    const { functionName } = data;

    // Update aggregated metrics
    const existing = this.metrics.get(functionName) || this.initializeMetrics(functionName);

    existing.executionCount++;
    existing.totalDuration += data.duration;
    existing.averageDuration = existing.totalDuration / existing.executionCount;
    existing.lastExecution = data.timestamp;

    if (!data.success) {
      existing.errorCount++;
      existing.errorRate = (existing.errorCount / existing.executionCount) * 100;
    }

    if (data.memoryUsed > existing.memoryPeak) {
      existing.memoryPeak = data.memoryUsed;
    }

    // Update business metrics
    if (data.businessData?.aiTokensUsed) {
      existing.businessMetrics.aiTokensConsumed += data.businessData.aiTokensUsed;
    }

    if (data.businessData?.cacheHit !== undefined) {
      const totalRequests = existing.executionCount;
      const currentHitRate = existing.businessMetrics.cacheHitRate;
      const newHitRate = data.businessData.cacheHit
        ? ((currentHitRate * (totalRequests - 1)) + 1) / totalRequests
        : (currentHitRate * (totalRequests - 1)) / totalRequests;
      existing.businessMetrics.cacheHitRate = newHitRate;
    }

    existing.businessMetrics.userRequestsByTier[data.userTier] =
            (existing.businessMetrics.userRequestsByTier[data.userTier] || 0) + 1;

    this.metrics.set(functionName, existing);

    // Store detailed data point
    this.dataPoints.push(data);

    // Prevent memory bloat
    if (this.dataPoints.length > this.MAX_DATA_POINTS) {
      this.dataPoints = this.dataPoints.slice(-this.MAX_DATA_POINTS / 2);
    }

    // Log performance alerts
    this.checkPerformanceThresholds(existing);
  }

  /**
     * Get metrics for a specific function
     */
  static getFunctionMetrics(functionName: string): FunctionMetrics | undefined {
    return this.metrics.get(functionName);
  }

  /**
     * Get all function metrics
     */
  static getAllMetrics(): Record<string, FunctionMetrics> {
    const result: Record<string, FunctionMetrics> = {};
    for (const [name, metrics] of this.metrics.entries()) {
      result[name] = { ...metrics };
    }
    return result;
  }

  /**
     * Get performance trends for a function
     */
  static getPerformanceTrends(
    functionName: string,
    timeWindow: number = 60 * 60 * 1000 // 1 hour default
  ): {
        averageDuration: number[];
        errorRate: number[];
        requestVolume: number[];
        timestamps: number[];
    } {
    const now = Date.now();
    const cutoff = now - timeWindow;

    const relevantPoints = this.dataPoints.filter(
      dp => dp.functionName === functionName && dp.timestamp >= cutoff
    );

    // Group by 5-minute intervals
    const intervalMs = 5 * 60 * 1000;
    const intervals = new Map<number, MetricDataPoint[]>();

    relevantPoints.forEach(point => {
      const interval = Math.floor(point.timestamp / intervalMs) * intervalMs;
      if (!intervals.has(interval)) {
        intervals.set(interval, []);
      }
            intervals.get(interval)!.push(point);
    });

    const timestamps: number[] = [];
    const averageDuration: number[] = [];
    const errorRate: number[] = [];
    const requestVolume: number[] = [];

    for (const [timestamp, points] of intervals.entries()) {
      timestamps.push(timestamp);

      const totalDuration = points.reduce((sum, p) => sum + p.duration, 0);
      averageDuration.push(totalDuration / points.length);

      const errors = points.filter(p => !p.success).length;
      errorRate.push((errors / points.length) * 100);

      requestVolume.push(points.length);
    }

    return { averageDuration, errorRate, requestVolume, timestamps };
  }

  /**
     * Generate comprehensive metrics report
     */
  static generateReport(): {
        summary: {
            totalFunctions: number;
            totalExecutions: number;
            overallErrorRate: number;
            topPerformingFunctions: string[];
            problemFunctions: string[];
        };
        functions: Record<string, FunctionMetrics>;
        insights: string[];
        } {
    const functions = this.getAllMetrics();
    const functionNames = Object.keys(functions);

    const totalExecutions = functionNames.reduce(
      (sum, name) => sum + functions[name].executionCount, 0
    );

    const totalErrors = functionNames.reduce(
      (sum, name) => sum + functions[name].errorCount, 0
    );

    const overallErrorRate = totalExecutions > 0 ? (totalErrors / totalExecutions) * 100 : 0;

    // Top performing functions (low error rate, fast execution)
    const topPerformingFunctions = functionNames
      .filter(name => functions[name].executionCount > 10) // Min 10 executions
      .sort((a, b) => {
        const scoreA = this.calculatePerformanceScore(functions[a]);
        const scoreB = this.calculatePerformanceScore(functions[b]);
        return scoreB - scoreA; // Higher score is better
      })
      .slice(0, 5);

    // Problem functions (high error rate or slow)
    const problemFunctions = functionNames
      .filter(name => {
        const metrics = functions[name];
        return metrics.errorRate > 5 || metrics.averageDuration > 15000; // >5% error or >15s
      })
      .sort((a, b) => functions[b].errorRate - functions[a].errorRate);

    // Generate insights
    const insights = this.generateInsights(functions);

    return {
      summary: {
        totalFunctions: functionNames.length,
        totalExecutions,
        overallErrorRate,
        topPerformingFunctions,
        problemFunctions
      },
      functions,
      insights
    };
  }

  /**
     * Initialize metrics for a new function
     */
  private static initializeMetrics(functionName: string): FunctionMetrics {
    return {
      functionName,
      executionCount: 0,
      totalDuration: 0,
      averageDuration: 0,
      errorCount: 0,
      errorRate: 0,
      memoryPeak: 0,
      lastExecution: 0,
      businessMetrics: {
        aiTokensConsumed: 0,
        cacheHitRate: 0,
        userRequestsByTier: {}
      }
    };
  }

  /**
     * Check performance thresholds and alert
     */
  private static checkPerformanceThresholds(metrics: FunctionMetrics): void {
    // High error rate alert
    if (metrics.errorRate > 10 && metrics.executionCount > 5) {
      logger.warn("High error rate detected", {
        functionName: metrics.functionName,
        errorRate: metrics.errorRate,
        executionCount: metrics.executionCount,
        alert: "HIGH_ERROR_RATE"
      });
    }

    // Slow function alert
    if (metrics.averageDuration > 20000 && metrics.executionCount > 3) {
      logger.warn("Slow function detected", {
        functionName: metrics.functionName,
        averageDuration: metrics.averageDuration,
        executionCount: metrics.executionCount,
        alert: "SLOW_FUNCTION"
      });
    }

    // High memory usage alert
    if (metrics.memoryPeak > 800) { // 800MB
      logger.warn("High memory usage function", {
        functionName: metrics.functionName,
        memoryPeak: metrics.memoryPeak,
        alert: "HIGH_MEMORY_FUNCTION"
      });
    }
  }

  /**
     * Calculate performance score for ranking
     */
  private static calculatePerformanceScore(metrics: FunctionMetrics): number {
    const speedScore = Math.max(0, 100 - (metrics.averageDuration / 1000)); // Deduct points for each second
    const reliabilityScore = Math.max(0, 100 - (metrics.errorRate * 2)); // Deduct 2 points per % error
    const efficiencyScore = Math.max(0, 100 - (metrics.memoryPeak / 10)); // Deduct points for memory usage

    return (speedScore + reliabilityScore + efficiencyScore) / 3;
  }

  /**
     * Generate performance insights
     */
  private static generateInsights(functions: Record<string, FunctionMetrics>): string[] {
    const insights: string[] = [];
    const functionNames = Object.keys(functions);

    // AI token usage insights
    const totalTokens = functionNames.reduce(
      (sum, name) => sum + functions[name].businessMetrics.aiTokensConsumed, 0
    );
    if (totalTokens > 0) {
      insights.push(`Total AI tokens consumed: ${totalTokens.toLocaleString()}`);
    }

    // Cache performance insights
    const functionsWithCache = functionNames.filter(
      name => functions[name].businessMetrics.cacheHitRate > 0
    );
    if (functionsWithCache.length > 0) {
      const avgCacheHitRate = functionsWithCache.reduce(
        (sum, name) => sum + functions[name].businessMetrics.cacheHitRate, 0
      ) / functionsWithCache.length;
      insights.push(`Average cache hit rate: ${avgCacheHitRate.toFixed(1)}%`);
    }

    // User tier distribution
    const tierCounts: Record<string, number> = {};
    functionNames.forEach(name => {
      const tiers = functions[name].businessMetrics.userRequestsByTier;
      Object.entries(tiers).forEach(([tier, count]) => {
        tierCounts[tier] = (tierCounts[tier] || 0) + count;
      });
    });

    if (Object.keys(tierCounts).length > 0) {
      const topTier = Object.entries(tierCounts)
        .sort(([, a], [, b]) => b - a)[0];
      insights.push(`Most active user tier: ${topTier[0]} (${topTier[1]} requests)`);
    }

    return insights;
  }

  /**
     * Record A/B test result
     */
  static recordABTestResult(
    experimentId: string,
    variantId: string,
    result: {
            success: boolean;
            responseTime: number;
            tokensUsed: number;
            userSatisfaction?: number;
            customMetrics?: Record<string, number>;
        }
  ): void {
    // Record as a data point for analysis
    this.dataPoints.push({
      timestamp: Date.now(),
      functionName: `ab_test_${experimentId}`,
      userId: variantId, // Use variant as userId for grouping
      duration: result.responseTime,
      memoryUsed: 0, // Not applicable for A/B tests
      success: result.success,
      userTier: "experiment",
      businessData: {
        aiTokensUsed: result.tokensUsed,
        resultCount: result.userSatisfaction
      }
    });

    // Maintain data points limit
    if (this.dataPoints.length > this.MAX_DATA_POINTS) {
      this.dataPoints = this.dataPoints.slice(-this.MAX_DATA_POINTS);
    }
  }

  /**
     * Flush metrics to logs for external monitoring
     */
  static flushMetricsToLogs(): void {
    const report = this.generateReport();

    logger.info("Function metrics report", {
      timestamp: new Date().toISOString(),
      type: "METRICS_REPORT",
      ...report
    });
  }
}

// Automatically flush metrics every 5 minutes
setInterval(() => MetricsCollector.flushMetricsToLogs(), MetricsCollector["METRICS_FLUSH_INTERVAL"]);
