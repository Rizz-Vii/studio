/**
 * Enterprise Application Performance Monitoring System
 * Phase 5 Priority 1: Advanced APM with custom KPIs for SEO performance
 */

import { EventEmitter } from 'events';

export interface APMMetric {
    id: string;
    name: string;
    value: number;
    unit: string;
    timestamp: number;
    tags: Record<string, string>;
    metadata?: Record<string, any>;
}

export interface PerformanceEvent {
    id: string;
    type: 'page-load' | 'api-call' | 'user-interaction' | 'error' | 'custom';
    name: string;
    duration: number;
    timestamp: number;
    userId?: string;
    sessionId: string;
    userTier: string;
    location: {
        country: string;
        region: string;
        city: string;
        lat: number;
        lng: number;
    };
    device: {
        type: 'mobile' | 'tablet' | 'desktop';
        browser: string;
        os: string;
        screen: { width: number; height: number; };
        connection: string;
    };
    performance: {
        lcp: number;
        fid: number;
        cls: number;
        ttfb: number;
        fcp: number;
    };
    seoMetrics?: {
        analysisTime: number;
        tokensUsed: number;
        engineUsed: string;
        cacheHit: boolean;
        resultQuality: number;
    };
}

export interface AlertRule {
    id: string;
    name: string;
    condition: string;
    threshold: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    channels: string[];
    enabled: boolean;
    cooldown: number;
    lastTriggered?: number;
}

export interface Dashboard {
    id: string;
    name: string;
    description: string;
    widgets: DashboardWidget[];
    permissions: {
        viewers: string[];
        editors: string[];
        owners: string[];
    };
    refreshInterval: number;
    timeRange: {
        start: number;
        end: number;
        relative?: string;
    };
}

export interface DashboardWidget {
    id: string;
    type: 'chart' | 'metric' | 'table' | 'heatmap' | 'gauge';
    title: string;
    query: string;
    visualization: {
        chartType?: 'line' | 'bar' | 'pie' | 'area';
        aggregation?: 'sum' | 'avg' | 'min' | 'max' | 'count';
        groupBy?: string[];
        filters?: Record<string, any>;
    };
    position: { x: number; y: number; width: number; height: number; };
    refreshInterval?: number;
}

export class EnterpriseAPM extends EventEmitter {
    private metrics: Map<string, APMMetric[]> = new Map();
    private events: PerformanceEvent[] = [];
    private alerts: Map<string, AlertRule> = new Map();
    private dashboards: Map<string, Dashboard> = new Map();
    private isCollecting: boolean = false;
    private collectors: Map<string, NodeJS.Timer> = new Map();

    constructor() {
        super();
        this.initializeDefaultAlerts();
        this.initializeDefaultDashboards();
    }

    /**
     * Start collecting performance metrics
     */
    startCollection(): void {
        if (this.isCollecting) return;

        this.isCollecting = true;

        // Core Web Vitals collection
        this.startCoreWebVitalsCollection();

        // API performance monitoring
        this.startAPIPerformanceMonitoring();

        // User journey tracking
        this.startUserJourneyTracking();

        // SEO-specific metrics
        this.startSEOMetricsCollection();

        // System resource monitoring
        this.startSystemResourceMonitoring();

        this.emit('collection-started');
    }

    /**
     * Stop collecting performance metrics
     */
    stopCollection(): void {
        if (!this.isCollecting) return;

        this.isCollecting = false;

        // Clear all collectors
        this.collectors.forEach(timer => {
            if (timer) clearInterval(timer as NodeJS.Timeout);
        });
        this.collectors.clear();

        this.emit('collection-stopped');
    }

    /**
     * Record a performance metric
     */
    recordMetric(metric: Omit<APMMetric, 'id' | 'timestamp'>): void {
        const fullMetric: APMMetric = {
            ...metric,
            id: this.generateMetricId(),
            timestamp: Date.now()
        };

        const key = `${metric.name}-${JSON.stringify(metric.tags)}`;
        if (!this.metrics.has(key)) {
            this.metrics.set(key, []);
        }

        const metricSeries = this.metrics.get(key)!;
        metricSeries.push(fullMetric);

        // Keep only last 1000 metrics per series
        if (metricSeries.length > 1000) {
            metricSeries.shift();
        }

        // Check alert rules
        this.checkAlertRules(fullMetric);

        this.emit('metric-recorded', fullMetric);
    }

    /**
     * Record a performance event
     */
    recordEvent(event: Omit<PerformanceEvent, 'id' | 'timestamp'>): void {
        const fullEvent: PerformanceEvent = {
            ...event,
            id: this.generateEventId(),
            timestamp: Date.now()
        };

        this.events.push(fullEvent);

        // Keep only last 10000 events
        if (this.events.length > 10000) {
            this.events.shift();
        }

        // Extract metrics from event
        this.extractMetricsFromEvent(fullEvent);

        this.emit('event-recorded', fullEvent);
    }

