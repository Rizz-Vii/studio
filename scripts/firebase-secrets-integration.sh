#!/bin/bash

# 🚀 RankPilot Firebase Secrets Integration Script
# Generated: January 27, 2025
# Purpose: Integrate with Firebase secrets for production API keys management

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔐 RankPilot Firebase Secrets Integration${NC}"
echo -e "${BLUE}=======================================${NC}"
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Firebase CLI not found. Please install it first:${NC}"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Firebase. Please login first:${NC}"
    echo "firebase login"
    exit 1
fi

echo -e "${GREEN}✅ Firebase CLI ready${NC}"
echo ""

# Set Firebase project (adjust as needed)
FIREBASE_PROJECT="rankpilot-h3jpc"
echo -e "${BLUE}Using Firebase project: $FIREBASE_PROJECT${NC}"

# List current secrets
echo ""
echo -e "${BLUE}📋 Current Firebase Secrets:${NC}"
firebase functions:secrets:access --project=$FIREBASE_PROJECT 2>/dev/null || echo "No secrets found or access denied"

echo ""
echo -e "${BLUE}🔧 Setting up production API keys in Firebase secrets...${NC}"

# Function to set secret securely
set_firebase_secret() {
    local secret_name=$1
    local secret_value=$2
    local description=$3
    
    echo -e "${YELLOW}Setting secret: $secret_name${NC}"
    echo "$secret_value" | firebase functions:secrets:set $secret_name --project=$FIREBASE_PROJECT --data-file=-
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Secret $secret_name set successfully${NC}"
    else
        echo -e "${RED}❌ Failed to set secret $secret_name${NC}"
    fi
}

# Production API Keys - Replace with actual production values
echo ""
echo -e "${YELLOW}⚠️  PRODUCTION SETUP REQUIRED:${NC}"
echo "Please replace these test values with actual production keys:"
echo ""

# Stripe Production Keys
set_firebase_secret "STRIPE_SECRET_KEY_PROD" "sk_live_your_production_key_here" "Stripe live secret key"
set_firebase_secret "STRIPE_PUBLISHABLE_KEY_PROD" "pk_live_your_production_key_here" "Stripe live publishable key"
set_firebase_secret "STRIPE_WEBHOOK_SECRET_PROD" "whsec_your_production_webhook_secret" "Stripe webhook endpoint secret"

# HuggingFace Production Key
set_firebase_secret "HUGGINGFACE_TOKEN_PROD" "hf_your_production_token_here" "HuggingFace production API token"

# Sentry Production Keys
set_firebase_secret "SENTRY_AUTH_TOKEN_PROD" "sntryu_your_production_token_here" "Sentry production auth token"
set_firebase_secret "SENTRY_DSN_PROD" "https://your_production_dsn@sentry.io/your_project" "Sentry production DSN"

# Firecrawl Production Key
set_firebase_secret "FIRECRAWL_API_KEY_PROD" "fc-your_production_key_here" "Firecrawl production API key"

# OpenAI Production Key
set_firebase_secret "OPENAI_API_KEY_PROD" "sk-your_production_openai_key_here" "OpenAI production API key"

echo ""
echo -e "${BLUE}📋 Updated Firebase Secrets List:${NC}"
firebase functions:secrets:access --project=$FIREBASE_PROJECT

echo ""
echo -e "${GREEN}✅ Firebase secrets integration complete!${NC}"
echo ""
echo -e "${BLUE}🚀 Next Steps:${NC}"
echo "1. Update Cloud Functions to use secrets:"
echo "   functions.config().stripe.secret_key → secrets.STRIPE_SECRET_KEY_PROD"
echo "2. Deploy functions: firebase deploy --only functions"
echo "3. Test production configuration"
echo ""
echo -e "${YELLOW}⚠️  Security Notes:${NC}"
echo "- Secrets are encrypted at rest in Firebase"
echo "- Access is limited to deployed functions"
echo "- Never log secret values in functions"
echo "- Rotate secrets regularly"

# Generate Cloud Functions integration example
cat > /tmp/firebase-secrets-example.js << 'EOF'
// 🔐 Firebase Cloud Functions Secrets Integration Example
// Use this pattern in your Cloud Functions

const { defineSecret } = require('firebase-functions/params');

// Define secrets
const stripeSecretKey = defineSecret('STRIPE_SECRET_KEY_PROD');
const huggingfaceToken = defineSecret('HUGGINGFACE_TOKEN_PROD');
const sentryAuthToken = defineSecret('SENTRY_AUTH_TOKEN_PROD');

// Use in functions
exports.processPayment = functions
  .runWith({ secrets: [stripeSecretKey] })
  .https.onCall(async (data, context) => {
    const stripe = require('stripe')(stripeSecretKey.value());
    // Your function logic here
  });

exports.aiAnalysis = functions
  .runWith({ secrets: [huggingfaceToken] })
  .https.onCall(async (data, context) => {
    const token = huggingfaceToken.value();
    // Your AI logic here
  });
EOF

echo ""
echo -e "${BLUE}📄 Generated Cloud Functions integration example:${NC}"
echo "/tmp/firebase-secrets-example.js"
echo ""
echo -e "${GREEN}Integration complete! 🎉${NC}"
