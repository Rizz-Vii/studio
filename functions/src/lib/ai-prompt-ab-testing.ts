/**
 * A/B Testing Framework for AI Prompts
 * Sophisticated testing system for optimizing AI prompt performance
 */

import { logger } from "firebase-functions";
import { StructuredLogger } from "./structured-logger";
import { MetricsCollector } from "./metrics-collector";

export interface PromptVariant {
    id: string;
    name: string;
    prompt: string;
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
    model?: string;
    weight: number; // Traffic allocation percentage (0-100)
    isControl: boolean;
    metadata?: Record<string, any>;
}

export interface ExperimentConfig {
    id: string;
    name: string;
    description: string;
    feature: string; // e.g., 'keyword-suggestions', 'content-analysis'
    variants: PromptVariant[];
    targetMetrics: string[]; // e.g., ['response_time', 'user_satisfaction', 'accuracy']
    startDate: number;
    endDate?: number;
    minSampleSize: number;
    confidenceLevel: number; // 0.90, 0.95, 0.99
    status: "draft" | "active" | "paused" | "completed" | "archived";
    userTiers: string[]; // Which tiers to include in experiment
    trafficSplit: Record<string, number>; // variant_id -> percentage
}

export interface ExperimentResult {
    variantId: string;
    requests: number;
    successes: number;
    failures: number;
    averageResponseTime: number;
    averageTokensUsed: number;
    userSatisfactionScore?: number;
    customMetrics: Record<string, number>;
    lastUpdated: number;
}

export interface ExperimentAnalysis {
    experimentId: string;
    results: Record<string, ExperimentResult>;
    winner?: string;
    confidence: number;
    significance: number;
    recommendations: string[];
    generatedAt: number;
}

export class AIPromptABTesting {
  private static experiments = new Map<string, ExperimentConfig>();
  private static results = new Map<string, Map<string, ExperimentResult>>();
  private static userAssignments = new Map<string, Map<string, string>>(); // userId -> experimentId -> variantId

  /**
     * Create new A/B test experiment
     */
  static createExperiment(config: ExperimentConfig): ExperimentConfig {
    // Validate configuration
    this.validateExperimentConfig(config);

    // Ensure traffic splits add up to 100%
    const totalTraffic = Object.values(config.trafficSplit).reduce((sum, pct) => sum + pct, 0);
    if (Math.abs(totalTraffic - 100) > 0.01) {
      throw new Error(`Traffic split must total 100%, got ${totalTraffic}%`);
    }

    // Initialize results map for each variant
    this.results.set(config.id, new Map());
    config.variants.forEach(variant => {
            this.results.get(config.id)!.set(variant.id, {
              variantId: variant.id,
              requests: 0,
              successes: 0,
              failures: 0,
              averageResponseTime: 0,
              averageTokensUsed: 0,
              customMetrics: {},
              lastUpdated: Date.now()
            });
    });

    this.experiments.set(config.id, config);

    logger.info("A/B test experiment created", {
      experimentId: config.id,
      feature: config.feature,
      variants: config.variants.length,
      trafficSplit: config.trafficSplit
    });

    return config;
  }

  /**
     * Get prompt variant for user
     */
  static getPromptVariant(
    experimentId: string,
    userId: string,
    userTier: string,
    traceId?: string
  ): PromptVariant | null {
    const experiment = this.experiments.get(experimentId);

    if (!experiment || experiment.status !== "active") {
      return null;
    }

    // Check if user tier is eligible
    if (!experiment.userTiers.includes(userTier) && !experiment.userTiers.includes("all")) {
      return null;
    }

    // Check if experiment is within date range
    const now = Date.now();
    if (now < experiment.startDate || (experiment.endDate && now > experiment.endDate)) {
      return null;
    }

    // Get or assign user to variant
    let userExperiments = this.userAssignments.get(userId);
    if (!userExperiments) {
      userExperiments = new Map();
      this.userAssignments.set(userId, userExperiments);
    }

    let assignedVariantId = userExperiments.get(experimentId);

    if (!assignedVariantId) {
      // Assign user to variant based on traffic split
      assignedVariantId = this.assignUserToVariant(experiment, userId);
      userExperiments.set(experimentId, assignedVariantId);

      if (traceId) {
        StructuredLogger.logBusinessEvent(traceId, "ab_test_assignment", {
          experimentId,
          userId,
          userTier,
          assignedVariant: assignedVariantId,
          feature: experiment.feature
        });
      }
    }

    const variant = experiment.variants.find(v => v.id === assignedVariantId);
    return variant || null;
  }

