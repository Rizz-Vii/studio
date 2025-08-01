/**
 * Memory Leak Detection and Prevention System
 * Advanced monitoring and cleanup mechanisms for production environments
 * 
 * Based on DevSMC.md memory management standards
 */

interface MemoryMetrics {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
    arrayBuffers: number;
    timestamp: number;
}

interface LeakDetectionConfig {
    monitoringInterval: number;    // Monitoring frequency in ms
    memoryThreshold: number;       // Memory usage threshold (bytes)
    growthThreshold: number;       // Memory growth threshold (%)
    maxSamples: number;           // Max samples to keep in history
    alertThreshold: number;       // Consecutive alerts before action
    gcInterval: number;           // Garbage collection interval
}

export class MemoryLeakDetector {
    private samples: MemoryMetrics[] = [];
    private listeners = new Set<EventListener>();
    private timers = new Set<NodeJS.Timeout>();
    private intervals = new Set<NodeJS.Timeout>();
    private monitoringTimer?: NodeJS.Timeout;
    private gcTimer?: NodeJS.Timeout;
    private alertCount = 0;
    private isMonitoring = false;

    private config: LeakDetectionConfig = {
        monitoringInterval: 30000,    // 30 seconds
        memoryThreshold: 512 * 1024 * 1024, // 512MB
        growthThreshold: 10,          // 10% growth
        maxSamples: 100,             // Keep last 100 samples
        alertThreshold: 3,           // 3 consecutive alerts
        gcInterval: 300000           // 5 minutes
    };

    constructor(config?: Partial<LeakDetectionConfig>) {
        this.config = { ...this.config, ...config };
        this.startMonitoring();
    }

    /**
     * Start memory monitoring
     */
    startMonitoring(): void {
        if (this.isMonitoring || typeof process === 'undefined') {
            return;
        }

        this.isMonitoring = true;
        console.log('🔍 Starting memory leak detection system...');

        // Periodic memory sampling
        this.monitoringTimer = setInterval(() => {
            this.sampleMemory();
        }, this.config.monitoringInterval);

        // Periodic garbage collection (if available)
        if (global.gc) {
            this.gcTimer = setInterval(() => {
                this.performGarbageCollection();
            }, this.config.gcInterval);
        }

        // Track the monitoring timer itself
        this.intervals.add(this.monitoringTimer);
        if (this.gcTimer) {
            this.intervals.add(this.gcTimer);
        }
    }

    /**
     * Stop memory monitoring
     */
    stopMonitoring(): void {
        if (!this.isMonitoring) {
            return;
        }

        this.isMonitoring = false;
        console.log('🛑 Stopping memory leak detection system...');

        if (this.monitoringTimer) {
            clearInterval(this.monitoringTimer);
            this.intervals.delete(this.monitoringTimer);
        }

        if (this.gcTimer) {
            clearInterval(this.gcTimer);
            this.intervals.delete(this.gcTimer);
        }
    }

    /**
     * Sample current memory usage
     */
    private sampleMemory(): void {
        if (typeof process === 'undefined') {
            return;
        }

        const memUsage = process.memoryUsage();
        const sample: MemoryMetrics = {
            heapUsed: memUsage.heapUsed,
            heapTotal: memUsage.heapTotal,
            external: memUsage.external,
            rss: memUsage.rss,
            arrayBuffers: memUsage.arrayBuffers || 0,
            timestamp: Date.now()
        };

        this.samples.push(sample);

        // Keep only the most recent samples
        if (this.samples.length > this.config.maxSamples) {
            this.samples.shift();
        }

        // Analyze for potential leaks
        this.analyzeMemoryPattern();
    }

    /**
     * Analyze memory patterns for potential leaks
     */
    private analyzeMemoryPattern(): void {
        if (this.samples.length < 10) {
            return; // Need more samples for analysis
        }

        const current = this.samples[this.samples.length - 1];
        const previous = this.samples[this.samples.length - 10];

        // Check absolute memory threshold
        if (current.heapUsed > this.config.memoryThreshold) {
            this.onMemoryThresholdExceeded(current);
        }

        // Check memory growth rate
        const growthRate = ((current.heapUsed - previous.heapUsed) / previous.heapUsed) * 100;
        if (growthRate > this.config.growthThreshold) {
            this.onMemoryGrowthDetected(current, growthRate);
        }

        // Check for consistent upward trend
        if (this.detectMemoryTrend()) {
            this.onMemoryLeakSuspected();
        }
    }

