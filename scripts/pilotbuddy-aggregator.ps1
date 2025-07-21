#!/usr/bin/env pwsh
# PilotBuddy Dynamic Content Aggregator
# Auto-generates comprehensive development context from project files
# Version 1.0 - July 22, 2025

param(
    [switch]$Verbose,
    [switch]$UpdateInstructions,
    [string]$OutputPath = ".github/pilotbuddy-dynamic.md"
)

function Write-Section {
    param([string]$Title, [string]$Content)
    if ($Verbose) { Write-Host "Processing: $Title" -ForegroundColor Yellow }
    return "`n### $Title`n`n$Content`n"
}

function Get-ProjectMetrics {
    $metrics = @{}
    
    # Count various project components
    $metrics.TestFiles = (Get-ChildItem tests -Recurse -Filter "*.spec.ts" -ErrorAction SilentlyContinue | Measure-Object).Count
    $metrics.Components = (Get-ChildItem src/components -Recurse -Filter "*.tsx" -ErrorAction SilentlyContinue | Measure-Object).Count
    $metrics.DocumentationFiles = (Get-ChildItem docs -Recurse -Filter "*.md" -ErrorAction SilentlyContinue | Measure-Object).Count
    $metrics.Scripts = (Get-ChildItem scripts -Recurse -Filter "*.{js,ps1,sh}" -ErrorAction SilentlyContinue | Measure-Object).Count
    $metrics.ConfigFiles = (Get-ChildItem . -Filter "*.config.*" -ErrorAction SilentlyContinue | Measure-Object).Count
    
    return $metrics
}

function Get-RecentIssues {
    $issues = @()
    
    # Scan status files for recent issues
    $statusFiles = Get-ChildItem docs/status -Filter "*.md" -ErrorAction SilentlyContinue
    foreach ($file in $statusFiles) {
        $content = Get-Content $file.FullName -ErrorAction SilentlyContinue
        $problemLines = $content | Select-String -Pattern "Problem|Issue|Error|Fix" | Select-Object -First 3
        foreach ($line in $problemLines) {
            $issues += "$($file.BaseName): $($line.Line.Trim())"
        }
    }
    
    return $issues | Select-Object -First 10
}

function Get-SolutionPatterns {
    $patterns = @()
    
    # Extract solution patterns from key files
    $keyFiles = @(
        "docs/ESLINT_BUILD_ERROR_RESOLUTION.md",
        "docs/TESTING_STATUS_REPORT.md",
        "docs/COMPREHENSIVE_INSTRUCTIONS.md"
    )
    
    foreach ($file in $keyFiles) {
        if (Test-Path $file) {
            $content = Get-Content $file -ErrorAction SilentlyContinue
            $solutionLines = $content | Select-String -Pattern "Solution|Fix|Pattern|Strategy" | Select-Object -First 5
            foreach ($line in $solutionLines) {
                $patterns += "$([System.IO.Path]::GetFileNameWithoutExtension($file)): $($line.Line.Trim())"
            }
        }
    }
    
    return $patterns | Select-Object -First 15
}

function Get-ScriptInventory {
    $scripts = @{}
    
    # Categorize scripts by function
    $scriptFiles = Get-ChildItem scripts -Filter "*.{js,ps1,sh}" -ErrorAction SilentlyContinue
    
    foreach ($script in $scriptFiles) {
        $category = switch -Regex ($script.Name) {
            "test" { "Testing" }
            "build" { "Build" }
            "fix" { "Fixes" }
            "validate" { "Validation" }
            "run" { "Execution" }
            default { "Utilities" }
        }
        
        if (-not $scripts[$category]) {
            $scripts[$category] = @()
        }
        $scripts[$category] += $script.Name
    }
    
    return $scripts
}

function Get-ConfigurationFiles {
    $configs = @()
    
    # Key configuration files
    $configPatterns = @(
        "*.config.*",
        "package.json",
        "tsconfig*.json",
        "playwright.config.*",
        "eslint.config.*"
    )
    
    foreach ($pattern in $configPatterns) {
        $files = Get-ChildItem . -Filter $pattern -ErrorAction SilentlyContinue
        foreach ($file in $files) {
            # Get file size and last modified
            $size = [math]::Round($file.Length / 1KB, 2)
            $modified = $file.LastWriteTime.ToString("yyyy-MM-dd HH:mm")
            $configs += "- ``$($file.Name)`` - ${size}KB (Modified: $modified)"
        }
    }
    
    return $configs
}

function Get-TestingArchitecture {
    $architecture = @()
    
    # Analyze testing structure
    if (Test-Path "testing/utils") {
        $testUtils = Get-ChildItem testing/utils -Filter "*.ts" -ErrorAction SilentlyContinue
        foreach ($util in $testUtils) {
            $lines = (Get-Content $util.FullName -ErrorAction SilentlyContinue | Measure-Object -Line).Lines
            $architecture += "- ``$($util.Name)`` - $lines lines of testing utilities"
        }
    }
    
    # Count test files by type
    if (Test-Path "tests") {
        $testTypes = @{}
        $testFiles = Get-ChildItem tests -Recurse -Filter "*.spec.ts" -ErrorAction SilentlyContinue
        foreach ($test in $testFiles) {
            $type = if ($test.Directory.Name -eq "tests") { "Root" } else { $test.Directory.Name }
            if (-not $testTypes[$type]) { $testTypes[$type] = 0 }
            $testTypes[$type]++
        }
        
        foreach ($type in $testTypes.Keys) {
            $architecture += "- **$type Tests**: $($testTypes[$type]) files"
        }
    }
    
    return $architecture
}

