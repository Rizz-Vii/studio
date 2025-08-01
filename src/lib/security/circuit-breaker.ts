/**
 * Circuit Breaker Pattern Implementation for AI Services
 * Implements enterprise-grade resilience patterns for external API calls
 * 
 * Based on DevSMC.md security standards and crash prevention
 */

export enum CircuitState {
    CLOSED = 'CLOSED',     // Normal operation
    OPEN = 'OPEN',         // Circuit breaker is open, failing fast
    HALF_OPEN = 'HALF_OPEN' // Testing if service has recovered
}

export interface CircuitBreakerConfig {
    failureThreshold: number;     // Number of failures to trigger open state
    recoveryTimeout: number;      // Time to wait before trying half-open
    successThreshold: number;     // Successes needed in half-open to close
    timeout: number;              // Request timeout in milliseconds
    monitoringWindow: number;     // Time window for failure counting
}

export interface CircuitBreakerMetrics {
    state: CircuitState;
    failureCount: number;
    successCount: number;
    lastFailureTime: number;
    lastSuccessTime: number;
    totalRequests: number;
    totalFailures: number;
    totalSuccesses: number;
    uptime: number;
}

export class CircuitBreaker<T = any> {
    private state: CircuitState = CircuitState.CLOSED;
    private failureCount = 0;
    private successCount = 0;
    private lastFailureTime = 0;
    private lastSuccessTime = 0;
    private totalRequests = 0;
    private totalFailures = 0;
    private totalSuccesses = 0;
    private startTime = Date.now();

    constructor(
        private serviceName: string,
        private config: CircuitBreakerConfig
    ) { }

    /**
     * Execute a function with circuit breaker protection
     */
    async execute<R>(operation: () => Promise<R>): Promise<R> {
        this.totalRequests++;

        // Fast fail if circuit is open
        if (this.state === CircuitState.OPEN) {
            if (this.shouldAttemptReset()) {
                this.state = CircuitState.HALF_OPEN;
                console.log(`🔧 Circuit breaker for ${this.serviceName} entering HALF_OPEN state`);
            } else {
                throw new Error(`Circuit breaker is OPEN for ${this.serviceName}. Service temporarily unavailable.`);
            }
        }

        try {
            // Execute with timeout
            const result = await Promise.race([
                operation(),
                new Promise<never>((_, reject) =>
                    setTimeout(() => reject(new Error('Request timeout')), this.config.timeout)
                )
            ]);

            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure(error as Error);
            throw error;
        }
    }

    /**
     * Handle successful request
     */
    private onSuccess(): void {
        this.successCount++;
        this.totalSuccesses++;
        this.lastSuccessTime = Date.now();

        if (this.state === CircuitState.HALF_OPEN) {
            if (this.successCount >= this.config.successThreshold) {
                this.state = CircuitState.CLOSED;
                this.failureCount = 0;
                console.log(`✅ Circuit breaker for ${this.serviceName} reset to CLOSED state`);
            }
        } else if (this.state === CircuitState.CLOSED) {
            // Reset failure count on success in closed state
            this.failureCount = 0;
        }
    }

    /**
     * Handle failed request
     */
    private onFailure(error: Error): void {
        this.failureCount++;
        this.totalFailures++;
        this.lastFailureTime = Date.now();

        console.warn(`⚠️ Circuit breaker failure for ${this.serviceName}:`, {
            error: error.message,
            failureCount: this.failureCount,
            state: this.state
        });

        if (this.state === CircuitState.HALF_OPEN) {
            // Go back to open state
            this.state = CircuitState.OPEN;
            console.log(`🚨 Circuit breaker for ${this.serviceName} returned to OPEN state`);
        } else if (this.state === CircuitState.CLOSED && this.failureCount >= this.config.failureThreshold) {
            // Open the circuit
            this.state = CircuitState.OPEN;
            console.log(`🚨 Circuit breaker for ${this.serviceName} OPENED due to failure threshold`);
        }
    }

    /**
     * Check if we should attempt to reset from OPEN to HALF_OPEN
     */
    private shouldAttemptReset(): boolean {
        return Date.now() - this.lastFailureTime >= this.config.recoveryTimeout;
    }

    /**
     * Get current circuit breaker metrics
     */
    getMetrics(): CircuitBreakerMetrics {
        return {
            state: this.state,
            failureCount: this.failureCount,
            successCount: this.successCount,
            lastFailureTime: this.lastFailureTime,
            lastSuccessTime: this.lastSuccessTime,
            totalRequests: this.totalRequests,
            totalFailures: this.totalFailures,
            totalSuccesses: this.totalSuccesses,
            uptime: Date.now() - this.startTime
        };
    }

    /**
     * Manually reset the circuit breaker
     */
    reset(): void {
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
        console.log(`🔄 Circuit breaker for ${this.serviceName} manually reset`);
    }

    /**
     * Get current state
     */
    getState(): CircuitState {
        return this.state;
    }

    /**
     * Check if circuit is available for requests
     */
    isAvailable(): boolean {
        return this.state !== CircuitState.OPEN || this.shouldAttemptReset();
    }
}

/**
 * Circuit Breaker Manager - Manages multiple circuit breakers
 */
