# Lean Channel Deployment Management Script
# PowerShell automation for Firebase hosting channel operations
# Version: 1.1 - July 23, 2025 (Syntax Fixed)

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
    Write-Host "🔧 $Message" -ForegroundColor $Color
}

function Write-SuccessMessage {
    param($Message)
    Write-Host "✅ $Message" -ForegroundColor $Green
}

function Write-WarningMessage {
    param($Message)
    Write-Host "⚠️ $Message" -ForegroundColor $Yellow
}

function Write-ErrorMessage {
    param($Message)
    Write-Host "❌ $Message" -ForegroundColor $Red
}

function Write-InfoMessage {
    param($Message)
    Write-Host "ℹ️ $Message" -ForegroundColor $Blue
}

function Invoke-SafeCommand {
    param($Command, $Description)
    
    Write-StatusMessage $Description
    
    if ($DryRun) {
        Write-InfoMessage "DRY RUN: Would execute: $Command"
        return $true
    }
    
    try {
        $result = Invoke-Expression $Command
        Write-SuccessMessage "$Description completed"
        return $true
    }
    catch {
        Write-ErrorMessage "$Description failed: $($_.Exception.Message)"
        return $false
    }
}

function Test-Prerequisites {
    Write-StatusMessage "Checking prerequisites..."
    
    # Check Firebase CLI
    try {
        $firebaseVersion = firebase --version
        Write-SuccessMessage "Firebase CLI found: $firebaseVersion"
    }
    catch {
        Write-ErrorMessage "Firebase CLI not found. Please install: npm install -g firebase-tools"
        return $false
    }
    
    # Check GitHub CLI
    try {
        $ghVersion = gh --version
        Write-SuccessMessage "GitHub CLI found"
    }
    catch {
        Write-ErrorMessage "GitHub CLI not found. Please install GitHub CLI"
        return $false
    }
    
    # Check if logged in to Firebase
    try {
        firebase projects:list | Out-Null
        Write-SuccessMessage "Firebase authentication verified"
    }
    catch {
        Write-ErrorMessage "Firebase authentication failed. Please run: firebase login"
        return $false
    }
    
    return $true
}

function Get-ChannelStatus {
    Write-StatusMessage "Getting channel status for project: $ProjectId"
    
    try {
        $channels = firebase hosting:channel:list --project $ProjectId --json | ConvertFrom-Json
        
        Write-InfoMessage "Active Firebase Hosting Channels:"
        foreach ($channel in $channels) {
            if ($channel.name -eq $ChannelId) {
                Write-Host "  🎯 " -ForegroundColor $Green -NoNewline
            } else {
                Write-Host "  📊 " -NoNewline
            }
            Write-Host "$($channel.name) - Expires: $($channel.expireTime)" -ForegroundColor $Blue
        }
        
        return $channels
    }
    catch {
        Write-WarningMessage "Could not retrieve channel status: $($_.Exception.Message)"
        return @()
    }
}

function Invoke-LeanDeployment {
    param($TTL)
    
    Write-StatusMessage "Initiating lean branch deployment..."
    Write-InfoMessage "Mode: $Mode"
    Write-InfoMessage "Branch: $Branch"
    Write-InfoMessage "Channel: $ChannelId"
    Write-InfoMessage "TTL: $TTL"
    
    # Build workflow parameters
    $workflowParams = @()
    
    if ($Mode -eq "backup") {
        $workflowParams += "-f backup_mode=true"
    }
    
    if ($DeployFunctions) {
        $workflowParams += "-f deploy_functions=true" 
    }
    
    $workflowCommand = "gh workflow run $WorkflowFile"
    if ($workflowParams.Count -gt 0) {
        $workflowCommand += " " + ($workflowParams -join " ")
    }
    
    if (Invoke-SafeCommand $workflowCommand "Triggering GitHub workflow") {
        Write-SuccessMessage "Workflow triggered successfully"
        
        # Wait a moment then show recent runs
        Start-Sleep -Seconds 3
        Write-StatusMessage "Recent workflow runs:"
        gh run list --workflow=$WorkflowFile --limit=3
        
        return $true
    }
    
    return $false
}