function Generate-DynamicContent {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $metrics = Get-ProjectMetrics
    $issues = Get-RecentIssues
    $solutions = Get-SolutionPatterns
    $scripts = Get-ScriptInventory
    $configs = Get-ConfigurationFiles
    $testing = Get-TestingArchitecture
    
    $content = @"
# PilotBuddy Dynamic Development Assistant v5.0

**Auto-Generated:** $timestamp UTC  
**Project:** RankPilot (Studio) - AI-First SEO SaaS Platform  
**Status:** Phase 4 - Production Readiness with Continuous Evolution  

## 📊 Live Project Metrics

### Current State
- **Test Files**: $($metrics.TestFiles) Playwright test specifications
- **Components**: $($metrics.Components) React/TypeScript components  
- **Documentation**: $($metrics.DocumentationFiles) markdown files
- **Scripts**: $($metrics.Scripts) automation and utility scripts
- **Config Files**: $($metrics.ConfigFiles) configuration files

### Testing Architecture
$($testing -join "`n")

### Configuration Files Status
$($configs -join "`n")

## 🔍 Recent Issue Patterns

### Active Issues (Auto-Extracted)
$($issues | ForEach-Object { "- $_" } | Out-String)

### Applied Solutions (Pattern Library)
$($solutions | ForEach-Object { "- $_" } | Out-String)

## 🛠️ Script Inventory

"@

    # Add script categories
    foreach ($category in $scripts.Keys) {
        $content += "`n### $category Scripts`n"
        foreach ($script in $scripts[$category]) {
            $content += "- ``$script```n"
        }
    }

    $content += @"

## 🧠 Pattern Recognition System

### Known Issue Categories
1. **Build System**: ESLint compatibility, TypeScript configuration
2. **Testing Framework**: Authentication patterns, mobile optimization
3. **Mobile Performance**: Touch targets, responsive design, WCAG compliance
4. **AI Services**: NeuroSEO™ orchestration, quota management
5. **Authentication**: 5-tier system complexity, dev mode fallbacks

### Solution Templates
1. **Graceful Fallbacks**: Always implement backup configurations
2. **Retry Mechanisms**: 3-attempt patterns with progressive backoff  
3. **Mobile-First**: 48px touch targets, progressive enhancement
4. **Tier-Based Access**: Inheritance patterns with clear fallbacks
5. **Service Orchestration**: AI service coordination with degradation

### Evolution Indicators
- **Build Success Rate**: Monitor npm run build consistency
- **Test Stability**: Track Playwright test pass rates
- **Mobile Performance**: Core Web Vitals compliance
- **AI Service Uptime**: NeuroSEO™ suite availability
- **Developer Experience**: Time to resolution metrics

## 🚀 Autonomous Recommendations

### Immediate Actions (AI-Prioritized)
1. Monitor ESLint v9.x compatibility matrix
2. Enhance mobile performance testing coverage
3. Implement AI service response caching
4. Expand visual regression test suite
5. Optimize Windows filesystem performance

### Framework Evolution Triggers
- **New Dependencies**: Compatibility analysis required
- **Mobile Issues**: Activate responsive utility patterns
- **Build Failures**: Apply graceful fallback configurations
- **Test Instability**: Enhance orchestration patterns
- **Performance Degradation**: Mobile-first optimization

---

**Last Updated:** $timestamp  
**Auto-Refresh:** Every development session  
**Memory Persistence:** Continuous learning enabled  
**Growth Model:** Pattern recognition with autonomous improvement
"@

    return $content
}

# Main execution
Write-Host "🤖 PilotBuddy Dynamic Content Aggregator" -ForegroundColor Cyan
Write-Host "Analyzing project state and generating insights..." -ForegroundColor Yellow

try {
    $dynamicContent = Generate-DynamicContent
    
    # Write to output file
    $dynamicContent | Out-File -FilePath $OutputPath -Encoding UTF8
    
    Write-Host "✅ Dynamic content generated: $OutputPath" -ForegroundColor Green
    
    if ($UpdateInstructions) {
        # Update the main copilot instructions
        $instructionsPath = ".github/copilot-instructions.md"
        if (Test-Path $instructionsPath) {
            $existingContent = Get-Content $instructionsPath -Raw
            $updatedContent = $existingContent + "`n`n## Auto-Generated Project Context`n`n" + $dynamicContent
            $updatedContent | Out-File -FilePath $instructionsPath -Encoding UTF8
            Write-Host "✅ Updated copilot instructions with dynamic content" -ForegroundColor Green
        }
    }
    
    # Display summary
    $metrics = Get-ProjectMetrics
    Write-Host "`n📋 Project Summary:" -ForegroundColor Yellow
    Write-Host "   Tests: $($metrics.TestFiles) | Components: $($metrics.Components) | Docs: $($metrics.DocumentationFiles)" -ForegroundColor White
    Write-Host "   Scripts: $($metrics.Scripts) | Configs: $($metrics.ConfigFiles)" -ForegroundColor White
    
} catch {
    Write-Error "Failed to generate dynamic content: $($_.Exception.Message)"
    exit 1
}

Write-Host "`n🎯 PilotBuddy is now autonomous and ready for continuous evolution!" -ForegroundColor Green
