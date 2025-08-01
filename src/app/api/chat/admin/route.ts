/**
 * RankPilot Admin Chatbot API Route
 * Proxies requests to Firebase Functions with admin authentication
 */

import { functions } from '@/lib/firebase';
import type { ChatResponse } from '@/types/chatbot';
import { httpsCallable } from 'firebase/functions';
import { NextRequest, NextResponse } from 'next/server';

// Types
interface AdminChatRequest {
    message: string;
    sessionId?: string;
}

export async function POST(request: NextRequest) {
    try {
        // Parse request body
        const body: AdminChatRequest = await request.json();
        const { message, sessionId } = body;

        // Validate input
        if (!message?.trim()) {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        // Get user from authentication middleware
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const token = authHeader.split(' ')[1];

        // Call Firebase Function
        const adminChatHandler = httpsCallable<any, ChatResponse>(functions, 'adminChatHandler');

        const result = await adminChatHandler({
            uid: token, // In production, decode JWT to get actual UID
            message,
            sessionId,
            chatType: 'admin'
        });

        return NextResponse.json(result.data);

    } catch (error) {
        console.error('Admin chat API error:', error);

        // Handle Firebase Function errors
        if (error && typeof error === 'object' && 'code' in error) {
            const firebaseError = error as any;

            switch (firebaseError.code) {
                case 'unauthenticated':
                    return NextResponse.json(
                        { error: 'Authentication required' },
                        { status: 401 }
                    );
                case 'permission-denied':
                    return NextResponse.json(
                        { error: 'Admin access required' },
                        { status: 403 }
                    );
                case 'invalid-argument':
                    return NextResponse.json(
                        { error: 'Invalid request data' },
                        { status: 400 }
                    );
                default:
                    return NextResponse.json(
                        { error: 'Admin chat service unavailable' },
                        { status: 503 }
                    );
            }
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// GET endpoint for admin chat history
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('sessionId');
        const limit = parseInt(searchParams.get('limit') || '20');

        // Get user from authentication
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const token = authHeader.split(' ')[1];

        // In production, implement proper admin chat history retrieval
        // For now, return empty history
        return NextResponse.json({
            messages: [],
            sessionId: sessionId || `admin_session_${Date.now()}`,
            hasMore: false
        });

    } catch (error) {
        console.error('Admin chat history API error:', error);
        return NextResponse.json(
            { error: 'Failed to retrieve admin chat history' },
            { status: 500 }
        );
    }
}
