#!/usr/bin/env pwsh
<#
.SYNOPSIS
    RankPilot Pre-Launch Process Automation
.DESCRIPTION
    Executes the RankPilot pre-launch process as outlined in the Pre-Launch Validation & Testing Protocol.
    This script guides you through the entire pre-launch process, providing interactive prompts and automating
    commands where possible.
.NOTES
    File Name      : execute-prelaunch.ps1
    Author         : GitHub Copilot
    Creation Date  : July 21, 2025
    Version        : 1.0
.EXAMPLE
    ./execute-prelaunch.ps1
    Runs the entire pre-launch process interactively.
.EXAMPLE
    ./execute-prelaunch.ps1 -skipTests
    Runs the pre-launch process but skips the automated test suite.
#>

param(
    [switch]$skipChecks,
    [switch]$skipTests,
    [switch]$skipBuild,
    [switch]$deployOnly,
    [switch]$checklistOnly
)

# Script setup
$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
$logFile = "$scriptDir\prelaunch-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"

# Define color codes for better readability
$colors = @{
    Success = "Green"
    Warning = "Yellow"
    Error = "Red"
    Info = "Cyan"
    Heading = "Magenta"
    Command = "Blue"
}

# Logging function
function Write-Log {
    param(
        [string]$message,
        [string]$color = "White",
        [switch]$noLog,
        [switch]$noNewLine
    )
    
    # Write to console
    if ($noNewLine) {
        Write-Host $message -ForegroundColor $color -NoNewline
    } else {
        Write-Host $message -ForegroundColor $color
    }
    
    # Write to log file
    if (-not $noLog) {
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        "$timestamp - $message" | Out-File -Append -FilePath $logFile
    }
}

# Command execution function with logging
function Invoke-LoggedCommand {
    param(
        [string]$command,
        [string]$description,
        [switch]$continueOnError
    )
    
    Write-Log "► $description..." $colors.Info -noNewLine
    Write-Log "  Command: $command" $colors.Command
    
    try {
        $output = Invoke-Expression $command 2>&1
        $success = $?
        
        # Log output
        $output | Out-File -Append -FilePath $logFile
        
        if ($success) {
            Write-Log "✓ Success" $colors.Success
            return $true
        } else {
            Write-Log "✗ Failed" $colors.Error
            
            if (-not $continueOnError) {
                Write-Log "Command failed: $command" $colors.Error
                Write-Log "Error output: $output" $colors.Error
                exit 1
            }
            return $false
        }
    }
    catch {
        Write-Log "✗ Failed with exception" $colors.Error
        Write-Log "Command failed: $command" $colors.Error
        Write-Log "Exception: $_" $colors.Error
        
        if (-not $continueOnError) {
            exit 1
        }
        return $false
    }
}

function Invoke-ManualStep {
    param(
        [string]$description,
        [string]$instructions,
        [switch]$required
    )
    
    Write-Log "`n► $description" $colors.Heading
    Write-Log $instructions $colors.Info
    
    if ($required) {
        Read-Host "Press Enter when completed (required step)" | Out-Null
        Write-Log "✓ Manual step completed: $description" $colors.Success
        return $true
    } else {
        $response = Read-Host "Press Enter when completed or type 'skip' to skip this step"
        if ($response -eq "skip") {
            Write-Log "⚠ Manual step skipped: $description" $colors.Warning
            return $false
        } else {
            Write-Log "✓ Manual step completed: $description" $colors.Success
            return $true
        }
    }
}

function Show-Separator {
    param([string]$title)
    
    $separator = "=" * 80
    Write-Log "`n$separator" $colors.Heading -noLog
    Write-Log "  $title" $colors.Heading
    Write-Log "$separator" $colors.Heading -noLog
}

function Step-EnvironmentSetup {
    Show-Separator "1. ENVIRONMENT SETUP"
    
    # Skip checks if requested
    if ($skipChecks) {
        Write-Log "Skipping environment checks as requested" $colors.Warning
        return
    }
    
    # 1. Verify development server command exists
    Invoke-LoggedCommand "npm run dev-no-turbopack --dry-run" "Verifying development server command"
    
    # 2. Check Firebase CLI
    Invoke-LoggedCommand "firebase --version" "Checking Firebase CLI"
    Invoke-LoggedCommand "firebase use rankpilot-h3jpc" "Setting Firebase project"
    
    # 3. Validate environment variables
    Invoke-LoggedCommand "npm run verify-env" "Validating environment variables" -continueOnError
    
    # 4. Run system optimizations
    Invoke-LoggedCommand "npm run optimize-windows" "Running Windows optimizations" -continueOnError
    Invoke-LoggedCommand "npm run emfile:check" "Checking file handle status" -continueOnError
}

