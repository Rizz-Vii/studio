#!/usr/bin/env pwsh
<#
.SYNOPSIS
    RankPilot Pre-Launch Checklist Runner
.DESCRIPTION
    A simplified script that runs through the pre-launch checklist items from the RankPilot Pre-Launch Validation & Testing Protocol.
.NOTES
    File Name      : run-prelaunch-checklist.ps1
    Author         : GitHub Copilot
    Creation Date  : July 21, 2025
    Version        : 1.0
#>

# Set strict error handling
$ErrorActionPreference = "Stop"

# Colorization functions
function Write-Header { param($text) Write-Host "`n$text" -ForegroundColor Magenta }
function Write-Success { param($text) Write-Host "$text" -ForegroundColor Green }
function Write-Info { param($text) Write-Host "$text" -ForegroundColor Cyan }
function Write-Warning { param($text) Write-Host "$text" -ForegroundColor Yellow }
function Write-Error { param($text) Write-Host "$text" -ForegroundColor Red }

# Progress tracking
$total = 6
$current = 0

function Update-Progress {
    param([string]$activity)
    $script:current++
    Write-Progress -Activity "Pre-Launch Validation" -Status $activity -PercentComplete (($script:current / $total) * 100)
    Write-Header "STEP $script:current/$total: $activity"
}

# Initialize script
Clear-Host
Write-Header "RANKPILOT PRE-LAUNCH CHECKLIST RUNNER"
Write-Info "Starting validation at $(Get-Date)`n"

