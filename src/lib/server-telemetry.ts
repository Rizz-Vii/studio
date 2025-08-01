/**
 * Server Telemetry - Simplified and Fixed
 * Removed problematic OpenTelemetry imports
 */

import type { TelemetryProvider } from './telemetry';

// Simple server telemetry without OpenTelemetry conflicts
export class ServerTelemetry implements TelemetryProvider {
    private static instance: ServerTelemetry;
    private isInitialized = false;
    public isActive = true;

    private constructor() { }

    public static getInstance(): ServerTelemetry {
        if (!ServerTelemetry.instance) {
            ServerTelemetry.instance = new ServerTelemetry();
        }
        return ServerTelemetry.instance;
    }

    public start(): void {
        this.isInitialized = true;
        console.log('📊 Server telemetry started');
    }

    public async shutdown(): Promise<void> {
        this.isInitialized = false;
        console.log('📊 Server telemetry shutdown');
    }

    public async initialize(): Promise<void> {
        if (this.isInitialized) {
            return;
        }

        try {
            console.log('🔧 Server telemetry initialized (simplified)');
            this.isInitialized = true;
        } catch (error) {
            console.error('❌ Server telemetry initialization failed:', error);
        }
    }

    public logMetric(name: string, value: number, labels?: Record<string, string>): void {
        console.log(`📊 Metric: ${name} = ${value}`, labels || {});
    }

    public logError(error: Error, context?: Record<string, any>): void {
        console.error('🚨 Server Error:', error.message, context || {});
    }

    public logInfo(message: string, data?: Record<string, any>): void {
        console.log('ℹ️ Info:', message, data || {});
    }
}

// Export singleton
export const serverTelemetry = ServerTelemetry.getInstance();

// Export factory function for compatibility
export function createTelemetryProvider(): Promise<ServerTelemetry> {
    const instance = ServerTelemetry.getInstance();
    instance.start();
    return Promise.resolve(instance);
}