function Step-DependencyValidation {
    Show-Separator "2. DEPENDENCY VALIDATION"
    
    # Skip checks if requested
    if ($skipChecks) {
        Write-Log "Skipping dependency validation as requested" $colors.Warning
        return
    }
    
    # 1. Install dependencies
    Invoke-LoggedCommand "npm install" "Installing dependencies"
    
    # 2. TypeScript compilation
    Invoke-LoggedCommand "npm run typecheck" "Verifying TypeScript compilation"
    
    # 3. Build verification (if not skipping build)
    if (-not $skipBuild) {
        Invoke-LoggedCommand "npm run build" "Verifying build process"
    } else {
        Write-Log "Skipping build verification as requested" $colors.Warning
    }
    
    # 4. ESLint validation
    Invoke-LoggedCommand "npm run lint" "Running ESLint validation" -continueOnError
}

function Step-CoreFeatureTesting {
    Show-Separator "3. CORE FEATURE TESTING"
    
    # Authentication & Tier Access Validation
    Invoke-ManualStep "Authentication & Tier Access Validation" @"
Test users (all pre-configured):
- free.user1@test.com (Password: testPassword123) - Free tier
- starter.user1@test.com (Password: testPassword123) - Starter tier
- agency.user1@test.com (Password: testPassword123) - Agency tier
- enterprise.user1@test.com (Password: testPassword123) - Enterprise tier
- admin.enterprise@test.com (Password: testPassword123) - Admin tier

Validation steps:
1. Login as each tier user at http://localhost:3000
2. Verify dashboard access and correct tier display
3. Check navigation visibility based on tier restrictions
4. Test feature gate restrictions (starter/agency/enterprise features)
5. Validate subscription status and quota display
"@
    
    # NeuroSEO Suite Validation
    Invoke-ManualStep "NeuroSEO Suite Validation" @"
Test the 6 Implemented Engines:
1. Navigate to NeuroSEO Dashboard (/neuroseo)
   - Verify dashboard loads with analytics interface
   - Check usage statistics and quota display
   - Test analysis form with sample URLs

2. Test Analysis Pipeline with these sample values:
   URLs: https://example.com, https://competitor.com
   Keywords: SEO optimization, content marketing
   Analysis Type: comprehensive

3. Validate Engine Output:
   - NeuralCrawler: Content extraction and technical analysis
   - SemanticMap: NLP analysis and topic visualization
   - AI Visibility Engine: LLM citation tracking
   - TrustBlock: E-A-T optimization scoring
   - RewriteGen: Content rewriting recommendations
   - Orchestrator: Unified reporting with competitive positioning

4. Check Tier-Based Access:
   - Free: Basic analysis only
   - Starter: Content-focused features
   - Agency: Full competitive analysis
   - Enterprise: Unlimited usage and advanced features
"@
    
    # Enhanced Navigation Testing
    Invoke-ManualStep "Enhanced Navigation Testing" @"
Verify Navigation Structure:
1. NeuroSEO Suite (Primary Group)
   - NeuroSEO Dashboard (AI badge visible)
   - NeuralCrawler (Starter+ tiers)
   - SemanticMap (Starter+ tiers)
   - AI Visibility Engine (Agency+ tiers)
   - TrustBlock (Starter+ tiers)
   - RewriteGen (Agency+ tiers)

2. SEO Tools Group
   - Keyword Tool (All tiers)
   - Content Analyzer (Starter+ tiers)
   - SEO Audit (All tiers)
   - Content Brief (Starter+ tiers)

3. Competitive Intelligence Group
   - Competitors (Starter+ tiers)
   - SERP View (Starter+ tiers)
   - Link View (Starter+ tiers)

4. Management Group
   - Dashboard (All tiers)
   - Insights (Starter+ tiers)
   - Performance (Agency+ tiers)

Navigation Validation:
- Test collapsible group functionality
- Verify tier-based visibility
- Check mobile navigation (48px touch targets)
- Validate accessibility (ARIA labels, keyboard navigation)
"@
    
    # Mobile Performance Validation
    if (-not $skipTests) {
        Invoke-LoggedCommand "npm run test:mobile" "Running mobile viewport testing"
        Invoke-LoggedCommand "npm run test:performance" "Running performance metrics validation"
        Invoke-LoggedCommand "npm run test:accessibility" "Running accessibility compliance tests"
    } else {
        Write-Log "Skipping automated mobile tests as requested" $colors.Warning
    }
    
    Invoke-ManualStep "Manual Mobile Testing" @"
Testing Steps:
1. Test responsive breakpoints (320px, 768px, 1024px, 1440px)
2. Verify touch target sizes (minimum 48px)
3. Test network-aware loading with throttled connection
4. Check adaptive image loading
5. Validate mobile navigation performance

Performance Targets:
- LCP (Largest Contentful Paint) < 2.5s
- FID (First Input Delay) < 100ms
- CLS (Cumulative Layout Shift) < 0.1
- Touch targets ≥ 48px (WCAG standard)
"@ -required:$false
    
    # Subscription & Billing System Testing
    Invoke-ManualStep "Subscription & Billing System Testing" @"
Subscription Validation:
1. Tier Management:
   - Verify user tier detection
   - Test feature gate enforcement
   - Check quota tracking accuracy
   - Validate upgrade/downgrade flows

2. Usage Quotas:
   - Test NeuroSEO analysis limits per tier
   - Verify quota reset functionality
   - Check overage handling
   - Validate quota warning notifications

3. Payment Integration:
   - Test PayPal integration (sandbox mode)
   - Verify webhook handling
   - Check payment history display
   - Validate billing cycle management
"@ -required:$false
}

