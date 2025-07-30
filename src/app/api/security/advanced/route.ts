/**
 * Advanced Security API Route
 * DevNext Part III Step 3: Advanced Security Hardening
 * 
 * Provides enterprise-grade security monitoring and management endpoints:
 * - Real-time threat detection and analysis
 * - Security incident management
 * - Compliance monitoring and reporting
 * - Zero-trust session management
 * - SOC automation and orchestration
 */

import { AdvancedSecurityFramework } from '@/lib/security/advanced-security-framework';
import { ComplianceAutomationEngine } from '@/lib/security/compliance-automation-engine';
import { SecurityOperationsCenter } from '@/lib/security/security-operations-center';
import { ZeroTrustOrchestrator } from '@/lib/security/zero-trust-orchestrator';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Initialize security components
const securityFramework = new AdvancedSecurityFramework();
const zeroTrustOrchestrator = new ZeroTrustOrchestrator();
const complianceEngine = new ComplianceAutomationEngine();
const securityOpsCenter = new SecurityOperationsCenter();

export async function POST(request: NextRequest) {
    try {
        const headersList = await headers();
        const userAgent = headersList.get('user-agent') || '';
        const clientIP = headersList.get('x-forwarded-for') ||
            headersList.get('x-real-ip') ||
            '127.0.0.1';

        const body = await request.json();
        const { action, ...params } = body;

        // Validate request against security framework
        const securityValidation = await securityFramework.validateRequest({
            ip: clientIP,
            method: request.method,
            url: request.url,
            headers: Object.fromEntries(headersList.entries()),
            body: params,
            userId: params.userId
        });

        if (!securityValidation.allowed) {
            return NextResponse.json(
                {
                    error: 'Security validation failed',
                    reason: securityValidation.blockReason,
                    threats: securityValidation.threats.map(t => ({
                        type: t.type,
                        severity: t.severity
                    }))
                },
                { status: 403 }
            );
        }

        // Route to appropriate security service
        switch (action) {
            case 'create-session':
                return await handleCreateSession(params, clientIP, userAgent);

            case 'validate-access':
                return await handleValidateAccess(params);

            case 'process-alert':
                return await handleProcessAlert(params);

            case 'create-incident':
                return await handleCreateIncident(params);

            case 'assess-compliance':
                return await handleAssessCompliance(params);

            case 'generate-compliance-report':
                return await handleGenerateComplianceReport(params);

            case 'get-security-metrics':
                return await handleGetSecurityMetrics();

            case 'execute-playbook':
                return await handleExecutePlaybook(params);

            case 'encrypt-data':
                return await handleEncryptData(params);

            case 'decrypt-data':
                return await handleDecryptData(params);

            default:
                return NextResponse.json(
                    { error: 'Invalid action' },
                    { status: 400 }
                );
        }

    } catch (error) {
        console.error('[SecurityAPI] Request failed:', error);
        return NextResponse.json(
            { error: 'Internal security error' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');

        switch (action) {
            case 'metrics':
                return await handleGetSecurityMetrics();

            case 'compliance-status':
                const frameworks = searchParams.get('frameworks')?.split(',') || [];
                return await handleGetComplianceStatus(frameworks);

            case 'incidents':
                const status = searchParams.get('status') || undefined;
                const severity = searchParams.get('severity') || undefined;
                return await handleGetIncidents({ status, severity });

            case 'alerts':
                const timeRange = searchParams.get('timeRange') || '24h';
                return await handleGetAlerts({ timeRange });

            default:
                return NextResponse.json(
                    { error: 'Invalid action' },
                    { status: 400 }
                );
        }

    } catch (error) {
        console.error('[SecurityAPI] GET request failed:', error);
        return NextResponse.json(
            { error: 'Internal security error' },
            { status: 500 }
        );
    }
}

// Handler functions
async function handleCreateSession(params: any, clientIP: string, userAgent: string) {
    try {
        const session = await zeroTrustOrchestrator.createSession({
            userId: params.userId,
            ipAddress: clientIP,
            userAgent,
            deviceFingerprint: params.deviceFingerprint,
            authenticationFactors: params.authenticationFactors || ['password']
        });

        return NextResponse.json({
            success: true,
            session: {
                id: session.id,
                trustLevel: session.trustLevel,
                riskScore: session.riskScore,
                permissions: session.permissions,
                restrictions: session.restrictions
            }
        });

    } catch (error) {
        console.error('[SecurityAPI] Session creation failed:', error);
        return NextResponse.json(
            { error: 'Failed to create security session' },
            { status: 500 }
        );
    }
}

async function handleValidateAccess(params: any) {
    try {
        const validation = await zeroTrustOrchestrator.validateAccess(
            params.sessionId,
            {
                resource: params.resource,
                action: params.action,
                context: params.context
            }
        );

        return NextResponse.json({
            success: true,
            validation
        });

    } catch (error) {
        console.error('[SecurityAPI] Access validation failed:', error);
        return NextResponse.json(
            { error: 'Failed to validate access' },
            { status: 500 }
        );
    }
}

async function handleProcessAlert(params: any) {
    try {
        const alert = await securityOpsCenter.processAlert({
            rule: params.rule,
            severity: params.severity,
            source: params.source,
            event: params.event,
            rawData: params.rawData
        });

        return NextResponse.json({
            success: true,
            alert: {
                id: alert.id,
                severity: alert.severity,
                status: alert.disposition.status
            }
        });

    } catch (error) {
        console.error('[SecurityAPI] Alert processing failed:', error);
        return NextResponse.json(
            { error: 'Failed to process security alert' },
            { status: 500 }
        );
    }
}

async function handleCreateIncident(params: any) {
    try {
        const incident = await securityOpsCenter.createIncident({
            title: params.title,
            description: params.description,
            severity: params.severity,
            category: params.category,
            source: params.source,
            indicators: params.indicators,
            impact: params.impact,
            alertIds: params.alertIds
        });

        return NextResponse.json({
            success: true,
            incident: {
                id: incident.id,
                title: incident.title,
                severity: incident.severity,
                status: incident.status
            }
        });

    } catch (error) {
        console.error('[SecurityAPI] Incident creation failed:', error);
        return NextResponse.json(
            { error: 'Failed to create security incident' },
            { status: 500 }
        );
    }
}

async function handleAssessCompliance(params: any) {
    try {
        const assessment = await complianceEngine.assessCompliance({
            frameworks: params.frameworks,
            fullAssessment: params.fullAssessment,
            generateReport: params.generateReport
        });

        return NextResponse.json({
            success: true,
            assessment
        });

    } catch (error) {
        console.error('[SecurityAPI] Compliance assessment failed:', error);
        return NextResponse.json(
            { error: 'Failed to assess compliance' },
            { status: 500 }
        );
    }
}

async function handleGenerateComplianceReport(params: any) {
    try {
        const report = await complianceEngine.generateComplianceReport(
            params.frameworks,
            {
                start: params.startDate || Date.now() - (30 * 24 * 60 * 60 * 1000),
                end: params.endDate || Date.now()
            }
        );

        return NextResponse.json({
            success: true,
            report
        });

    } catch (error) {
        console.error('[SecurityAPI] Report generation failed:', error);
        return NextResponse.json(
            { error: 'Failed to generate compliance report' },
            { status: 500 }
        );
    }
}

async function handleGetSecurityMetrics() {
    try {
        const securityMetrics = securityFramework.getSecurityMetrics();
        const zeroTrustMetrics = zeroTrustOrchestrator.getSecurityMetrics();
        const complianceMetrics = complianceEngine.getComplianceMetrics();
        const socMetrics = securityOpsCenter.getSOCMetrics();

        return NextResponse.json({
            success: true,
            metrics: {
                security: securityMetrics,
                zeroTrust: zeroTrustMetrics,
                compliance: complianceMetrics,
                soc: socMetrics,
                timestamp: Date.now()
            }
        });

    } catch (error) {
        console.error('[SecurityAPI] Metrics retrieval failed:', error);
        return NextResponse.json(
            { error: 'Failed to retrieve security metrics' },
            { status: 500 }
        );
    }
}

async function handleExecutePlaybook(params: any) {
    try {
        const execution = await securityOpsCenter.executePlaybook(
            params.playbookId,
            {
                incidentId: params.incidentId,
                alertId: params.alertId,
                parameters: params.parameters,
                executor: params.executor
            }
        );

        return NextResponse.json({
            success: true,
            execution
        });

    } catch (error) {
        console.error('[SecurityAPI] Playbook execution failed:', error);
        return NextResponse.json(
            { error: 'Failed to execute security playbook' },
            { status: 500 }
        );
    }
}

async function handleEncryptData(params: any) {
    try {
        const encryptedData = await securityFramework.encryptData(
            params.data,
            params.keyId
        );

        return NextResponse.json({
            success: true,
            encryptedData
        });

    } catch (error) {
        console.error('[SecurityAPI] Data encryption failed:', error);
        return NextResponse.json(
            { error: 'Failed to encrypt data' },
            { status: 500 }
        );
    }
}

async function handleDecryptData(params: any) {
    try {
        const decryptedData = await securityFramework.decryptData(
            params.encryptedData,
            params.keyId
        );

        return NextResponse.json({
            success: true,
            decryptedData
        });

    } catch (error) {
        console.error('[SecurityAPI] Data decryption failed:', error);
        return NextResponse.json(
            { error: 'Failed to decrypt data' },
            { status: 500 }
        );
    }
}

async function handleGetComplianceStatus(frameworks: string[]) {
    try {
        const metrics = complianceEngine.getComplianceMetrics();

        const status = {
            overallScore: metrics.overallScore,
            frameworkScores: metrics.frameworkScores,
            requirementStatus: metrics.requirementStatus,
            findingsSummary: metrics.findingsSummary,
            timestamp: Date.now()
        };

        return NextResponse.json({
            success: true,
            status
        });

    } catch (error) {
        console.error('[SecurityAPI] Compliance status retrieval failed:', error);
        return NextResponse.json(
            { error: 'Failed to retrieve compliance status' },
            { status: 500 }
        );
    }
}

async function handleGetIncidents(filters: { status?: string; severity?: string; }) {
    try {
        const socMetrics = securityOpsCenter.getSOCMetrics();

        // In a real implementation, this would filter and return actual incidents
        const incidents = {
            total: socMetrics.incidents.total,
            open: socMetrics.incidents.open,
            closed: socMetrics.incidents.closed,
            bySeverity: socMetrics.incidents.bySeverity,
            byCategory: socMetrics.incidents.byCategory,
            averageResolutionTime: socMetrics.incidents.averageResolutionTime
        };

        return NextResponse.json({
            success: true,
            incidents,
            filters
        });

    } catch (error) {
        console.error('[SecurityAPI] Incidents retrieval failed:', error);
        return NextResponse.json(
            { error: 'Failed to retrieve security incidents' },
            { status: 500 }
        );
    }
}

async function handleGetAlerts(filters: { timeRange: string; }) {
    try {
        const socMetrics = securityOpsCenter.getSOCMetrics();

        // In a real implementation, this would filter and return actual alerts
        const alerts = {
            total: socMetrics.alerts.total,
            processed: socMetrics.alerts.processed,
            falsePositives: socMetrics.alerts.falsePositives,
            escalated: socMetrics.alerts.escalated,
            averageProcessingTime: socMetrics.alerts.averageProcessingTime
        };

        return NextResponse.json({
            success: true,
            alerts,
            filters
        });

    } catch (error) {
        console.error('[SecurityAPI] Alerts retrieval failed:', error);
        return NextResponse.json(
            { error: 'Failed to retrieve security alerts' },
            { status: 500 }
        );
    }
}