    /**
     * Detect consistent memory growth trend
     */
    private detectMemoryTrend(): boolean {
        if (this.samples.length < 20) {
            return false;
        }

        const recentSamples = this.samples.slice(-20);
        let increasingCount = 0;

        for (let i = 1; i < recentSamples.length; i++) {
            if (recentSamples[i].heapUsed > recentSamples[i - 1].heapUsed) {
                increasingCount++;
            }
        }

        // If 80% of recent samples show growth, suspect a leak
        return (increasingCount / (recentSamples.length - 1)) > 0.8;
    }

    /**
     * Handle memory threshold exceeded
     */
    private onMemoryThresholdExceeded(sample: MemoryMetrics): void {
        this.alertCount++;
        console.warn('⚠️ Memory threshold exceeded:', {
            heapUsed: `${Math.round(sample.heapUsed / 1024 / 1024)}MB`,
            threshold: `${Math.round(this.config.memoryThreshold / 1024 / 1024)}MB`,
            alertCount: this.alertCount
        });

        if (this.alertCount >= this.config.alertThreshold) {
            this.triggerMemoryCleanup();
        }
    }

    /**
     * Handle memory growth detection
     */
    private onMemoryGrowthDetected(sample: MemoryMetrics, growthRate: number): void {
        console.warn('📈 Rapid memory growth detected:', {
            heapUsed: `${Math.round(sample.heapUsed / 1024 / 1024)}MB`,
            growthRate: `${growthRate.toFixed(2)}%`,
            threshold: `${this.config.growthThreshold}%`
        });
    }

    /**
     * Handle suspected memory leak
     */
    private onMemoryLeakSuspected(): void {
        console.error('🚨 Potential memory leak detected! Consistent memory growth pattern observed.');
        this.triggerMemoryCleanup();
        this.dumpMemoryReport();
    }

    /**
     * Trigger memory cleanup procedures
     */
    private triggerMemoryCleanup(): void {
        console.log('🧹 Triggering memory cleanup procedures...');

        // Force garbage collection if available
        this.performGarbageCollection();

        // Clean up tracked resources
        this.cleanupTrackedResources();

        // Reset alert count after cleanup
        this.alertCount = 0;
    }

    /**
     * Perform garbage collection
     */
    private performGarbageCollection(): void {
        if (global.gc) {
            console.log('♻️ Performing garbage collection...');
            const before = process.memoryUsage().heapUsed;
            global.gc();
            const after = process.memoryUsage().heapUsed;
            const freed = before - after;
            console.log(`♻️ GC completed. Freed: ${Math.round(freed / 1024 / 1024)}MB`);
        }
    }

    /**
     * Clean up tracked resources
     */
    private cleanupTrackedResources(): void {
        console.log('🧹 Cleaning up tracked resources...');

        // Clear tracked timers
        for (const timer of this.timers) {
            clearTimeout(timer);
        }
        this.timers.clear();

        // Clear tracked intervals (except monitoring)
        for (const interval of this.intervals) {
            if (interval !== this.monitoringTimer && interval !== this.gcTimer) {
                clearInterval(interval);
            }
        }

        // Remove event listeners
        for (const listener of this.listeners) {
            // Note: Would need reference to the element to properly remove
            // This is a simplified example
        }
        this.listeners.clear();

        console.log('✅ Resource cleanup completed');
    }

    /**
     * Dump detailed memory report
     */
    private dumpMemoryReport(): void {
        if (this.samples.length === 0) {
            return;
        }

        const current = this.samples[this.samples.length - 1];
        const oldest = this.samples[0];
        const duration = current.timestamp - oldest.timestamp;

        console.log('📊 Memory Usage Report:', {
            current: {
                heapUsed: `${Math.round(current.heapUsed / 1024 / 1024)}MB`,
                heapTotal: `${Math.round(current.heapTotal / 1024 / 1024)}MB`,
                external: `${Math.round(current.external / 1024 / 1024)}MB`,
                rss: `${Math.round(current.rss / 1024 / 1024)}MB`
            },
            growth: {
                heapUsed: `${Math.round((current.heapUsed - oldest.heapUsed) / 1024 / 1024)}MB`,
                duration: `${Math.round(duration / 1000)}s`
            },
            tracking: {
                timers: this.timers.size,
                intervals: this.intervals.size,
                listeners: this.listeners.size
            }
        });
    }

    /**
     * Track a timer for cleanup
     */
    trackTimer(timer: NodeJS.Timeout): NodeJS.Timeout {
        this.timers.add(timer);
        return timer;
    }

    /**
     * Track an interval for cleanup
     */
    trackInterval(interval: NodeJS.Timeout): NodeJS.Timeout {
        this.intervals.add(interval);
        return interval;
    }

