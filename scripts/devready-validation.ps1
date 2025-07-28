#!/usr/bin/env pwsh
# DevReady Validation Script - Autonomous Excellence Mode
# Validates MCP Server Integration, Systematic Debugging, and Mobile Performance

param(
    [string]$Priority = "all",
    [switch]$DryRun = $false,
    [switch]$Detailed = $false
)

Write-Host "🚀 DevReady Validation - Autonomous Excellence Mode" -ForegroundColor Green
Write-Host "Priority: $Priority | DryRun: $DryRun | Detailed: $Detailed" -ForegroundColor Cyan

# Priority 1: Website Functionality & UX Review
function Test-Priority1 {
    Write-Host "`n🥇 PRIORITY 1 — WEBSITE FUNCTIONALITY & UX REVIEW" -ForegroundColor Yellow
    
    # Core Web Vitals Check
    $lighthouseConfig = Test-Path "lighthouse.config.js"
    Write-Host "📊 Core Web Vitals Config: $(if ($lighthouseConfig) { '✅' } else { '❌' })" -ForegroundColor $(if ($lighthouseConfig) { 'Green' } else { 'Red' })
    
    # Mobile Performance Check
    $mobileUtils = Test-Path "src/lib/mobile-responsive-utils.ts"
    Write-Host "📱 Mobile Performance Utils: $(if ($mobileUtils) { '✅' } else { '❌' })" -ForegroundColor $(if ($mobileUtils) { 'Green' } else { 'Red' })
    
    # Touch Target Validation
    $touchTargets = Select-String -Path "src/**/*.tsx" -Pattern "min-h-\[48px\]|min-w-\[48px\]" -ErrorAction SilentlyContinue
    Write-Host "🎯 48px Touch Targets: $(if ($touchTargets.Count -gt 0) { '✅' } else { '⚠️' })" -ForegroundColor $(if ($touchTargets.Count -gt 0) { 'Green' } else { 'Yellow' })
    
    return @{
        CoreWebVitals = $lighthouseConfig
        MobileUtils = $mobileUtils
        TouchTargets = ($touchTargets.Count -gt 0)
    }
}

# Priority 2: Phase 2 Execution Plan
function Test-Priority2 {
    Write-Host "`n🥈 PRIORITY 2 — PHASE 2 EXECUTION PLAN" -ForegroundColor Yellow
    
    # Enhanced NeuroSEO Orchestrator
    $orchestrator = Test-Path "src/lib/ai/enhanced-neuroseo-orchestrator.ts"
    Write-Host "🧠 Enhanced NeuroSEO Orchestrator: $(if ($orchestrator) { '✅' } else { '❌' })" -ForegroundColor $(if ($orchestrator) { 'Green' } else { 'Red' })
    
    # Firestore Rules
    $firestoreRules = Test-Path "firestore.rules"
    Write-Host "🔐 Firestore Rules: $(if ($firestoreRules) { '✅' } else { '❌' })" -ForegroundColor $(if ($firestoreRules) { 'Green' } else { 'Red' })
    
    # CI/CD Configuration
    $githubActions = Test-Path ".github/workflows"
    Write-Host "🚀 CI/CD Configuration: $(if ($githubActions) { '✅' } else { '❌' })" -ForegroundColor $(if ($githubActions) { 'Green' } else { 'Red' })
    
    return @{
        Orchestrator = $orchestrator
        FirestoreRules = $firestoreRules
        CICD = $githubActions
    }
}