    /**
     * Get metrics with filtering and aggregation
     */
    getMetrics(query: {
        name?: string;
        tags?: Record<string, string>;
        timeRange?: { start: number; end: number; };
        aggregation?: 'avg' | 'sum' | 'min' | 'max' | 'count';
        groupBy?: string[];
        limit?: number;
    }): APMMetric[] {
        let results: APMMetric[] = [];

        // Collect all metrics matching the query
        for (const [key, metrics] of this.metrics.entries()) {
            const filteredMetrics = metrics.filter(metric => {
                // Name filter
                if (query.name && metric.name !== query.name) return false;

                // Time range filter
                if (query.timeRange) {
                    const { start, end } = query.timeRange;
                    if (metric.timestamp < start || metric.timestamp > end) return false;
                }

                // Tags filter
                if (query.tags) {
                    for (const [key, value] of Object.entries(query.tags)) {
                        if (metric.tags[key] !== value) return false;
                    }
                }

                return true;
            });

            results.push(...filteredMetrics);
        }

        // Apply aggregation if specified
        if (query.aggregation && query.groupBy) {
            results = this.aggregateMetrics(results, query.aggregation, query.groupBy);
        }

        // Apply limit
        if (query.limit) {
            results = results.slice(0, query.limit);
        }

        return results.sort((a, b) => b.timestamp - a.timestamp);
    }

    /**
     * Get performance events with filtering
     */
    getEvents(query: {
        type?: string;
        userId?: string;
        sessionId?: string;
        timeRange?: { start: number; end: number; };
        limit?: number;
    }): PerformanceEvent[] {
        let results = this.events.filter(event => {
            if (query.type && event.type !== query.type) return false;
            if (query.userId && event.userId !== query.userId) return false;
            if (query.sessionId && event.sessionId !== query.sessionId) return false;

            if (query.timeRange) {
                const { start, end } = query.timeRange;
                if (event.timestamp < start || event.timestamp > end) return false;
            }

            return true;
        });

        if (query.limit) {
            results = results.slice(0, query.limit);
        }

        return results.sort((a, b) => b.timestamp - a.timestamp);
    }

    /**
     * Create or update alert rule
     */
    setAlertRule(rule: AlertRule): void {
        this.alerts.set(rule.id, rule);
        this.emit('alert-rule-updated', rule);
    }

    /**
     * Create or update dashboard
     */
    setDashboard(dashboard: Dashboard): void {
        this.dashboards.set(dashboard.id, dashboard);
        this.emit('dashboard-updated', dashboard);
    }

    /**
     * Get dashboard data
     */
    getDashboardData(dashboardId: string): any {
        const dashboard = this.dashboards.get(dashboardId);
        if (!dashboard) throw new Error(`Dashboard ${dashboardId} not found`);

        const data = {
            ...dashboard,
            widgets: dashboard.widgets.map(widget => ({
                ...widget,
                data: this.executeWidgetQuery(widget)
            }))
        };

        return data;
    }

    /**
     * Get performance insights using AI analysis
     */
    async getPerformanceInsights(timeRange: { start: number; end: number; }): Promise<{
        summary: string;
        issues: Array<{ severity: string; description: string; recommendation: string; }>;
        trends: Array<{ metric: string; trend: 'up' | 'down' | 'stable'; change: number; }>;
        predictions: Array<{ metric: string; prediction: number; confidence: number; }>;
    }> {
        const events = this.getEvents({ timeRange });
        const metrics = this.getMetrics({ timeRange });

        // Analyze performance patterns
        const insights = await this.analyzePerformancePatterns(events, metrics);

        return insights;
    }