  /**
     * Record experiment result
     */
  static recordResult(
    experimentId: string,
    variantId: string,
    result: {
            success: boolean;
            responseTime: number;
            tokensUsed: number;
            userSatisfaction?: number;
            customMetrics?: Record<string, number>;
            traceId?: string;
        }
  ): void {
    const experimentResults = this.results.get(experimentId);
    if (!experimentResults) return;

    const variantResult = experimentResults.get(variantId);
    if (!variantResult) return;

    // Update counts
    variantResult.requests++;
    if (result.success) {
      variantResult.successes++;
    } else {
      variantResult.failures++;
    }

    // Update running averages
    variantResult.averageResponseTime = this.updateRunningAverage(
      variantResult.averageResponseTime,
      result.responseTime,
      variantResult.requests
    );

    variantResult.averageTokensUsed = this.updateRunningAverage(
      variantResult.averageTokensUsed,
      result.tokensUsed,
      variantResult.requests
    );

    // Update user satisfaction if provided
    if (result.userSatisfaction !== undefined) {
      variantResult.userSatisfactionScore = this.updateRunningAverage(
        variantResult.userSatisfactionScore || 0,
        result.userSatisfaction,
        variantResult.requests
      );
    }

    // Update custom metrics
    if (result.customMetrics) {
      Object.entries(result.customMetrics).forEach(([metric, value]) => {
        variantResult.customMetrics[metric] = this.updateRunningAverage(
          variantResult.customMetrics[metric] || 0,
          value,
          variantResult.requests
        );
      });
    }

    variantResult.lastUpdated = Date.now();

    // Log to metrics collector
    MetricsCollector.recordABTestResult(experimentId, variantId, result);

    if (result.traceId) {
      StructuredLogger.logBusinessEvent(result.traceId, "ab_test_result", {
        experimentId,
        variantId,
        success: result.success,
        responseTime: result.responseTime,
        tokensUsed: result.tokensUsed,
        userSatisfaction: result.userSatisfaction
      });
    }
  }

  /**
     * Analyze experiment results
     */
  static analyzeExperiment(experimentId: string): ExperimentAnalysis | null {
    const experiment = this.experiments.get(experimentId);
    const experimentResults = this.results.get(experimentId);

    if (!experiment || !experimentResults) {
      return null;
    }

    const results: Record<string, ExperimentResult> = {};
    experimentResults.forEach((result, variantId) => {
      results[variantId] = { ...result };
    });

    // Find control variant
    const controlVariant = experiment.variants.find(v => v.isControl);
    if (!controlVariant) {
      logger.warn("No control variant found for experiment", { experimentId });
      return {
        experimentId,
        results,
        confidence: 0,
        significance: 0,
        recommendations: ["No control variant defined"],
        generatedAt: Date.now()
      };
    }

    // Calculate statistical significance
    const controlResults = results[controlVariant.id];
    let winner: string | undefined;
    let maxImprovement = 0;
    let confidence = 0;

    for (const [variantId, variantResults] of Object.entries(results)) {
      if (variantId === controlVariant.id) continue;

      const improvement = this.calculateImprovement(controlResults, variantResults);
      const significance = this.calculateSignificance(controlResults, variantResults);

      if (improvement > maxImprovement && significance >= experiment.confidenceLevel) {
        maxImprovement = improvement;
        winner = variantId;
        confidence = significance;
      }
    }

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      experiment,
      results,
      controlResults,
      winner
    );

