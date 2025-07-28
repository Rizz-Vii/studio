#!/bin/bash
# DevReady Validation Script - Autonomous Excellence Mode (Linux/Bash Version)
# Validates MCP Server Integration, Systematic Debugging, and Mobile Performance

PRIORITY=${1:-"all"}
DRY_RUN=${2:-"false"}
DETAILED=${3:-"false"}

echo "🚀 DevReady Validation - Autonomous Excellence Mode"
echo "Priority: $PRIORITY | DryRun: $DRY_RUN | Detailed: $DETAILED"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Priority 1: Website Functionality & UX Review
test_priority_1() {
    echo -e "\n${YELLOW}🥇 PRIORITY 1 — WEBSITE FUNCTIONALITY & UX REVIEW${NC}"
    
    # Core Web Vitals Check
    lighthouse_config=$([ -f "lighthouse.config.js" ] && echo "✅" || echo "❌")
    echo -e "📊 Core Web Vitals Config: ${lighthouse_config}"
    
    # Mobile Performance Check
    mobile_utils=$([ -f "src/lib/mobile-responsive-utils.ts" ] && echo "✅" || echo "❌")
    echo -e "📱 Mobile Performance Utils: ${mobile_utils}"
    
    # Touch Target Validation
    touch_targets=$(grep -r "min-h-\[48px\]\|min-w-\[48px\]" src/ 2>/dev/null | wc -l)
    touch_status=$([ $touch_targets -gt 0 ] && echo "✅" || echo "⚠️")
    echo -e "🎯 48px Touch Targets: ${touch_status} ($touch_targets found)"
    
    # Core Web Vitals compliance check
    core_vitals=$(grep -r "LCP\|CLS\|FID" src/ 2>/dev/null | wc -l)
    vitals_status=$([ $core_vitals -gt 0 ] && echo "✅" || echo "⚠️")
    echo -e "📊 Core Web Vitals Implementation: ${vitals_status} ($core_vitals references)"
}

# Priority 2: Phase 2 Execution Plan
test_priority_2() {
    echo -e "\n${YELLOW}🥈 PRIORITY 2 — PHASE 2 EXECUTION PLAN${NC}"
    
    # Enhanced NeuroSEO Orchestrator
    orchestrator=$([ -f "src/lib/ai/enhanced-neuroseo-orchestrator.ts" ] && echo "✅" || echo "❌")
    echo -e "🧠 Enhanced NeuroSEO Orchestrator: ${orchestrator}"
    
    # Firestore Rules
    firestore_rules=$([ -f "firestore.rules" ] && echo "✅" || echo "❌")
    echo -e "🔐 Firestore Rules: ${firestore_rules}"
    
    # CI/CD Configuration
    github_actions=$([ -d ".github/workflows" ] && echo "✅" || echo "❌")
    echo -e "🚀 CI/CD Configuration: ${github_actions}"
    
    # Firebase Functions
    firebase_functions=$([ -d "functions" ] && echo "✅" || echo "❌")
    echo -e "⚡ Firebase Functions: ${firebase_functions}"
}

# Priority 3: Engineering Excellence
test_priority_3() {
    echo -e "\n${YELLOW}🥉 PRIORITY 3 — ENGINEERING EXCELLENCE${NC}"
    
    # MCP Server Integration Validation
    echo -e "${CYAN}🤖 MCP Server Integration Validation:${NC}"
    
    # Check package.json for MCP-related dependencies
    if [ -f "package.json" ]; then
        mcp_servers=0
        
        # Check for MCP server patterns in package.json
        if grep -q "modelcontextprotocol\|firecrawl\|sentry\|huggingface" package.json; then
            mcp_servers=$((mcp_servers + 1))
        fi
        
        # Check for MCP usage in source code
        mcp_usage=$(grep -r "mcp_\|MCP\|ModelContext" src/ 2>/dev/null | wc -l)
        mcp_status=$([ $mcp_usage -gt 0 ] && echo "✅" || echo "❌")
        echo -e "  MCP Server Usage: ${mcp_status} ($mcp_usage references)"
    fi
    
    # Systematic Debugging Framework
    echo -e "\n${CYAN}🔍 Systematic Debugging Framework:${NC}"
    debugging_framework=$([ -f "src/lib/debugging/systematic-debugger.ts" ] && echo "✅" || echo "❌")
    echo -e "  Debugging Framework: ${debugging_framework}"
    
    # Pattern Recognition Engine
    pattern_database=$([ -f "docs/patterns/debugging-patterns.json" ] && echo "✅" || echo "❌")
    echo -e "  Pattern Database: ${pattern_database}"
    
    # Testing Framework
    test_orchestrator=$([ -f "testing/utils/test-orchestrator.ts" ] && echo "✅" || echo "❌")
    echo -e "  Test Orchestrator: ${test_orchestrator}"
    
    # Enhanced Testing Coverage
    playwright_tests=$(find testing/ -name "*.spec.ts" 2>/dev/null | wc -l)
    test_status=$([ $playwright_tests -gt 100 ] && echo "✅" || echo "⚠️")
    echo -e "  Playwright Tests: ${test_status} ($playwright_tests tests)"
}