function Invoke-ChannelCleanup {
    Write-StatusMessage "Starting channel cleanup process..."
    
    $channels = Get-ChannelStatus
    $currentDate = Get-Date
    $expiredChannels = @()
    
    foreach ($channel in $channels) {
        try {
            $expireDate = [DateTime]::Parse($channel.expireTime)
            if ($expireDate -lt $currentDate) {
                $expiredChannels += $channel
            }
        }
        catch {
            Write-WarningMessage "Could not parse expire time for channel: $($channel.name)"
        }
    }
    
    if ($expiredChannels.Count -eq 0) {
        Write-SuccessMessage "No expired channels found"
        return $true
    }
    
    Write-InfoMessage "Found $($expiredChannels.Count) expired channels:"
    foreach ($channel in $expiredChannels) {
        Write-Host "  🗑️ $($channel.name) - Expired: $($channel.expireTime)" -ForegroundColor $Yellow
    }
    
    if (!$DryRun) {
        $confirm = Read-Host "Delete expired channels? (y/N)"
        if ($confirm -eq "y" -or $confirm -eq "Y") {
            foreach ($channel in $expiredChannels) {
                $deleteCommand = "firebase hosting:channel:delete $($channel.name) --project $ProjectId"
                Invoke-SafeCommand $deleteCommand "Deleting channel: $($channel.name)"
            }
        }
    } else {
        Write-InfoMessage "DRY RUN: Would delete $($expiredChannels.Count) expired channels"
    }
    
    return $true
}

function Show-DeploymentInfo {
    Write-Host ""
    Write-Host "🚀 RankPilot Lean Channel Deployment Manager" -ForegroundColor $Green
    Write-Host "=============================================" -ForegroundColor $Green
    Write-Host ""
    Write-InfoMessage "Project: $ProjectId"
    Write-InfoMessage "Channel: $ChannelId"
    Write-InfoMessage "Mode: $Mode"
    Write-InfoMessage "Branch: $Branch"
    
    if ($DryRun) {
        Write-WarningMessage "DRY RUN MODE - No changes will be made"
    }
    Write-Host ""
}

# Main execution
Show-DeploymentInfo

if (!(Test-Prerequisites)) {
    Write-ErrorMessage "Prerequisites check failed"
    exit 1
}

switch ($Mode) {
    "test" {
        $ttl = $DefaultTTL
        if ($ExtendedTTL) { $ttl = $ExtendedTTLValue }
        
        if (Invoke-LeanDeployment $ttl) {
            Write-SuccessMessage "Test deployment initiated successfully"
        } else {
            Write-ErrorMessage "Test deployment failed"
            exit 1
        }
    }
    
    "backup" {
        $ttl = $ExtendedTTLValue
        
        if (Invoke-LeanDeployment $ttl) {
            Write-SuccessMessage "Backup deployment initiated successfully"
        } else {
            Write-ErrorMessage "Backup deployment failed"
            exit 1
        }
    }
    
    "cleanup" {
        if (Invoke-ChannelCleanup) {
            Write-SuccessMessage "Cleanup completed successfully"
        } else {
            Write-ErrorMessage "Cleanup failed"
            exit 1
        }
    }
    
    "status" {
        Get-ChannelStatus | Out-Null
        Write-SuccessMessage "Status check completed"
    }
    
    default {
        Write-ErrorMessage "Invalid mode: $Mode"
        Write-InfoMessage "Valid modes: test, backup, cleanup, status"
        exit 1
    }
}

Write-Host ""
Write-SuccessMessage "Lean channel deployment operation completed"
Write-Host ""

# Show helpful next steps
switch ($Mode) {
    "test", "backup" {
        Write-InfoMessage "Next steps:"
        Write-Host "  1. Monitor workflow progress: gh run watch" -ForegroundColor $Blue
        Write-Host "  2. Check deployment URL when ready" -ForegroundColor $Blue
        Write-Host "  3. Verify health: curl -I https://$ProjectId--$ChannelId-[RUN_ID].web.app" -ForegroundColor $Blue
    }
    
    "status" {
        Write-InfoMessage "Use other modes to manage channels:"
        Write-Host "  .\deploy-lean-channel.ps1 -Mode test     # Deploy for testing" -ForegroundColor $Blue
        Write-Host "  .\deploy-lean-channel.ps1 -Mode backup  # Deploy as backup" -ForegroundColor $Blue
        Write-Host "  .\deploy-lean-channel.ps1 -Mode cleanup # Clean expired channels" -ForegroundColor $Blue
    }
}