    /**
     * Track an event listener for cleanup
     */
    trackEventListener(listener: EventListener): EventListener {
        this.listeners.add(listener);
        return listener;
    }

    /**
     * Untrack a timer
     */
    untrackTimer(timer: NodeJS.Timeout): void {
        this.timers.delete(timer);
    }

    /**
     * Untrack an interval
     */
    untrackInterval(interval: NodeJS.Timeout): void {
        this.intervals.delete(interval);
    }

    /**
     * Get current memory metrics
     */
    getCurrentMetrics(): MemoryMetrics | null {
        return this.samples[this.samples.length - 1] || null;
    }

    /**
     * Get memory history
     */
    getMemoryHistory(): MemoryMetrics[] {
        return [...this.samples];
    }

    /**
     * Check if memory usage is healthy
     */
    isMemoryHealthy(): boolean {
        const current = this.getCurrentMetrics();
        if (!current) {
            return true;
        }

        return current.heapUsed < this.config.memoryThreshold && this.alertCount < this.config.alertThreshold;
    }

    /**
     * Reset monitoring state
     */
    reset(): void {
        this.samples = [];
        this.alertCount = 0;
        console.log('🔄 Memory leak detector reset');
    }

    /**
     * Destroy the detector and clean up
     */
    destroy(): void {
        this.stopMonitoring();
        this.cleanupTrackedResources();
        this.reset();
        console.log('🗑️ Memory leak detector destroyed');
    }
}

/**
 * Weak Reference Manager for preventing memory leaks
 */
export class WeakReferenceManager {
    private weakRefs = new Set<WeakRef<any>>();
    private finalizationRegistry: FinalizationRegistry<string>;

    constructor() {
        this.finalizationRegistry = new FinalizationRegistry((heldValue: string) => {
            console.log(`🗑️ Object collected: ${heldValue}`);
        });
    }

    /**
     * Create and track a weak reference
     */
    createWeakRef<T extends object>(obj: T, label?: string): WeakRef<T> {
        const weakRef = new WeakRef(obj);
        this.weakRefs.add(weakRef);

        if (label) {
            this.finalizationRegistry.register(obj, label);
        }

        return weakRef;
    }

    /**
     * Clean up dead weak references
     */
    cleanup(): void {
        const deadRefs = [];
        for (const ref of this.weakRefs) {
            if (ref.deref() === undefined) {
                deadRefs.push(ref);
            }
        }

        for (const deadRef of deadRefs) {
            this.weakRefs.delete(deadRef);
        }

        if (deadRefs.length > 0) {
            console.log(`🧹 Cleaned up ${deadRefs.length} dead weak references`);
        }
    }

    /**
     * Get count of live references
     */
    getLiveReferenceCount(): number {
        let count = 0;
        for (const ref of this.weakRefs) {
            if (ref.deref() !== undefined) {
                count++;
            }
        }
        return count;
    }
}

// Singleton instances
let memoryLeakDetector: MemoryLeakDetector;
let weakReferenceManager: WeakReferenceManager;

/**
 * Get global memory leak detector instance
 */
export function getMemoryLeakDetector(): MemoryLeakDetector {
    if (!memoryLeakDetector) {
        memoryLeakDetector = new MemoryLeakDetector();
    }
    return memoryLeakDetector;
}

/**
 * Get weak reference manager instance
 */
export function getWeakReferenceManager(): WeakReferenceManager {
    if (!weakReferenceManager) {
        weakReferenceManager = new WeakReferenceManager();
    }
    return weakReferenceManager;
}

/**
 * Helper function to safely set timeout with tracking
 */
export function safeSetTimeout(callback: () => void, delay: number): NodeJS.Timeout {
    const detector = getMemoryLeakDetector();
    const timer = setTimeout(() => {
        detector.untrackTimer(timer);
        callback();
    }, delay);

    return detector.trackTimer(timer);
}

/**
 * Helper function to safely set interval with tracking
 */
export function safeSetInterval(callback: () => void, delay: number): NodeJS.Timeout {
    const detector = getMemoryLeakDetector();
    const interval = setInterval(callback, delay);

    return detector.trackInterval(interval);
}

/**
 * Helper function to safely clear tracked timer
 */
export function safeClearTimeout(timer: NodeJS.Timeout): void {
    const detector = getMemoryLeakDetector();
    clearTimeout(timer);
    detector.untrackTimer(timer);
}

/**
 * Helper function to safely clear tracked interval
 */
export function safeClearInterval(interval: NodeJS.Timeout): void {
    const detector = getMemoryLeakDetector();
    clearInterval(interval);
    detector.untrackInterval(interval);
}
