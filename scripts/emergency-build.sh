#!/bin/bash
# Emergency Build Fallback Script
echo "🚨 Emergency build initiated..."
export ESLINT_NO_DEV_ERRORS=true
export NODE_OPTIONS='--max-old-space-size=2048'
export NEXT_TELEMETRY_DISABLED=1

if npm run build:memory-safe; then
    echo "✅ Emergency build successful"
    exit 0
fi

echo "❌ Emergency build failed"
exit 1
