/**
 * MCP NeuroSEO Enhanced Analysis API Route
 * /api/mcp/neuroseo/enhanced
 */

import { neuroSEOMCPOrchestrator } from '@/lib/neuroseo/mcp-enhanced';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { url, content, keywords, competitorUrls } = await request.json();

        if (!url || !content || !keywords?.length) {
            return NextResponse.json({
                success: false,
                error: 'URL, content, and keywords are required',
                message: 'Please provide all required parameters',
            }, { status: 400 });
        }

        const result = await neuroSEOMCPOrchestrator.runMCPEnhancedAnalysis({
            url,
            content,
            keywords,
            competitorUrls,
        });

        return NextResponse.json({
            success: true,
            data: result,
            message: 'MCP-enhanced NeuroSEO™ analysis completed successfully',
            metadata: {
                enhancementFlags: result.enhancementFlags,
                combinedScore: result.combinedScore,
                timestamp: new Date().toISOString(),
            },
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            message: 'Enhanced NeuroSEO™ analysis failed',
        }, { status: 500 });
    }
}
