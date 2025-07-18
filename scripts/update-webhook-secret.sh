#!/bin/bash
# Update webhook secret after creating webhook in Stripe Dashboard
# Usage: ./update-webhook-secret.sh "whsec_your_actual_secret_here"

if [ $# -eq 0 ]; then
    echo "❌ Error: Please provide the webhook secret as an argument"
    echo "Usage: ./update-webhook-secret.sh \"whsec_your_actual_secret_here\""
    exit 1
fi

WEBHOOK_SECRET="$1"

if [[ "$WEBHOOK_SECRET" == "WEBHOOK_SECRET_HERE" ]] || [[ -z "$WEBHOOK_SECRET" ]]; then
    echo "❌ Error: Please provide the actual webhook secret from Stripe Dashboard"
    echo "Usage: ./update-webhook-secret.sh \"whsec_your_actual_secret_here\""
    exit 1
fi

if [[ ! "$WEBHOOK_SECRET" =~ ^whsec_ ]]; then
    echo "⚠️  Warning: Webhook secret should start with 'whsec_'"
    read -p "Continue anyway? (y/N): " confirm
    if [[ "$confirm" != "y" ]] && [[ "$confirm" != "Y" ]]; then
        exit 1
    fi
fi

echo "🔧 Updating Firebase Secret..."
echo "$WEBHOOK_SECRET" | firebase functions:secrets:set STRIPE_WEBHOOK_SECRET --project rankpilot-h3jpc

echo "🔧 Updating Firebase Functions Config..."
firebase functions:config:set stripe.webhook_secret="$WEBHOOK_SECRET" --project rankpilot-h3jpc

echo "🔧 Updating local .env.local file..."
if [ -f ".env.local" ]; then
    # Update existing STRIPE_WEBHOOK_SECRET or add it
    if grep -q "^STRIPE_WEBHOOK_SECRET=" .env.local; then
        sed -i "s/^STRIPE_WEBHOOK_SECRET=.*/STRIPE_WEBHOOK_SECRET=$WEBHOOK_SECRET/" .env.local
    else
        echo "STRIPE_WEBHOOK_SECRET=$WEBHOOK_SECRET" >> .env.local
    fi
    echo "✅ Updated .env.local with webhook secret"
else
    echo "⚠️  .env.local file not found"
fi

echo ""
echo "✅ Webhook secret updated successfully!"
echo "📝 Next steps:"
echo "   1. Deploy functions: firebase deploy --only functions"
echo "   2. Test webhook: Create a test payment in Stripe Dashboard"
echo "   3. Check Firebase Functions logs for webhook events"
