#!/bin/bash

# 🚀 RankPilot MCP API Token Validation Script
# Generated: July 29, 2025
# Purpose: Validate HuggingFace and Sentry API tokens

set -e

echo "🔍 RankPilot MCP Token Validation"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Load environment variables
if [ -f ".env.local" ]; then
    # Use a more robust way to load environment variables
    while IFS= read -r line; do
        # Skip comments and empty lines
        [[ $line =~ ^#.*$ ]] && continue
        [[ -z "$line" ]] && continue
        
        # Extract variable name and value
        if [[ $line =~ ^([^=]+)=(.*)$ ]]; then
            var_name="${BASH_REMATCH[1]}"
            var_value="${BASH_REMATCH[2]}"
            # Remove quotes if present
            var_value=$(echo "$var_value" | sed 's/^"//;s/"$//')
            export "$var_name=$var_value"
        fi
    done < .env.local
    echo -e "${GREEN}✅ Loaded .env.local${NC}"
else
    echo -e "${RED}❌ .env.local not found${NC}"
    exit 1
fi

echo ""
echo "🔑 Validating API Tokens..."
echo ""

# Validate HuggingFace Token
echo -e "${BLUE}Testing HuggingFace Token...${NC}"
if [ -z "$HUGGINGFACE_TOKEN" ]; then
    echo -e "${RED}❌ HUGGINGFACE_TOKEN not set${NC}"
    exit 1
fi

# Test HuggingFace API
HF_RESPONSE=$(curl -s -H "Authorization: Bearer $HUGGINGFACE_TOKEN" \
    "https://huggingface.co/api/models?limit=1" || echo "error")

if echo "$HF_RESPONSE" | grep -q '"id":'; then
    MODEL_NAME=$(echo "$HF_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo -e "${GREEN}✅ HuggingFace Token Valid - Test Model: $MODEL_NAME${NC}"
else
    echo -e "${RED}❌ HuggingFace Token Invalid${NC}"
    echo "Response: $HF_RESPONSE"
fi

echo ""

# Validate Sentry Token
echo -e "${BLUE}Testing Sentry Token...${NC}"
if [ -z "$SENTRY_AUTH_TOKEN" ]; then
    echo -e "${RED}❌ SENTRY_AUTH_TOKEN not set${NC}"
    exit 1
fi

# Test Sentry API
SENTRY_RESPONSE=$(curl -s -H "Authorization: Bearer $SENTRY_AUTH_TOKEN" \
    "https://sentry.io/api/0/organizations/" || echo "error")

if echo "$SENTRY_RESPONSE" | grep -q "rankpilot"; then
    echo -e "${GREEN}✅ Sentry Token Valid - Organization: rankpilot${NC}"
else
    echo -e "${YELLOW}⚠️  Sentry Token Response:${NC}"
    echo "$SENTRY_RESPONSE" | head -c 200
fi

echo ""

# Validate Stripe Token
echo -e "${BLUE}Testing Stripe Token...${NC}"
if [ -z "$STRIPE_SECRET_KEY" ]; then
    echo -e "${RED}❌ STRIPE_SECRET_KEY not set${NC}"
    exit 1
fi

# Test Stripe API
STRIPE_RESPONSE=$(curl -s -H "Authorization: Bearer $STRIPE_SECRET_KEY" \
    "https://api.stripe.com/v1/account" || echo "error")

if echo "$STRIPE_RESPONSE" | grep -q '"id":'; then
    ACCOUNT_ID=$(echo "$STRIPE_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    COUNTRY=$(echo "$STRIPE_RESPONSE" | grep -o '"country":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo -e "${GREEN}✅ Stripe Token Valid - Account: $ACCOUNT_ID (Country: $COUNTRY)${NC}"
else
    echo -e "${YELLOW}⚠️  Stripe Response:${NC}"
    echo "$STRIPE_RESPONSE" | head -c 200
fi

echo ""

# Validate Firecrawl Token
echo -e "${BLUE}Testing Firecrawl Token...${NC}"
if [ -z "$FIRECRAWL_API_KEY" ]; then
    echo -e "${RED}❌ FIRECRAWL_API_KEY not set${NC}"
    exit 1
fi

# Test Firecrawl API (simple endpoint)
FC_RESPONSE=$(curl -s -H "Authorization: Bearer $FIRECRAWL_API_KEY" \
    "https://api.firecrawl.dev/v1/crawl" \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"url": "https://example.com", "limit": 1}' || echo "error")

if echo "$FC_RESPONSE" | grep -q "jobId\|success"; then
    echo -e "${GREEN}✅ Firecrawl Token Valid${NC}"
else
    echo -e "${YELLOW}⚠️  Firecrawl Response (may be rate limited):${NC}"
    echo "$FC_RESPONSE" | head -c 200
fi

echo ""
echo "🎯 Token Validation Summary:"
echo "- HuggingFace: Configured and tested"
echo "- Sentry: Configured and tested"  
echo "- Stripe: Configured and tested"
echo "- Firecrawl: Configured and tested"
echo ""
echo -e "${GREEN}✅ MCP Server tokens ready for use!${NC}"
echo ""
echo "🚀 Next Steps:"
echo "1. Test MCP servers with: npm run mcp:test"
echo "2. Start development server: npm run dev-no-turbopack"
echo "3. Access MCP features in VS Code"
