/**
 * RankPilot Chatbot System Validation
 * Comprehensive testing for chatbot functionality and types
 */

import { ChatBotConfig, TierFeatures } from '@/types/chatbot';
import type { PlanType } from '@/lib/stripe';

// Configuration for the chatbot system
export const chatBotConfig: ChatBotConfig = {
    customer: {
        maxMessageLength: 2000,
        welcomeMessage: `👋 Hi! I'm RankPilot AI, your SEO assistant. I can help you with:

• **SEO Audit Analysis** - Explain your site's performance scores
• **Content Optimization** - Suggest improvements for better rankings  
• **Technical SEO** - Fix crawling and indexing issues
• **Keyword Strategy** - Identify opportunities for growth
• **NeuroSEO™ Insights** - Advanced AI-powered recommendations

What can I help you with today?`,
        placeholderText: 'Ask about your SEO performance...',
        theme: {
            primaryColor: 'from-blue-600 to-purple-600',
            accentColor: 'from-blue-700 to-purple-700',
        },
    },
    admin: {
        maxMessageLength: 3000,
        welcomeMessage: `🛡️ **RankPilot Admin AI** - System Management Assistant

**Available Commands:**
• \`/system status\` - Get real-time system health
• \`/users analytics\` - User engagement metrics  
• \`/performance report\` - System performance analysis
• \`/errors analyze\` - Error tracking and resolution
• \`/billing overview\` - Revenue and subscription insights
• \`/database metrics\` - Database performance stats

**Quick Actions:**
• Monitor system health and performance
• Analyze user behavior and engagement
• Track errors and suggest fixes
• Generate business intelligence reports
• Optimize system performance

What would you like to analyze today?`,
        placeholderText: 'Ask about system performance, users, errors...',
        theme: {
            primaryColor: 'from-red-600 to-orange-600',
            accentColor: 'from-red-700 to-orange-700',
        },
        quickCommands: [
            { label: 'System Status', command: '/system status', icon: 'Shield' as any, category: 'system' },
            { label: 'User Analytics', command: '/users analytics', icon: 'Users' as any, category: 'users' },
            { label: 'Performance', command: '/performance report', icon: 'TrendingUp' as any, category: 'performance' },
            { label: 'Error Analysis', command: '/errors analyze', icon: 'AlertTriangle' as any, category: 'system' },
            { label: 'Billing Overview', command: '/billing overview', icon: 'BarChart3' as any, category: 'billing' },
        ],
    },
    general: {
        maxTokensPerMessage: 1000,
        rateLimitPerHour: 50,
        sessionTimeoutMinutes: 30,
        retryAttempts: 3,
    },
};

// Tier-based feature definitions  
export const tierFeatures: Record<PlanType | 'free' | 'admin', TierFeatures> = {
    free: {
        tier: 'free',
        features: {
            basicSEOGuidance: true,
            auditExplanations: true,
            contentAnalysis: false,
            neuroSEOInsights: false,
            competitorAnalysis: false,
            advancedNeuroSEO: false,
            customSolutions: false,
            prioritySupport: false,
        },
        quotas: {
            messagesPerHour: 10,
            tokensPerMessage: 500,
            sessionsPerDay: 3,
        },
    },
    starter: {
        tier: 'starter',
        features: {
            basicSEOGuidance: true,
            auditExplanations: true,
            contentAnalysis: true,
            neuroSEOInsights: true,
            competitorAnalysis: false,
            advancedNeuroSEO: false,
            customSolutions: false,
            prioritySupport: false,
        },
        quotas: {
            messagesPerHour: 25,
            tokensPerMessage: 750,
            sessionsPerDay: 10,
        },
    },
    agency: {
        tier: 'agency',
        features: {
            basicSEOGuidance: true,
            auditExplanations: true,
            contentAnalysis: true,
            neuroSEOInsights: true,
            competitorAnalysis: true,
            advancedNeuroSEO: true,
            customSolutions: false,
            prioritySupport: true,
        },
        quotas: {
            messagesPerHour: 50,
            tokensPerMessage: 1000,
            sessionsPerDay: 25,
        },
    },
    enterprise: {
        tier: 'enterprise',
        features: {
            basicSEOGuidance: true,
            auditExplanations: true,
            contentAnalysis: true,
            neuroSEOInsights: true,
            competitorAnalysis: true,
            advancedNeuroSEO: true,
            customSolutions: true,
            prioritySupport: true,
            systemMonitoring: true,
            userAnalytics: true,
        },
        quotas: {
            messagesPerHour: 100,
            tokensPerMessage: 1500,
            sessionsPerDay: 50,
        },
    },
    admin: {
        tier: 'admin',
        features: {
            basicSEOGuidance: true,
            auditExplanations: true,
            contentAnalysis: true,
            neuroSEOInsights: true,
            competitorAnalysis: true,
            advancedNeuroSEO: true,
            customSolutions: true,
            prioritySupport: true,
            systemMonitoring: true,
            userAnalytics: true,
        },
        quotas: {
            messagesPerHour: 200,
            tokensPerMessage: 2000,
            sessionsPerDay: 100,
        },
    },
};

