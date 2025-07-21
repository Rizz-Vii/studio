#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Automated pre-launch validation script for RankPilot
.DESCRIPTION
    This script automates the pre-launch validation steps outlined in the RankPilot Pre-Launch Validation & Testing Protocol.
    It executes environment setup checks, dependency validation, feature testing, and deployment readiness validation.
.NOTES
    File Name      : run-prelaunch-validation.ps1
    Author         : GitHub Copilot
    Creation Date  : July 21, 2025
    Version        : 1.0
#>

# Set error action preference
$ErrorActionPreference = "Stop"

# Script variables
$startTime = Get-Date
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir

# Define color codes for better readability
$colors = @{
    Success = "Green"
    Warning = "Yellow"
    Error = "Red"
    Info = "Cyan"
    Heading = "Magenta"
}

# Function to print section headers
function Write-SectionHeader {
    param([string]$title)
    
    $separator = "=" * 80
    Write-Host "`n$separator" -ForegroundColor $colors.Heading
    Write-Host "  $title" -ForegroundColor $colors.Heading
    Write-Host "$separator`n" -ForegroundColor $colors.Heading
}

# Function to execute commands and handle errors
function Invoke-ValidationStep {
    param(
        [string]$description,
        [scriptblock]$command,
        [switch]$continueOnError
    )
    
    Write-Host "► $description... " -ForegroundColor $colors.Info -NoNewline
    
    try {
        & $command
        Write-Host "✓ Success" -ForegroundColor $colors.Success
        return $true
    }
    catch {
        Write-Host "✗ Failed" -ForegroundColor $colors.Error
        Write-Host "  Error: $_" -ForegroundColor $colors.Error
        
        if (-not $continueOnError) {
            Write-Host "`nValidation failed at step: $description" -ForegroundColor $colors.Error
            Write-Host "Fix the issue and run the script again." -ForegroundColor $colors.Error
            exit 1
        }
        return $false
    }
}

function Test-EnvironmentSetup {
    Write-SectionHeader "ENVIRONMENT SETUP"
    
    # 1. Verify development server (just check for errors, don't actually start it)
    Invoke-ValidationStep "Checking npm run dev-no-turbopack command" {
        $packageJson = Get-Content "$projectRoot\package.json" | ConvertFrom-Json
        if (-not $packageJson.scripts.'dev-no-turbopack') {
            throw "dev-no-turbopack script not found in package.json"
        }
    }
    
    # 2. Check Firebase connectivity
    Invoke-ValidationStep "Checking Firebase CLI" {
        $firebaseVersion = Invoke-Expression "firebase --version"
        if (-not $firebaseVersion) {
            throw "Firebase CLI not installed or not working"
        }
        Write-Host "  Firebase CLI version: $firebaseVersion" -ForegroundColor $colors.Info
    }
    
    # 3. Verify project setup
    Invoke-ValidationStep "Checking Firebase project" {
        $result = Invoke-Expression "firebase use rankpilot-h3jpc 2>&1"
        if ($result -match "error") {
            throw "Failed to set Firebase project: $result"
        }
    }
    
    # 4. Validate environment variables
    Invoke-ValidationStep "Checking environment variables" {
        if (Test-Path "$projectRoot\scripts\verify-env.js") {
            node "$projectRoot\scripts\verify-env.js"
        } else {
            # Check if the script exists in package.json
            $packageJson = Get-Content "$projectRoot\package.json" | ConvertFrom-Json
            if ($packageJson.scripts.'verify-env') {
                npm run verify-env
            } else {
                Write-Host "  No verify-env script found, checking for .env file" -ForegroundColor $colors.Warning
                if (-not (Test-Path "$projectRoot\.env")) {
                    throw ".env file not found"
                }
            }
        }
    } -continueOnError
    
    # 5. Run system optimization
    Invoke-ValidationStep "Running system optimization" {
        if (Test-Path "$projectRoot\scripts\optimize-windows.ps1") {
            & "$projectRoot\scripts\optimize-windows.ps1"
        } else {
            # Check if the script exists in package.json
            $packageJson = Get-Content "$projectRoot\package.json" | ConvertFrom-Json
            if ($packageJson.scripts.'optimize-windows') {
                npm run optimize-windows
            } else {
                Write-Host "  No optimize-windows script found, skipping" -ForegroundColor $colors.Warning
            }
        }
    } -continueOnError
    
    # 6. Check file handle status
    Invoke-ValidationStep "Checking file handle status" {
        if (Test-Path "$projectRoot\scripts\emfile-check.js") {
            node "$projectRoot\scripts\emfile-check.js"
        } else {
            # Check if the script exists in package.json
            $packageJson = Get-Content "$projectRoot\package.json" | ConvertFrom-Json
            if ($packageJson.scripts.'emfile:check') {
                npm run emfile:check
            } else {
                Write-Host "  No emfile:check script found, skipping" -ForegroundColor $colors.Warning
            }
        }
    } -continueOnError
}

