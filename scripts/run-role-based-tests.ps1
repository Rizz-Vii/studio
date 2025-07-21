# Enhanced Role-Based Test Runner for RankPilot 
# PowerShell wrapper for Windows execution with database-optimized user management
# Version 2.0 - Updated July 21, 2025

param(
    [ValidateSet("optimized", "comprehensive", "all", "free", "enterprise", "mobile", "cross-browser")]
    [string]$TestType = "optimized",
    [switch]$SkipPrereqs,
    [switch]$Verbose,
    [switch]$DevServer,
    [switch]$Headed
)

function Write-TestHeader {
    param([string]$Title)
    Write-Host ""
    Write-Host "=" * 60 -ForegroundColor Cyan
    Write-Host " $Title" -ForegroundColor Yellow  
    Write-Host "=" * 60 -ForegroundColor Cyan
    Write-Host ""
}

Write-TestHeader "🚀 RankPilot Role-Based Test Runner v2.0"
Write-Host "Database-Optimized with Real User Data" -ForegroundColor Green
Write-Host ""

# Display available test users
Write-Host "📋 Available Test Users:" -ForegroundColor Yellow
Write-Host "  ✅ abbas_ali_rizvi@hotmail.com (Free Tier - Production User)" -ForegroundColor Green
Write-Host "  ✅ admin.user1@test.com (Admin Tier)" -ForegroundColor Green  
Write-Host "  ✅ enterprise.user1@test.com (Enterprise Tier)" -ForegroundColor Green
Write-Host "  ✅ starter.user1@test.com (Starter Tier)" -ForegroundColor Green
Write-Host "  ✅ free.user1@test.com (Free Tier - Test User)" -ForegroundColor Green
Write-Host ""

# Start dev server if requested
if ($DevServer) {
    Write-Host "Starting development server..." -ForegroundColor Yellow
    Start-Process -FilePath "npm" -ArgumentList "run", "dev-no-turbopack" -WindowStyle Minimized
    Write-Host "Waiting for dev server to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
}

# Check if dev server is running
if (-not $SkipPrereqs) {
    Write-Host "Checking prerequisites..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -UseBasicParsing
        Write-Host "Development server is running" -ForegroundColor Green
    }
    catch {
        Write-Host "Development server is not running" -ForegroundColor Red
        Write-Host "Use -DevServer flag to start automatically or run: npm run dev" -ForegroundColor Yellow
        exit 1
    }
}

# Set environment variables
$env:PWDEBUG = if ($Verbose) { "1" } else { "0" }

try {
    $headedFlag = if ($Headed) { " --headed" } else { "" }
    
    switch ($TestType.ToLower()) {
        "optimized" {
            Write-Host "Running Optimized Role-Based Tests..." -ForegroundColor Blue
            npx playwright test --config=playwright.config.roles.ts --project=role-based-optimized$headedFlag
        }
        "comprehensive" {
            Write-Host "Running Comprehensive Role-Based Tests..." -ForegroundColor Blue
            npx playwright test --config=playwright.config.roles.ts --project=role-based-comprehensive$headedFlag
        }
        "free" {
            Write-Host "Running Free Tier Tests only..." -ForegroundColor Blue
            npx playwright test --config=playwright.config.roles.ts --grep="Free Tier"$headedFlag
        }
        "enterprise" {
            Write-Host "Running Enterprise Tier Tests only..." -ForegroundColor Blue
            npx playwright test --config=playwright.config.roles.ts --grep="Enterprise Tier"$headedFlag
        }
        "mobile" {
            Write-Host "Running Mobile Role Tests..." -ForegroundColor Blue
            npx playwright test --config=playwright.config.roles.ts --project=role-mobile-chrome --project=role-mobile-safari$headedFlag
        }
        "cross-browser" {
            Write-Host "Running Cross-Browser Compatibility Tests..." -ForegroundColor Blue
            npx playwright test --config=playwright.config.roles.ts --project=role-firefox --project=role-webkit$headedFlag
        }
        "all" {
            Write-Host "Running complete optimized role-based test suite..." -ForegroundColor Blue
            npx playwright test --config=playwright.config.roles.ts$headedFlag
        }
        default {
            Write-Host "Invalid test type: $TestType" -ForegroundColor Red
            Write-Host "Valid options: optimized, comprehensive, all, free, enterprise, mobile, cross-browser" -ForegroundColor Yellow
            exit 1
        }
    }
    
    Write-Host ""
    Write-Host "Tests completed successfully!" -ForegroundColor Green
    
    # Check for test reports
    $reportPath = "test-results"
    if (Test-Path $reportPath) {
        Write-Host "Test reports available in: $reportPath" -ForegroundColor Cyan
        $htmlReports = Get-ChildItem $reportPath -Filter "*.html" -Recurse | Select-Object -First 1
        if ($htmlReports) {
            Write-Host "Opening HTML report..." -ForegroundColor Cyan
            Start-Process $htmlReports.FullName
        }
    }
}
catch {
    Write-Host "Test execution failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host "✅ Role-based test execution completed" -ForegroundColor Green
Write-Host ""
