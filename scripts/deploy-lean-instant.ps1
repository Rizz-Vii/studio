# Development Hyperloop - Instant Lean Deployment Script
# PowerShell script for instant continuous development with lean channels
# Version: 1.0 - July 26, 2025

param(
    [Parameter(Mandatory=$false)]
    [switch]$SkipBuild,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipTests,
    
    [Parameter(Mandatory=$false)]
    [string]$Branch = "",
    
    [Parameter(Mandatory=$false)]
    [switch]$DryRun,
    
    [Parameter(Mandatory=$false)]
    [string]$ProjectId = "rankpilot-h3jpc"
)

# Configuration
$DefaultTTL = "1d"  # Short TTL for development purposes
$Green = "Green"
$Yellow = "Yellow"
$Red = "Red" 
$Blue = "Cyan"

function Write-StatusMessage {
    param($Message, $Color = "White")
    Write-Host "[INFO] $Message" -ForegroundColor $Color
}

function Write-SuccessMessage {
    param($Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Green
}

function Write-WarningMessage {
    param($Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

function Write-ErrorMessage {
    param($Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

function Test-Prerequisites {
    Write-StatusMessage "Checking prerequisites..." $Blue
    
    # Check Firebase CLI
    try {
        $result = firebase --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-SuccessMessage "Firebase CLI: Available"
        } else {
            Write-ErrorMessage "Firebase CLI not found"
            return $false
        }
    } catch {
        Write-ErrorMessage "Firebase CLI check failed"
        return $false
    }
    
    # Check authentication
    try {
        firebase projects:list --json | Out-Null 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-SuccessMessage "Firebase authentication: Valid"
        } else {
            Write-ErrorMessage "Firebase authentication failed"
            return $false
        }
    } catch {
        Write-ErrorMessage "Firebase authentication check failed"
        return $false
    }
    
    return $true
}

function Get-CurrentBranch {
    if ($Branch -eq "") {
        try {
            $currentBranch = git branch --show-current 2>$null
            if ($LASTEXITCODE -eq 0) {
                return $currentBranch.Trim()
            } else {
                Write-WarningMessage "Could not detect current branch, using 'dev' as fallback"
                return "dev"
            }
        } catch {
            Write-WarningMessage "Git branch detection failed, using 'dev' as fallback"
            return "dev"
        }
    } else {
        return $Branch
    }
}

function Get-ChangedFiles {
    try {
        $changedFiles = git diff --name-only HEAD^ HEAD 2>$null
        if ($LASTEXITCODE -eq 0) {
            return $changedFiles
        } else {
            Write-WarningMessage "Could not get changed files, assuming full rebuild needed"
            return @("src/")  # Default to assuming source changes
        }
    } catch {
        Write-WarningMessage "Failed to detect changed files: $_"
        return @("src/")  # Default to assuming source changes
    }
}

function Get-BuildNeeded {
    param($ChangedFiles)
    
    # Check if any source files, components, or pages changed
    foreach ($file in $ChangedFiles) {
        if ($file -match "src/|components/|pages/|styles/|lib/|app/") {
            return $true
        }
    }
    
    return $false
}

function Invoke-LeanBuild {
    param($ChangedFiles, $NeedsBuild)
    
    if (!$NeedsBuild) {
        Write-StatusMessage "No source changes detected, skipping build" $Yellow
        return $true
    }
    
    if ($SkipBuild) {
        Write-StatusMessage "Build explicitly skipped via parameter" $Yellow
        return $true
    }
    
    Write-StatusMessage "Running lean build process..." $Blue
    
    if ($DryRun) {
        Write-StatusMessage "DRY RUN: Would run npm run build:lean" $Yellow
        return $true
    }
    
    # Set environment variable to skip TypeScript type checking
    $env:LEAN_MODE = "true"
    $env:SKIP_TYPE_CHECK = "true"
    
    # Run lean build
    try {
        Write-StatusMessage "Starting lean build (skipping type checking and optimization)..."
        
        # Create lean build command
        # We're using Next.js --no-lint and experimental features to speed up build
        npm run build -- --no-lint
        
        if ($LASTEXITCODE -eq 0) {
            Write-SuccessMessage "Lean build completed successfully"
            return $true
        } else {
            Write-ErrorMessage "Lean build failed"
            return $false
        }
    } catch {
        Write-ErrorMessage "Lean build failed with error: $_"
        return $false
    } finally {
        # Reset environment variables
        $env:LEAN_MODE = $null
        $env:SKIP_TYPE_CHECK = $null
    }
}

function Get-SafeChannelId {
    param($BranchName)
    
    # Normalize branch name for Firebase channel (lowercase, no special chars)
    $channelId = $BranchName -replace '[^a-zA-Z0-9-]', '-'
    $channelId = $channelId.ToLower()
    
    # Ensure we don't exceed Firebase channel ID length limits (63 chars)
    if ($channelId.Length -gt 50) {
        $channelId = $channelId.Substring(0, 50)
    }
    
    return "lean-$channelId"
}

function Deploy-ToLeanChannel {
    param($ChannelId)
    
    Write-StatusMessage "Deploying to lean channel: $ChannelId" $Blue
    
    if ($DryRun) {
        Write-StatusMessage "DRY RUN: Would deploy to channel '$ChannelId' with TTL '$DefaultTTL'" $Yellow
        return $true
    }
    
    try {
        Write-StatusMessage "Deploying to Firebase channel..."
        firebase hosting:channel:deploy $ChannelId --expires $DefaultTTL --project $ProjectId
        
        if ($LASTEXITCODE -eq 0) {
            Write-SuccessMessage "Channel deployment successful!"
            return $true
        } else {
            Write-ErrorMessage "Channel deployment failed"
            return $false
        }
    } catch {
        Write-ErrorMessage "Deployment failed: $_"
        return $false
    }
}

function Show-ChannelInfo {
    param($ChannelId)
    
    try {
        $channelsJson = firebase hosting:channel:list --project $ProjectId --json
        if ($LASTEXITCODE -ne 0) {
            Write-ErrorMessage "Failed to list channels"
            return
        }
        
        $channels = $channelsJson | ConvertFrom-Json
        $targetChannel = $channels | Where-Object { $_.name -eq $ChannelId }
        
        if ($targetChannel) {
            Write-Host ""
            Write-Host "🚀 DEVELOPMENT HYPERLOOP ACTIVE" -ForegroundColor $Green
            Write-Host "===============================" -ForegroundColor $Green
            Write-Host "📋 Channel ID: $($targetChannel.name)" -ForegroundColor $Green
            Write-Host "🔗 URL: $($targetChannel.url)" -ForegroundColor $Green
            Write-Host "📱 Mobile URL: $($targetChannel.url) (same)" -ForegroundColor $Green
            Write-Host "⏰ Expires: $($targetChannel.expireTime)" -ForegroundColor $Green
            Write-Host "🌿 Branch: $currentBranch" -ForegroundColor $Green
            Write-Host ""
            Write-Host "📲 Scan to preview on mobile:" -ForegroundColor $Blue
            Write-Host "  Use a QR code generator with URL: $($targetChannel.url)" -ForegroundColor $Blue
            Write-Host ""
            Write-Host "💻 VS Code Integration:" -ForegroundColor $Blue
            Write-Host "  • To add shortcut: Press Ctrl+K Ctrl+S and add keybinding for task 'Instant Deploy'" -ForegroundColor $Blue
            Write-Host ""
        } else {
            Write-WarningMessage "Could not find channel info for: $ChannelId"
        }
    } catch {
        Write-ErrorMessage "Failed to get channel info: $_"
    }
}

# Main execution
Write-Host ""
Write-Host "🚀 RankPilot Development Hyperloop" -ForegroundColor $Green
Write-Host "=============================" -ForegroundColor $Green

# Validate prerequisites
if (!(Test-Prerequisites)) {
    Write-ErrorMessage "Prerequisites check failed. Please fix issues and try again."
    exit 1
}

# Get current branch
$currentBranch = Get-CurrentBranch
$channelId = Get-SafeChannelId $currentBranch
Write-StatusMessage "Current branch: $currentBranch" $Blue
Write-StatusMessage "Channel ID: $channelId" $Blue

# Detect changed files
$changedFiles = Get-ChangedFiles
$needsBuild = Get-BuildNeeded $changedFiles
if ($needsBuild) {
    Write-StatusMessage "Source changes detected, build needed" $Blue
} else {
    Write-StatusMessage "No source changes detected" $Yellow
}

# Run lean build if needed
if (!(Invoke-LeanBuild $changedFiles $needsBuild)) {
    Write-ErrorMessage "Build failed. Fix build issues and try again."
    exit 1
}

# Deploy to channel
if (!(Deploy-ToLeanChannel $channelId)) {
    Write-ErrorMessage "Deployment failed. Please check Firebase CLI output."
    exit 1
}

# Show channel info
Show-ChannelInfo $channelId

Write-Host ""
Write-Host "✨ Development Hyperloop deployment complete!" -ForegroundColor $Green
