#!/usr/bin/env pwsh
# PilotBuddy Dynamic Content Aggregator - Simplified Version
# Auto-generates comprehensive development context from project files
# Version 1.1 - July 22, 2025

param(
    [switch]$Verbose,
    [string]$OutputPath = ".github/pilotbuddy-dynamic.md"
)

function Get-ProjectMetrics {
    $metrics = @{}
    $metrics.TestFiles = (Get-ChildItem tests -Recurse -Filter "*.spec.ts" -ErrorAction SilentlyContinue | Measure-Object).Count
    $metrics.Components = (Get-ChildItem src/components -Recurse -Filter "*.tsx" -ErrorAction SilentlyContinue | Measure-Object).Count
    $metrics.DocumentationFiles = (Get-ChildItem docs -Recurse -Filter "*.md" -ErrorAction SilentlyContinue | Measure-Object).Count
    $metrics.Scripts = (Get-ChildItem scripts -Recurse -Filter "*.{js,ps1,sh}" -ErrorAction SilentlyContinue | Measure-Object).Count
    return $metrics
}

function Get-ScriptInventory {
    $scripts = @{}
    $scriptFiles = Get-ChildItem scripts -Filter "*.{js,ps1,sh}" -ErrorAction SilentlyContinue
    
    foreach ($script in $scriptFiles) {
        $category = switch -Regex ($script.Name) {
            "test" { "Testing" }
            "build" { "Build" }
            "fix" { "Fixes" }
            "pilotbuddy" { "PilotBuddy" }
            default { "Utilities" }
        }
        
        if (-not $scripts[$category]) {
            $scripts[$category] = @()
        }
        $scripts[$category] += $script.Name
    }
    return $scripts
}

# Main execution
Write-Host "🤖 PilotBuddy Dynamic Content Aggregator v1.1" -ForegroundColor Cyan

try {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $metrics = Get-ProjectMetrics
    $scripts = Get-ScriptInventory
    
    # Generate content
    $content = "# PilotBuddy Dynamic Development Assistant v5.0`n`n"
    $content += "**Auto-Generated:** $timestamp UTC`n"
    $content += "**Project:** RankPilot (Studio) - AI-First SEO SaaS Platform`n"
    $content += "**Status:** Phase 4 - Production Readiness with Continuous Evolution`n`n"
    
    $content += "## 📊 Live Project Metrics`n`n"
    $content += "- **Test Files**: $($metrics.TestFiles) Playwright test specifications`n"
    $content += "- **Components**: $($metrics.Components) React/TypeScript components`n"
    $content += "- **Documentation**: $($metrics.DocumentationFiles) markdown files`n"
    $content += "- **Scripts**: $($metrics.Scripts) automation and utility scripts`n`n"
    
    $content += "## 🛠️ Script Inventory`n`n"
    foreach ($category in $scripts.Keys) {
        $content += "### $category Scripts`n"
        foreach ($script in $scripts[$category]) {
            $content += "- ``$script```n"
        }
        $content += "`n"
    }
    
    $content += "## 🧠 Autonomous Learning System`n`n"
    $content += "### Core Patterns Learned`n"
    $content += "1. **ESLint Compatibility**: Fallback configurations for build stability`n"
    $content += "2. **Testing Framework**: Enhanced authentication with graceful error handling`n"
    $content += "3. **Mobile Performance**: 48px touch targets and responsive utilities`n"
    $content += "4. **AI Service Orchestration**: 6-engine coordination with quota management`n"
    $content += "5. **Tier-Based Authentication**: 5-tier system with inheritance patterns`n`n"
    
    $content += "### Decision Framework`n"
    $content += "- **Build Failures**: Apply ESLint fallback configuration`n"
    $content += "- **Test Issues**: Use enhanced authentication utilities`n"
    $content += "- **Mobile Problems**: Activate responsive component patterns`n"
    $content += "- **AI Service Errors**: Implement orchestrator with degradation`n`n"
    
    $content += "---`n`n"
    $content += "**Last Updated:** $timestamp`n"
    $content += "**Auto-Refresh:** Every development session`n"
    $content += "**Memory Persistence:** Continuous learning enabled`n"
    
    # Write to output file
    $content | Out-File -FilePath $OutputPath -Encoding UTF8
    
    Write-Host "✅ Dynamic content generated: $OutputPath" -ForegroundColor Green
    
    # Display summary
    Write-Host "`n📋 Project Summary:" -ForegroundColor Yellow
    Write-Host "   Tests: $($metrics.TestFiles) | Components: $($metrics.Components) | Docs: $($metrics.DocumentationFiles)" -ForegroundColor White
    Write-Host "   Scripts: $($metrics.Scripts)" -ForegroundColor White
    
} catch {
    Write-Error "Failed to generate dynamic content: $($_.Exception.Message)"
    exit 1
}

Write-Host "`n🎯 PilotBuddy is now autonomous and ready for continuous evolution!" -ForegroundColor Green