function Step-TestSuiteExecution {
    Show-Separator "4. COMPREHENSIVE TEST SUITE EXECUTION"
    
    if ($skipTests) {
        Write-Log "Skipping automated tests as requested" $colors.Warning
        return
    }
    
    # 1. Role-based testing
    Invoke-LoggedCommand "npm run test:role-based" "Running role-based tests (all 5 tiers)"
    if (Test-Path "$projectRoot\scripts\run-role-based-tests.ps1") {
        Invoke-LoggedCommand "& `"$projectRoot\scripts\run-role-based-tests.ps1`"" "Running Windows-optimized role-based tests"
    }
    
    # 2. Feature-specific testing
    Invoke-LoggedCommand "npm run test:critical" "Running critical path validation"
    Invoke-LoggedCommand "npm run test:unit" "Running unit tests"
    Invoke-LoggedCommand "npm run test:integration" "Running integration tests" -continueOnError
    Invoke-LoggedCommand "npm run test:e2e" "Running end-to-end workflows" -continueOnError
    
    # 3. Performance & accessibility
    Invoke-LoggedCommand "npm run test:performance" "Running Core Web Vitals validation" -continueOnError
    Invoke-LoggedCommand "npm run test:accessibility" "Running WCAG compliance testing" -continueOnError
    Invoke-LoggedCommand "npm run test:visual" "Running visual regression testing" -continueOnError
    
    # 4. Cross-browser testing
    Invoke-LoggedCommand "npm run test:role-based:cross-browser" "Running Firefox & WebKit testing" -continueOnError
    Invoke-LoggedCommand "npm run test:role-based:mobile" "Running mobile browser testing" -continueOnError
}

function Step-PerformanceAndSecurity {
    Show-Separator "5. PERFORMANCE & SECURITY VALIDATION"
    
    if ($skipChecks) {
        Write-Log "Skipping performance and security checks as requested" $colors.Warning
        return
    }
    
    # 1. Windows-specific optimizations
    Invoke-LoggedCommand "npm run optimize-windows" "Running filesystem optimization" -continueOnError
    Invoke-LoggedCommand "npm run emfile:monitor" "Running file handle monitoring" -continueOnError
    
    # 2. Build optimization
    if (-not $skipBuild) {
        Invoke-LoggedCommand "npm run build:analyze" "Running bundle analysis" -continueOnError
        Invoke-LoggedCommand "npm run build:production" "Running production build validation"
    } else {
        Write-Log "Skipping build optimization as requested" $colors.Warning
    }
    
    # 3. Memory management
    Invoke-LoggedCommand "Get-Process | Where-Object {`$_.ProcessName -eq 'node'} | Format-Table Id, ProcessName, CPU, WorkingSet -AutoSize" "Monitoring Node processes"
    
    # 4. Security audit
    Invoke-LoggedCommand "npm run security-check" "Running dependency audit" -continueOnError
    Invoke-LoggedCommand "npm run verify-env" "Running environment security check" -continueOnError
    
    # 5. Firebase security
    Invoke-ManualStep "Firebase Security Rules Testing" @"
Manual steps to validate Firebase security:
1. Start Firebase emulators: firebase emulators:start
2. Test security rules with different user tiers
3. Verify RBAC is working correctly
4. Test API rate limiting and authentication on NeuroSEO endpoints

(Press Enter when complete, or type 'skip' to bypass)
"@ -required:$false
}