# Priority 3: Engineering Excellence
function Test-Priority3 {
    Write-Host "`n🥉 PRIORITY 3 — ENGINEERING EXCELLENCE" -ForegroundColor Yellow
    
    # MCP Server Integration Validation
    Write-Host "🤖 MCP Server Integration Validation:" -ForegroundColor Cyan
    
    # Check for MCP server usage in package.json
    $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
    $mcpServers = @("@modelcontextprotocol/server-firecrawl", "@modelcontextprotocol/server-sentry", "@modelcontextprotocol/server-huggingface")
    
    foreach ($server in $mcpServers) {
        $installed = $packageJson.dependencies.$server -or $packageJson.devDependencies.$server
        Write-Host "  $server: $(if ($installed) { '✅' } else { '❌' })" -ForegroundColor $(if ($installed) { 'Green' } else { 'Red' })
    }
    
    # Systematic Debugging Framework
    Write-Host "`n🔍 Systematic Debugging Framework:" -ForegroundColor Cyan
    $debuggingFramework = Test-Path "src/lib/debugging/systematic-debugger.ts"
    Write-Host "  Debugging Framework: $(if ($debuggingFramework) { '✅' } else { '❌' })" -ForegroundColor $(if ($debuggingFramework) { 'Green' } else { 'Red' })
    
    # Pattern Recognition Engine
    $patternDatabase = Test-Path "docs/patterns/debugging-patterns.json"
    Write-Host "  Pattern Database: $(if ($patternDatabase) { '✅' } else { '❌' })" -ForegroundColor $(if ($patternDatabase) { 'Green' } else { 'Red' })
    
    # Testing Framework
    $testingFramework = Test-Path "testing/utils/test-orchestrator.ts"
    Write-Host "  Test Orchestrator: $(if ($testingFramework) { '✅' } else { '❌' })" -ForegroundColor $(if ($testingFramework) { 'Green' } else { 'Red' })
    
    return @{
        MCPServers = ($mcpServers | ForEach-Object { $packageJson.dependencies.$_ -or $packageJson.devDependencies.$_ }).Count
        DebuggingFramework = $debuggingFramework
        PatternDatabase = $patternDatabase
        TestingFramework = $testingFramework
    }
}

# Execute validation based on priority
$results = @{}

switch ($Priority.ToLower()) {
    "1" { $results.Priority1 = Test-Priority1 }
    "2" { $results.Priority2 = Test-Priority2 }
    "3" { $results.Priority3 = Test-Priority3 }
    "all" {
        $results.Priority1 = Test-Priority1
        $results.Priority2 = Test-Priority2
        $results.Priority3 = Test-Priority3
    }
    default { Write-Host "Invalid priority. Use: 1, 2, 3, or all" -ForegroundColor Red; exit 1 }
}

# Generate DevReady Compliance Score
Write-Host "`n📊 DevReady Compliance Score:" -ForegroundColor Green

$totalChecks = 0
$passedChecks = 0

if ($results.Priority1) {
    $totalChecks += 3
    $passedChecks += ($results.Priority1.CoreWebVitals + $results.Priority1.MobileUtils + $results.Priority1.TouchTargets)
}

if ($results.Priority2) {
    $totalChecks += 3
    $passedChecks += ($results.Priority2.Orchestrator + $results.Priority2.FirestoreRules + $results.Priority2.CICD)
}

if ($results.Priority3) {
    $totalChecks += 4
    $passedChecks += ([math]::Min($results.Priority3.MCPServers, 3) + $results.Priority3.DebuggingFramework + $results.Priority3.PatternDatabase + $results.Priority3.TestingFramework)
}

$complianceScore = [math]::Round(($passedChecks / $totalChecks) * 100, 1)
Write-Host "Overall Compliance: $complianceScore% ($passedChecks/$totalChecks)" -ForegroundColor $(if ($complianceScore -ge 90) { 'Green' } elseif ($complianceScore -ge 75) { 'Yellow' } else { 'Red' })

# Recommendations
Write-Host "`n🧠 DevReady Enhancement Recommendations:" -ForegroundColor Magenta

if ($complianceScore -lt 100) {
    Write-Host "• Run 'npm run dev-no-turbopack' to validate live functionality" -ForegroundColor White
    Write-Host "• Execute 'npm run test:role-based' for comprehensive testing" -ForegroundColor White
    Write-Host "• Use 'npm run optimize-windows' for performance optimization" -ForegroundColor White
    
    if ($results.Priority3 -and -not $results.Priority3.DebuggingFramework) {
        Write-Host "• Implement systematic debugging framework in src/lib/debugging/" -ForegroundColor Yellow
    }
    
    if ($results.Priority3 -and $results.Priority3.MCPServers -lt 3) {
        Write-Host "• Install missing MCP servers for enhanced AI capabilities" -ForegroundColor Yellow
    }
}

Write-Host "`n✅ DevReady Validation Complete - Autonomous Excellence Mode" -ForegroundColor Green
