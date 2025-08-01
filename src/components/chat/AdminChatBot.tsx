/**
 * RankPilot Admin ChatBot Component
 * Advanced chatbot interface for admin users with system management capabilities
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import type { AdminChatBotProps, AdminChatMessage, ChatResponse, AdminQuickCommand } from '@/types/chatbot';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertTriangle,
    BarChart3,
    Bot,
    Loader2,
    Maximize2,
    Minimize2,
    Send,
    Settings,
    Shield,
    TrendingUp,
    User,
    Users,
    X
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

export default function AdminChatBot({ className }: AdminChatBotProps) {
    // State management
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<AdminChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [activeTab, setActiveTab] = useState('chat');

    // Refs
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auth
    const { user, profile } = useAuth();
    const userTier = profile?.subscriptionTier || 'free';

    // Check if user has admin access
    const isAdmin = userTier === 'admin' || userTier === 'enterprise';

    // Auto-scroll to bottom on new messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen && !isMinimized && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen, isMinimized]);

    // Initialize with admin welcome message
    useEffect(() => {
        if (isOpen && messages.length === 0 && isAdmin) {
            const welcomeMessage: AdminChatMessage = {
                id: `admin_welcome_${Date.now()}`,
                message: '',
                response: `🛡️ **RankPilot Admin AI** - System Management Assistant

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
                timestamp: new Date().toISOString(),
                isUser: false,
            };
            setMessages([welcomeMessage]);
        }
    }, [isOpen, messages.length, isAdmin]);

    // Send message to API
    const sendMessage = async () => {
        if (!inputValue.trim() || isLoading || !user || !isAdmin) return;

        const userMessage: AdminChatMessage = {
            id: `admin_user_${Date.now()}`,
            message: inputValue,
            response: '',
            timestamp: new Date().toISOString(),
            isUser: true,
        };

        // Add user message immediately
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);
        setError('');

        try {
            // Get user token
            const token = await user.getIdToken();

            const response = await fetch('/api/chat/admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    message: inputValue,
                    sessionId: sessionId || undefined,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to send admin message');
            }

            const data: ChatResponse = await response.json();

            // Update session ID if new
            if (data.sessionId && data.sessionId !== sessionId) {
                setSessionId(data.sessionId);
            }

            // Add AI response
            const aiMessage: AdminChatMessage = {
                id: `admin_ai_${Date.now()}`,
                message: '',
                response: data.response,
                timestamp: data.timestamp,
                isUser: false,
                tokensUsed: data.tokensUsed,
                metadata: {
                    systemMetrics: data.context.dataUsed.includes('system_metrics'),
                    performanceData: data.context.dataUsed.includes('performance_data'),
                },
            };

            setMessages(prev => [...prev, aiMessage]);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send admin message');
            console.error('Admin chat error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle Enter key press
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Quick command buttons
    const quickCommands: AdminQuickCommand[] = [
        { label: 'System Status', command: '/system status', icon: Shield, category: 'system' },
        { label: 'User Analytics', command: '/users analytics', icon: Users, category: 'users' },
        { label: 'Performance', command: '/performance report', icon: TrendingUp, category: 'performance' },
        { label: 'Error Analysis', command: '/errors analyze', icon: AlertTriangle, category: 'system' },
        { label: 'Billing Overview', command: '/billing overview', icon: BarChart3, category: 'billing' },
    ];

    // Admin toggle button
    const AdminToggleButton = () => (
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn("fixed bottom-6 left-6 z-50", className)}
        >
            <Button
                onClick={() => setIsOpen(true)}
                size="lg"
                className="w-14 h-14 rounded-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-200"
                aria-label="Open Admin AI Chat"
            >
                <Settings className="w-6 h-6" />
            </Button>
        </motion.div>
    );

    // Admin chat window
    const AdminChatWindow = () => (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{
                opacity: 1,
                scale: 1,
                y: 0,
                height: isMinimized ? 'auto' : '700px'
            }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className={cn(
                "fixed bottom-6 left-6 z-50 w-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200",
                isMinimized && "h-auto"
            )}
        >
            <Card className="h-full border-none shadow-none">
                {/* Header */}
                <CardHeader className="flex flex-row items-center justify-between p-4 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-t-2xl">
                    <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        <div>
                            <h3 className="font-semibold text-sm">RankPilot Admin AI</h3>
                            <p className="text-xs opacity-90">System Management</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsMinimized(!isMinimized)}
                            className="h-8 w-8 p-0 text-white hover:bg-white/20"
                        >
                            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsOpen(false)}
                            className="h-8 w-8 p-0 text-white hover:bg-white/20"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </CardHeader>

                {!isMinimized && (
                    <CardContent className="flex flex-col h-[calc(700px-80px)] p-0">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                            <TabsList className="grid grid-cols-2 w-full rounded-none border-b">
                                <TabsTrigger value="chat">Chat</TabsTrigger>
                                <TabsTrigger value="commands">Quick Commands</TabsTrigger>
                            </TabsList>

                            <TabsContent value="chat" className="flex-1 flex flex-col mt-0">
                                {/* Messages */}
                                <ScrollArea className="flex-1 p-4">
                                    <div className="space-y-4">
                                        {messages.map((msg, index) => (
                                            <div
                                                key={msg.id}
                                                className={cn(
                                                    "flex gap-3",
                                                    msg.isUser ? "justify-end" : "justify-start"
                                                )}
                                            >
                                                {!msg.isUser && (
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                                                        <Bot className="w-4 h-4 text-white" />
                                                    </div>
                                                )}

                                                <div
                                                    className={cn(
                                                        "max-w-[75%] rounded-lg p-3 text-sm",
                                                        msg.isUser
                                                            ? "bg-gradient-to-r from-red-600 to-orange-600 text-white"
                                                            : "bg-gray-100 text-gray-900"
                                                    )}
                                                >
                                                    <div className="whitespace-pre-wrap">
                                                        {msg.isUser ? msg.message : msg.response}
                                                    </div>

                                                    {!msg.isUser && (
                                                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                                                            {msg.tokensUsed && (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    {msg.tokensUsed} tokens
                                                                </Badge>
                                                            )}
                                                            {msg.metadata?.systemMetrics && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    System Data
                                                                </Badge>
                                                            )}
                                                            {msg.metadata?.performanceData && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    Performance
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {msg.isUser && (
                                                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                                                        <User className="w-4 h-4 text-gray-600" />
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        {isLoading && (
                                            <div className="flex gap-3 justify-start">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
                                                    <Bot className="w-4 h-4 text-white" />
                                                </div>
                                                <div className="bg-gray-100 rounded-lg p-3 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        <span>Analyzing system data...</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {error && (
                                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
                                                {error}
                                            </div>
                                        )}
                                    </div>
                                    <div ref={messagesEndRef} />
                                </ScrollArea>

                                {/* Input */}
                                <div className="p-4 border-t border-gray-200">
                                    <div className="flex gap-2">
                                        <Input
                                            ref={inputRef}
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            placeholder="Ask about system performance, users, errors..."
                                            disabled={isLoading || !isAdmin}
                                            className="flex-1"
                                        />
                                        <Button
                                            onClick={sendMessage}
                                            disabled={!inputValue.trim() || isLoading || !isAdmin}
                                            size="sm"
                                            className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                                        >
                                            <Send className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    {!isAdmin && (
                                        <p className="text-xs text-red-500 mt-2">
                                            Admin access required
                                        </p>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="commands" className="flex-1 mt-0">
                                <div className="p-4 space-y-3">
                                    <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Commands</h4>
                                    {quickCommands.map((cmd, index) => (
                                        <Button
                                            key={index}
                                            variant="outline"
                                            className="w-full justify-start gap-2 h-auto p-3"
                                            onClick={() => {
                                                setInputValue(cmd.command);
                                                setActiveTab('chat');
                                                setTimeout(() => sendMessage(), 100);
                                            }}
                                            disabled={isLoading || !isAdmin}
                                        >
                                            <cmd.icon className="w-4 h-4" />
                                            <div className="text-left">
                                                <div className="font-medium text-sm">{cmd.label}</div>
                                                <div className="text-xs text-gray-500">{cmd.command}</div>
                                            </div>
                                        </Button>
                                    ))}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                )}
            </Card>
        </motion.div>
    );

    if (!isAdmin) {
        return null; // Don't show admin chatbot if user doesn't have admin access
    }

    return (
        <>
            <AnimatePresence>
                {!isOpen && <AdminToggleButton />}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen && <AdminChatWindow />}
            </AnimatePresence>
        </>
    );
}