function Test-Dependencies {
    Write-SectionHeader "DEPENDENCIES VALIDATION"
    
    # 1. Check dependencies
    Invoke-ValidationStep "Verifying npm dependencies" {
        npm list --depth=0
    } -continueOnError
    
    # 2. TypeScript compilation check
    Invoke-ValidationStep "Running TypeScript type checking" {
        npm run typecheck
    }
    
    # 3. Build verification
    Invoke-ValidationStep "Verifying build process" {
        npm run build
    }
    
    # 4. ESLint validation
    Invoke-ValidationStep "Running ESLint validation" {
        npm run lint
    } -continueOnError
}

function Test-CoreFeatures {
    Write-SectionHeader "CORE FEATURE TESTING"
    
    # 1. Run automated tests
    Invoke-ValidationStep "Running comprehensive test suite" {
        npm run test:role-based
    } -continueOnError
    
    # 2. Check Windows-optimized test script
    Invoke-ValidationStep "Running Windows-optimized tests" {
        if (Test-Path "$projectRoot\scripts\run-role-based-tests.ps1") {
            & "$projectRoot\scripts\run-role-based-tests.ps1"
        } else {
            Write-Host "  No run-role-based-tests.ps1 script found, skipping" -ForegroundColor $colors.Warning
        }
    } -continueOnError
    
    # 3. Run critical path tests
    Invoke-ValidationStep "Running critical path tests" {
        npm run test:critical
    } -continueOnError
    
    # 4. Run mobile-specific tests
    Invoke-ValidationStep "Running mobile tests" {
        npm run test:mobile
    } -continueOnError
    
    # 5. Run performance tests
    Invoke-ValidationStep "Running performance tests" {
        npm run test:performance
    } -continueOnError
    
    # 6. Run accessibility tests
    Invoke-ValidationStep "Running accessibility tests" {
        npm run test:accessibility
    } -continueOnError
}

function Test-PerformanceAndSecurity {
    Write-SectionHeader "PERFORMANCE & SECURITY VALIDATION"
    
    # 1. Windows optimizations
    Invoke-ValidationStep "Running Windows optimizations" {
        npm run optimize-windows
    } -continueOnError
    
    # 2. Build analysis
    Invoke-ValidationStep "Analyzing production build" {
        npm run build:analyze
    } -continueOnError
    
    # 3. Security audit
    Invoke-ValidationStep "Running security audit" {
        npm audit
    } -continueOnError
    
    # 4. Monitor Node processes
    Invoke-ValidationStep "Checking Node processes" {
        $nodeProcesses = Get-Process | Where-Object {$_.ProcessName -eq "node"}
        $nodeProcesses | Format-Table Id, ProcessName, CPU, WorkingSet -AutoSize
    } -continueOnError
}

function Test-Documentation {
    Write-SectionHeader "DOCUMENTATION REVIEW"
    
    # 1. Format documentation
    Invoke-ValidationStep "Formatting documentation" {
        if (Test-Path "$projectRoot\scripts\format-docs.js") {
            node "$projectRoot\scripts\format-docs.js"
        } else {
            # Check if the script exists in package.json
            $packageJson = Get-Content "$projectRoot\package.json" | ConvertFrom-Json
            if ($packageJson.scripts.'format:docs') {
                npm run format:docs
            } else {
                Write-Host "  No format:docs script found, skipping" -ForegroundColor $colors.Warning
            }
        }
    } -continueOnError
    
    # 2. Check documentation links
    Invoke-ValidationStep "Checking documentation links" {
        if (Test-Path "$projectRoot\scripts\lint-md.js") {
            node "$projectRoot\scripts\lint-md.js"
        } else {
            # Check if the script exists in package.json
            $packageJson = Get-Content "$projectRoot\package.json" | ConvertFrom-Json
            if ($packageJson.scripts.'lint:md') {
                npm run lint:md
            } else {
                Write-Host "  No lint:md script found, skipping" -ForegroundColor $colors.Warning
            }
        }
    } -continueOnError
    
    # 3. Documentation completeness check
    Invoke-ValidationStep "Checking documentation completeness" {
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
                
                Write-Host "  $doc - Last modified: $lastModified ($daysOld days ago)" -ForegroundColor (
                    if ($daysOld -gt 30) { $colors.Warning } else { $colors.Info }
                )
            } else {
                Write-Host "  $doc - Not found" -ForegroundColor $colors.Error
            }
        }
    } -continueOnError
}

