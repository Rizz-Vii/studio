#!/bin/bash

# Security Validation Test Runner
# Enhanced security testing for RankPilot

echo "🛡️ RankPilot Security Validation Suite"
echo "======================================"

# Set environment variables
export NODE_ENV=test
export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

# Ensure development server is running
echo "🔧 Checking development server..."
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "⚠️ Starting development server..."
    npm run dev &
    DEV_PID=$!
    
    # Wait for server to start
    echo "⏳ Waiting for server to start..."
    for i in {1..30}; do
        if curl -s http://localhost:3000 > /dev/null; then
            echo "✅ Development server is running"
            break
        fi
        sleep 2
    done
else
    echo "✅ Development server already running"
fi

echo ""
echo "🔍 Running Security Tests..."
echo "----------------------------"

# Run security tests with custom config
npx playwright test \
    --config=playwright.config.security.ts \
    --project=security-tests \
    --reporter=list,html \
    --timeout=60000 \
    testing/production/security.spec.ts

SECURITY_EXIT_CODE=$?

echo ""
echo "📊 Security Test Results:"
echo "------------------------"

if [ $SECURITY_EXIT_CODE -eq 0 ]; then
    echo "✅ All security tests passed!"
    echo "🛡️ RankPilot security validation: SUCCESSFUL"
else
    echo "⚠️ Some security tests failed (exit code: $SECURITY_EXIT_CODE)"
    echo "🔍 Check the HTML report for details"
fi

# Clean up if we started the dev server
if [ ! -z "$DEV_PID" ]; then
    echo "🧹 Cleaning up development server..."
    kill $DEV_PID 2>/dev/null || true
fi

echo ""
echo "📁 Test artifacts:"
echo "  - HTML Report: test-results/security-html-report/index.html"
echo "  - JSON Results: test-results/security-results.json"
echo "  - Screenshots: test-results/ (if any failures)"

exit $SECURITY_EXIT_CODE
