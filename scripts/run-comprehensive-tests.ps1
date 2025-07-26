#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Comprehensive Test Suite Runner for RankPilot
    
.DESCRIPTION
    Executes complete test coverage across all 128+ pages and features
    Includes authentication, mobile, visual, API, accessibility, performance, and feature tests
    
.PARAMETER Suite
    Which test suite to run (all, auth, mobile, visual, api, accessibility, performance, features, e2e, critical)
    
.PARAMETER Tier
    Which subscription tier to test (free, starter, agency, enterprise, admin, all)
    
.PARAMETER Parallel
    Whether to run tests in parallel (default: true)
    
.PARAMETER Headed
    Whether to run tests in headed mode for debugging (default: false)
    
.PARAMETER Production
    Whether to test against production URL (default: false)
    
.EXAMPLE
    .\run-comprehensive-tests.ps1 -Suite all
    
.EXAMPLE
    .\run-comprehensive-tests.ps1 -Suite features -Tier agency
    
.EXAMPLE
    .\run-comprehensive-tests.ps1 -Suite critical -Headed
#>

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("all", "auth", "mobile", "visual", "api", "accessibility", "performance", "features", "e2e", "critical")]
    [string]$Suite = "all",
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("free", "starter", "agency", "enterprise", "admin", "all")]
    [string]$Tier = "all",
    
    [Parameter(Mandatory=$false)]
    [bool]$Parallel = $true,
    
    [Parameter(Mandatory=$false)]
    [bool]$Headed = $false,
    
    [Parameter(Mandatory=$false)]
    [bool]$Production = $false
)

# Colors for output
$Green = "`e[32m"
$Red = "`e[31m"
$Yellow = "`e[33m"
$Blue = "`e[34m"
$Reset = "`e[0m"

function Write-ColorOutput {
    param([string]$Message, [string]$Color)
    Write-Host "$Color$Message$Reset"
}

function Write-TestHeader {
    param([string]$Title)
    Write-Host ""
    Write-ColorOutput "=" * 60 $Blue
    Write-ColorOutput "  $Title" $Blue
    Write-ColorOutput "=" * 60 $Blue
    Write-Host ""
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput "✅ $Message" $Green
}

function Write-Warning {
    param([string]$Message)
    Write-ColorOutput "⚠️  $Message" $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-ColorOutput "❌ $Message" $Red
}

# Test execution statistics
$global:TestStats = @{
    Total = 0
    Passed = 0
    Failed = 0
    Skipped = 0
    StartTime = Get-Date
}

function Execute-TestSuite {
    param(
        [string]$TestName,
        [string]$TestCommand,
        [bool]$Required = $true
    )
    
    Write-TestHeader "Running $TestName Tests"
    Write-Host "Command: $TestCommand"
    Write-Host ""
    
    $startTime = Get-Date
    
    try {
        Invoke-Expression $TestCommand
        $exitCode = $LASTEXITCODE
        
        $duration = (Get-Date) - $startTime
        
        if ($exitCode -eq 0) {
            Write-Success "$TestName tests completed successfully in $($duration.TotalSeconds.ToString('F1'))s"
            $global:TestStats.Passed++
        } else {
            if ($Required) {
                Write-Error "$TestName tests failed with exit code $exitCode after $($duration.TotalSeconds.ToString('F1'))s"
                $global:TestStats.Failed++
                throw "Critical test suite failed: $TestName"
            } else {
                Write-Warning "$TestName tests failed with exit code $exitCode after $($duration.TotalSeconds.ToString('F1'))s (non-critical)"
                $global:TestStats.Failed++
            }
        }
    } catch {
        $duration = (Get-Date) - $startTime
        Write-Error "Error executing $TestName tests: $($_.Exception.Message)"
        $global:TestStats.Failed++
        
        if ($Required) {
            throw
        }
    }
    
    $global:TestStats.Total++
    Write-Host ""
}

function Get-BaseTestCommand {
    $baseCmd = "cross-env NODE_OPTIONS='--max-old-space-size=2048' playwright test --config=testing/configs/test.config.ts"
    
    if (-not $Parallel) {
        $baseCmd += " --workers=1"
    }
    
    if ($Headed) {
        $baseCmd += " --headed"
    }
    
    if ($Production) {
        $baseCmd = "cross-env NODE_OPTIONS='--max-old-space-size=2048' TEST_BASE_URL=https://rankpilot-h3jpc.web.app playwright test --config=testing/configs/test.config.ts"
    }
    
    return $baseCmd
}

