/**
 * 🚀 RankPilot AI Agent Environment Validator
 * Purpose: Ensure proper AI agent configuration before deployment
 * Created: July 31, 2025
 */

export interface AgentEnvironmentConfig {
    isProduction: boolean;
    agentsEnabled: boolean;
    neuroSEOEnabled: boolean;
    orchestratorsActive: {
        customerSupport: boolean;
        businessOperations: boolean;
        technicalOperations: boolean;
    };
    apiKeysConfigured: {
        openai: boolean;
        gemini: boolean;
        anthropic: boolean;
    };
    performanceSettings: {
        concurrentRequests: number;
        requestTimeout: number;
        retryAttempts: number;
    };
}

export class AgentEnvironmentValidator {

    /**
     * Validate complete AI agent environment configuration
     */
    static validateEnvironment(): AgentEnvironmentConfig {
        const config: AgentEnvironmentConfig = {
            isProduction: process.env.NODE_ENV === 'production',
            agentsEnabled: this.isAgentsEnabled(),
            neuroSEOEnabled: this.isNeuroSEOEnabled(),
            orchestratorsActive: this.getOrchestratorStatus(),
            apiKeysConfigured: this.checkAPIKeys(),
            performanceSettings: this.getPerformanceSettings(),
        };

        // Log configuration status
        this.logEnvironmentStatus(config);

        return config;
    }

    /**
     * Check if AI agents should be enabled
     */
    private static isAgentsEnabled(): boolean {
        const explicitlyEnabled = process.env.RANKPILOT_AGENTS_ENABLED === 'true';
        const featureFlagEnabled = process.env.FEATURE_FLAG_AI_AGENTS === 'true';
        const isProduction = process.env.NODE_ENV === 'production';

        return explicitlyEnabled || (isProduction && featureFlagEnabled);
    }

    /**
     * Check if NeuroSEO™ Suite is enabled
     */
    private static isNeuroSEOEnabled(): boolean {
        return process.env.NEUROSEO_ENABLED === 'true' ||
            process.env.FEATURE_FLAG_NEUROSEO_SUITE === 'true';
    }

    /**
     * Get orchestrator activation status
     */
    private static getOrchestratorStatus() {
        return {
            customerSupport: process.env.CUSTOMER_SUPPORT_ORCHESTRATOR_ENABLED === 'true',
            businessOperations: process.env.BUSINESS_OPERATIONS_ORCHESTRATOR_ENABLED === 'true',
            technicalOperations: process.env.TECHNICAL_OPERATIONS_ORCHESTRATOR_ENABLED === 'true',
        };
    }

    /**
     * Check API key configuration
     */
    private static checkAPIKeys() {
        return {
            openai: !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-'),
            gemini: !!process.env.GOOGLE_API_KEY && process.env.GOOGLE_API_KEY.length > 10,
            anthropic: !!process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.startsWith('sk-'),
        };
    }

    /**
     * Get performance settings with defaults
     */
    private static getPerformanceSettings() {
        return {
            concurrentRequests: parseInt(process.env.AI_AGENT_CONCURRENT_REQUESTS || '10'),
            requestTimeout: parseInt(process.env.AI_AGENT_REQUEST_TIMEOUT || '30000'),
            retryAttempts: parseInt(process.env.AI_AGENT_RETRY_ATTEMPTS || '3'),
        };
    }

