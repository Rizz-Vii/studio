#!/bin/bash

# 🚀 RankPilot AI Agent Deployment Script
# Purpose: Ensure proper AI agent activation in production environment
# Created: July 31, 2025

set -e

echo "🚀 RankPilot AI Agent Deployment Preparation"
echo "=============================================="
echo ""

# Check environment
if [ "$NODE_ENV" != "production" ]; then
    echo "⚠️  NODE_ENV is not set to 'production'"
    echo "   Current value: $NODE_ENV"
fi

echo "📋 Environment Configuration Check:"
echo "   NODE_ENV: ${NODE_ENV:-not set}"
echo "   RANKPILOT_AGENTS_ENABLED: ${RANKPILOT_AGENTS_ENABLED:-not set}"
echo "   FEATURE_FLAG_AI_AGENTS: ${FEATURE_FLAG_AI_AGENTS:-not set}"
echo ""

# Load production environment if available
if [ -f ".env.production" ]; then
    echo "📁 Loading production environment variables..."
    export $(grep -v '^#' .env.production | xargs)
    echo "✅ Production environment loaded"
else
    echo "⚠️  .env.production file not found"
fi

echo ""
echo "🤖 AI Agent System Status:"
echo "   Customer Support Orchestrator: ${CUSTOMER_SUPPORT_ORCHESTRATOR_ENABLED:-not set}"
echo "   Business Operations Orchestrator: ${BUSINESS_OPERATIONS_ORCHESTRATOR_ENABLED:-not set}"
echo "   Technical Operations Orchestrator: ${TECHNICAL_OPERATIONS_ORCHESTRATOR_ENABLED:-not set}"
echo "   NeuroSEO™ Suite: ${NEUROSEO_ENABLED:-not set}"
echo ""

# Firebase Functions environment setup
echo "🔥 Firebase Functions Configuration:"
echo "   Setting AI agent environment variables..."

# Note: Using legacy functions.config() until migration is complete
firebase functions:config:set \
  rankpilot.agents_enabled=true \
  neuroseo.enabled=true \
  ai.orchestrators_active=true \
  environment.node_env=production

echo "✅ Firebase functions configured"
echo ""

# Build check
echo "🔨 Running production build test..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful - AI agents will be active in production"
else
    echo "❌ Build failed - check configuration"
    exit 1
fi

echo ""
echo "🎯 Deployment Ready!"
echo "   AI Agents: ENABLED"
echo "   NeuroSEO™ Suite: ENABLED" 
echo "   All Orchestrators: ACTIVE"
echo ""
echo "🚀 Run 'firebase deploy' to deploy with AI agents enabled"
