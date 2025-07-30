// 🚀 RankPilot API Route - Stripe Checkout
// File: src/app/api/stripe/checkout/route.ts

import { auth } from '@/lib/firebase/auth';
import { createCheckoutSession, RANKPILOT_TIERS } from '@/lib/stripe/subscription-management';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { tier, successUrl, cancelUrl } = await request.json();

        // Get authenticated user
        const user = await auth.currentUser;
        if (!user) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        // Validate tier
        if (!tier || !(tier in RANKPILOT_TIERS)) {
            return NextResponse.json({ error: 'Invalid subscription tier' }, { status: 400 });
        }

        // Free tier doesn't need Stripe
        if (tier === 'free') {
            return NextResponse.json({ error: 'Free tier does not require payment' }, { status: 400 });
        }

        // Create checkout session
        const session = await createCheckoutSession(
            user.uid,
            tier,
            user.email!,
            successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
            cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/pricing`
        );

        return NextResponse.json({
            sessionId: session.id,
            url: session.url
        });

    } catch (error) {
        console.error('Stripe checkout error:', error);
        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}

// Handle successful checkout
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('session_id');

        if (!sessionId) {
            return NextResponse.json({ error: 'Missing session ID' }, { status: 400 });
        }

        const result = await handleSubscriptionSuccess(sessionId);

        // Here you would typically:
        // 1. Update user's tier in Firestore
        // 2. Send welcome email
        // 3. Log the subscription event

        return NextResponse.json(result);

    } catch (error) {
        console.error('Checkout success handling error:', error);
        return NextResponse.json(
            { error: 'Failed to process successful checkout' },
            { status: 500 }
        );
    }
}
