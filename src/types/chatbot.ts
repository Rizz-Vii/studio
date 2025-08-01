/**
 * RankPilot Chatbot System Types
 * Comprehensive TypeScript interfaces for chatbot functionality
 */

import type { PlanType } from '@/lib/stripe';

// Base message interface
export interface BaseChatMessage {
    id: string;
    message: string;
    response: string;
    timestamp: string;
    isUser: boolean;
    tokensUsed?: number;
}

// Customer chatbot specific message
export interface CustomerChatMessage extends BaseChatMessage {
    metadata?: {
        auditContext?: boolean;
        siteContext?: boolean;
        neuroSEOContext?: boolean;
        userTier?: PlanType;
        currentUrl?: string;
    };
}

// Admin chatbot specific message
export interface AdminChatMessage extends BaseChatMessage {
    metadata?: {
        systemMetrics?: boolean;
        performanceData?: boolean;
        adminLevel?: PlanType;
        commandExecuted?: string;
    };
}

// Chat request interfaces
export interface CustomerChatRequest {
    uid: string;
    message: string;
    url?: string;
    sessionId?: string;
    chatType: 'customer';
}

export interface AdminChatRequest {
    uid: string;
    message: string;
    sessionId?: string;
    chatType: 'admin';
}

export type ChatRequest = CustomerChatRequest | AdminChatRequest;

// Chat response interface
export interface ChatResponse {
    response: string;
    sessionId: string;
    timestamp: string;
    tokensUsed: number;
    context: {
        type: 'customer' | 'admin';
        dataUsed: string[];
    };
}

// Context interfaces for AI processing
export interface AuditContext {
    url: string;
    score: {
        performance: number;
        accessibility: number;
        seo: number;
        bestPractices: number;
    };
    issues: string[];
    suggestions: string[];
    lastAnalyzed: string;
}

export interface SiteContext {
    totalPages: number;
    contentSummary: string;
    keywords: string[];
    recentAnalyses: any[];
    domain?: string;
    lastCrawled?: string;
}

export interface AdminContext {
    systemMetrics: {
        totalUsers: number;
        activeSubscriptions: number;
        totalAnalyses: number;
        errorRate: number;
        uptime?: number;
        responseTime?: number;
    };
    recentActivity: AdminActivity[];
    performanceInsights: string[];
}

export interface AdminActivity {
    type: 'user_signup' | 'subscription_upgrade' | 'audit_completed' | 'error_detected' | 'system_event';
    description: string;
    timestamp: Date;
    userId?: string;
    metadata?: Record<string, any>;
}

export interface ChatContext {
    userTier: PlanType | 'free' | 'admin';
    recentConversations: ConversationHistory[];
    availableFeatures: string[];
    userId: string;
    isAdmin?: boolean;
}

export interface ConversationHistory {
    id: string;
    question: string;
    response: string;
    timestamp: string;
    tokensUsed?: number;
    sessionId: string;
}

// Component prop interfaces
export interface ChatBotProps {
    className?: string;
}

export interface CustomerChatBotProps {
    currentUrl?: string;
    className?: string;
    userTier?: PlanType;
    onClose?: () => void;
}

export interface AdminChatBotProps {
    className?: string;
    onClose?: () => void;
}

// Chat session interface
export interface ChatSession {
    id: string;
    userId: string;
    type: 'customer' | 'admin';
    startTime: string;
    lastActivity: string;
    messageCount: number;
    totalTokens: number;
    isActive: boolean;
}

// Error handling interfaces
export interface ChatError {
    code: 'unauthenticated' | 'permission-denied' | 'invalid-argument' | 'internal' | 'quota-exceeded';
    message: string;
    details?: Record<string, any>;
}

// Quick command interface for admin chat
export interface AdminQuickCommand {
    label: string;
    command: string;
    icon: React.ComponentType<{ className?: string }>;
    description?: string;
    category: 'system' | 'users' | 'performance' | 'analytics' | 'billing';
}

// Feature availability based on subscription tier
export interface TierFeatures {
    tier: PlanType | 'free' | 'admin';
    features: {
        basicSEOGuidance: boolean;
        auditExplanations: boolean;
        contentAnalysis: boolean;
        neuroSEOInsights: boolean;
        competitorAnalysis: boolean;
        advancedNeuroSEO: boolean;
        customSolutions: boolean;
        prioritySupport: boolean;
        systemMonitoring?: boolean; // Admin only
        userAnalytics?: boolean; // Admin only
    };
    quotas: {
        messagesPerHour: number;
        tokensPerMessage: number;
        sessionsPerDay: number;
    };
}

// API response wrapper
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: ChatError;
    timestamp: string;
}

// Chatbot state interface
export interface ChatBotState {
    isOpen: boolean;
    isMinimized: boolean;
    messages: (CustomerChatMessage | AdminChatMessage)[];
    inputValue: string;
    isLoading: boolean;
    sessionId: string;
    error: string;
    activeTab?: string; // For admin chatbot
}

// Export utility type for strict message type checking
export type StrictChatMessage<T extends 'customer' | 'admin'> = T extends 'customer'
    ? CustomerChatMessage
    : AdminChatMessage;

// Export utility type for message arrays
export type ChatMessageArray<T extends 'customer' | 'admin'> = StrictChatMessage<T>[];

// Configuration interface
export interface ChatBotConfig {
    customer: {
        maxMessageLength: number;
        welcomeMessage: string;
        placeholderText: string;
        theme: {
            primaryColor: string;
            accentColor: string;
        };
    };
    admin: {
        maxMessageLength: number;
        welcomeMessage: string;
        placeholderText: string;
        theme: {
            primaryColor: string;
            accentColor: string;
        };
        quickCommands: AdminQuickCommand[];
    };
    general: {
        maxTokensPerMessage: number;
        rateLimitPerHour: number;
        sessionTimeoutMinutes: number;
        retryAttempts: number;
    };
}