# Main execution
try {
    Write-TestHeader "RankPilot Comprehensive Test Suite Runner"
    Write-Host "Suite: $Suite"
    Write-Host "Tier: $Tier"
    Write-Host "Parallel: $Parallel"
    Write-Host "Headed: $Headed"
    Write-Host "Production: $Production"
    Write-Host "Start Time: $($global:TestStats.StartTime)"
    
    $baseCmd = Get-BaseTestCommand
    
    # Check if dev server is running
    Write-Host ""
    Write-ColorOutput "Checking development server status..." $Blue
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method Head -TimeoutSec 5 -ErrorAction Stop
        Write-Success "Development server is running"
    } catch {
        if (-not $Production) {
            Write-Warning "Development server not detected. Starting..."
            Start-Process -FilePath "npm" -ArgumentList "run", "dev-no-turbopack" -NoNewWindow -PassThru
            Write-Host "Waiting 10 seconds for server to start..."
            Start-Sleep -Seconds 10
        }
    }
    
    # Execute test suites based on selection
    switch ($Suite) {
        "all" {
            Write-TestHeader "Executing Complete Test Suite (All 8 Categories)"
            
            # Critical foundation tests first
            Execute-TestSuite "Authentication" "$baseCmd testing/specs/main/auth-consolidated.spec.ts" $true
            Execute-TestSuite "Performance" "$baseCmd testing/specs/main/performance.spec.ts" $true
            Execute-TestSuite "Accessibility" "$baseCmd testing/specs/main/accessibility.spec.ts" $true
            
            # Feature tests
            Execute-TestSuite "Team Projects" "$baseCmd testing/specs/main/features/team-projects.spec.ts" $true
            Execute-TestSuite "Team Reports" "$baseCmd testing/specs/main/features/team-reports.spec.ts" $true
            Execute-TestSuite "Team Chat" "$baseCmd testing/specs/main/features/team-chat.spec.ts" $true
            Execute-TestSuite "Content Analyzer" "$baseCmd testing/specs/main/features/content-analyzer.spec.ts" $true
            Execute-TestSuite "Keyword Tool" "$baseCmd testing/specs/main/features/keyword-tool.spec.ts" $true
            
            # UI and integration tests
            Execute-TestSuite "Mobile Navigation" "$baseCmd testing/specs/main/mobile-nav-consolidated.spec.ts" $false
            Execute-TestSuite "Visual Regression" "$baseCmd testing/specs/main/visual-regression.spec.ts" $false
            Execute-TestSuite "API Contracts" "$baseCmd testing/specs/main/api-contracts.spec.ts" $false
            Execute-TestSuite "End-to-End" "$baseCmd testing/specs/main/public-pages-e2e.spec.ts" $false
        }
        
        "critical" {
            Write-TestHeader "Executing Critical Test Suite"
            Execute-TestSuite "Authentication" "$baseCmd testing/specs/main/auth-consolidated.spec.ts" $true
            Execute-TestSuite "Performance" "$baseCmd testing/specs/main/performance.spec.ts" $true
            Execute-TestSuite "Accessibility" "$baseCmd testing/specs/main/accessibility.spec.ts" $true
        }
        
        "features" {
            Write-TestHeader "Executing Feature Test Suite"
            Execute-TestSuite "Team Projects" "$baseCmd testing/specs/main/features/team-projects.spec.ts" $true
            Execute-TestSuite "Team Reports" "$baseCmd testing/specs/main/features/team-reports.spec.ts" $true
            Execute-TestSuite "Team Chat" "$baseCmd testing/specs/main/features/team-chat.spec.ts" $true
            Execute-TestSuite "Content Analyzer" "$baseCmd testing/specs/main/features/content-analyzer.spec.ts" $true
            Execute-TestSuite "Keyword Tool" "$baseCmd testing/specs/main/features/keyword-tool.spec.ts" $true
        }
        
        "auth" {
            Execute-TestSuite "Authentication" "$baseCmd testing/specs/main/auth-consolidated.spec.ts" $true
        }
        
        "mobile" {
            Execute-TestSuite "Mobile Navigation" "$baseCmd testing/specs/main/mobile-nav-consolidated.spec.ts" $true
        }
        
        "visual" {
            Execute-TestSuite "Visual Regression" "$baseCmd testing/specs/main/visual-regression.spec.ts" $true
        }
        
        "api" {
            Execute-TestSuite "API Contracts" "$baseCmd testing/specs/main/api-contracts.spec.ts" $true
        }
        
        "accessibility" {
            Execute-TestSuite "Accessibility" "$baseCmd testing/specs/main/accessibility.spec.ts" $true
        }
        
        "performance" {
            Execute-TestSuite "Performance" "$baseCmd testing/specs/main/performance.spec.ts" $true
        }
        
        "e2e" {
            Execute-TestSuite "End-to-End" "$baseCmd testing/specs/main/public-pages-e2e.spec.ts" $true
        }
    }
    
    # Final statistics
    $totalDuration = (Get-Date) - $global:TestStats.StartTime
    
    Write-TestHeader "Test Execution Summary"
    Write-Host "Total Test Suites: $($global:TestStats.Total)"
    Write-Success "Passed: $($global:TestStats.Passed)"
    
    if ($global:TestStats.Failed -gt 0) {
        Write-Error "Failed: $($global:TestStats.Failed)"
    } else {
        Write-Host "Failed: 0"
    }
    
    Write-Host "Duration: $($totalDuration.TotalMinutes.ToString('F1')) minutes"
    Write-Host "Success Rate: $(($global:TestStats.Passed / $global:TestStats.Total * 100).ToString('F1'))%"
    
    if ($global:TestStats.Failed -eq 0) {
        Write-Success "🎉 All test suites completed successfully!"
        exit 0
    } else {
        Write-Warning "⚠️  Some test suites failed. Check logs above for details."
        exit 1
    }
    
} catch {
    Write-Error "Test execution failed: $($_.Exception.Message)"
    Write-Host $_.ScriptStackTrace
    exit 1
}
