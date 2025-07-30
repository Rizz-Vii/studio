#!/bin/bash
# RankPilot Process Monitoring Script
# Monitors and reports on redundant processes and memory usage

echo "🔍 RankPilot Process Monitor Report"
echo "=================================="
echo "Generated: $(date)"
echo ""

# Check for duplicate TypeScript servers
echo "📝 TypeScript Language Servers:"
TSSERVER_COUNT=$(ps aux | grep "tsserver.js" | grep -v grep | wc -l)
if [ $TSSERVER_COUNT -gt 2 ]; then
    echo "⚠️  WARNING: $TSSERVER_COUNT TypeScript servers detected (expected: 2)"
    ps aux | grep "tsserver.js" | grep -v grep | awk '{print $2, $4"% mem", $11}'
else
    echo "✅ TypeScript servers: $TSSERVER_COUNT (optimal)"
fi
echo ""

# Check for duplicate extension hosts
echo "🔌 VS Code Extension Hosts:"
EXTHOST_COUNT=$(ps aux | grep "extensionHost" | grep -v grep | wc -l)
if [ $EXTHOST_COUNT -gt 1 ]; then
    echo "⚠️  Multiple extension hosts: $EXTHOST_COUNT (consider VS Code restart)"
    ps aux | grep "extensionHost" | grep -v grep | awk '{print $2, $4"% mem", $9"% cpu"}'
else
    echo "✅ Extension hosts: $EXTHOST_COUNT"
fi
echo ""

# Check for duplicate language services
echo "🛠️  Language Services:"
ESLINT_COUNT=$(ps aux | grep "eslintServer" | grep -v grep | wc -l)
TAILWIND_COUNT=$(ps aux | grep "tailwindServer" | grep -v grep | wc -l)
echo "ESLint servers: $ESLINT_COUNT $([ $ESLINT_COUNT -gt 1 ] && echo '⚠️' || echo '✅')"
echo "Tailwind servers: $TAILWIND_COUNT $([ $TAILWIND_COUNT -gt 1 ] && echo '⚠️' || echo '✅')"
echo ""

# Memory usage summary
echo "💾 Memory Usage Summary:"
echo "Top 5 memory consumers:"
ps aux --sort=-%mem | head -6 | tail -5 | awk '{printf "  %s%% - %s\n", $4, $11}'
echo ""

# Port usage
echo "🌐 Active Ports:"
netstat -tlnp 2>/dev/null | grep LISTEN | grep -E "(node|:300[0-9]|:808[0-9])" | awk '{print "  " $4}' || echo "  No development servers detected"
echo ""

# Recommendations
echo "💡 Recommendations:"
if [ $TSSERVER_COUNT -gt 2 ] || [ $EXTHOST_COUNT -gt 1 ] || [ $ESLINT_COUNT -gt 1 ] || [ $TAILWIND_COUNT -gt 1 ]; then
    echo "  • Run process cleanup to eliminate redundancies"
    echo "  • Consider restarting VS Code to consolidate services"
else
    echo "  • System is optimally configured"
    echo "  • No redundant processes detected"
fi
echo ""
echo "Run with 'bash scripts/process-monitor.sh' for regular monitoring"