    /**
     * Export metrics data for external analysis
     */
    exportData(format: 'json' | 'csv' | 'prometheus', timeRange?: { start: number; end: number; }): string {
        const metrics = this.getMetrics({ timeRange });
        const events = this.getEvents({ timeRange });

        switch (format) {
            case 'json':
                return JSON.stringify({ metrics, events }, null, 2);

            case 'csv':
                return this.exportToCSV(metrics, events);

            case 'prometheus':
                return this.exportToPrometheus(metrics);

            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }

    // Private methods
    private startCoreWebVitalsCollection(): void {
        const collector = setInterval(() => {
            if (typeof window !== 'undefined' && 'performance' in window) {
                this.collectCoreWebVitals();
            }
        }, 1000);

        this.collectors.set('core-web-vitals', collector);
    }

    private startAPIPerformanceMonitoring(): void {
        // Monitor API calls through fetch interception
        if (typeof window !== 'undefined') {
            const originalFetch = window.fetch;
            window.fetch = async (...args) => {
                const start = performance.now();
                const response = await originalFetch(...args);
                const duration = performance.now() - start;

                this.recordMetric({
                    name: 'api.response_time',
                    value: duration,
                    unit: 'ms',
                    tags: {
                        url: args[0] as string,
                        status: response.status.toString(),
                        method: args[1]?.method || 'GET'
                    }
                });

                return response;
            };
        }
    }

    private startUserJourneyTracking(): void {
        if (typeof window !== 'undefined') {
            // Track page views
            let currentPath = window.location.pathname;
            const observer = new MutationObserver(() => {
                if (window.location.pathname !== currentPath) {
                    currentPath = window.location.pathname;
                    this.recordEvent({
                        type: 'page-load',
                        name: 'page-view',
                        duration: 0,
                        sessionId: this.getSessionId(),
                        userTier: this.getUserTier(),
                        location: this.getCurrentLocation(),
                        device: this.getDeviceInfo(),
                        performance: this.getCurrentPerformance()
                    });
                }
            });

            observer.observe(document.body, { childList: true, subtree: true });
        }
    }

    private startSEOMetricsCollection(): void {
        // This would integrate with the NeuroSEO™ Suite to collect SEO-specific metrics
        const collector = setInterval(() => {
            // Collect SEO analysis performance metrics
            this.collectSEOMetrics();
        }, 5000);

        this.collectors.set('seo-metrics', collector);
    }

    private startSystemResourceMonitoring(): void {
        const collector = setInterval(() => {
            if (typeof window !== 'undefined' && 'performance' in window) {
                const memory = (performance as any).memory;
                if (memory) {
                    this.recordMetric({
                        name: 'system.memory_usage',
                        value: memory.usedJSHeapSize,
                        unit: 'bytes',
                        tags: { type: 'javascript_heap' }
                    });
                }
            }
        }, 10000);

        this.collectors.set('system-resources', collector);
    }

    private collectCoreWebVitals(): void {
        // Implementation would collect actual Core Web Vitals
        // This is a simplified version
        this.recordMetric({
            name: 'performance.lcp',
            value: Math.random() * 3000 + 1000,
            unit: 'ms',
            tags: { page: window.location.pathname }
        });
    }

    private collectSEOMetrics(): void {
        // Placeholder for SEO metrics collection
        // This would integrate with actual NeuroSEO™ monitoring
    }

    private checkAlertRules(metric: APMMetric): void {
        for (const rule of this.alerts.values()) {
            if (!rule.enabled) continue;

            // Simple threshold check (real implementation would support complex conditions)
            if (rule.name === metric.name && metric.value > rule.threshold) {
                const now = Date.now();
                if (!rule.lastTriggered || (now - rule.lastTriggered) > rule.cooldown) {
                    this.triggerAlert(rule, metric);
                    rule.lastTriggered = now;
                }
            }
        }
    }

    private triggerAlert(rule: AlertRule, metric: APMMetric): void {
        const alert = {
            rule,
            metric,
            timestamp: Date.now(),
            message: `Alert: ${rule.name} threshold exceeded. Value: ${metric.value}${metric.unit}`
        };

        this.emit('alert-triggered', alert);
    }

    private extractMetricsFromEvent(event: PerformanceEvent): void {
        // Extract Core Web Vitals metrics
        this.recordMetric({
            name: 'performance.lcp',
            value: event.performance.lcp,
            unit: 'ms',
            tags: {
                page: event.name,
                userTier: event.userTier,
                device: event.device.type,
                country: event.location.country
            }
        });

        // Extract user engagement metrics
        if (event.type === 'user-interaction') {
            this.recordMetric({
                name: 'user.engagement',
                value: event.duration,
                unit: 'ms',
                tags: {
                    interaction: event.name,
                    userTier: event.userTier
                }
            });
        }
    }

    private aggregateMetrics(metrics: APMMetric[], aggregation: string, groupBy: string[]): APMMetric[] {
        // Simplified aggregation implementation
        const groups = new Map<string, APMMetric[]>();

        for (const metric of metrics) {
            const key = groupBy.map(field => metric.tags[field] || 'unknown').join('-');
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key)!.push(metric);
        }

        const results: APMMetric[] = [];
        for (const [key, groupMetrics] of groups.entries()) {
            let value: number;

            switch (aggregation) {
                case 'avg':
                    value = groupMetrics.reduce((sum, m) => sum + m.value, 0) / groupMetrics.length;
                    break;
                case 'sum':
                    value = groupMetrics.reduce((sum, m) => sum + m.value, 0);
                    break;
                case 'min':
                    value = Math.min(...groupMetrics.map(m => m.value));
                    break;
                case 'max':
                    value = Math.max(...groupMetrics.map(m => m.value));
                    break;
                case 'count':
                    value = groupMetrics.length;
                    break;
                default:
                    value = groupMetrics[0].value;
            }

            results.push({
                id: this.generateMetricId(),
                name: groupMetrics[0].name,
                value,
                unit: groupMetrics[0].unit,
                timestamp: Date.now(),
                tags: { aggregation, groupKey: key }
            });
        }

        return results;
    }