function Step-DocumentationReview {
    Show-Separator "6. DOCUMENTATION REVIEW"
    
    # 1. Format documentation
    Invoke-LoggedCommand "npm run format:docs" "Formatting documentation" -continueOnError
    
    # 2. Verify documentation links
    Invoke-LoggedCommand "npm run lint:md" "Verifying documentation links" -continueOnError
    
    # 3. Check documentation currency
    Write-Log "`nChecking critical documentation files:" $colors.Info
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
            $daysOld = ((Get-Date) - $lastModified).Days
            
            if ($daysOld -gt 30) {
                Write-Log "- $doc (Last modified $daysOld days ago - NEEDS UPDATE)" $colors.Warning
            } else {
                Write-Log "- $doc (Last modified $daysOld days ago)" $colors.Success
            }
        } else {
            Write-Log "- $doc (NOT FOUND)" $colors.Error
        }
    }
    
    # 4. Documentation updates required
    Invoke-ManualStep "Documentation Updates" @"
Required documentation updates:
1. Update project status to "Production Ready" in PROJECT_STATUS_AND_NEXT_STEPS.md
2. Mark completed features in AGILE_PRIORITY_PLAN.md
3. Update any API documentation changes
4. Verify mobile enhancement completion in MOBILE_ENHANCEMENT_CHECKLIST.md
5. Update testing documentation with current results

(Press Enter when updates are complete, or type 'skip' to bypass)
"@ -required:$false
}

function Step-DeploymentReadiness {
    Show-Separator "7. DEPLOYMENT READINESS VALIDATION"
    
    if ($skipChecks -and -not $deployOnly) {
        Write-Log "Skipping deployment readiness checks as requested" $colors.Warning
        return
    }
    
    # 1. Functions deployment
    Invoke-LoggedCommand "firebase deploy --only functions --dry-run" "Testing functions deployment to australia-southeast2"
    
    # 2. Hosting deployment preparation
    if (-not $skipBuild) {
        Invoke-LoggedCommand "npm run build" "Building production artifacts"
        
        Invoke-ManualStep "Build Artifact Verification" @"
Please verify the build artifacts in the .next directory:
1. Check that all expected files were generated
2. Verify there are no build errors in the logs
3. Check the generated size of the build artifacts

(Press Enter when verification is complete)
"@
    } else {
        Write-Log "Skipping build step as requested" $colors.Warning
    }
    
    # 3. Environment variables
    Invoke-ManualStep "Environment Variables Check" @"
Please verify all production environment variables:
1. Check that all required environment variables are set
2. Verify Firebase project configuration
3. Ensure all API keys are correctly set

(Press Enter when verification is complete)
"@
    
    # 4. Deployment
    if ($deployOnly) {
        $confirmDeploy = Read-Host "Are you ready to deploy to production? (yes/no)"
        if ($confirmDeploy -eq "yes") {
            Invoke-LoggedCommand "firebase deploy" "Deploying to production"
            Write-Log "🚀 Deployment complete!" $colors.Success
        } else {
            Write-Log "Deployment cancelled" $colors.Warning
        }
    }
}

