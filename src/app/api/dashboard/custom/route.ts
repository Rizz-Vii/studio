/**
 * Custom Dashboard Builder API Route
 * Handles enterprise dashboard creation, management, and sharing
 */

import { customDashboardBuilder } from '@/lib/dashboard/custom-dashboard-builder';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
    const projectId = process.env.FIREBASE_PROJECT_ID || 'rankpilot-h3jpc';

    try {
        initializeApp({
            projectId,
            // For production, you'd use service account credentials
            // credential: cert({...})
        });
    } catch (error) {
        console.error('[DashboardAPI] Firebase Admin initialization error:', error);
    }
}

interface DashboardRequestBody {
    action: 'create' | 'update' | 'delete' | 'export' | 'share' | 'duplicate';
    dashboardId?: string;
    name?: string;
    templateId?: string;
    widgetConfig?: any;
    position?: { x: number; y: number; width: number; height: number; };
    updates?: any;
    exportFormat?: 'pdf' | 'excel' | 'json';
    exportOptions?: any;
    collaborators?: Array<{ userId: string; role: 'viewer' | 'editor'; }>;
    isPublic?: boolean;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as DashboardRequestBody;
        const authHeader = request.headers.get('authorization');

        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Unauthorized - Missing token' },
                { status: 401 }
            );
        }

        const token = authHeader.split('Bearer ')[1];
        let user;

        try {
            user = await getAuth().verifyIdToken(token);
        } catch (error) {
            console.error('[DashboardAPI] Token verification failed:', error);
            return NextResponse.json(
                { error: 'Unauthorized - Invalid token' },
                { status: 401 }
            );
        }

        // Get user's subscription tier from Firebase
        const userTier = user.customClaims?.subscriptionTier || 'free';

        // Validate tier access for enterprise features
        if (!['agency', 'enterprise', 'admin'].includes(userTier)) {
            return NextResponse.json(
                { error: 'Upgrade required - Custom dashboards available for Agency tier and above' },
                { status: 403 }
            );
        }

        switch (body.action) {
            case 'create':
                if (!body.name) {
                    return NextResponse.json(
                        { error: 'Dashboard name is required' },
                        { status: 400 }
                    );
                }

                const newDashboard = await customDashboardBuilder.createDashboard(
                    body.name,
                    user.uid,
                    userTier,
                    body.templateId
                );

                return NextResponse.json({
                    success: true,
                    dashboard: newDashboard,
                    message: 'Dashboard created successfully'
                });

            case 'update':
                if (!body.dashboardId) {
                    return NextResponse.json(
                        { error: 'Dashboard ID is required' },
                        { status: 400 }
                    );
                }

                if (body.widgetConfig && body.position) {
                    // Adding new widget
                    const widget = await customDashboardBuilder.addWidget(
                        body.dashboardId,
                        body.widgetConfig,
                        body.position
                    );

                    return NextResponse.json({
                        success: true,
                        widget,
                        message: 'Widget added successfully'
                    });
                } else if (body.updates) {
                    // Updating existing widget or dashboard
                    const result = await customDashboardBuilder.updateWidget(
                        body.dashboardId,
                        body.updates.widgetId,
                        body.updates
                    );

                    return NextResponse.json({
                        success: true,
                        widget: result,
                        message: 'Widget updated successfully'
                    });
                }

                return NextResponse.json(
                    { error: 'Invalid update request' },
                    { status: 400 }
                );

            case 'delete':
                if (!body.dashboardId) {
                    return NextResponse.json(
                        { error: 'Dashboard ID is required' },
                        { status: 400 }
                    );
                }

                // For widget deletion, we'd need a widgetId in the body
                if (body.updates?.widgetId) {
                    const removed = await customDashboardBuilder.removeWidget(
                        body.dashboardId,
                        body.updates.widgetId
                    );

                    return NextResponse.json({
                        success: removed,
                        message: removed ? 'Widget removed successfully' : 'Widget not found'
                    });
                }

                return NextResponse.json(
                    { error: 'Widget ID is required for deletion' },
                    { status: 400 }
                );

            case 'export':
                if (!body.dashboardId || !body.exportFormat) {
                    return NextResponse.json(
                        { error: 'Dashboard ID and export format are required' },
                        { status: 400 }
                    );
                }

                const exportResult = await customDashboardBuilder.exportDashboard(
                    body.dashboardId,
                    body.exportFormat,
                    body.exportOptions
                );

                return NextResponse.json({
                    success: exportResult.success,
                    downloadUrl: exportResult.downloadUrl,
                    error: exportResult.error,
                    message: exportResult.success ? 'Export completed successfully' : 'Export failed'
                });

            case 'share':
                if (!body.dashboardId || !body.collaborators) {
                    return NextResponse.json(
                        { error: 'Dashboard ID and collaborators are required' },
                        { status: 400 }
                    );
                }

                const shareResult = await customDashboardBuilder.shareDashboard(
                    body.dashboardId,
                    body.collaborators,
                    body.isPublic || false
                );

                return NextResponse.json({
                    success: true,
                    shareId: shareResult.shareId,
                    shareUrl: shareResult.shareUrl,
                    message: 'Dashboard shared successfully'
                });

            case 'duplicate':
                if (!body.dashboardId || !body.name) {
                    return NextResponse.json(
                        { error: 'Dashboard ID and new name are required' },
                        { status: 400 }
                    );
                }

                const duplicatedDashboard = await customDashboardBuilder.duplicateDashboard(
                    body.dashboardId,
                    body.name,
                    user.uid
                );

                return NextResponse.json({
                    success: true,
                    dashboard: duplicatedDashboard,
                    message: 'Dashboard duplicated successfully'
                });

            default:
                return NextResponse.json(
                    { error: 'Invalid action' },
                    { status: 400 }
                );
        }

    } catch (error) {
        console.error('[DashboardAPI] Error:', error);
        return NextResponse.json(
            {
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const action = url.searchParams.get('action');
        const authHeader = request.headers.get('authorization');

        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Unauthorized - Missing token' },
                { status: 401 }
            );
        }

        const token = authHeader.split('Bearer ')[1];
        let user;

        try {
            user = await getAuth().verifyIdToken(token);
        } catch (error) {
            console.error('[DashboardAPI] Token verification failed:', error);
            return NextResponse.json(
                { error: 'Unauthorized - Invalid token' },
                { status: 401 }
            );
        }

        const userTier = user.customClaims?.subscriptionTier || 'free';

        switch (action) {
            case 'templates':
                const templates = customDashboardBuilder.getTemplates(userTier);
                return NextResponse.json({
                    success: true,
                    templates,
                    userTier
                });

            case 'dashboards':
                const dashboards = customDashboardBuilder.getUserDashboards(user.uid);
                return NextResponse.json({
                    success: true,
                    dashboards,
                    count: dashboards.length
                });

            case 'widget-data':
                const dashboardId = url.searchParams.get('dashboardId');
                const widgetId = url.searchParams.get('widgetId');

                if (!dashboardId || !widgetId) {
                    return NextResponse.json(
                        { error: 'Dashboard ID and Widget ID are required' },
                        { status: 400 }
                    );
                }

                // Get dashboard and find widget
                const userDashboards = customDashboardBuilder.getUserDashboards(user.uid);
                const dashboard = userDashboards.find(d => d.id === dashboardId);

                if (!dashboard) {
                    return NextResponse.json(
                        { error: 'Dashboard not found' },
                        { status: 404 }
                    );
                }

                const widget = dashboard.widgets.find(w => w.id === widgetId);
                if (!widget) {
                    return NextResponse.json(
                        { error: 'Widget not found' },
                        { status: 404 }
                    );
                }

                const widgetData = await customDashboardBuilder.getWidgetData(widgetId, widget);
                return NextResponse.json({
                    success: true,
                    data: widgetData
                });

            default:
                return NextResponse.json(
                    { error: 'Invalid action' },
                    { status: 400 }
                );
        }

    } catch (error) {
        console.error('[DashboardAPI] GET Error:', error);
        return NextResponse.json(
            {
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