# Calculate compliance score
calculate_compliance() {
    echo -e "\n${GREEN}📊 DevReady Compliance Score:${NC}"
    
    total_checks=12
    passed_checks=0
    
    # Priority 1 checks (4)
    [ -f "lighthouse.config.js" ] && passed_checks=$((passed_checks + 1))
    [ -f "src/lib/mobile-responsive-utils.ts" ] && passed_checks=$((passed_checks + 1))
    [ $(grep -r "min-h-\[48px\]\|min-w-\[48px\]" src/ 2>/dev/null | wc -l) -gt 0 ] && passed_checks=$((passed_checks + 1))
    [ $(grep -r "LCP\|CLS\|FID" src/ 2>/dev/null | wc -l) -gt 0 ] && passed_checks=$((passed_checks + 1))
    
    # Priority 2 checks (4)
    [ -f "src/lib/ai/enhanced-neuroseo-orchestrator.ts" ] && passed_checks=$((passed_checks + 1))
    [ -f "firestore.rules" ] && passed_checks=$((passed_checks + 1))
    [ -d ".github/workflows" ] && passed_checks=$((passed_checks + 1))
    [ -d "functions" ] && passed_checks=$((passed_checks + 1))
    
    # Priority 3 checks (4)
    [ $(grep -r "mcp_\|MCP\|ModelContext" src/ 2>/dev/null | wc -l) -gt 0 ] && passed_checks=$((passed_checks + 1))
    [ -f "src/lib/debugging/systematic-debugger.ts" ] && passed_checks=$((passed_checks + 1))
    [ -f "testing/utils/test-orchestrator.ts" ] && passed_checks=$((passed_checks + 1))
    [ $(find testing/ -name "*.spec.ts" 2>/dev/null | wc -l) -gt 100 ] && passed_checks=$((passed_checks + 1))
    
    compliance_score=$((passed_checks * 100 / total_checks))
    
    if [ $compliance_score -ge 90 ]; then
        score_color=$GREEN
    elif [ $compliance_score -ge 75 ]; then
        score_color=$YELLOW
    else
        score_color=$RED
    fi
    
    echo -e "Overall Compliance: ${score_color}${compliance_score}%${NC} ($passed_checks/$total_checks)"
}

# Generate recommendations
generate_recommendations() {
    echo -e "\n${CYAN}🧠 DevReady Enhancement Recommendations:${NC}"
    
    # Check if compliance is not 100%
    total_checks=12
    passed_checks=0
    
    # Recalculate for recommendations
    [ -f "lighthouse.config.js" ] && passed_checks=$((passed_checks + 1))
    [ -f "src/lib/mobile-responsive-utils.ts" ] && passed_checks=$((passed_checks + 1))
    [ $(grep -r "min-h-\[48px\]\|min-w-\[48px\]" src/ 2>/dev/null | wc -l) -gt 0 ] && passed_checks=$((passed_checks + 1))
    [ $(grep -r "LCP\|CLS\|FID" src/ 2>/dev/null | wc -l) -gt 0 ] && passed_checks=$((passed_checks + 1))
    [ -f "src/lib/ai/enhanced-neuroseo-orchestrator.ts" ] && passed_checks=$((passed_checks + 1))
    [ -f "firestore.rules" ] && passed_checks=$((passed_checks + 1))
    [ -d ".github/workflows" ] && passed_checks=$((passed_checks + 1))
    [ -d "functions" ] && passed_checks=$((passed_checks + 1))
    [ $(grep -r "mcp_\|MCP\|ModelContext" src/ 2>/dev/null | wc -l) -gt 0 ] && passed_checks=$((passed_checks + 1))
    [ -f "src/lib/debugging/systematic-debugger.ts" ] && passed_checks=$((passed_checks + 1))
    [ -f "testing/utils/test-orchestrator.ts" ] && passed_checks=$((passed_checks + 1))
    [ $(find testing/ -name "*.spec.ts" 2>/dev/null | wc -l) -gt 100 ] && passed_checks=$((passed_checks + 1))
    
    if [ $passed_checks -lt $total_checks ]; then
        echo -e "• Run 'npm run dev-no-turbopack' to validate live functionality"
        echo -e "• Execute 'npm run test:role-based' for comprehensive testing"
        echo -e "• Use 'npm run optimize-windows' for performance optimization"
        
        if [ ! -f "src/lib/debugging/systematic-debugger.ts" ]; then
            echo -e "${YELLOW}• Implement systematic debugging framework in src/lib/debugging/${NC}"
        fi
        
        if [ $(grep -r "mcp_\|MCP\|ModelContext" src/ 2>/dev/null | wc -l) -eq 0 ]; then
            echo -e "${YELLOW}• Integrate MCP servers for enhanced AI capabilities${NC}"
        fi
    fi
}

# Execute validation based on priority
case $PRIORITY in
    "1")
        test_priority_1
        ;;
    "2")
        test_priority_2
        ;;
    "3")
        test_priority_3
        ;;
    "all")
        test_priority_1
        test_priority_2
        test_priority_3
        calculate_compliance
        generate_recommendations
        ;;
    *)
        echo -e "${RED}Invalid priority. Use: 1, 2, 3, or all${NC}"
        exit 1
        ;;
esac

echo -e "\n${GREEN}✅ DevReady Validation Complete - Autonomous Excellence Mode${NC}"
