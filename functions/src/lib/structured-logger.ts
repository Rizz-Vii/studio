/**
 * Advanced Structured Logging with Request Tracing
 * Provides comprehensive observability for Firebase Functions
 */

import { logger } from "firebase-functions";
import { CallableRequest } from "firebase-functions/v2/https";
import { v4 as uuidv4 } from "uuid";

export interface RequestTrace {
    traceId: string;
    userId: string;
    userTier: string;
    functionName: string;
    startTime: number;
    userAgent?: string;
    origin?: string;
    subscription?: {
        tier: string;
        plan: string;
    };
}

export interface LogContext {
    traceId: string;
    userId: string;
    functionName: string;
    duration?: number;
    timestamp: string;
    subscription?: {
        tier: string;
        plan: string;
    };
    performance?: {
        memoryUsed: number;
        cpuTime: number;
    };
    business?: {
        aiTokensUsed?: number;
        cacheHit?: boolean;
        resultCount?: number;
    };
}

export class StructuredLogger {
  private static traces = new Map<string, RequestTrace>();

  /**
       * Start request tracing
       */
  static startTrace(request: CallableRequest, functionName: string): RequestTrace {
    const traceId = uuidv4();
    const userId = request.auth?.uid || "anonymous";
    const subscriptionInfo = this.extractSubscriptionInfo(request);

    const trace: RequestTrace = {
      traceId,
      userId,
      userTier: subscriptionInfo?.tier || "free",
      functionName,
      startTime: Date.now(),
      userAgent: request.rawRequest?.headers?.["user-agent"],
      origin: request.rawRequest?.headers?.origin,
      subscription: subscriptionInfo
    };

    this.traces.set(traceId, trace);

    logger.info("Request started", {
      traceId,
      userId,
      functionName,
      timestamp: new Date().toISOString(),
      userAgent: trace.userAgent,
      origin: trace.origin,
      subscription: trace.subscription
    });

    return trace;
  }

  /**
       * Generate a trace ID for manual usage
       */
  static generateTraceId(): string {
    return uuidv4();
  }

  /**
       * Log function completion
       */
  static completeTrace(
    traceId: string,
    result?: any,
    businessMetrics?: {
            aiTokensUsed?: number;
            cacheHit?: boolean;
            resultCount?: number;
        }
  ): void {
    const trace = this.traces.get(traceId);
    if (!trace) return;

    const duration = Date.now() - trace.startTime;
    const memoryUsage = process.memoryUsage();

    const logContext: LogContext = {
      traceId,
      userId: trace.userId,
      functionName: trace.functionName,
      duration,
      timestamp: new Date().toISOString(),
      subscription: trace.subscription,
      performance: {
        memoryUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        cpuTime: process.cpuUsage().user / 1000 // microseconds to milliseconds
      },
      business: businessMetrics
    };

    logger.info("Request completed", logContext);

    // Performance alerts
    if (duration > 30000) { // 30 seconds
      logger.warn("Slow request detected", {
        ...logContext,
        alert: "SLOW_REQUEST",
        threshold: "30s"
      });
    }

    if (logContext.performance && logContext.performance.memoryUsed > 400) { // 400MB
      logger.warn("High memory usage detected", {
        ...logContext,
        alert: "HIGH_MEMORY",
        threshold: "400MB"
      });
    }

    this.traces.delete(traceId);
  }

  /**
       * Log function error
       */
  static errorTrace(
    traceId: string,
    error: Error | unknown,
    additionalContext?: Record<string, any>
  ): void {
    const trace = this.traces.get(traceId);
    if (!trace) return;

    const duration = Date.now() - trace.startTime;
    const memoryUsage = process.memoryUsage();

    const errorContext = {
      traceId,
      userId: trace.userId,
      functionName: trace.functionName,
      duration,
      timestamp: new Date().toISOString(),
      error: {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : "UnknownError"
      },
      performance: {
        memoryUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        cpuTime: process.cpuUsage().user / 1000
      },
      subscription: trace.subscription,
      ...additionalContext
    };

    logger.error("Request failed", errorContext);

    // Error alerting
    if (this.isServiceError(error)) {
      logger.error("Service error detected", {
        ...errorContext,
        alert: "SERVICE_ERROR",
        severity: "HIGH"
      });
    }

    this.traces.delete(traceId);
  }

  /**
       * Log business events
       */
  static logBusinessEvent(
    traceId: string,
    event: string,
    data: Record<string, any>
  ): void {
    const trace = this.traces.get(traceId);
    if (!trace) return;

    logger.info("Business event", {
      traceId,
      userId: trace.userId,
      functionName: trace.functionName,
      event,
      timestamp: new Date().toISOString(),
      subscription: trace.subscription,
      ...data
    });
  }

  /**
       * Log performance metrics
       */
  static logPerformanceMetric(
    traceId: string,
    metric: string,
    value: number,
    unit: string
  ): void {
    const trace = this.traces.get(traceId);
    if (!trace) return;

    logger.info("Performance metric", {
      traceId,
      userId: trace.userId,
      functionName: trace.functionName,
      metric,
      value,
      unit,
      timestamp: new Date().toISOString()
    });
  }

  /**
       * Extract subscription information from request
       */
  private static extractSubscriptionInfo(request: CallableRequest) {
    const token = request.auth?.token as any;
    if (!token?.subscription) return undefined;

    return {
      tier: token.subscription.tier || "free",
      plan: token.subscription.plan || "basic"
    };
  }

  /**
       * Check if error is a service error requiring immediate attention
       */
  private static isServiceError(error: unknown): boolean {
    if (!(error instanceof Error)) return false;

    const serviceErrorPatterns = [
      "ECONNREFUSED",
      "TIMEOUT",
      "SERVICE_UNAVAILABLE",
      "QUOTA_EXCEEDED",
      "API_KEY_INVALID"
    ];

    return serviceErrorPatterns.some(pattern =>
      error.message.includes(pattern) || error.name.includes(pattern)
    );
  }

  /**
       * Cleanup old traces (memory leak prevention)
       */
  static cleanup(): void {
    const now = Date.now();
    const TRACE_TTL = 5 * 60 * 1000; // 5 minutes

    for (const [traceId, trace] of this.traces.entries()) {
      if (now - trace.startTime > TRACE_TTL) {
        logger.warn("Orphaned trace cleaned up", {
          traceId,
          userId: trace.userId,
          functionName: trace.functionName,
          age: now - trace.startTime
        });
        this.traces.delete(traceId);
      }
    }
  }
}

// Cleanup orphaned traces every 10 minutes
setInterval(() => StructuredLogger.cleanup(), 10 * 60 * 1000);
