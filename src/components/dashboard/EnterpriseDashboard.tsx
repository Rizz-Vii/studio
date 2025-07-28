/**
 * Enterprise Monitoring & Automation Dashboard
 * Phase 5: Complete monitoring, optimization, and AI automation overview
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Activity,
    AlertTriangle,
    Brain,
    CheckCircle, Clock,
    Globe,
    Monitor,
    Rocket,
    Settings,
    TrendingUp,
    Users,
    Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis, YAxis
} from 'recharts';

interface DashboardMetrics {
    global_performance: {
        edge_locations: { total: number; active: number; avg_latency: number; avg_cache_hit_rate: number; };
        cache_performance: { global_hit_rate: number; bandwidth_savings: number; };
        database: { avg_query_improvement: number; throughput_increase: number; };
    };
    automation_metrics: {
        code_quality: { average_quality_score: number; issues_auto_fixed: number; };
        testing: { average_pass_rate: number; performance_regressions_detected: number; };
        deployment: { success_rate: number; average_deployment_time: number; };
    };
    business_intelligence: {
        revenue_growth: number;
        user_engagement_improvement: number;
        conversion_rate_improvement: number;
        performance_impact_score: number;
    };
    anomalies: Array<{
        id: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
        description: string;
        timestamp: number;
        resolved: boolean;
    }>;
    real_time_metrics: {
        active_users: number;
        response_time: number;
        error_rate: number;
        cpu_usage: number;
        memory_usage: number;
    };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function EnterpriseDashboard() {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        loadDashboardMetrics();
        const interval = setInterval(loadDashboardMetrics, 30000); // Update every 30 seconds
        return () => clearInterval(interval);
    }, [selectedTimeRange]);

    const loadDashboardMetrics = async () => {
        try {
            setIsLoading(true);
            // Mock data for demonstration
            const mockMetrics: DashboardMetrics = {
                global_performance: {
                    edge_locations: { total: 12, active: 11, avg_latency: 145, avg_cache_hit_rate: 0.94 },
                    cache_performance: { global_hit_rate: 0.91, bandwidth_savings: 2500000 },
                    database: { avg_query_improvement: 65, throughput_increase: 45 }
                },
                automation_metrics: {
                    code_quality: { average_quality_score: 92, issues_auto_fixed: 156 },
                    testing: { average_pass_rate: 97.8, performance_regressions_detected: 3 },
                    deployment: { success_rate: 98.9, average_deployment_time: 8.5 }
                },
                business_intelligence: {
                    revenue_growth: 18.5,
                    user_engagement_improvement: 25.3,
                    conversion_rate_improvement: 21.7,
                    performance_impact_score: 88.5
                },
                anomalies: [
                    { id: '1', severity: 'medium', description: 'API response time spike detected', timestamp: Date.now() - 3600000, resolved: false },
                    { id: '2', severity: 'low', description: 'Cache hit rate below optimal', timestamp: Date.now() - 7200000, resolved: true },
                    { id: '3', severity: 'high', description: 'Database connection pool exhaustion', timestamp: Date.now() - 1800000, resolved: false }
                ],
                real_time_metrics: {
                    active_users: 2847,
                    response_time: 187,
                    error_rate: 0.012,
                    cpu_usage: 67.5,
                    memory_usage: 72.3
                }
            };

            setMetrics(mockMetrics);
        } catch (error) {
            console.error('Failed to load dashboard metrics:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const performanceData = [
        { time: '00:00', latency: 150, throughput: 1200, errors: 2 },
        { time: '04:00', latency: 145, throughput: 1350, errors: 1 },
        { time: '08:00', latency: 180, throughput: 1800, errors: 5 },
        { time: '12:00', latency: 195, throughput: 2100, errors: 8 },
        { time: '16:00', latency: 210, throughput: 2300, errors: 6 },
        { time: '20:00', latency: 175, throughput: 1900, errors: 3 }
    ];

    const businessMetricsData = [
        { month: 'Jan', revenue: 95000, users: 2200, conversion: 3.2 },
        { month: 'Feb', revenue: 108000, users: 2450, conversion: 3.5 },
        { month: 'Mar', revenue: 125000, users: 2800, conversion: 3.8 },
        { month: 'Apr', revenue: 142000, users: 3200, conversion: 4.1 },
        { month: 'May', revenue: 158000, users: 3650, conversion: 4.3 },
        { month: 'Jun', revenue: 175000, users: 4100, conversion: 4.5 }
    ];

    const edgeLocationData = [
        { region: 'US East', performance: 95, traffic: 35 },
        { region: 'US West', performance: 92, traffic: 28 },
        { region: 'Europe', performance: 88, traffic: 22 },
        { region: 'Asia Pacific', performance: 85, traffic: 15 }
    ];

    if (isLoading) {
        return (
            <div className="p-8 space-y-4">
                <div className="h-8 bg-gray-200 rounded animate-pulse" />
                <div className="grid grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (!metrics) {
        return (
            <div className="p-8 text-center">
                <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Failed to Load Dashboard</h2>
                <p className="text-gray-600">Unable to retrieve enterprise metrics.</p>
                <Button onClick={loadDashboardMetrics} className="mt-4">
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Enterprise Command Center</h1>
                        <p className="text-gray-600">Phase 5: Global Optimization + AI Automation Excellence</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <select
                            value={selectedTimeRange}
                            onChange={(e) => setSelectedTimeRange(e.target.value)}
                            className="px-3 py-2 border rounded-md bg-white"
                        >
                            <option value="1h">Last Hour</option>
                            <option value="24h">Last 24 Hours</option>
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                        </select>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            All Systems Operational
                        </Badge>
                    </div>
                </div>

                {/* Key Metrics Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Global Performance</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {metrics.global_performance.edge_locations.avg_latency}ms
                                    </p>
                                    <p className="text-xs text-green-600">↓ 32% improvement</p>
                                </div>
                                <Globe className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Automation Score</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {metrics.automation_metrics.code_quality.average_quality_score}%
                                    </p>
                                    <p className="text-xs text-blue-600">↑ 15% this month</p>
                                </div>
                                <Brain className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Revenue Growth</p>
                                    <p className="text-2xl font-bold text-purple-600">
                                        +{metrics.business_intelligence.revenue_growth}%
                                    </p>
                                    <p className="text-xs text-purple-600">MRR: $175K</p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                                    <p className="text-2xl font-bold text-orange-600">
                                        {metrics.real_time_metrics.active_users.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-orange-600">↑ 12% vs yesterday</p>
                                </div>
                                <Users className="h-8 w-8 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Dashboard Content */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-6">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="performance">Performance</TabsTrigger>
                        <TabsTrigger value="automation">Automation</TabsTrigger>
                        <TabsTrigger value="business">Business</TabsTrigger>
                        <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
                        <TabsTrigger value="optimization">Optimization</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Real-time Performance */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Activity className="h-5 w-5 mr-2" />
                                        Real-time Performance
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={performanceData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="time" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="latency" stroke="#8884d8" name="Latency (ms)" />
                                            <Line type="monotone" dataKey="throughput" stroke="#82ca9d" name="Throughput" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Edge Locations Status */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Globe className="h-5 w-5 mr-2" />
                                        Global Edge Performance
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {edgeLocationData.map((location, index) => (
                                            <div key={index} className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                                                    <span className="font-medium">{location.region}</span>
                                                </div>
                                                <div className="flex items-center space-x-4">
                                                    <div className="text-right">
                                                        <p className="text-sm font-medium">{location.performance}%</p>
                                                        <p className="text-xs text-gray-500">{location.traffic}% traffic</p>
                                                    </div>
                                                    <Progress value={location.performance} className="w-20" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* System Health Overview */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Monitor className="h-5 w-5 mr-2" />
                                    System Health Overview
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">99.99%</div>
                                        <div className="text-sm text-gray-600">Uptime</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">{metrics.real_time_metrics.response_time}ms</div>
                                        <div className="text-sm text-gray-600">Avg Response</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-yellow-600">{(metrics.real_time_metrics.error_rate * 100).toFixed(3)}%</div>
                                        <div className="text-sm text-gray-600">Error Rate</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-600">{metrics.real_time_metrics.cpu_usage}%</div>
                                        <div className="text-sm text-gray-600">CPU Usage</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-red-600">{metrics.real_time_metrics.memory_usage}%</div>
                                        <div className="text-sm text-gray-600">Memory Usage</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="performance" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Core Web Vitals Trends</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <AreaChart data={performanceData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="time" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Area type="monotone" dataKey="latency" stackId="1" stroke="#8884d8" fill="#8884d8" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Database Performance</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span>Query Time Improvement</span>
                                            <span className="font-bold text-green-600">+{metrics.global_performance.database.avg_query_improvement}%</span>
                                        </div>
                                        <Progress value={metrics.global_performance.database.avg_query_improvement} />

                                        <div className="flex justify-between items-center">
                                            <span>Throughput Increase</span>
                                            <span className="font-bold text-blue-600">+{metrics.global_performance.database.throughput_increase}%</span>
                                        </div>
                                        <Progress value={metrics.global_performance.database.throughput_increase} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="automation" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Settings className="h-5 w-5 mr-2" />
                                        Code Quality AI
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-blue-600">
                                                {metrics.automation_metrics.code_quality.average_quality_score}%
                                            </div>
                                            <div className="text-sm text-gray-600">Quality Score</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600">
                                                {metrics.automation_metrics.code_quality.issues_auto_fixed}
                                            </div>
                                            <div className="text-sm text-gray-600">Issues Auto-Fixed</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Zap className="h-5 w-5 mr-2" />
                                        Testing Automation
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-green-600">
                                                {metrics.automation_metrics.testing.average_pass_rate}%
                                            </div>
                                            <div className="text-sm text-gray-600">Pass Rate</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-yellow-600">
                                                {metrics.automation_metrics.testing.performance_regressions_detected}
                                            </div>
                                            <div className="text-sm text-gray-600">Regressions Detected</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Rocket className="h-5 w-5 mr-2" />
                                        Deployment Intelligence
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-purple-600">
                                                {metrics.automation_metrics.deployment.success_rate}%
                                            </div>
                                            <div className="text-sm text-gray-600">Success Rate</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-600">
                                                {metrics.automation_metrics.deployment.average_deployment_time}min
                                            </div>
                                            <div className="text-sm text-gray-600">Avg Deploy Time</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="business" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Revenue & Growth Metrics</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={businessMetricsData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="revenue" fill="#8884d8" name="Revenue ($)" />
                                            <Bar dataKey="users" fill="#82ca9d" name="Users" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Business Intelligence Insights</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                            <span className="font-medium">Revenue Growth</span>
                                            <span className="font-bold text-green-600">+{metrics.business_intelligence.revenue_growth}%</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                            <span className="font-medium">User Engagement</span>
                                            <span className="font-bold text-blue-600">+{metrics.business_intelligence.user_engagement_improvement}%</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                                            <span className="font-medium">Conversion Rate</span>
                                            <span className="font-bold text-purple-600">+{metrics.business_intelligence.conversion_rate_improvement}%</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                                            <span className="font-medium">Performance Impact</span>
                                            <span className="font-bold text-orange-600">{metrics.business_intelligence.performance_impact_score}/100</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="anomalies" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <AlertTriangle className="h-5 w-5 mr-2" />
                                    Anomaly Detection & Management
                                </CardTitle>
                                <CardDescription>
                                    AI-powered anomaly detection with automated resolution
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {metrics.anomalies.map((anomaly) => (
                                        <div key={anomaly.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <Badge variant={
                                                    anomaly.severity === 'critical' ? 'destructive' :
                                                        anomaly.severity === 'high' ? 'destructive' :
                                                            anomaly.severity === 'medium' ? 'default' : 'secondary'
                                                }>
                                                    {anomaly.severity}
                                                </Badge>
                                                <div>
                                                    <p className="font-medium">{anomaly.description}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {new Date(anomaly.timestamp).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {anomaly.resolved ? (
                                                    <Badge variant="outline" className="bg-green-50 text-green-700">
                                                        <CheckCircle className="h-3 w-3 mr-1" />
                                                        Resolved
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        Active
                                                    </Badge>
                                                )}
                                                <Button size="sm" variant="outline">View Details</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="optimization" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Global Cache Performance</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span>Global Hit Rate</span>
                                            <span className="font-bold text-green-600">
                                                {(metrics.global_performance.cache_performance.global_hit_rate * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                        <Progress value={metrics.global_performance.cache_performance.global_hit_rate * 100} />

                                        <div className="flex justify-between items-center">
                                            <span>Bandwidth Savings</span>
                                            <span className="font-bold text-blue-600">
                                                {(metrics.global_performance.cache_performance.bandwidth_savings / 1000000).toFixed(1)}MB
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Optimization Recommendations</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="p-3 bg-blue-50 rounded-lg">
                                            <p className="font-medium text-blue-900">Database Index Optimization</p>
                                            <p className="text-sm text-blue-700">Expected 25% query improvement</p>
                                        </div>
                                        <div className="p-3 bg-green-50 rounded-lg">
                                            <p className="font-medium text-green-900">CDN Cache Rules Update</p>
                                            <p className="text-sm text-green-700">Increase hit rate by 5%</p>
                                        </div>
                                        <div className="p-3 bg-purple-50 rounded-lg">
                                            <p className="font-medium text-purple-900">API Response Compression</p>
                                            <p className="text-sm text-purple-700">Reduce bandwidth by 30%</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
