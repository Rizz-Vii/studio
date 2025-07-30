#!/bin/bash

# =============================================================================
# VS Code Extension & MCP Server Analysis Tool
# Created: $(date)
# Purpose: Comprehensive analysis of VS Code extensions and MCP server integration
# =============================================================================

echo "🔍 RankPilot Codespace Analysis - VS Code Extensions & MCP Integration"
echo "======================================================================="

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
# 1. VS Code Extension Analysis
# =============================================================================
print_section "VS Code Extensions Analysis"

echo "📋 Installed Extensions:"
code --list-extensions --show-versions | sort

echo -e "\n📂 Extension Directory Analysis:"
if [ -d ~/.vscode-remote/extensions/ ]; then
    echo "Total extension directories: $(ls -1 ~/.vscode-remote/extensions/ | wc -l)"
    
    # Check for duplicate extensions
    echo -e "\n🔍 Checking for duplicate extensions:"
    ls -1 ~/.vscode-remote/extensions/ | cut -d'-' -f1-2 | sort | uniq -d | while read extension; do
        print_warning "Duplicate found: $extension"
        ls -la ~/.vscode-remote/extensions/${extension}* | awk '{print "  - " $9 " (" $5 " bytes, " $6 " " $7 " " $8 ")"}'
    done
    
    # Check for Copilot versions
    echo -e "\n🤖 Copilot Extension Analysis:"
    ls -la ~/.vscode-remote/extensions/ | grep -i copilot | while read line; do
        extension=$(echo $line | awk '{print $9}')
        size=$(echo $line | awk '{print $5}')
        echo "  - $extension ($size bytes)"
    done
    
    # Check for TypeScript versions
    echo -e "\n📝 TypeScript Extension Analysis:"
    ls -la ~/.vscode-remote/extensions/ | grep -i typescript | while read line; do
        extension=$(echo $line | awk '{print $9}')
        size=$(echo $line | awk '{print $5}')
        echo "  - $extension ($size bytes)"
    done
else
    print_error "VS Code extensions directory not found"
fi

# =============================================================================
# 2. MCP Server Configuration Analysis
# =============================================================================
print_section "MCP Server Configuration Analysis"

if [ -f "mcp.json" ]; then
    echo "📊 MCP Configuration Summary:"
    
    # Count servers
    server_count=$(jq '.servers | length' mcp.json 2>/dev/null || echo "Cannot parse JSON")
    echo "  - Total MCP Servers: $server_count"
    
    # List servers
    echo -e "\n🔧 Configured MCP Servers:"
    if command -v jq &> /dev/null; then
        jq -r '.servers | keys[]' mcp.json 2>/dev/null | while read server; do
            type=$(jq -r ".servers.$server.type // \"unknown\"" mcp.json)
            echo "  - $server ($type)"
        done
    else
        grep -o '"[^"]*":' mcp.json | grep -v '"type":' | grep -v '"command":' | sed 's/"//g' | sed 's/://g' | head -15
    fi
    
    # Count required API keys
    echo -e "\n🔑 Required API Keys:"
    if command -v jq &> /dev/null; then
        input_count=$(jq '.inputs | length' mcp.json 2>/dev/null || echo "0")
        echo "  - Total API Keys Required: $input_count"
        jq -r '.inputs[].id' mcp.json 2>/dev/null | while read key; do
            echo "    ✓ $key"
        done
    fi
else
    print_error "mcp.json not found in current directory"
fi

# =============================================================================
# 3. Process Analysis
# =============================================================================
print_section "Process Analysis"

echo "🔄 TypeScript Language Server Processes:"
ps aux | grep "tsserver.js" | grep -v grep | while read line; do
    pid=$(echo $line | awk '{print $2}')
    memory=$(echo $line | awk '{print $6}')
    cpu=$(echo $line | awk '{print $3}')
    path=$(echo $line | awk '{for(i=11;i<=NF;i++) printf $i" "; print ""}')
    
    # Convert memory from KB to MB
    memory_mb=$((memory / 1024))
    
    if [ $memory_mb -gt 100 ]; then
        print_warning "High memory usage: PID $pid - ${memory_mb}MB, CPU: ${cpu}%"
    else
        echo "  ✓ PID $pid - ${memory_mb}MB, CPU: ${cpu}%"
    fi
    echo "    Path: $path"
