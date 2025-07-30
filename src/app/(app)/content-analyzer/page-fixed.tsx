import { RewriteAnalysis } from '@/lib/neuroseo/types';
// src/app/(app)/content-analyzer/page.tsx
"use client";

import {
    NeuroSEOActionableTasks,
    NeuroSEOFeatureGate,
    NeuroSEOInsightsPanel,
    NeuroSEOProgressIndicator
} from "@/components/neuroseo/NeuroSEOEnhancedComponents";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { ACTIVITY_TYPES, TOOL_NAMES } from "@/lib/activity-types";
import { db } from "@/lib/firebase";
import {
    type NeuroSEOAnalysisRequest,
    type NeuroSEOReport
} from "@/lib/neuroseo";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { motion } from "framer-motion";
import {
    AlertTriangle,
    Brain,
    CheckCircle,
    Edit,
    RefreshCw,
    TrendingUp
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

// Type definitions for content analysis
interface ContentAnalysisResponse {
    overallScore: number;
    readability: {
        score: number;
        grade: string;
        suggestions: string[];
    };
    seo: {
        score: number;
        keywordDensity: number;
        suggestions: string[];
    };
    sentiment: {
        score: number;
        tone: string;
        suggestions: string[];
    };
    readabilityScore: number;
    seoScore: number;
    sentimentScore: number;
    resultsSummary: string;
}

// Mock analysis function - to be replaced with NeuroSEO integration
async function analyzeContent(input: {
    content: string;
    targetKeywords: string[];
    url?: string;
}): Promise<ContentAnalysisResponse> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
        overallScore: 78,
        readability: {
            score: 85,
            grade: "8th Grade",
            suggestions: ["Use shorter sentences", "Simplify complex words"]
        },
        seo: {
            score: 72,
            keywordDensity: 2.1,
            suggestions: ["Increase keyword density", "Add semantic keywords"]
        },
        sentiment: {
            score: 68,
            tone: "Neutral",
            suggestions: ["Add more positive language", "Include emotional triggers"]
        },
        readabilityScore: 85,
        seoScore: 72,
        sentimentScore: 68,
        resultsSummary: "Content analysis completed successfully"
    };
}