    private executeWidgetQuery(widget: DashboardWidget): any {
        // Simplified query execution
        return this.getMetrics({
            name: widget.query,
            limit: 100
        });
    }

    private async analyzePerformancePatterns(events: PerformanceEvent[], metrics: APMMetric[]): Promise<any> {
        // Simplified AI analysis - real implementation would use ML models
        return {
            summary: 'Performance analysis completed',
            issues: [],
            trends: [],
            predictions: []
        };
    }

    private exportToCSV(metrics: APMMetric[], events: PerformanceEvent[]): string {
        // Simplified CSV export
        const headers = 'timestamp,type,name,value,unit,tags\n';
        const rows = metrics.map(m =>
            `${m.timestamp},metric,${m.name},${m.value},${m.unit},"${JSON.stringify(m.tags)}"`
        ).join('\n');

        return headers + rows;
    }

    private exportToPrometheus(metrics: APMMetric[]): string {
        // Simplified Prometheus format export
        return metrics.map(m =>
            `${m.name.replace(/\./g, '_')}{${Object.entries(m.tags).map(([k, v]) => `${k}="${v}"`).join(',')}} ${m.value} ${m.timestamp}`
        ).join('\n');
    }

    private initializeDefaultAlerts(): void {
        // Default performance alerts
        this.setAlertRule({
            id: 'high-lcp',
            name: 'performance.lcp',
            condition: 'threshold',
            threshold: 4000,
            severity: 'high',
            channels: ['email', 'slack'],
            enabled: true,
            cooldown: 300000 // 5 minutes
        });
    }

    private initializeDefaultDashboards(): void {
        // Default performance dashboard
        this.setDashboard({
            id: 'performance-overview',
            name: 'Performance Overview',
            description: 'Core Web Vitals and performance metrics',
            refreshInterval: 30000,
            timeRange: { start: Date.now() - 3600000, end: Date.now() },
            permissions: { viewers: ['*'], editors: ['admin'], owners: ['admin'] },
            widgets: [
                {
                    id: 'lcp-chart',
                    type: 'chart',
                    title: 'Largest Contentful Paint',
                    query: 'performance.lcp',
                    visualization: {
                        chartType: 'line',
                        aggregation: 'avg',
                        groupBy: ['page']
                    },
                    position: { x: 0, y: 0, width: 6, height: 4 }
                }
            ]
        });
    }

    private generateMetricId(): string {
        return `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateEventId(): string {
        return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private getSessionId(): string {
        // Simplified session ID generation
        return `session_${Date.now()}`;
    }

    private getUserTier(): string {
        // This would integrate with the authentication system
        return 'free';
    }

    private getCurrentLocation(): PerformanceEvent['location'] {
        // This would use geolocation API or IP-based location
        return {
            country: 'US',
            region: 'CA',
            city: 'San Francisco',
            lat: 37.7749,
            lng: -122.4194
        };
    }

    private getDeviceInfo(): PerformanceEvent['device'] {
        if (typeof window === 'undefined') {
            return {
                type: 'desktop',
                browser: 'unknown',
                os: 'unknown',
                screen: { width: 1920, height: 1080 },
                connection: 'unknown'
            };
        }

        return {
            type: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
            browser: navigator.userAgent,
            os: navigator.platform,
            screen: { width: window.screen.width, height: window.screen.height },
            connection: (navigator as any).connection?.effectiveType || 'unknown'
        };
    }

    private getCurrentPerformance(): PerformanceEvent['performance'] {
        // This would collect actual Core Web Vitals
        return {
            lcp: Math.random() * 3000 + 1000,
            fid: Math.random() * 100 + 50,
            cls: Math.random() * 0.1,
            ttfb: Math.random() * 500 + 200,
            fcp: Math.random() * 2000 + 800
        };
    }
}

// Global instance for enterprise APM
export const enterpriseAPM = new EnterpriseAPM();

// Auto-start collection in browser environment
if (typeof window !== 'undefined') {
    enterpriseAPM.startCollection();
}
