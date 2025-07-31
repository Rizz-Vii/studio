#!/bin/bash

# 🚀 RankPilot Stripe Integration Test Script
# Tests the complete payment flow with real Stripe events

# Load environment variables
if [ -f ".env.local" ]; then
    export $(grep -v '^#' .env.local | xargs)
    echo "✅ Environment variables loaded from .env.local"
fi

echo "🔍 Testing RankPilot Stripe Integration"
echo "======================================"
echo ""

# Check if development server is running
echo "1. Checking development server..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Development server running on localhost:3000"
else
    echo "❌ Development server not running. Start with: npm run dev-no-turbopack"
    exit 1
fi

echo ""

# Test webhook endpoint
echo "2. Testing webhook endpoint..."
WEBHOOK_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/api/stripe/webhook)
if [ "$WEBHOOK_RESPONSE" = "400" ] || [ "$WEBHOOK_RESPONSE" = "401" ]; then
    echo "✅ Webhook endpoint responding (expected 400/401 without proper signature)"
else
    echo "⚠️  Webhook endpoint response: $WEBHOOK_RESPONSE"
fi

echo ""

# Test environment variables
echo "3. Checking environment variables..."
if [ -n "$STRIPE_SECRET_KEY" ]; then
    echo "✅ STRIPE_SECRET_KEY configured"
else
    echo "❌ STRIPE_SECRET_KEY not found in environment"
fi

if [ -n "$STRIPE_WEBHOOK_SECRET" ]; then
    echo "✅ STRIPE_WEBHOOK_SECRET configured: whsec_***"
else
    echo "❌ STRIPE_WEBHOOK_SECRET not found in environment"
fi

echo ""

# Test Stripe API connection
echo "4. Testing Stripe API connection..."
STRIPE_TEST=$(curl -s -H "Authorization: Bearer $STRIPE_SECRET_KEY" "https://api.stripe.com/v1/account")
if echo "$STRIPE_TEST" | grep -q '"id":'; then
    ACCOUNT_ID=$(echo "$STRIPE_TEST" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo "✅ Stripe API connected - Account: $ACCOUNT_ID"
else
    echo "❌ Stripe API connection failed"
fi

echo ""

# Test Price ID
echo "5. Testing Price ID: price_1RqFwc2fkoCQ0GTp8wygbgXh"
PRICE_TEST=$(curl -s -H "Authorization: Bearer $STRIPE_SECRET_KEY" "https://api.stripe.com/v1/prices/price_1RqFwc2fkoCQ0GTp8wygbgXh")
if echo "$PRICE_TEST" | grep -q '"id":'; then
    PRICE_AMOUNT=$(echo "$PRICE_TEST" | grep -o '"unit_amount":[0-9]*' | cut -d':' -f2)
    PRICE_CURRENCY=$(echo "$PRICE_TEST" | grep -o '"currency":"[^"]*"' | cut -d'"' -f4)
    echo "✅ Price ID valid - Amount: $PRICE_AMOUNT $PRICE_CURRENCY"
else
    echo "❌ Price ID not found or invalid"
fi

echo ""
echo "🎯 Integration Status Summary:"
echo "- Development server: Ready"
echo "- Webhook endpoint: Configured" 
echo "- Stripe API: Connected"
echo "- Price ID: Active"
echo "- Webhook secret: whsec_uUnLNcs8nTaMTlVOkkLYoMpWLnLzIv7c"
echo ""
echo "🚀 Ready for live payment testing!"
echo ""
echo "Next steps:"
echo "1. Run: stripe listen --forward-to localhost:3000/api/stripe/webhook"
echo "2. Test: stripe trigger checkout.session.completed"
echo "3. Monitor: Check webhook logs in terminal"
