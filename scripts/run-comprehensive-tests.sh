#!/bin/bash

# Comprehensive Test Suite Runner for RankPilot (Linux/Bash Version)
# Executes complete test coverage across all 128+ pages and features

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
RESET='\033[0m'

# Default values
SUITE="all"
TIER="all"
PARALLEL=true
HEADED=false
PRODUCTION=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --suite)
            SUITE="$2"
            shift 2
            ;;
        --tier)
            TIER="$2"
            shift 2
            ;;
        --parallel)
            PARALLEL="$2"
            shift 2
            ;;
        --headed)
            HEADED=true
            shift
            ;;
        --production)
            PRODUCTION=true
            shift
            ;;
        *)
            echo "Unknown option $1"
            exit 1
            ;;
    esac
done

# Test execution statistics
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
START_TIME=$(date +%s)

function write_color_output() {
    local message="$1"
    local color="$2"
    echo -e "${color}${message}${RESET}"
}

function write_test_header() {
    local title="$1"
    echo ""
    write_color_output "============================================================" "$BLUE"
    write_color_output "  $title" "$BLUE"
    write_color_output "============================================================" "$BLUE"
    echo ""
}

function write_success() {
    write_color_output "✅ $1" "$GREEN"
}

function write_warning() {
    write_color_output "⚠️  $1" "$YELLOW"
}

function write_error() {
    write_color_output "❌ $1" "$RED"
}

function execute_test_suite() {
    local test_name="$1"
    local test_command="$2"
    local required="${3:-true}"
    
    write_test_header "Running $test_name Tests"
    echo "Command: $test_command"
    echo ""
    
    local start_time=$(date +%s)
    
    if eval "$test_command"; then
        local duration=$(($(date +%s) - start_time))
        write_success "$test_name tests completed successfully in ${duration}s"
        ((PASSED_TESTS++))
    else
        local exit_code=$?
        local duration=$(($(date +%s) - start_time))
        
        if [[ "$required" == "true" ]]; then
            write_error "$test_name tests failed with exit code $exit_code after ${duration}s"
            ((FAILED_TESTS++))
            echo "Critical test suite failed: $test_name"
            exit 1
        else
            write_warning "$test_name tests failed with exit code $exit_code after ${duration}s (non-critical)"
            ((FAILED_TESTS++))
        fi
    fi
    
    ((TOTAL_TESTS++))
    echo ""
}

function get_base_test_command() {
    local base_cmd="cross-env NODE_OPTIONS='--max-old-space-size=2048' playwright test --config=testing/configs/test.config.ts"
    
    if [[ "$PARALLEL" == "false" ]]; then
        base_cmd="$base_cmd --workers=1"
    fi
    
    if [[ "$HEADED" == "true" ]]; then
        base_cmd="$base_cmd --headed"
    fi
    
    if [[ "$PRODUCTION" == "true" ]]; then
        base_cmd="cross-env NODE_OPTIONS='--max-old-space-size=2048' TEST_BASE_URL=https://rankpilot-h3jpc.web.app playwright test --config=testing/configs/test.config.ts"
    fi
    
    echo "$base_cmd"
}

# Main execution
write_test_header "RankPilot Comprehensive Test Suite Runner"
echo "Suite: $SUITE"
echo "Tier: $TIER"
echo "Parallel: $PARALLEL"
echo "Headed: $HEADED"
echo "Production: $PRODUCTION"
echo "Start Time: $(date)"

BASE_CMD=$(get_base_test_command)

# Check if dev server is running
echo ""
write_color_output "Checking development server status..." "$BLUE"

if curl -s --head http://localhost:3000 > /dev/null 2>&1; then
    write_success "Development server is running"
else
    if [[ "$PRODUCTION" != "true" ]]; then
        write_warning "Development server not detected. Please start with: npm run dev"
        write_warning "Continuing with tests anyway..."
    fi
fi

