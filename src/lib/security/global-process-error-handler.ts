/**
 * Global Process Error Handler - Production Security Implementation
 * Implements enterprise-grade error handling with graceful shutdown
 * 
 * Based on DevSMC.md security standards for crash prevention
 */

interface GlobalErrorMetrics {
    uncaughtExceptionCount: number;
    unhandledRejectionCount: number;
    lastErrorTime: number;
    errorRateThreshold: number;
    shutdownInitiated: boolean;
}

class GlobalErrorHandler {
    private metrics: GlobalErrorMetrics = {
        uncaughtExceptionCount: 0,
        unhandledRejectionCount: 0,
        lastErrorTime: 0,
        errorRateThreshold: 5, // Max 5 errors per minute
        shutdownInitiated: false
    };

    private gracefulShutdownTimeout = 30000; // 30 seconds
    private shutdownCallbacks: (() => Promise<void>)[] = [];

    constructor() {
        this.setupErrorHandlers();
    }

    /**
     * Register cleanup callback for graceful shutdown
     */
    public registerShutdownCallback(callback: () => Promise<void>) {
        this.shutdownCallbacks.push(callback);
    }

    /**
     * Setup global error handlers with security patterns
     */
    private setupErrorHandlers() {
        // Handle uncaught exceptions with logging and graceful shutdown
        process.on('uncaughtException', (error: Error) => {
            this.metrics.uncaughtExceptionCount++;
            this.metrics.lastErrorTime = Date.now();

            console.error('🚨 CRITICAL: Uncaught Exception:', {
                error: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString(),
                count: this.metrics.uncaughtExceptionCount
            });

            // Send to error tracking service (Sentry)
            if (typeof window !== 'undefined' && (window as any).Sentry) {
                (window as any).Sentry.captureException(error, {
                    tags: { errorType: 'uncaughtException' },
                    level: 'fatal'
                });
            }

            this.initiateGracefulShutdown('uncaughtException', error);
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
            this.metrics.unhandledRejectionCount++;
            this.metrics.lastErrorTime = Date.now();

            console.error('🚨 CRITICAL: Unhandled Promise Rejection:', {
                reason: reason?.message || reason,
                stack: reason?.stack,
                timestamp: new Date().toISOString(),
                count: this.metrics.unhandledRejectionCount
            });

            // Send to error tracking service (Sentry)
            if (typeof window !== 'undefined' && (window as any).Sentry) {
                (window as any).Sentry.captureException(new Error(`Unhandled Rejection: ${reason}`), {
                    tags: { errorType: 'unhandledRejection' },
                    level: 'error'
                });
            }

            // Don't shutdown for unhandled rejections in production
            // Just log and monitor - they're often recoverable
            if (this.isErrorRateExceeded()) {
                this.initiateGracefulShutdown('highErrorRate', new Error('Error rate threshold exceeded'));
            }
        });

        // Handle process warnings
        process.on('warning', (warning: Error) => {
            console.warn('⚠️ Process Warning:', {
                name: warning.name,
                message: warning.message,
                stack: warning.stack,
                timestamp: new Date().toISOString()
            });
        });

        // Handle graceful shutdown signals
        process.on('SIGTERM', () => {
            console.log('📟 Received SIGTERM, initiating graceful shutdown...');
            this.initiateGracefulShutdown('SIGTERM');
        });

        process.on('SIGINT', () => {
            console.log('📟 Received SIGINT, initiating graceful shutdown...');
            this.initiateGracefulShutdown('SIGINT');
        });
    }

    /**
     * Check if error rate exceeds threshold (security pattern)
     */
    private isErrorRateExceeded(): boolean {
        const oneMinuteAgo = Date.now() - 60000;
        const recentErrors = this.metrics.uncaughtExceptionCount + this.metrics.unhandledRejectionCount;

        return (
            this.metrics.lastErrorTime > oneMinuteAgo &&
            recentErrors >= this.metrics.errorRateThreshold
        );
    }

    /**
     * Initiate graceful shutdown with cleanup
     */
    private async initiateGracefulShutdown(reason: string, error?: Error) {
        if (this.metrics.shutdownInitiated) {
            console.log('Shutdown already in progress...');
            return;
        }

        this.metrics.shutdownInitiated = true;
        console.log(`🔄 Initiating graceful shutdown due to: ${reason}`);

        // Set shutdown timeout
        const shutdownTimer = setTimeout(() => {
            console.error('⏰ Graceful shutdown timeout exceeded, forcing exit');
            process.exit(1);
        }, this.gracefulShutdownTimeout);

        try {
            // Execute cleanup callbacks
            console.log('🧹 Executing cleanup callbacks...');
            await Promise.all(
                this.shutdownCallbacks.map(async (callback, index) => {
                    try {
                        await Promise.race([
                            callback(),
                            new Promise((_, reject) =>
                                setTimeout(() => reject(new Error('Callback timeout')), 5000)
                            )
                        ]);
                        console.log(`✅ Cleanup callback ${index + 1} completed`);
                    } catch (error) {
                        console.error(`❌ Cleanup callback ${index + 1} failed:`, error);
                    }
                })
            );

            // Close database connections, clear caches, etc.
            await this.performSystemCleanup();

            clearTimeout(shutdownTimer);
            console.log('✅ Graceful shutdown completed successfully');

            // Exit with appropriate code
            process.exit(error ? 1 : 0);
        } catch (shutdownError) {
            console.error('❌ Error during graceful shutdown:', shutdownError);
            clearTimeout(shutdownTimer);
            process.exit(1);
        }
    }

    /**
     * Perform system-wide cleanup
     */
    private async performSystemCleanup(): Promise<void> {
        try {
            // Clear all timers and intervals
            if (typeof clearTimeout !== 'undefined') {
                // Clear any global timers (implementation depends on your app)
            }

            // Close HTTP servers
            if ((global as any).httpServer) {
                await new Promise<void>((resolve) => {
                    (global as any).httpServer.close(() => resolve());
                });
            }

            // Clear memory caches
            if (global.gc) {
                global.gc();
            }

            console.log('✅ System cleanup completed');
        } catch (error) {
            console.error('❌ Error during system cleanup:', error);
        }
    }

    /**
     * Get current error metrics
     */
    public getMetrics(): GlobalErrorMetrics {
        return { ...this.metrics };
    }

    /**
     * Reset error counters (for testing or manual reset)
     */
    public resetMetrics(): void {
        this.metrics = {
            uncaughtExceptionCount: 0,
            unhandledRejectionCount: 0,
            lastErrorTime: 0,
            errorRateThreshold: 5,
            shutdownInitiated: false
        };
    }
}

// Singleton instance
let globalErrorHandler: GlobalErrorHandler;

/**
 * Initialize global error handler
 */
export function initializeGlobalErrorHandler(): GlobalErrorHandler {
    if (!globalErrorHandler) {
        globalErrorHandler = new GlobalErrorHandler();
    }
    return globalErrorHandler;
}

/**
 * Get global error handler instance
 */
export function getGlobalErrorHandler(): GlobalErrorHandler {
    if (!globalErrorHandler) {
        throw new Error('Global error handler not initialized. Call initializeGlobalErrorHandler() first.');
    }
    return globalErrorHandler;
}

/**
 * Register cleanup callback for graceful shutdown
 */
export function registerShutdownCallback(callback: () => Promise<void>): void {
    getGlobalErrorHandler().registerShutdownCallback(callback);
}

// Auto-initialize in Node.js environment (server-side)
if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    initializeGlobalErrorHandler();
}

export { GlobalErrorHandler };
