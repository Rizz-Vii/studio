#!/bin/bash
# RankPilot Smart Process Cleanup Script
# Intelligently manages redundant VS Code language service processes

echo "🧹 RankPilot Smart Process Cleanup"
echo "=================================="

# Function to safely kill older duplicate processes
cleanup_duplicates() {
    local process_pattern="$1"
    local process_name="$2"
    local max_allowed="$3"
    
    echo "🔍 Checking $process_name processes..."
    
    # Get all matching processes sorted by start time (oldest first)
    local pids=($(ps -eo pid,lstart,cmd | grep "$process_pattern" | grep -v grep | sort -k2 | awk '{print $1}'))
    local count=${#pids[@]}
    
    if [ $count -gt $max_allowed ]; then
        local to_kill=$((count - max_allowed))
        echo "  ⚠️  Found $count $process_name processes (max: $max_allowed)"
        echo "  🗑️  Terminating $to_kill oldest processes..."
        
        for ((i=0; i<to_kill; i++)); do
            local pid=${pids[$i]}
            if kill -TERM $pid 2>/dev/null; then
                echo "    ✅ Terminated process $pid"
            else
                echo "    ⚠️  Could not terminate process $pid"
            fi
        done
    else
        echo "  ✅ $process_name: $count processes (optimal)"
    fi
}

# Cleanup TypeScript Language Servers (keep 2 newest)
cleanup_duplicates "tsserver.js" "TypeScript Language Server" 2

# Cleanup ESLint Servers (keep 1 newest)  
cleanup_duplicates "eslintServer.js" "ESLint Server" 1

# Cleanup Tailwind CSS Servers (keep 1 newest)
cleanup_duplicates "tailwindServer.js" "Tailwind CSS Server" 1

# Cleanup JSON Language Servers (keep 1 newest)
cleanup_duplicates "jsonServerMain" "JSON Language Server" 1

# Cleanup Markdown Language Servers (keep 1 newest)
cleanup_duplicates "serverWorkerMain" "Markdown Language Server" 1

echo ""
echo "⏱️  Waiting 3 seconds for processes to terminate..."
sleep 3

echo ""
echo "📊 Post-cleanup status:"
bash scripts/process-monitor.sh

echo ""
echo "💡 For maximum optimization, consider:"
echo "   1. Restarting VS Code to consolidate extension hosts"
echo "   2. Closing unused file tabs to reduce TypeScript memory usage"
echo "   3. Running this script periodically: bash scripts/process-cleanup.sh"
