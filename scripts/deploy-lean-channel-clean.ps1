# Lean Channel Deployment Management Script - Clean Version
# PowerShell automation for Firebase hosting channel operations
# Version: 1.2 - July 23, 2025 (Unicode Fixed)

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("test", "backup", "cleanup", "status")]
    [string]$Mode = "test",
    
    [Parameter(Mandatory=$false)]
    [string]$Branch = "feature/lean-branch-architecture",
    
    [Parameter(Mandatory=$false)]
    [switch]$ExtendedTTL,
    
    [Parameter(Mandatory=$false)]
    [switch]$DeployFunctions,
    
    [Parameter(Mandatory=$false)]
    [switch]$DryRun,
    
    [Parameter(Mandatory=$false)]
    [string]$ProjectId = "rankpilot-h3jpc"
)

# Configuration
$ChannelId = "lean-branch-testing"
$DefaultTTL = "14d"
$ExtendedTTLValue = "30d"
$WorkflowFile = "deploy-lean-branch.yml"

# Colors for output
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

function Get-ChannelStatus {
    Write-StatusMessage "Getting channel status for: $ChannelId" $Blue
    
    try {
        $channelsJson = firebase hosting:channel:list --project $ProjectId --json
        if ($LASTEXITCODE -ne 0) {
            Write-ErrorMessage "Failed to list channels"
            return $null
        }
        
        $channels = $channelsJson | ConvertFrom-Json
        $leanChannel = $channels | Where-Object { $_.name -eq $ChannelId }
        
        if ($leanChannel) {
            Write-SuccessMessage "Lean channel found:"
            Write-Host "  Channel ID: $($leanChannel.name)" -ForegroundColor $Green
            Write-Host "  URL: $($leanChannel.url)" -ForegroundColor $Green
            Write-Host "  Expires: $($leanChannel.expireTime)" -ForegroundColor $Green
            return $leanChannel
        } else {
            Write-WarningMessage "Lean channel '$ChannelId' does not exist"
            return $null
        }
    } catch {
        Write-ErrorMessage "Failed to get channel status: $_"
        return $null
    }
}

function Deploy-ToChannel {
    param([string]$TTL)
    
    Write-StatusMessage "Deploying to lean channel with TTL: $TTL" $Blue
    
    if ($DryRun) {
        Write-StatusMessage "DRY RUN: Would deploy to channel '$ChannelId' with TTL '$TTL'" $Yellow
        return $true
    }
    
    try {
        # Build application
        Write-StatusMessage "Building application..."
        npm run build
        if ($LASTEXITCODE -ne 0) {
            Write-ErrorMessage "Build failed"
            return $false
        }
        
        # Deploy to channel
        Write-StatusMessage "Deploying to Firebase channel..."
        firebase hosting:channel:deploy $ChannelId --expires $TTL --project $ProjectId
        if ($LASTEXITCODE -ne 0) {
            Write-ErrorMessage "Channel deployment failed"
            return $false
        }
        
        # Deploy functions if requested
        if ($DeployFunctions) {
            Write-StatusMessage "Deploying Firebase Functions..."
            firebase deploy --only functions --project $ProjectId
            if ($LASTEXITCODE -ne 0) {
                Write-WarningMessage "Functions deployment failed"
            } else {
                Write-SuccessMessage "Functions deployed successfully"
            }
        }
        
        # Show final status
        $channelInfo = Get-ChannelStatus
        if ($channelInfo) {
            Write-SuccessMessage "Deployment completed successfully!"
            Write-Host "URL: $($channelInfo.url)" -ForegroundColor $Green
        }
        
        return $true
    } catch {
        Write-ErrorMessage "Deployment failed: $_"
        return $false
    }
}

function Remove-ExpiredChannels {
    Write-StatusMessage "Checking for expired channels..." $Blue
    
    try {
        $channelsJson = firebase hosting:channel:list --project $ProjectId --json
        if ($LASTEXITCODE -ne 0) {
            Write-ErrorMessage "Failed to list channels"
            return $false
        }
        
        $channels = $channelsJson | ConvertFrom-Json
        $expiredChannels = $channels | Where-Object { 
            $_.name -like "*lean*" -and 
            $_.expireTime -and 
            (Get-Date $_.expireTime) -lt (Get-Date)
        }
        
        if ($expiredChannels.Count -eq 0) {
            Write-SuccessMessage "No expired lean channels found"
            return $true
        }
        
        Write-StatusMessage "Found $($expiredChannels.Count) expired channels"
        foreach ($channel in $expiredChannels) {
            Write-Host "  Channel: $($channel.name) - Expired: $($channel.expireTime)" -ForegroundColor $Yellow
        }
        
        if ($DryRun) {
            Write-StatusMessage "DRY RUN: Would delete $($expiredChannels.Count) expired channels" $Yellow
            return $true
        }
        
        $confirm = Read-Host "Delete expired channels? (y/N)"
        if ($confirm -eq "y" -or $confirm -eq "Y") {
            foreach ($channel in $expiredChannels) {
                Write-StatusMessage "Deleting channel: $($channel.name)"
                firebase hosting:channel:delete $channel.name --project $ProjectId --force
                if ($LASTEXITCODE -eq 0) {
                    Write-SuccessMessage "Deleted: $($channel.name)"
                } else {
                    Write-ErrorMessage "Failed to delete: $($channel.name)"
                }
            }
        }
        
        return $true
    } catch {
        Write-ErrorMessage "Cleanup failed: $_"
        return $false
    }
}

# Main execution
Write-Host ""
Write-Host "RankPilot Lean Channel Deployment Manager" -ForegroundColor $Green
Write-Host "=========================================" -ForegroundColor $Green
Write-Host "Mode: $Mode | Branch: $Branch | Project: $ProjectId" -ForegroundColor $Blue
Write-Host ""

if ($DryRun) {
    Write-StatusMessage "DRY RUN MODE - No actual changes will be made" $Yellow
}

# Check prerequisites
if (-not (Test-Prerequisites)) {
    Write-ErrorMessage "Prerequisites check failed"
    exit 1
}

# Execute based on mode
switch ($Mode) {
    "status" {
        Get-ChannelStatus | Out-Null
    }
    
    "test" {
        $ttl = if ($ExtendedTTL) { $ExtendedTTLValue } else { $DefaultTTL }
        $success = Deploy-ToChannel -TTL $ttl
        if (-not $success) {
            exit 1
        }
    }
    
    "backup" {
        $success = Deploy-ToChannel -TTL $ExtendedTTLValue
        if (-not $success) {
            exit 1
        }
        Write-SuccessMessage "Backup deployment completed"
    }
    
    "cleanup" {
        $success = Remove-ExpiredChannels
        if (-not $success) {
            exit 1
        }
    }
    
    default {
        Write-ErrorMessage "Invalid mode: $Mode"
        exit 1
    }
}

Write-SuccessMessage "Operation completed: $Mode"
Write-Host ""