function Test-DeploymentReadiness {
    Write-SectionHeader "DEPLOYMENT READINESS VALIDATION"
    
    # 1. Firebase functions deployment check (dry run)
    Invoke-ValidationStep "Checking Firebase functions" {
        firebase deploy --only functions --dry-run
    } -continueOnError
    
    # 2. Production build check
    Invoke-ValidationStep "Checking production build" {
        npm run build
    }
    
    # 3. Environment variables check
    Invoke-ValidationStep "Verifying production environment variables" {
        if (Test-Path "$projectRoot\scripts\verify-prod-env.js") {
            node "$projectRoot\scripts\verify-prod-env.js"
        } else {
            # Check if the script exists in package.json
            $packageJson = Get-Content "$projectRoot\package.json" | ConvertFrom-Json
            if ($packageJson.scripts.'verify-env') {
                npm run verify-env
            } else {
                Write-Host "  No verify-env script found, checking for .env.production file" -ForegroundColor $colors.Warning
                if (-not (Test-Path "$projectRoot\.env.production")) {
                    Write-Host "  .env.production file not found, using .env" -ForegroundColor $colors.Warning
                    if (-not (Test-Path "$projectRoot\.env")) {
                        throw "Neither .env.production nor .env file found"
                    }
                }
            }
        }
    } -continueOnError
}

function Show-LaunchReadinessChecklist {
    Write-SectionHeader "LAUNCH READINESS CHECKLIST"
    
    $checklistItems = @(
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
    
    foreach ($item in $checklistItems) {
        Write-Host "[ ] $item" -ForegroundColor $colors.Info
    }
    
    Write-Host "`nManually check each item and update the success criteria in:" -ForegroundColor $colors.Warning
    Write-Host "  .github\prompts\preLaunch.prompt.md" -ForegroundColor $colors.Warning
}

function Show-FinalSteps {
    Write-SectionHeader "FINAL LAUNCH STEPS"
    
    Write-Host "1. Complete the launch readiness checklist" -ForegroundColor $colors.Info
    Write-Host "2. Run the final deployment command:" -ForegroundColor $colors.Info
    Write-Host "   firebase deploy" -ForegroundColor $colors.Success
    Write-Host "3. Test the production deployment" -ForegroundColor $colors.Info
    Write-Host "4. Update documentation status to 'Production Ready'" -ForegroundColor $colors.Info
    Write-Host "5. Verify monitoring and analytics are active" -ForegroundColor $colors.Info
}

function Show-Summary {
    $endTime = Get-Date
    $duration = $endTime - $startTime
    
    Write-SectionHeader "VALIDATION SUMMARY"
    
    Write-Host "Start time: $startTime" -ForegroundColor $colors.Info
    Write-Host "End time: $endTime" -ForegroundColor $colors.Info
    Write-Host "Duration: $($duration.Minutes) minutes, $($duration.Seconds) seconds`n" -ForegroundColor $colors.Info
    
    Write-Host "Next steps:" -ForegroundColor $colors.Heading
    Write-Host "1. Review and fix any failed validation steps" -ForegroundColor $colors.Info
    Write-Host "2. Complete the launch readiness checklist" -ForegroundColor $colors.Info
    Write-Host "3. Deploy to production when all criteria are met" -ForegroundColor $colors.Info
    
    Write-Host "`nRun this script again after fixing any issues to ensure complete validation." -ForegroundColor $colors.Warning
}

# Main execution flow
try {
    Write-SectionHeader "RANKPILOT PRE-LAUNCH VALIDATION"
    Write-Host "Starting validation at $startTime`n" -ForegroundColor $colors.Info
    
    # Change to project root directory
    Set-Location $projectRoot
    
    # Run validation steps
    Test-EnvironmentSetup
    Test-Dependencies
    Test-CoreFeatures
    Test-PerformanceAndSecurity
    Test-Documentation
    Test-DeploymentReadiness
    
    # Show manual checklist and final steps
    Show-LaunchReadinessChecklist
    Show-FinalSteps
    
    # Summary
    Show-Summary
} 
catch {
    Write-Host "`nValidation script failed: $_" -ForegroundColor $colors.Error
    exit 1
}