export class CircuitBreakerManager {
    private breakers = new Map<string, CircuitBreaker>();
    private defaultConfig: CircuitBreakerConfig = {
        failureThreshold: 5,
        recoveryTimeout: 60000, // 1 minute
        successThreshold: 3,
        timeout: 30000, // 30 seconds
        monitoringWindow: 300000 // 5 minutes
    };

    /**
     * Get or create a circuit breaker for a service
     */
    getCircuitBreaker(serviceName: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker {
        if (!this.breakers.has(serviceName)) {
            const finalConfig = { ...this.defaultConfig, ...config };
            this.breakers.set(serviceName, new CircuitBreaker(serviceName, finalConfig));
        }
        return this.breakers.get(serviceName)!;
    }

    /**
     * Execute operation with circuit breaker protection
     */
    async execute<T>(
        serviceName: string,
        operation: () => Promise<T>,
        config?: Partial<CircuitBreakerConfig>
    ): Promise<T> {
        const breaker = this.getCircuitBreaker(serviceName, config);
        return breaker.execute(operation);
    }

    /**
     * Get metrics for all circuit breakers
     */
    getAllMetrics(): Record<string, CircuitBreakerMetrics> {
        const metrics: Record<string, CircuitBreakerMetrics> = {};
        for (const [serviceName, breaker] of this.breakers) {
            metrics[serviceName] = breaker.getMetrics();
        }
        return metrics;
    }

    /**
     * Reset all circuit breakers
     */
    resetAll(): void {
        for (const breaker of this.breakers.values()) {
            breaker.reset();
        }
        console.log('🔄 All circuit breakers reset');
    }

    /**
     * Get health status of all services
     */
    getHealthStatus(): Record<string, { status: string; available: boolean }> {
        const health: Record<string, { status: string; available: boolean }> = {};
        for (const [serviceName, breaker] of this.breakers) {
            health[serviceName] = {
                status: breaker.getState(),
                available: breaker.isAvailable()
            };
        }
        return health;
    }
}

// Singleton instance
let circuitBreakerManager: CircuitBreakerManager;

/**
 * Get global circuit breaker manager instance
 */
export function getCircuitBreakerManager(): CircuitBreakerManager {
    if (!circuitBreakerManager) {
        circuitBreakerManager = new CircuitBreakerManager();
    }
    return circuitBreakerManager;
}

/**
 * AI Service-specific Circuit Breakers with optimized configurations
 */
export class AIServiceCircuitBreakers {
    private manager = getCircuitBreakerManager();

    // OpenAI GPT-4o Configuration
    private openaiConfig: CircuitBreakerConfig = {
        failureThreshold: 3,     // Lower threshold for critical AI service
        recoveryTimeout: 30000,  // 30 seconds recovery
        successThreshold: 2,     // Quick recovery
        timeout: 45000,          // 45 seconds for AI processing
        monitoringWindow: 180000 // 3 minutes
    };

    // Claude 3.5 Sonnet Configuration
    private claudeConfig: CircuitBreakerConfig = {
        failureThreshold: 3,
        recoveryTimeout: 45000,  // 45 seconds
        successThreshold: 2,
        timeout: 60000,          // 60 seconds for complex reasoning
        monitoringWindow: 300000 // 5 minutes
    };

    // Gemini Pro Configuration
    private geminiConfig: CircuitBreakerConfig = {
        failureThreshold: 4,     // Slightly more tolerant
        recoveryTimeout: 60000,  // 1 minute
        successThreshold: 3,
        timeout: 30000,          // 30 seconds
        monitoringWindow: 240000 // 4 minutes
    };

    /**
     * Execute OpenAI request with circuit breaker
     */
    async executeOpenAI<T>(operation: () => Promise<T>): Promise<T> {
        return this.manager.execute('openai', operation, this.openaiConfig);
    }

    /**
     * Execute Claude request with circuit breaker
     */
    async executeClaude<T>(operation: () => Promise<T>): Promise<T> {
        return this.manager.execute('claude', operation, this.claudeConfig);
    }

    /**
     * Execute Gemini request with circuit breaker
     */
    async executeGemini<T>(operation: () => Promise<T>): Promise<T> {
        return this.manager.execute('gemini', operation, this.geminiConfig);
    }

    /**
     * Get AI services health status
     */
    getAIServicesHealth(): Record<string, { status: string; available: boolean }> {
        const allHealth = this.manager.getHealthStatus();
        return {
            openai: allHealth.openai || { status: 'CLOSED', available: true },
            claude: allHealth.claude || { status: 'CLOSED', available: true },
            gemini: allHealth.gemini || { status: 'CLOSED', available: true }
        };
    }

    /**
     * Get AI services metrics
     */
    getAIServicesMetrics(): Record<string, CircuitBreakerMetrics> {
        const allMetrics = this.manager.getAllMetrics();
        return {
            openai: allMetrics.openai,
            claude: allMetrics.claude,
            gemini: allMetrics.gemini
        };
    }
}

// Export singleton instance for AI services
export const aiServiceCircuitBreakers = new AIServiceCircuitBreakers();

/**
 * Decorator for automatic circuit breaker protection
 */
export function withCircuitBreaker(serviceName: string, config?: Partial<CircuitBreakerConfig>) {
    return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
        const method = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            const manager = getCircuitBreakerManager();
            return manager.execute(serviceName, () => method.apply(this, args), config);
        };

        return descriptor;
    };
}
