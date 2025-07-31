#!/bin/bash

# =============================================================================
# VS Code Extension & MCP Optimization Tool
# Created: $(date)
# Purpose: Clean up duplicate extensions and optimize MCP server configuration
# =============================================================================

echo "🧹 RankPilot Codespace Optimization - VS Code Extensions & MCP Cleanup"
echo "========================================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_section() {
    echo -e "\n${BLUE}=================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}=================================${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# =============================================================================
# 1. Extension Cleanup
# =============================================================================
print_section "Extension Cleanup"

# Check if we're in interactive mode
INTERACTIVE=${1:-"true"}

cleanup_duplicate_extensions() {
    local extension_base="$1"
    local description="$2"
    
    echo "🔍 Checking for duplicate $description extensions..."
    
    # Find all versions of this extension
    extension_dirs=($(ls -d ~/.vscode-remote/extensions/${extension_base}* 2>/dev/null | sort -V))
    
    if [ ${#extension_dirs[@]} -gt 1 ]; then
        print_warning "Found ${#extension_dirs[@]} versions of $description:"
        
        for dir in "${extension_dirs[@]}"; do
            version=$(basename "$dir" | sed "s/${extension_base}-//")
            size=$(du -sh "$dir" 2>/dev/null | cut -f1)
            echo "  - Version: $version (Size: $size)"
        done
        
        # Keep only the latest version
        if [ "$INTERACTIVE" = "true" ]; then
            echo "Keep only the latest version? (y/N)"
            read -r response
            if [[ $response =~ ^[Yy]$ ]]; then
                # Remove all but the last (latest) version
                for (( i=0; i<${#extension_dirs[@]}-1; i++ )); do
                    echo "🗑️  Removing ${extension_dirs[i]}"
                    rm -rf "${extension_dirs[i]}"
                done
                print_success "Cleaned up duplicate $description extensions"
            fi
        else
            # Auto-cleanup in non-interactive mode
            for (( i=0; i<${#extension_dirs[@]}-1; i++ )); do
                echo "🗑️  Removing ${extension_dirs[i]}"
                rm -rf "${extension_dirs[i]}"
            done
            print_success "Auto-cleaned duplicate $description extensions"
        fi
    else
        print_success "No duplicate $description extensions found"
    fi
}

# Clean up specific known duplicates
cleanup_duplicate_extensions "github.copilot" "GitHub Copilot"
cleanup_duplicate_extensions "ms-vscode.vscode-typescript-next" "TypeScript"
cleanup_duplicate_extensions "ms-python.vscode" "Python"
cleanup_duplicate_extensions "ms-toolsai.jupyter" "Jupyter"
cleanup_duplicate_extensions "ms-toolsai.vscode" "Jupyter Tools"

# =============================================================================
# 2. Process Cleanup
# =============================================================================
print_section "Process Cleanup"

echo "🔍 Checking for redundant TypeScript servers..."

# Find TypeScript server processes using old extensions
old_ts_processes=$(ps aux | grep "ms-vscode.vscode-typescript-next-5.9.20250728" | grep -v grep | awk '{print $2}')

if [ -n "$old_ts_processes" ]; then
    print_warning "Found TypeScript servers using old extension version"
    echo "Process IDs: $old_ts_processes"
    
    if [ "$INTERACTIVE" = "true" ]; then
        echo "Terminate old TypeScript servers? (y/N)"
        read -r response
        if [[ $response =~ ^[Yy]$ ]]; then
            for pid in $old_ts_processes; do
                echo "🔄 Terminating process $pid"
                kill -15 "$pid" 2>/dev/null || echo "  ℹ️  Process $pid already terminated"
            done
            print_success "Terminated old TypeScript servers"
        fi
    else
        # Auto-cleanup in non-interactive mode
        for pid in $old_ts_processes; do
            echo "🔄 Terminating process $pid"
            kill -15 "$pid" 2>/dev/null || echo "  ℹ️  Process $pid already terminated"
        done
        print_success "Auto-terminated old TypeScript servers"
    fi
else
    print_success "No old TypeScript servers found"
fi

# =============================================================================
# 3. MCP Server Optimization
# =============================================================================
print_section "MCP Server Optimization"

if [ -f "mcp.json" ]; then
    echo "📊 Current MCP Server Configuration:"
    
    # List all servers
    if command -v jq &> /dev/null; then
        jq -r '.servers | keys[]' mcp.json | while read server; do
            type=$(jq -r ".servers.$server.type // \"unknown\"" mcp.json)
            echo "  ✓ $server ($type)"
        done
        
        server_count=$(jq '.servers | length' mcp.json)
        echo -e "\nTotal servers: $server_count"
        
        if [ "$server_count" -gt 8 ]; then
            print_warning "High number of MCP servers may impact performance"
            echo "💡 Consider disabling unused servers in mcp.json"
        fi
    fi
    
    # Check for servers that might not be essential
    echo -e "\n🎯 Server Usage Recommendations:"
    echo "  Essential: firecrawl, github, sentry, stripe"
    echo "  Development: sequentialthinking, markitdown, filesystem"
    echo "  Optional: playwright, huggingface, zapier, brave-search"
    
else
    print_error "mcp.json not found"
fi

# =============================================================================
# 4. Memory Optimization
# =============================================================================
print_section "Memory Optimization"

echo "💾 Current Memory Usage:"
free -h | grep -E "(Mem|Swap)"

# Calculate memory saved
echo -e "\n📊 Estimated Memory Savings:"
extension_dirs_before=$(ls -1 ~/.vscode-remote/extensions/ 2>/dev/null | wc -l)
echo "  - Extension directory cleanup: ~50-200MB per duplicate removed"
echo "  - TypeScript server optimization: ~500-1000MB per old server terminated"

# =============================================================================
# 5. VS Code Settings Optimization
# =============================================================================
print_section "VS Code Settings Optimization"

echo "⚙️  Recommended VS Code settings for better performance:"
echo "Add to VS Code settings.json:"
echo ""
echo "{"
echo "  \"typescript.preferences.includePackageJsonAutoImports\": \"off\","
echo "  \"typescript.suggest.autoImports\": false,"
echo "  \"typescript.validate.enable\": true,"
echo "  \"typescript.preferences.disableSuggestions\": false,"
echo "  \"extensions.autoUpdate\": false,"
echo "  \"extensions.autoCheckUpdates\": false"
echo "}"

# =============================================================================
# 6. Restart Recommendations
# =============================================================================
print_section "Restart Recommendations"

echo "🔄 For optimal performance, consider:"
echo "  1. Reload VS Code window (Ctrl+Shift+P → 'Reload Window')"
echo "  2. Restart TypeScript service (Ctrl+Shift+P → 'TypeScript: Restart TS Server')"
echo "  3. Clear VS Code cache if issues persist"

print_section "Optimization Complete"

# Calculate final stats
if [ -d ~/.vscode-remote/extensions/ ]; then
    extension_dirs_after=$(ls -1 ~/.vscode-remote/extensions/ 2>/dev/null | wc -l)
    echo "📈 Extension directories: $extension_dirs_before → $extension_dirs_after"
fi

echo "🎯 Codespace optimization completed successfully!"
echo "💡 Monitor memory usage with: free -h"
echo "🔍 Re-run analysis with: ./scripts/codespace-analysis.sh"
echo ""