done

echo -e "\n🔄 ESLint Server Processes:"
ps aux | grep "eslintServer.js" | grep -v grep | while read line; do
    pid=$(echo $line | awk '{print $2}')
    memory=$(echo $line | awk '{print $6}')
    cpu=$(echo $line | awk '{print $3}')
    memory_mb=$((memory / 1024))
    echo "  ✓ PID $pid - ${memory_mb}MB, CPU: ${cpu}%"
done

echo -e "\n🔄 VS Code Extension Host Processes:"
ps aux | grep "extensionHost" | grep -v grep | while read line; do
    pid=$(echo $line | awk '{print $2}')
    memory=$(echo $line | awk '{print $6}')
    cpu=$(echo $line | awk '{print $3}')
    memory_mb=$((memory / 1024))
    echo "  ✓ PID $pid - ${memory_mb}MB, CPU: ${cpu}%"
done

# =============================================================================
# 4. Memory Analysis
# =============================================================================
print_section "Memory Analysis"

echo "📊 Total Memory Usage by Service:"

# VS Code related processes
vscode_memory=$(ps aux | grep -E "(code-server|tsserver|eslint)" | grep -v grep | awk '{sum += $6} END {print sum/1024}')
echo "  - VS Code Services: ${vscode_memory:-0}MB"

# Node.js processes
node_memory=$(ps aux | grep node | grep -v grep | awk '{sum += $6} END {print sum/1024}')
echo "  - Node.js Processes: ${node_memory:-0}MB"

# System memory
echo -e "\n💾 System Memory Status:"
free -h | grep -E "(Mem|Swap)"

# =============================================================================
# 5. Port Analysis
# =============================================================================
print_section "Port Analysis"

echo "🌐 Active Network Connections:"
netstat -tulpn 2>/dev/null | grep LISTEN | head -10 | while read line; do
    port=$(echo $line | awk '{print $4}' | cut -d':' -f2)
    protocol=$(echo $line | awk '{print $1}')
    process=$(echo $line | awk '{print $7}' | cut -d'/' -f2)
    echo "  - Port $port ($protocol) - $process"
done

# =============================================================================
# 6. Recommendations
# =============================================================================
print_section "Optimization Recommendations"

# Check for duplicate extensions
duplicate_count=$(ls -1 ~/.vscode-remote/extensions/ 2>/dev/null | cut -d'-' -f1-2 | sort | uniq -d | wc -l)
if [ $duplicate_count -gt 0 ]; then
    print_warning "Found $duplicate_count duplicate extension(s)"
    echo "  💡 Recommendation: Remove older versions of duplicate extensions"
fi

# Check TypeScript server memory
ts_high_memory=$(ps aux | grep "tsserver.js" | grep -v grep | awk '$6 > 500000 {count++} END {print count+0}')
if [ $ts_high_memory -gt 0 ]; then
    print_warning "Found $ts_high_memory TypeScript server(s) using >500MB memory"
    echo "  💡 Recommendation: Restart TypeScript services or reduce project complexity"
fi

# Check MCP server count
if [ -f "mcp.json" ] && command -v jq &> /dev/null; then
    mcp_server_count=$(jq '.servers | length' mcp.json 2>/dev/null || echo "0")
    if [ $mcp_server_count -gt 10 ]; then
        print_warning "High number of MCP servers configured: $mcp_server_count"
        echo "  💡 Recommendation: Consider disabling unused MCP servers"
    fi
fi

print_section "Analysis Complete"
echo "🎯 Summary: Analyzed VS Code extensions, MCP configuration, and system processes"
echo "📝 Review the warnings above for optimization opportunities"
echo ""