// Enhanced Content Analyzer with NeuroSEO™ RewriteGen™ Integration
export default function ContentAnalyzerPage() {
    const { user } = useAuth();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [report, setReport] = useState<NeuroSEOReport | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [analysisProgress, setAnalysisProgress] = useState(0);
    const [currentEngine, setCurrentEngine] = useState<string>("");
    const [completedEngines, setCompletedEngines] = useState<string[]>([]);

    // Form state
    const [content, setContent] = useState("");
    const [url, setUrl] = useState("");
    const [keywords, setKeywords] = useState("");

    const formRef = useRef<HTMLFormElement>(null);
    const resultRef = useRef<HTMLDivElement>(null);

    // Get user subscription tier for feature gating
    const userTier = (user as any)?.subscriptionTier || "free";

    // Scroll to results when analysis completes
    useEffect(() => {
        if (report && !isAnalyzing && resultRef.current) {
            resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [report, isAnalyzing]);

    // Simulate analysis progress focusing on content-related engines
    useEffect(() => {
        if (isAnalyzing) {
            const engines = ['semanticMap', 'rewriteGen', 'trustBlock', 'aiVisibility'];
            let currentIndex = 0;

            const interval = setInterval(() => {
                if (currentIndex < engines.length) {
                    setCurrentEngine(engines[currentIndex]);
                    setAnalysisProgress((currentIndex + 1) * (100 / engines.length));

                    setTimeout(() => {
                        setCompletedEngines(prev => [...prev, engines[currentIndex]]);
                        currentIndex++;
                    }, 2000);
                } else {
                    clearInterval(interval);
                }
            }, 3000);

            return () => clearInterval(interval);
        } else {
            setAnalysisProgress(0);
            setCurrentEngine("");
            setCompletedEngines([]);
        }
    }, [isAnalyzing]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!content.trim() && !url.trim()) {
            setError("Please provide either content text or a URL to analyze");
            return;
        }

        if (!user) {
            setError("Please log in to analyze content");
            return;
        }

        setIsAnalyzing(true);
        setError(null);
        setReport(null);

        try {
            const analysisRequest: NeuroSEOAnalysisRequest = {
                urls: url.trim() ? [url.trim()] : [],
                targetKeywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
                analysisType: "content-focused",
                userPlan: userTier,
                userId: user.uid,
            };

            // Call NeuroSEO™ API
            const response = await fetch('/api/neuroseo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...analysisRequest,
                    content: content.trim(), // Add content to request
                }),
            });

            if (!response.ok) {
                throw new Error(`Analysis failed: ${response.statusText}`);
            }

            const data = await response.json();

            // Enhanced mock report for content analysis
            const mockReport: NeuroSEOReport = {
                id: `content-${Date.now()}`,
                timestamp: new Date().toISOString(),
                request: analysisRequest,
                crawlResults: [],
                semanticAnalysis: [],
                visibilityAnalysis: [],
                trustAnalysis: [],
                rewriteRecommendations: [
                    {
                        summary: "Enhanced version" as any // Optional property with improved clarity and SEO optimization",
                        improvements: [] as any, // Fixed syntax
                            "Improved readability score from 65 to 82",
                            "Added target keywords naturally",
                            "Enhanced semantic structure",
                            "Optimized for featured snippets",
                        ],
                        seoImpact: {
                            readability: 8.5,
                            keywordDensity: 7.2,
                            semanticRelevance: 9.1,
                        },
                    },
                ],
                overallScore: 78,
                keyInsights: [
                    {
                        category: "content",
                        title: "Content Readability Enhancement",
                        description: "Your content can be significantly improved for better user engagement and SEO performance.",
                        impact: "high",
                        confidence: 0.89,
                        evidence: ["Complex sentence structures identified", "Passive voice usage detected", "Technical jargon without explanations"],
                        recommendation: "Simplify sentence structure and add explanatory content for technical terms.",
                    },
                    {
                        category: "seo",
                        title: "Keyword Optimization Opportunity",
                        description: "Target keywords are underutilized and could be better integrated into the content.",
                        impact: "medium",
                        confidence: 0.94,
                        evidence: ["Low keyword density", "Missing semantic variations", "Weak keyword placement"],
                        recommendation: "Integrate target keywords more naturally and include semantic variations.",
                    },
                    {
                        category: "trust",
                        title: "E-A-T Signal Enhancement",
                        description: "Content lacks authoritative signals and expert credibility markers.",
                        impact: "medium",
                        confidence: 0.87,
                        evidence: ["No author byline", "Missing expert citations", "Lack of authoritative sources"],
                        recommendation: "Add author credentials, expert quotes, and authoritative source citations.",
                    },
                ],
                actionableTasks: [
                    {
                        id: "task-1",
                        title: "Improve Content Readability",
                        description: "Rewrite complex sentences and add explanatory content for technical terms.",
                        category: "content",
                        priority: "high",
                        estimatedEffort: "medium",
                        estimatedImpact: 8,
                        timeframe: "2-3 hours",
                        dependencies: [],
                        resources: [
                            {
                                type: "tool",
                                title: "Hemingway Editor",
                                description: "Readability improvement tool",
                            },
                            {
                                type: "guide",
                                title: "Content Readability Best Practices",
                                description: "Comprehensive guide to writing readable content",
                            }
                        ],
                    },
                    {
                        id: "task-2",
                        title: "Optimize Keyword Integration",
                        description: "Naturally integrate target keywords and semantic variations throughout the content.",
                        category: "seo",
                        priority: "high",
                        estimatedEffort: "medium",
                        estimatedImpact: 7,
                        timeframe: "1-2 hours",
                        dependencies: ["task-1"],
                        resources: [
                            {
                                type: "tool",
                                title: "LSI Keywords Tool",
                                description: "Find semantic keyword variations",
                            }
                        ],
                    },
                ],
                quotaUsage: {
                    allowed: true,
                    remaining: 100,
                    limit: 100,
                    remainingQuota: 100,
                    resetDate: new Date()
                },
            };

            setReport(mockReport);

            // Save to Firestore with activity tracking
            if (user) {
                await addDoc(collection(db, "contentAnalyses"), {
                    userId: user.uid,
                    content: content.substring(0, 500), // Store first 500 chars
                    url: url || null,
                    report: mockReport,
                    timestamp: serverTimestamp(),
                });

                // Track activity
                await addDoc(collection(db, "activities"), {
                    userId: user.uid,
                    type: "tool-usage",
                    tool: TOOL_NAMES.CONTENT_ANALYZER,
                    timestamp: serverTimestamp(),
                    metadata: {
                        contentLength: content.length,
                        hasUrl: !!url,
                        keywordCount: keywords.split(',').filter(Boolean).length,
                    },
                });
            }

        } catch (error) {
            console.error("Content analysis error:", error);
            setError(error instanceof Error ? error.message : "Analysis failed");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-2">
                    NeuroSEO™ Content Analyzer
                </h1>
                <p className="text-muted-foreground text-lg">
                    Advanced AI-powered content analysis with RewriteGen™ optimization
                </p>
            </div>

            {/* Analysis Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Edit className="h-5 w-5" />
                        Content Analysis
                    </CardTitle>
                    <CardDescription>
                        Analyze your content for SEO optimization, readability, and AI-powered rewrite suggestions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="content">Content Text</Label>
                            <Textarea
                                id="content"
                                placeholder="Paste your content here for analysis..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={8}
                                className="resize-none"
                            />
                            <p className="text-sm text-muted-foreground mt-1">
                                {content.length} characters
                            </p>
                        </div>

                        <div className="text-center text-muted-foreground">
                            <span>OR</span>
                        </div>

                        <div>
                            <Label htmlFor="url">Content URL</Label>
                            <Input
                                id="url"
                                type="url"
                                placeholder="https://example.com/article"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="keywords">Target Keywords (comma-separated)</Label>
                            <Input
                                id="keywords"
                                placeholder="content marketing, SEO, digital strategy"
                                value={keywords}
                                onChange={(e) => setKeywords(e.target.value)}
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={isAnalyzing || (!content.trim() && !url.trim())}
                            className="w-full"
                        >
                            {isAnalyzing ? (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    Analyzing with RewriteGen™...
                                </>
                            ) : (
                                <>
                                    <Brain className="mr-2 h-4 w-4" />
                                    Analyze Content
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Progress Indicator */}
            <NeuroSEOProgressIndicator
                isAnalyzing={isAnalyzing}
                currentEngine={currentEngine}
                progress={analysisProgress}
                completedEngines={completedEngines}
            />

            {/* Error Display */}
            {error && (
                <Card className="border-destructive">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-5 w-5" />
                            <span>{error}</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Results */}
            {report && (
                <div ref={resultRef} className="space-y-6">
                    {/* Engine Overview - Content Focused */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5" />
                                    Content Performance Analysis
                                </CardTitle>
                                <CardDescription>
                                    Overall content score: {report.overallScore}/100
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600">85%</div>
                                        <div className="text-sm text-blue-700">Readability</div>
                                    </div>
                                    <div className="text-center p-4 bg-green-50 rounded-lg">
                                        <div className="text-2xl font-bold text-green-600">72%</div>
                                        <div className="text-sm text-green-700">SEO Score</div>
                                    </div>
                                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                                        <div className="text-2xl font-bold text-purple-600">78%</div>
                                        <div className="text-sm text-purple-700">E-A-T Score</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* RewriteGen™ Recommendations */}
                    {report.rewriteRecommendations && report.rewriteRecommendations.length > 0 && (
                        <NeuroSEOFeatureGate
                            requiredTier="starter"
                            currentTier={userTier}
                            featureName="AI Content Rewriting"
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Edit className="h-5 w-5" />
                                            RewriteGen™ Recommendations
                                        </CardTitle>
                                        <CardDescription>
                                            AI-powered content improvements with high confidence
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {report.rewriteRecommendations.map((rewrite, index) => (
                                            <div key={index} className="space-y-4">
                                                <div>
                                                    <h4 className="font-semibold mb-2">AI-Enhanced Version</h4>
                                                    <div className="p-3 bg-green-50 rounded border text-sm">
                                                        {rewrite.summary || 'No summary available'}
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="font-semibold mb-2">Improvements Made</h4>
                                                    <ul className="grid md:grid-cols-2 gap-2">
                                                        {(rewrite.improvements || []).map((improvement, idx) => (
                                                            <li key={idx} className="flex items-center gap-2 text-sm">
                                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                                {improvement}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                <div className="grid md:grid-cols-3 gap-4 mt-4">
                                                    <div className="text-center p-3 bg-blue-50 rounded">
                                                        <div className="font-bold text-blue-600">{rewrite.seoImpact?.readability}</div>
                                                        <div className="text-xs text-blue-700">Readability Impact</div>
                                                    </div>
                                                    <div className="text-center p-3 bg-green-50 rounded">
                                                        <div className="font-bold text-green-600">{rewrite.seoImpact?.keywordDensity}</div>
                                                        <div className="text-xs text-green-700">Keyword Optimization</div>
                                                    </div>
                                                    <div className="text-center p-3 bg-purple-50 rounded">
                                                        <div className="font-bold text-purple-600">{rewrite.seoImpact?.semanticRelevance}</div>
                                                        <div className="text-xs text-purple-700">Semantic Relevance</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </NeuroSEOFeatureGate>
                    )}

                    {/* Content Insights */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <NeuroSEOInsightsPanel insights={report.keyInsights} />
                    </motion.div>

                    {/* Actionable Tasks */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                    >
                        <NeuroSEOActionableTasks tasks={report.actionableTasks} />
                    </motion.div>
                </div>
            )}
        </div>
    );
}