# Execute test suites based on selection
case "$SUITE" in
    "all")
        write_test_header "Executing Complete Test Suite (All 8 Categories)"
        
        # Critical foundation tests first
        execute_test_suite "Authentication" "$BASE_CMD testing/specs/main/auth-consolidated.spec.ts" true
        execute_test_suite "Performance" "$BASE_CMD testing/specs/main/performance.spec.ts" true
        execute_test_suite "Accessibility" "$BASE_CMD testing/specs/main/accessibility.spec.ts" true
        
        # Feature tests
        execute_test_suite "Team Projects" "$BASE_CMD testing/specs/main/features/team-projects.spec.ts" true
        execute_test_suite "Team Reports" "$BASE_CMD testing/specs/main/features/team-reports.spec.ts" true
        execute_test_suite "Team Chat" "$BASE_CMD testing/specs/main/features/team-chat.spec.ts" true
        execute_test_suite "Content Analyzer" "$BASE_CMD testing/specs/main/features/content-analyzer.spec.ts" true
        execute_test_suite "Keyword Tool" "$BASE_CMD testing/specs/main/features/keyword-tool.spec.ts" true
        
        # UI and integration tests
        execute_test_suite "Mobile Navigation" "$BASE_CMD testing/specs/main/mobile-nav-consolidated.spec.ts" false
        execute_test_suite "Visual Regression" "$BASE_CMD testing/specs/main/visual-regression.spec.ts" false
        execute_test_suite "API Contracts" "$BASE_CMD testing/specs/main/api-contracts.spec.ts" false
        execute_test_suite "End-to-End" "$BASE_CMD testing/specs/main/public-pages-e2e.spec.ts" false
        ;;
        
    "critical")
        write_test_header "Executing Critical Test Suite"
        execute_test_suite "Authentication" "$BASE_CMD testing/specs/main/auth-consolidated.spec.ts" true
        execute_test_suite "Performance" "$BASE_CMD testing/specs/main/performance.spec.ts" true
        execute_test_suite "Accessibility" "$BASE_CMD testing/specs/main/accessibility.spec.ts" true
        ;;
        
    "features")
        write_test_header "Executing Feature Test Suite"
        execute_test_suite "Team Projects" "$BASE_CMD testing/specs/main/features/team-projects.spec.ts" true
        execute_test_suite "Team Reports" "$BASE_CMD testing/specs/main/features/team-reports.spec.ts" true
        execute_test_suite "Team Chat" "$BASE_CMD testing/specs/main/features/team-chat.spec.ts" true
        execute_test_suite "Content Analyzer" "$BASE_CMD testing/specs/main/features/content-analyzer.spec.ts" true
        execute_test_suite "Keyword Tool" "$BASE_CMD testing/specs/main/features/keyword-tool.spec.ts" true
        ;;
        
    "auth")
        execute_test_suite "Authentication" "$BASE_CMD testing/specs/main/auth-consolidated.spec.ts" true
        ;;
        
    "mobile")
        execute_test_suite "Mobile Navigation" "$BASE_CMD testing/specs/main/mobile-nav-consolidated.spec.ts" true
        ;;
        
    "visual")
        execute_test_suite "Visual Regression" "$BASE_CMD testing/specs/main/visual-regression.spec.ts" true
        ;;
        
    "api")
        execute_test_suite "API Contracts" "$BASE_CMD testing/specs/main/api-contracts.spec.ts" true
        ;;
        
    "accessibility")
        execute_test_suite "Accessibility" "$BASE_CMD testing/specs/main/accessibility.spec.ts" true
        ;;
        
    "performance")
        execute_test_suite "Performance" "$BASE_CMD testing/specs/main/performance.spec.ts" true
        ;;
        
    "e2e")
        execute_test_suite "End-to-End" "$BASE_CMD testing/specs/main/public-pages-e2e.spec.ts" true
        ;;
        
    *)
        write_error "Unknown test suite: $SUITE"
        echo "Available suites: all, critical, features, auth, mobile, visual, api, accessibility, performance, e2e"
        exit 1
        ;;
esac

# Final statistics
TOTAL_DURATION=$(($(date +%s) - START_TIME))
TOTAL_MINUTES=$((TOTAL_DURATION / 60))

write_test_header "Test Execution Summary"
echo "Total Test Suites: $TOTAL_TESTS"
write_success "Passed: $PASSED_TESTS"

if [[ $FAILED_TESTS -gt 0 ]]; then
    write_error "Failed: $FAILED_TESTS"
else
    echo "Failed: 0"
fi

echo "Duration: ${TOTAL_MINUTES} minutes"

if [[ $TOTAL_TESTS -gt 0 ]]; then
    SUCCESS_RATE=$(( (PASSED_TESTS * 100) / TOTAL_TESTS ))
    echo "Success Rate: ${SUCCESS_RATE}%"
fi

if [[ $FAILED_TESTS -eq 0 ]]; then
    write_success "🎉 All test suites completed successfully!"
    exit 0
else
    write_warning "⚠️  Some test suites failed. Check logs above for details."
    exit 1
fi
