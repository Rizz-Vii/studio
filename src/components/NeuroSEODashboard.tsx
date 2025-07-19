/**
 * NeuroSEO™ Dashboard Component
 * Main interface for the NeuroSEO™ Suite
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/context/AuthContext';
import { 
  Brain, 
  Search, 
  Shield, 
  Edit, 
  TrendingUp, 
  Eye, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Target,
  Zap,
  BarChart3,
  Globe
} from 'lucide-react';
import type { NeuroSEOReport, NeuroSEOAnalysisRequest } from '@/lib/neuroseo';

interface NeuroSEODashboardProps {
  className?: string;
}

export default function NeuroSEODashboard({ className }: NeuroSEODashboardProps) {
  const { user } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<NeuroSEOReport | null>(null);
  const [usageStats, setUsageStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [urls, setUrls] = useState<string>('');
  const [targetKeywords, setTargetKeywords] = useState<string>('');
  const [competitorUrls, setCompetitorUrls] = useState<string>('');
  const [analysisType, setAnalysisType] = useState<'comprehensive' | 'seo-focused' | 'content-focused' | 'competitive'>('comprehensive');

  useEffect(() => {
    loadUsageStats();
  }, []);

  const loadUsageStats = async () => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/neuroseo', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const stats = await response.json();
        setUsageStats(stats);
      }
    } catch (error) {
      console.error('Failed to load usage stats:', error);
    }
  };

  const runAnalysis = async () => {
    if (!user) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      
      const analysisRequest: Omit<NeuroSEOAnalysisRequest, 'userId' | 'userPlan'> = {
        urls: urls.split('\n').filter(url => url.trim()),
        targetKeywords: targetKeywords.split(',').map(k => k.trim()).filter(k => k),
        competitorUrls: competitorUrls ? competitorUrls.split('\n').filter(url => url.trim()) : undefined,
        analysisType
      };

      const response = await fetch('/api/neuroseo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(analysisRequest)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const analysisReport = await response.json();
      setReport(analysisReport);
      loadUsageStats(); // Refresh usage stats

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-blue-600" />
            NeuroSEO™ Suite
          </h1>
          <p className="text-gray-600 mt-1">
            AI-powered content analysis and optimization platform
          </p>
        </div>
        
        {usageStats && (
          <Card className="w-64">
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">Usage This Month</div>
              <div className="text-2xl font-bold">{usageStats.used}/{usageStats.limit}</div>
              <Progress value={(usageStats.used / usageStats.limit) * 100} className="mt-2" />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Analysis Form */}
      <Card>
        <CardHeader>
          <CardTitle>Start New Analysis</CardTitle>
          <CardDescription>
            Analyze your content with our comprehensive NeuroSEO™ engine
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="urls">Target URLs *</Label>
              <Textarea
                id="urls"
                placeholder="https://example.com/page1&#10;https://example.com/page2"
                value={urls}
                onChange={(e) => setUrls(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">One URL per line</p>
            </div>

            <div>
              <Label htmlFor="competitors">Competitor URLs</Label>
              <Textarea
                id="competitors"
                placeholder="https://competitor1.com&#10;https://competitor2.com"
                value={competitorUrls}
                onChange={(e) => setCompetitorUrls(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">Optional: One URL per line</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="keywords">Target Keywords *</Label>
              <Input
                id="keywords"
                placeholder="SEO, content optimization, digital marketing"
                value={targetKeywords}
                onChange={(e) => setTargetKeywords(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">Comma-separated keywords</p>
            </div>

            <div>
              <Label htmlFor="analysisType">Analysis Type</Label>
              <Select value={analysisType} onValueChange={(value: any) => setAnalysisType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comprehensive">Comprehensive Analysis</SelectItem>
                  <SelectItem value="seo-focused">SEO-Focused</SelectItem>
                  <SelectItem value="content-focused">Content-Focused</SelectItem>
                  <SelectItem value="competitive">Competitive Analysis</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={runAnalysis} 
            disabled={isAnalyzing || !urls.trim() || !targetKeywords.trim()}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Zap className="mr-2 h-4 w-4 animate-spin" />
                Running NeuroSEO™ Analysis...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                Start Analysis
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {report && (
        <div className="space-y-6">
          {/* Overall Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                NeuroSEO™ Analysis Results
                <Badge variant={getScoreBadgeVariant(report.overallScore)} className="text-lg px-3 py-1">
                  {report.overallScore}/100
                </Badge>
              </CardTitle>
              <CardDescription>
                Analysis completed on {new Date(report.timestamp).toLocaleString()}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Key Insights */}
          {report.keyInsights.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Key Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {report.keyInsights.map((insight, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={insight.impact === 'critical' ? 'destructive' : insight.impact === 'high' ? 'default' : 'secondary'}>
                          {insight.impact}
                        </Badge>
                        <span className="font-medium">{insight.title}</span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{insight.description}</p>
                      <p className="text-blue-600 text-sm font-medium">{insight.recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Detailed Analysis Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="seo">SEO Analysis</TabsTrigger>
              <TabsTrigger value="visibility">AI Visibility</TabsTrigger>
              <TabsTrigger value="trust">Trust Signals</TabsTrigger>
              <TabsTrigger value="tasks">Action Items</TabsTrigger>
              <TabsTrigger value="competitive">Competitive</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Search className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">SEO Score</span>
                    </div>
                    <div className={`text-2xl font-bold ${getScoreColor((report.crawlResults[0] as any)?.seoMetrics?.overallScore || 0)}`}>
                      {(report.crawlResults[0] as any)?.seoMetrics?.overallScore || 0}/100
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">AI Visibility</span>
                    </div>
                    <div className={`text-2xl font-bold ${getScoreColor(report.visibilityAnalysis[0]?.metrics.overallVisibilityScore || 0)}`}>
                      {report.visibilityAnalysis[0]?.metrics.overallVisibilityScore || 0}/100
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium">Trust Score</span>
                    </div>
                    <div className={`text-2xl font-bold ${getScoreColor(report.trustAnalysis[0]?.metrics.overallEATScore || 0)}`}>
                      {report.trustAnalysis[0]?.metrics.overallEATScore || 0}/100
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium">Semantic Relevance</span>
                    </div>
                    <div className={`text-2xl font-bold ${getScoreColor((report as any).semanticAnalysis?.[0]?.overallRelevanceScore || 0)}`}>
                      {(report as any).semanticAnalysis?.[0]?.overallRelevanceScore || 0}/100
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="seo" className="space-y-4">
              {report.crawlResults.map((result, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{result.url}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">Overall SEO</div>
                        <div className={`text-xl font-bold ${getScoreColor((result as any).seoMetrics?.overallScore || 0)}`}>
                          {(result as any).seoMetrics?.overallScore || 0}/100
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Technical</div>
                        <div className={`text-xl font-bold ${getScoreColor((result as any).seoMetrics?.technicalScore || 0)}`}>
                          {(result as any).seoMetrics?.technicalScore || 0}/100
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Content</div>
                        <div className={`text-xl font-bold ${getScoreColor((result as any).seoMetrics?.contentScore || 0)}`}>
                          {(result as any).seoMetrics?.contentScore || 0}/100
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Performance</div>
                        <div className={`text-xl font-bold ${getScoreColor((result as any).performance?.overallScore || 0)}`}>
                          {(result as any).performance?.overallScore || 0}/100
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="visibility" className="space-y-4">
              {report.visibilityAnalysis.map((visibility, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{visibility.url}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">Citation Rate</div>
                        <div className="text-xl font-bold">
                          {Math.round(visibility.metrics.citationRate * 100)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Avg Position</div>
                        <div className="text-xl font-bold">
                          #{visibility.metrics.averageCitationPosition.toFixed(1)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Opportunities</div>
                        <div className="text-xl font-bold">
                          {visibility.metrics.improvementOpportunities.length}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="trust" className="space-y-4">
              {report.trustAnalysis.map((trust, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{trust.url}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">Expertise</div>
                        <div className={`text-xl font-bold ${getScoreColor(trust.metrics.expertiseScore)}`}>
                          {trust.metrics.expertiseScore}/100
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Authority</div>
                        <div className={`text-xl font-bold ${getScoreColor(trust.metrics.authoritativeness)}`}>
                          {trust.metrics.authoritativeness}/100
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Trust</div>
                        <div className={`text-xl font-bold ${getScoreColor(trust.metrics.trustworthiness)}`}>
                          {trust.metrics.trustworthiness}/100
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="tasks" className="space-y-4">
              <div className="space-y-3">
                {report.actionableTasks.map((task, index) => (
                  <Card key={task.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={task.priority === 'urgent' ? 'destructive' : task.priority === 'high' ? 'default' : 'secondary'}>
                            {task.priority}
                          </Badge>
                          <span className="font-medium">{task.title}</span>
                        </div>
                        <div className="text-sm text-gray-600 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {task.timeframe}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Impact: {task.estimatedImpact}%</span>
                        <span>Effort: {task.estimatedEffort}</span>
                        <span>Category: {task.category}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="competitive" className="space-y-4">
              {report.competitivePositioning && (
                <Card>
                  <CardHeader>
                    <CardTitle>Competitive Position</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Current Ranking
                        </h4>
                        <div className="text-3xl font-bold">
                          #{report.competitivePositioning.overallRanking} of {report.competitivePositioning.totalCompetitors}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Strengths</h4>
                        <div className="space-y-1">
                          {report.competitivePositioning.strengths.map((strength, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-3 w-3 text-green-600" />
                              {strength}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