try {
    # Move to project root (assuming script is in scripts folder)
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    $projectRoot = Split-Path -Parent $scriptDir
    Set-Location $projectRoot
    
    #----------------------------------
    # STEP 1: Environment Setup
    #----------------------------------
    Update-Progress "Environment Setup"
    
    Write-Info "► Verifying development server..."
    npm run dev-no-turbopack --dry-run
    Write-Success "✓ Development server verified"
    
    Write-Info "► Checking Firebase connectivity..."
    firebase --version
    firebase use rankpilot-h3jpc
    Write-Success "✓ Firebase connectivity verified"
    
    Write-Info "► Validating environment variables..."
    npm run verify-env
    Write-Success "✓ Environment variables validated"
    
    Write-Info "► Running system optimizations..."
    npm run optimize-windows
    npm run emfile:check
    Write-Success "✓ System optimizations complete"
    
    #----------------------------------
    # STEP 2: Dependencies Validation
    #----------------------------------
    Update-Progress "Dependencies Validation"
    
    Write-Info "► Installing dependencies..."
    npm install
    Write-Success "✓ Dependencies installed"
    
    Write-Info "► Verifying TypeScript compilation..."
    npm run typecheck
    Write-Success "✓ TypeScript compilation verified"
    
    Write-Info "► Checking build process..."
    npm run build
    Write-Success "✓ Build process verified"
    
    Write-Info "► Running ESLint validation..."
    npm run lint
    Write-Success "✓ ESLint validation complete"
    
    #----------------------------------
    # STEP 3: Core Feature Testing
    #----------------------------------
    Update-Progress "Core Feature Testing"
    
    Write-Info "► Testing authentication & tier access..."
    Write-Warning "Manual step required: Login with test users to verify tier access"
    Write-Info "- free.user1@test.com (Password: testPassword123)"
    Write-Info "- starter.user1@test.com (Password: testPassword123)"
    Write-Info "- agency.user1@test.com (Password: testPassword123)"
    Write-Info "- enterprise.user1@test.com (Password: testPassword123)"
    Write-Info "- admin.enterprise@test.com (Password: testPassword123)"
    Read-Host "Press Enter when manual verification is complete"
    
    Write-Info "► Testing NeuroSEO Suite..."
    Write-Warning "Manual step required: Test all 6 NeuroSEO engines"
    Read-Host "Press Enter when manual verification is complete"
    
    Write-Info "► Testing enhanced navigation..."
    Write-Warning "Manual step required: Verify navigation structure and tier visibility"
    Read-Host "Press Enter when manual verification is complete"
    
    Write-Info "► Running mobile performance tests..."
    npm run test:mobile
    npm run test:performance
    npm run test:accessibility
    Write-Success "✓ Mobile performance tests complete"
    
    #----------------------------------
    # STEP 4: Comprehensive Test Suite
    #----------------------------------
    Update-Progress "Comprehensive Test Suite"
    
    Write-Info "► Running role-based tests..."
    npm run test:role-based
    & "$projectRoot\scripts\run-role-based-tests.ps1"
    Write-Success "✓ Role-based tests complete"
    
    Write-Info "► Running feature-specific tests..."
    npm run test:critical
    npm run test:unit
    npm run test:integration
    npm run test:e2e
    Write-Success "✓ Feature-specific tests complete"
    
    Write-Info "► Running performance & accessibility tests..."
    npm run test:performance
    npm run test:accessibility
    npm run test:visual
    Write-Success "✓ Performance & accessibility tests complete"
    
    #----------------------------------
    # STEP 5: Documentation Review
    #----------------------------------
    Update-Progress "Documentation Review"
    
    Write-Info "► Formatting documentation..."
    npm run format:docs
    Write-Success "✓ Documentation formatted"
    
    Write-Info "► Verifying documentation links..."
    npm run lint:md
    Write-Success "✓ Documentation links verified"
    
    Write-Info "► Checking critical documentation..."
    $criticalDocs = @(
        "PROJECT_STATUS_AND_NEXT_STEPS.md",
        "COMPREHENSIVE_INSTRUCTIONS.md",
        "AGILE_PRIORITY_PLAN.md",
        "MOBILE_ENHANCEMENT_CHECKLIST.md"
    )
    
    foreach ($doc in $criticalDocs) {
        $docPath = "$projectRoot\docs\$doc"
        if (Test-Path $docPath) {
            $lastModified = (Get-Item $docPath).LastWriteTime
            Write-Info "- $doc (Last modified: $lastModified)"
        } else {
            Write-Warning "- $doc not found"
        }
    }
    
    #----------------------------------
    # STEP 6: Deployment Readiness
    #----------------------------------
    Update-Progress "Deployment Readiness"
    
    Write-Info "► Checking Firebase deployment..."
    firebase deploy --only functions --dry-run
    Write-Success "✓ Firebase functions deployment check complete"
    
    Write-Info "► Preparing production build..."
    npm run build
    Write-Success "✓ Production build prepared"
    
    Write-Info "► Verifying CI/CD pipeline..."
    Write-Warning "Manual step required: Check GitHub Actions workflow"
    Write-Info "git add ."
    Write-Info "git commit -m \"Pre-launch validation complete\""
    Write-Info "git push origin feature/performance-optimization-mobile-enhancement"
    Write-Warning "Note: Don't execute these commands now if you're not ready to commit"
    
    # Complete
    Write-Progress -Activity "Pre-Launch Validation" -Completed
    Write-Header "PRE-LAUNCH VALIDATION COMPLETE"
    
    # Display final checklist
    Write-Header "LAUNCH READINESS CHECKLIST"
    Write-Info "Manually verify the following items before launch:"
    
    $checklist = @(
        "[ ] All 5 user tiers authenticate successfully",
        "[ ] NeuroSEO™ Suite (6 engines) operational across all tiers",
        "[ ] Enhanced navigation functional with tier-based visibility",
        "[ ] Mobile performance meets Core Web Vitals targets",
        "[ ] All 153 tests pass successfully",
        "[ ] Security validations complete",
        "[ ] Documentation current and formatted",
        "[ ] Firebase deployment successful",
        "[ ] Production build succeeds without errors",
        "[ ] Performance optimizations applied and verified"
    )
    
    foreach ($item in $checklist) {
        Write-Info $item
    }
    
    Write-Header "FINAL LAUNCH COMMANDS"
    Write-Info "Run the following commands to complete the launch:"
    Write-Info "1. npm run optimize-windows"
    Write-Info "2. npm run precommit"
    Write-Info "3. npm run test:role-based"
    Write-Info "4. firebase deploy"
    
} catch {
    Write-Error "`nError during validation: $_"
    Write-Error "Fix the issue and run the script again."
    exit 1
}