function Step-LaunchReadinessChecklist {
    Show-Separator "LAUNCH READINESS CHECKLIST"
    
    $checklist = @(
        "All 5 user tiers authenticate successfully",
        "NeuroSEO™ Suite (6 engines) operational across all tiers",
        "Enhanced navigation functional with tier-based visibility",
        "Mobile performance meets Core Web Vitals targets",
        "All 153 tests pass successfully",
        "Security validations complete",
        "Documentation current and formatted",
        "Firebase deployment successful",
        "Production build succeeds without errors",
        "Performance optimizations applied and verified"
    )
    
    $readyForLaunch = $true
    foreach ($item in $checklist) {
        $status = Read-Host "Is this item complete? $item (yes/no/partial)"
        
        switch ($status.ToLower()) {
            "yes" {
                Write-Log "[✓] $item" $colors.Success
            }
            "partial" {
                Write-Log "[!] $item (PARTIAL)" $colors.Warning
                $readyForLaunch = $false
            }
            default {
                Write-Log "[✗] $item (INCOMPLETE)" $colors.Error
                $readyForLaunch = $false
            }
        }
    }
    
    if ($readyForLaunch) {
        Write-Log "`n✅ READY FOR LAUNCH! All checklist items are complete." $colors.Success
    } else {
        Write-Log "`n⚠️ NOT READY FOR LAUNCH. Some checklist items are incomplete." $colors.Warning
    }
    
    return $readyForLaunch
}

function Step-FinalLaunchPreparation {
    Show-Separator "FINAL LAUNCH PREPARATION"
    
    # 1. Final optimization pass
    Invoke-LoggedCommand "npm run optimize-windows" "Running final optimization pass"
    Invoke-LoggedCommand "npm run precommit" "Running full quality check" -continueOnError
    
    # 2. Complete test suite
    if (-not $skipTests) {
        Invoke-LoggedCommand "npm run test:role-based" "Running final comprehensive testing"
        
        if (Test-Path "$projectRoot\scripts\run-role-based-tests.ps1") {
            Invoke-LoggedCommand "& `"$projectRoot\scripts\run-role-based-tests.ps1`"" "Running Windows-optimized tests"
        }
    } else {
        Write-Log "Skipping final test suite as requested" $colors.Warning
    }
    
    # 3. Production deployment
    $confirmDeploy = Read-Host "Ready to deploy to production? This is the FINAL STEP. (yes/no)"
    
    if ($confirmDeploy -eq "yes") {
        Invoke-LoggedCommand "firebase deploy" "Deploying all components to production"
        Write-Log "`n🚀 DEPLOYMENT COMPLETE! RankPilot is now live." $colors.Success
    } else {
        Write-Log "`nDeployment cancelled. Run this script again when ready to deploy." $colors.Warning
    }
}

# Main execution
Clear-Host
Write-Log "RANKPILOT PRE-LAUNCH PROCESS" $colors.Heading
Write-Log "Starting at $(Get-Date)" $colors.Info
Write-Log "Log file: $logFile" $colors.Info

try {
    # Switch to project root directory
    Set-Location $projectRoot
    
    if ($checklistOnly) {
        # Only run the checklist
        Step-LaunchReadinessChecklist
    } elseif ($deployOnly) {
        # Only run deployment steps
        Step-DeploymentReadiness
    } else {
        # Run the full process
        Step-EnvironmentSetup
        Step-DependencyValidation
        Step-CoreFeatureTesting
        Step-TestSuiteExecution
        Step-PerformanceAndSecurity
        Step-DocumentationReview
        Step-DeploymentReadiness
        
        $readyForLaunch = Step-LaunchReadinessChecklist
        
        if ($readyForLaunch) {
            $proceedWithLaunch = Read-Host "Would you like to proceed with the final launch preparation? (yes/no)"
            if ($proceedWithLaunch -eq "yes") {
                Step-FinalLaunchPreparation
            } else {
                Write-Log "Launch preparation cancelled. Run this script again when ready to proceed." $colors.Warning
            }
        }
    }
    
    Write-Log "`nPre-launch process completed at $(Get-Date)" $colors.Success
    Write-Log "Check the log file for details: $logFile" $colors.Info
} catch {
    Write-Log "`nError during pre-launch process: $_" $colors.Error
    Write-Log "Check the log file for details: $logFile" $colors.Error
    Write-Log "Fix the issue and run the script again." $colors.Warning
    exit 1
}