// Validation functions
export class ChatBotValidator {
    /**
     * Validates message content and length
     */
    static validateMessage(message: string, chatType: 'customer' | 'admin'): { isValid: boolean; error?: string } {
        if (!message || typeof message !== 'string') {
            return { isValid: false, error: 'Message must be a non-empty string' };
        }

        const maxLength = chatType === 'customer'
            ? chatBotConfig.customer.maxMessageLength
            : chatBotConfig.admin.maxMessageLength;

        if (message.length > maxLength) {
            return { isValid: false, error: `Message exceeds maximum length of ${maxLength} characters` };
        }

        if (message.trim().length === 0) {
            return { isValid: false, error: 'Message cannot be empty or only whitespace' };
        }

        return { isValid: true };
    }

    /**
     * Validates user tier and feature access
     */
    static validateTierAccess(userTier: PlanType | 'free' | 'admin', feature: keyof TierFeatures['features']): boolean {
        const tierConfig = tierFeatures[userTier];
        return tierConfig?.features[feature] || false;
    }

    /**
     * Validates rate limits for user
     */
    static validateRateLimit(userTier: PlanType | 'free' | 'admin', currentUsage: {
        messagesThisHour: number;
        sessionsToday: number;
    }): { isValid: boolean; error?: string } {
        const tierConfig = tierFeatures[userTier];

        if (currentUsage.messagesThisHour >= tierConfig.quotas.messagesPerHour) {
            return {
                isValid: false,
                error: `Rate limit exceeded. ${tierConfig.quotas.messagesPerHour} messages per hour allowed for ${userTier} tier`
            };
        }

        if (currentUsage.sessionsToday >= tierConfig.quotas.sessionsPerDay) {
            return {
                isValid: false,
                error: `Daily session limit exceeded. ${tierConfig.quotas.sessionsPerDay} sessions per day allowed for ${userTier} tier`
            };
        }

        return { isValid: true };
    }

    /**
     * Validates admin access
     */
    static validateAdminAccess(userTier: PlanType | 'free' | 'admin'): boolean {
        return userTier === 'admin' || userTier === 'enterprise';
    }

    /**
     * Validates session ID format
     */
    static validateSessionId(sessionId: string): boolean {
        if (!sessionId || typeof sessionId !== 'string') {
            return false;
        }

        // Check for valid session ID format (timestamp + random string)
        const sessionPattern = /^(session_|admin_session_)\d+_[a-z0-9]+$/;
        return sessionPattern.test(sessionId);
    }

    /**
     * Sanitizes message input
     */
    static sanitizeMessage(message: string): string {
        return message
            .trim()
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .replace(/[^\w\s\-.,!?@#$%^&*()+={}[\]|\\:";'<>/`~]/g, ''); // Remove potentially harmful characters
    }

    /**
     * Gets available features for user tier
     */
    static getAvailableFeatures(userTier: PlanType | 'free' | 'admin'): string[] {
        const tierConfig = tierFeatures[userTier];
        return Object.entries(tierConfig.features)
            .filter(([_, enabled]) => enabled)
            .map(([feature, _]) => feature);
    }
}

// Chatbot response helpers
export class ChatBotResponseHelper {
    /**
     * Formats error response
     */
    static formatErrorResponse(error: string, code: string = 'internal'): {
        success: false;
        error: { code: string; message: string };
        timestamp: string;
    } {
        return {
            success: false,
            error: {
                code,
                message: error,
            },
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * Formats success response
     */
    static formatSuccessResponse<T>(data: T): {
        success: true;
        data: T;
        timestamp: string;
    } {
        return {
            success: true,
            data,
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * Gets tier-specific welcome message
     */
    static getTierWelcomeMessage(userTier: PlanType | 'free' | 'admin', chatType: 'customer' | 'admin'): string {
        const baseMessage = chatType === 'customer'
            ? chatBotConfig.customer.welcomeMessage
            : chatBotConfig.admin.welcomeMessage;

        const tierInfo = tierFeatures[userTier];
        const availableFeatures = ChatBotValidator.getAvailableFeatures(userTier);

        return `${baseMessage}

**Your ${userTier.toUpperCase()} tier includes:**
${availableFeatures.map(feature => `• ${feature.replace(/([A-Z])/g, ' $1').toLowerCase()}`).join('\n')}

**Usage Limits:**
• ${tierInfo.quotas.messagesPerHour} messages per hour
• ${tierInfo.quotas.tokensPerMessage} tokens per message
• ${tierInfo.quotas.sessionsPerDay} sessions per day`;
    }
}

// Export the configuration and utilities
export { chatBotConfig as default };