    return {
      experimentId,
      results,
      winner,
      confidence,
      significance: maxImprovement,
      recommendations,
      generatedAt: Date.now()
    };
  }

  /**
     * Get all active experiments for a feature
     */
  static getActiveExperiments(feature?: string): ExperimentConfig[] {
    const activeExperiments: ExperimentConfig[] = [];

    this.experiments.forEach(experiment => {
      if (experiment.status === "active" &&
                (!feature || experiment.feature === feature)) {
        activeExperiments.push(experiment);
      }
    });

    return activeExperiments;
  }

  /**
     * Update experiment status
     */
  static updateExperimentStatus(
    experimentId: string,
    status: ExperimentConfig["status"],
    reason?: string
  ): boolean {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) return false;

    experiment.status = status;

    logger.info("A/B test experiment status updated", {
      experimentId,
      status,
      reason,
      feature: experiment.feature
    });

    return true;
  }

  /**
     * Get experiment summary
     */
  static getExperimentSummary(): {
        total: number;
        active: number;
        completed: number;
        byFeature: Record<string, number>;
        totalUsers: number;
        } {
    const summary = {
      total: this.experiments.size,
      active: 0,
      completed: 0,
      byFeature: {} as Record<string, number>,
      totalUsers: this.userAssignments.size
    };

    this.experiments.forEach(experiment => {
      if (experiment.status === "active") summary.active++;
      if (experiment.status === "completed") summary.completed++;

      summary.byFeature[experiment.feature] = (summary.byFeature[experiment.feature] || 0) + 1;
    });

    return summary;
  }

  /**
     * Clean up old experiments and user assignments
     */
  static cleanup(retentionDays = 30): void {
    const cutoff = Date.now() - (retentionDays * 24 * 60 * 60 * 1000);

    // Clean up completed/archived experiments
    this.experiments.forEach((experiment, id) => {
      if ((experiment.status === "completed" || experiment.status === "archived") &&
                (experiment.endDate || experiment.startDate) < cutoff) {
        this.experiments.delete(id);
        this.results.delete(id);

        // Clean up user assignments for this experiment
        this.userAssignments.forEach(userExperiments => {
          userExperiments.delete(id);
        });
      }
    });

    logger.info("A/B test cleanup completed", {
      retentionDays,
      remainingExperiments: this.experiments.size
    });
  }

  /**
     * Validate experiment configuration
     */
  private static validateExperimentConfig(config: ExperimentConfig): void {
    if (!config.id || !config.name || !config.feature) {
      throw new Error("Experiment must have id, name, and feature");
    }

    if (config.variants.length < 2) {
      throw new Error("Experiment must have at least 2 variants");
    }

    const controlVariants = config.variants.filter(v => v.isControl);
    if (controlVariants.length !== 1) {
      throw new Error("Experiment must have exactly one control variant");
    }

    if (config.confidenceLevel < 0.5 || config.confidenceLevel > 0.99) {
      throw new Error("Confidence level must be between 0.5 and 0.99");
    }
  }

  /**
     * Assign user to variant using deterministic hash
     */
  private static assignUserToVariant(experiment: ExperimentConfig, userId: string): string {
    // Use deterministic hash to ensure consistent assignment
    const hash = this.hashString(userId + experiment.id);
    const percentage = hash % 100;

    let cumulativeWeight = 0;
    for (const [variantId, weight] of Object.entries(experiment.trafficSplit)) {
      cumulativeWeight += weight;
      if (percentage < cumulativeWeight) {
        return variantId;
      }
    }

    // Fallback to first variant
    return experiment.variants[0].id;
  }

  /**
     * Simple hash function for consistent user assignment
     */
  private static hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
     * Update running average
     */
  private static updateRunningAverage(
    currentAverage: number,
    newValue: number,
    count: number
  ): number {
    return ((currentAverage * (count - 1)) + newValue) / count;
  }

  /**
     * Calculate improvement percentage
     */
  private static calculateImprovement(
    control: ExperimentResult,
    variant: ExperimentResult
  ): number {
    if (control.successes === 0) return 0;

    const controlRate = control.successes / control.requests;
    const variantRate = variant.successes / variant.requests;

    return ((variantRate - controlRate) / controlRate) * 100;
  }

  /**
     * Calculate statistical significance (simplified)
     */
  private static calculateSignificance(
    control: ExperimentResult,
    variant: ExperimentResult
  ): number {
    // Simplified significance calculation
    // In production, use proper statistical tests like chi-square or t-test

    if (control.requests < 30 || variant.requests < 30) {
      return 0; // Not enough samples
    }

    const controlRate = control.successes / control.requests;
    const variantRate = variant.successes / variant.requests;

    const pooledRate = (control.successes + variant.successes) /
            (control.requests + variant.requests);

    const standardError = Math.sqrt(
      pooledRate * (1 - pooledRate) *
            (1 / control.requests + 1 / variant.requests)
    );

    const zScore = Math.abs(variantRate - controlRate) / standardError;

    // Convert z-score to confidence level (approximate)
    if (zScore > 2.58) return 0.99;
    if (zScore > 1.96) return 0.95;
    if (zScore > 1.64) return 0.90;
    return 0.50;
  }

  /**
     * Generate recommendations based on results
     */
  private static generateRecommendations(
    experiment: ExperimentConfig,
    results: Record<string, ExperimentResult>,
    controlResults: ExperimentResult,
    winner?: string
  ): string[] {
    const recommendations: string[] = [];

    if (winner) {
      const winnerResults = results[winner];
      const improvement = this.calculateImprovement(controlResults, winnerResults);
      recommendations.push(
        `Variant ${winner} shows ${improvement.toFixed(1)}% improvement over control`
      );
      recommendations.push(`Consider promoting variant ${winner} to production`);
    } else {
      recommendations.push("No statistically significant winner found");

      // Check sample sizes
      const minSamples = experiment.minSampleSize;
      const lowSampleVariants = Object.entries(results)
        .filter(([_, result]) => result.requests < minSamples)
        .map(([variantId]) => variantId);

      if (lowSampleVariants.length > 0) {
        recommendations.push(
          `Increase sample size for variants: ${lowSampleVariants.join(", ")}`
        );
      }
    }

    // Performance recommendations
    const slowVariants = Object.entries(results)
      .filter(([_, result]) => result.averageResponseTime > 5000)
      .map(([variantId]) => variantId);

    if (slowVariants.length > 0) {
      recommendations.push(
        `Consider optimizing response time for variants: ${slowVariants.join(", ")}`
      );
    }

    return recommendations;
  }
}

// Auto-cleanup every 24 hours
setInterval(() => {
  AIPromptABTesting.cleanup();
}, 24 * 60 * 60 * 1000);