    /**
     * Log environment status with detailed information
     */
    private static logEnvironmentStatus(config: AgentEnvironmentConfig): void {
        console.log('🔍 RankPilot AI Agent Environment Status:');
        console.log('========================================');
        console.log(`Environment: ${config.isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
        console.log(`AI Agents: ${config.agentsEnabled ? '✅ ENABLED' : '❌ DISABLED'}`);
        console.log(`NeuroSEO™ Suite: ${config.neuroSEOEnabled ? '✅ ENABLED' : '❌ DISABLED'}`);

        console.log('\n🤖 Orchestrator Status:');
        console.log(`Customer Support: ${config.orchestratorsActive.customerSupport ? '✅' : '❌'}`);
        console.log(`Business Operations: ${config.orchestratorsActive.businessOperations ? '✅' : '❌'}`);
        console.log(`Technical Operations: ${config.orchestratorsActive.technicalOperations ? '✅' : '❌'}`);

        console.log('\n🔑 API Configuration:');
        console.log(`OpenAI: ${config.apiKeysConfigured.openai ? '✅' : '❌'}`);
        console.log(`Gemini: ${config.apiKeysConfigured.gemini ? '✅' : '❌'}`);
        console.log(`Anthropic: ${config.apiKeysConfigured.anthropic ? '✅' : '❌'}`);

        console.log('\n⚡ Performance Settings:');
        console.log(`Concurrent Requests: ${config.performanceSettings.concurrentRequests}`);
        console.log(`Request Timeout: ${config.performanceSettings.requestTimeout}ms`);
        console.log(`Retry Attempts: ${config.performanceSettings.retryAttempts}`);
        console.log('========================================\n');
    }

    /**
     * Validate deployment readiness
     */
    static validateDeploymentReadiness(): { ready: boolean; issues: string[] } {
        const config = this.validateEnvironment();
        const issues: string[] = [];

        if (config.isProduction && !config.agentsEnabled) {
            issues.push('AI Agents should be enabled in production environment');
        }

        if (config.agentsEnabled && !config.neuroSEOEnabled) {
            issues.push('NeuroSEO™ Suite should be enabled when AI Agents are active');
        }

        const activeOrchestrators = Object.values(config.orchestratorsActive).filter(Boolean).length;
        if (config.agentsEnabled && activeOrchestrators === 0) {
            issues.push('At least one orchestrator should be active when AI Agents are enabled');
        }

        const configuredAPIs = Object.values(config.apiKeysConfigured).filter(Boolean).length;
        if (config.agentsEnabled && configuredAPIs === 0) {
            issues.push('At least one AI API key must be configured');
        }

        return {
            ready: issues.length === 0,
            issues
        };
    }

    /**
     * Get deployment status report
     */
    static getDeploymentReport(): string {
        const config = this.validateEnvironment();
        const readiness = this.validateDeploymentReadiness();

        let report = '🚀 RankPilot AI Agent Deployment Report\n';
        report += '=====================================\n\n';

        if (readiness.ready) {
            report += '✅ DEPLOYMENT READY\n';
            report += 'All AI agent systems are properly configured for production deployment.\n\n';
        } else {
            report += '⚠️  DEPLOYMENT ISSUES DETECTED\n';
            report += 'The following issues need to be resolved before deployment:\n\n';
            readiness.issues.forEach(issue => {
                report += `  ❌ ${issue}\n`;
            });
            report += '\n';
        }

        report += '📊 Configuration Summary:\n';
        report += `Environment: ${config.isProduction ? 'Production' : 'Development'}\n`;
        report += `AI Agents: ${config.agentsEnabled ? 'Enabled' : 'Disabled'}\n`;
        report += `NeuroSEO™: ${config.neuroSEOEnabled ? 'Enabled' : 'Disabled'}\n`;
        report += `Active Orchestrators: ${Object.values(config.orchestratorsActive).filter(Boolean).length}/3\n`;
        report += `Configured APIs: ${Object.values(config.apiKeysConfigured).filter(Boolean).length}/3\n\n`;

        report += '🔧 Recommended Actions:\n';
        if (!readiness.ready) {
            report += '1. Set RANKPILOT_AGENTS_ENABLED=true in production environment\n';
            report += '2. Configure all required API keys (OpenAI, Gemini, Anthropic)\n';
            report += '3. Enable NeuroSEO™ Suite with NEUROSEO_ENABLED=true\n';
            report += '4. Activate all three orchestrators in production\n';
        } else {
            report += '1. Run deployment script: ./scripts/deploy-ai-agents.sh\n';
            report += '2. Deploy to Firebase: firebase deploy\n';
            report += '3. Verify AI agents are active in production\n';
        }

        return report;
    }
}

// Export singleton instance for easy access
export const agentEnvironmentValidator = new AgentEnvironmentValidator();
