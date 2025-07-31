import { functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { NextRequest, NextResponse } from 'next/server';

const createCheckoutSession = httpsCallable(functions, 'createCheckoutSession');

export async function POST(request: NextRequest) {
    try {
        const { tier, billingInterval, successUrl, cancelUrl } = await request.json();

        // Validate required fields
        if (!tier) {
            return NextResponse.json({ error: 'Subscription tier is required' }, { status: 400 });
        }

        // Free tier doesn't need Stripe
        if (tier === 'free') {
            return NextResponse.json({ error: 'Free tier does not require payment' }, { status: 400 });
        }

        // Validate tier
        const validTiers = ['starter', 'agency', 'enterprise'];
        if (!validTiers.includes(tier)) {
            return NextResponse.json({ error: 'Invalid subscription tier' }, { status: 400 });
        }

        // Create checkout session via Firebase Function
        const result = await createCheckoutSession({
            planId: tier,
            billingInterval: billingInterval || 'monthly',
            successUrl: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
            cancelUrl: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
        });

        const { sessionId } = result.data as { sessionId: string; };

        return NextResponse.json({
            sessionId,
            url: `https://checkout.stripe.com/pay/${sessionId}`,
        });

    } catch (error: any) {
        console.error('❌ Stripe checkout error:', error);

        // Handle Firebase Function errors
        if (error.code === 'unauthenticated') {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        return NextResponse.json(
            { error: error.message || 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}

// Handle checkout session retrieval
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('session_id');

        if (!sessionId) {
            return NextResponse.json({ error: 'Missing session ID' }, { status: 400 });
        }

        // TODO: Retrieve session details from Stripe
        // const session = await stripe.checkout.sessions.retrieve(sessionId);

        return NextResponse.json({
            sessionId,
            status: 'success',
            message: 'Checkout completed successfully',
        });

    } catch (error: any) {
        console.error('❌ Checkout retrieval error:', error);
        return NextResponse.json(
            { error: 'Failed to retrieve checkout session' },
            { status: 500 }
        );
    }
}
