// 🚀 RankPilot Stripe Webhook Handler
// File: src/app/api/stripe/webhook/route.ts

import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-06-30.basil',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                console.log('🎉 Checkout completed:', session.id);

                // Update user subscription in Firestore
                await updateUserSubscription(session);
                break;
            }

            case 'customer.subscription.created': {
                const subscription = event.data.object as Stripe.Subscription;
                console.log('📝 Subscription created:', subscription.id);
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                console.log('🔄 Subscription updated:', subscription.id);

                // Handle tier changes, trial endings, etc.
                await handleSubscriptionUpdate(subscription);
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                console.log('❌ Subscription cancelled:', subscription.id);

                // Downgrade user to free tier
                await downgradeToFreeTier(subscription);
                break;
            }

            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as Stripe.Invoice;
                console.log('💰 Payment succeeded:', invoice.id);
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice;
                console.log('💥 Payment failed:', invoice.id);

                // Handle failed payments - send notifications
                await handleFailedPayment(invoice);
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });

    } catch (error) {
        console.error('Webhook handler error:', error);
        return NextResponse.json(
            { error: 'Webhook handler failed' },
            { status: 500 }
        );
    }
}

async function updateUserSubscription(session: Stripe.Checkout.Session) {
    // Import your Firestore functions here
    // Update user document with new subscription details
    const userId = session.client_reference_id;
    const tier = session.metadata?.tier;

    console.log(`Updating user ${userId} to ${tier} tier`);

    // Example Firestore update:
    // await updateDoc(doc(db, 'users', userId), {
    //   subscriptionTier: tier,
    //   stripeCustomerId: session.customer,
    //   subscriptionId: session.subscription,
    //   updatedAt: new Date()
    // });
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
    // Handle subscription changes
    const userId = subscription.metadata.userId;
    const newTier = subscription.metadata.tier;

    console.log(`User ${userId} subscription updated to ${newTier}`);
}

async function downgradeToFreeTier(subscription: Stripe.Subscription) {
    // Downgrade user to free tier
    const userId = subscription.metadata.userId;

    console.log(`Downgrading user ${userId} to free tier`);

    // Update Firestore to free tier
}

async function handleFailedPayment(invoice: Stripe.Invoice) {
    // Send email notification about failed payment
    console.log(`Payment failed for customer: ${invoice.customer}`);

    // You would send an email here
}
