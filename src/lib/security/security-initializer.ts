/**
 * Security Integration Initializer
 * Initializes all security systems at application startup
 * 
 * Implements enterprise-grade security patterns from DevSMC.md standards
 */

import { initializeGlobalErrorHandler, registerShutdownCallback } from './global-process-error-handler';
import { getCircuitBreakerManager, aiServiceCircuitBreakers } from './circuit-breaker';
import { getMemoryLeakDetector, getWeakReferenceManager } from './memory-leak-detector';
import React from 'react';

/**
 * Initialize all security systems
 */
export async function initializeSecuritySystems(): Promise<void> {
    console.log('🛡️ Initializing RankPilot security systems...');

    try {
        // 1. Initialize global error handler
        console.log('🔧 Initializing global error handler...');
        const errorHandler = initializeGlobalErrorHandler();

        // 2. Initialize circuit breakers for AI services
        console.log('🔧 Initializing circuit breakers...');
        const circuitManager = getCircuitBreakerManager();

        // 3. Initialize memory leak detection
        console.log('🔧 Initializing memory leak detector...');
        const memoryDetector = getMemoryLeakDetector();

        // 4. Initialize weak reference manager
        console.log('🔧 Initializing weak reference manager...');
        const weakRefManager = getWeakReferenceManager();

        // 5. Register cleanup callbacks for graceful shutdown
        console.log('🔧 Registering shutdown callbacks...');

        registerShutdownCallback(async () => {
            console.log('🧹 Cleaning up security systems...');

            // Stop memory monitoring
            memoryDetector.stopMonitoring();

            // Reset circuit breakers
            circuitManager.resetAll();

            // Cleanup weak references
            weakRefManager.cleanup();

            console.log('✅ Security systems cleanup completed');
        });

        // 6. Perform initial health checks
        console.log('🔧 Performing initial health checks...');
        await performInitialHealthChecks();

        console.log('✅ Security systems initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize security systems:', error);
        throw error;
    }
}

/**
 * Perform initial health checks on all systems
 */
async function performInitialHealthChecks(): Promise<void> {
    const memoryDetector = getMemoryLeakDetector();
    const circuitManager = getCircuitBreakerManager();

    // Check memory health
    const memoryHealthy = memoryDetector.isMemoryHealthy();
    console.log(`🔍 Memory health: ${memoryHealthy ? '✅ Healthy' : '⚠️ Warning'}`);

    // Check circuit breaker status
    const circuitHealth = circuitManager.getHealthStatus();
    console.log('🔍 Circuit breaker status:', circuitHealth);

    // Check AI services specifically
    const aiHealth = aiServiceCircuitBreakers.getAIServicesHealth();
    console.log('🔍 AI services status:', aiHealth);
}

/**
 * Get comprehensive system health report
 */
export function getSystemHealthReport(): {
    memory: any;
    circuitBreakers: any;
    aiServices: any;
    timestamp: number;
} {
    const memoryDetector = getMemoryLeakDetector();
    const circuitManager = getCircuitBreakerManager();

    return {
        memory: {
            current: memoryDetector.getCurrentMetrics(),
            healthy: memoryDetector.isMemoryHealthy()
        },
        circuitBreakers: circuitManager.getHealthStatus(),
        aiServices: aiServiceCircuitBreakers.getAIServicesHealth(),
        timestamp: Date.now()
    };
}

/**
 * Middleware for API routes to include security monitoring
 */
export function createSecurityMiddleware() {
    return async function securityMiddleware(request: Request, context: any, next: () => Promise<Response>): Promise<Response> {
        const startTime = Date.now();

        try {
            // Execute the API route
            const response = await next();

            // Log successful request
            const duration = Date.now() - startTime;
            if (duration > 5000) { // Log slow requests
                console.warn(`⚠️ Slow API request: ${request.url} took ${duration}ms`);
            }

            return response;
        } catch (error) {
            // Log failed request
            const duration = Date.now() - startTime;
            console.error(`❌ API request failed: ${request.url} after ${duration}ms`, error);

            // Re-throw to be handled by global error handler
            throw error;
        }
    };
}

/**
 * React Hook for monitoring component memory usage
 */
export function useMemoryMonitoring(componentName: string) {
    const weakRefManager = getWeakReferenceManager();

    // Create a weak reference to track component lifecycle
    const componentRef = React.useRef<any>(null);

    React.useEffect(() => {
        if (componentRef.current) {
            weakRefManager.createWeakRef(componentRef.current, `Component:${componentName}`);
        }

        return () => {
            // Cleanup is handled automatically by weak references
            console.log(`🗑️ Component unmounted: ${componentName}`);
        };
    }, [componentName, weakRefManager]);

    return componentRef;
}

/**
 * Enhanced fetch with circuit breaker protection
 */
export async function secureApiFetch(
    serviceName: string,
    url: string,
    options?: RequestInit
): Promise<Response> {
    const circuitManager = getCircuitBreakerManager();

    return circuitManager.execute(serviceName, async () => {
        const response = await fetch(url, {
            ...options,
            // Add security headers
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                ...options?.headers
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response;
    });
}

// Auto-initialize in server environment
if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    // Initialize security systems on server startup
    initializeSecuritySystems().catch(console.error);
}

export {
    initializeGlobalErrorHandler,
    getCircuitBreakerManager,
    aiServiceCircuitBreakers,
    getMemoryLeakDetector,
    getWeakReferenceManager
};
