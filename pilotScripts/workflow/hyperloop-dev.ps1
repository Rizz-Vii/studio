<#
.SYNOPSIS
    Development Hyperloop - Execute instant lean deployment with CI feedback
.DESCRIPTION
    Provides instant continuous deployment for rapid development feedback.
    1. Builds lean version of the app (no type checking, minimal ESLint)
    2. Deploys to Firebase hosting channel
    3. Triggers CI/CD tests against the deployed channel
    4. Returns URL and live feedback
.EXAMPLE
    .\pilotScripts\workflow\hyperloop-dev.ps1
.NOTES
    Part of the RankPilot Development Hyperloop system
#>

# Config
$projectId = "rankpilot-h3jpc"
$region = "australia-southeast2"
$branchName = git rev-parse --abbrev-ref HEAD

# Use existing stable channel for consistent URL
$channelId = "lean-branch-testing"

# Script header
Write-Host "🚀 DEVELOPMENT HYPERLOOP - INSTANT LEAN DEPLOYMENT" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "Branch: $branchName" -ForegroundColor Yellow
Write-Host "Channel ID: $channelId" -ForegroundColor Yellow
Write-Host "Firebase Project: $projectId" -ForegroundColor Yellow
Write-Host ""

try {
    # Step 1: Verify prerequisites
    Write-Host "🔍 Checking prerequisites..." -ForegroundColor Magenta
    
    # Check for Firebase CLI
    if (!(Get-Command firebase -ErrorAction SilentlyContinue)) {
        throw "Firebase CLI not found. Install with: npm install -g firebase-tools"
    }
    
    # Check for Git
    if (!(Get-Command git -ErrorAction SilentlyContinue)) {
        throw "Git not found. Required for branch information."
    }
    
    # Check Firebase login
    $loginCheck = firebase projects:list --json | ConvertFrom-Json
    if (!$loginCheck) {
        throw "Not logged in to Firebase. Run 'firebase login' first."
    }
    
    # Step 2: Execute lean build
    Write-Host "🛠️ Building lean version..." -ForegroundColor Magenta
    
    # Use existing script for consistency
    & "$PSScriptRoot\..\..\scripts\build-lean-instant.ps1"
    
    if ($LASTEXITCODE -ne 0) {
        throw "Lean build failed with exit code $LASTEXITCODE"
    }
    
    Write-Host "✅ Lean build completed successfully" -ForegroundColor Green
    Write-Host ""
    
    # Step 3: Deploy to Firebase channel
    Write-Host "🚀 Deploying to Firebase channel: $channelId..." -ForegroundColor Magenta
    
    $deployOutput = firebase hosting:channel:deploy $channelId --only hosting --expires 1d --project $projectId --json
    if ($LASTEXITCODE -ne 0) {
        throw "Firebase deployment failed with exit code $LASTEXITCODE"
    }
    
    # Parse the deployment JSON output
    $deployResult = $deployOutput | ConvertFrom-Json
    $channelUrl = $deployResult.result.url
    
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host "🌐 Channel URL: $channelUrl" -ForegroundColor Cyan
    Write-Host ""
    
    # Step 4: Trigger GitHub Actions workflow for testing
    Write-Host "🧪 Triggering tests via GitHub Actions..." -ForegroundColor Magenta
    
    # Use the GitHub CLI to trigger the workflow
    if (Get-Command gh -ErrorAction SilentlyContinue) {
        gh workflow run lean-channel-tests.yml --ref $branchName -f channelId=$channelId
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Test workflow triggered successfully" -ForegroundColor Green
            Write-Host "📊 View test results: https://github.com/your-org/rankpilot/actions" -ForegroundColor Cyan
        } else {
            Write-Host "⚠️ Could not trigger test workflow. Tests will run automatically." -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️ GitHub CLI not installed. Tests will run automatically from the CI pipeline." -ForegroundColor Yellow
        Write-Host "📊 View test results: https://github.com/your-org/rankpilot/actions" -ForegroundColor Cyan
    }
    
    # Step 5: Final summary with expiration information
    $expirationDate = (Get-Date).AddDays(1)
    
    Write-Host ""
    Write-Host "📋 DEPLOYMENT SUMMARY" -ForegroundColor Cyan
    Write-Host "===============================================" -ForegroundColor Cyan
    Write-Host "🌐 Preview URL: $channelUrl" -ForegroundColor Green
    Write-Host "🔖 Channel ID: $channelId" -ForegroundColor Green
    Write-Host "⏳ Expires: $($expirationDate.ToString("yyyy-MM-dd HH:mm:ss"))" -ForegroundColor Yellow
    Write-Host "🌿 Branch: $branchName" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📱 Mobile Testing:" -ForegroundColor Magenta
    Write-Host "   Open Chrome DevTools > Toggle Device Toolbar > Test responsive design" -ForegroundColor Cyan
    
    # QR Code for mobile testing
    Write-Host ""
    Write-Host "📱 Scan QR code for mobile testing:" -ForegroundColor Magenta
    # Create a QR code using a web service - opens in default browser
    Start-Process "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=$([uri]::EscapeDataString($channelUrl))"
    
    # Step 6: Open preview in browser
    Write-Host ""
    Write-Host "🌐 Opening preview in browser..." -ForegroundColor Magenta
    Start-Process $channelUrl
    
} catch {
    Write-Host "❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
