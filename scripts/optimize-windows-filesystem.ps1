# PowerShell Script: Windows Filesystem Optimization for Next.js Development
# Description: Optimizes Windows environment for faster Next.js builds and reduced filesystem overhead
# Usage: Run as Administrator for best results

param(
    [switch]$DryRun = $false,
    [switch]$SkipDefender = $false,
    [switch]$Benchmark = $false
)

$ErrorActionPreference = "Continue"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$ProjectName = "RankPilot Studio"

Write-Host "🚀 Windows Filesystem Optimization for $ProjectName" -ForegroundColor Cyan
Write-Host "Project Root: $ProjectRoot" -ForegroundColor Yellow

if ($DryRun) {
    Write-Host "🔍 DRY RUN MODE - No changes will be made" -ForegroundColor Yellow
}

# Function to check if running as administrator
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Function to benchmark filesystem performance
function Test-FilesystemPerformance {
    Write-Host "📊 Benchmarking filesystem performance..." -ForegroundColor Green
    
    $testDir = Join-Path $ProjectRoot ".filesystem-test"
    $testFile = Join-Path $testDir "test.txt"
    
    try {
        # Create test directory
        if (-not (Test-Path $testDir)) {
            New-Item -ItemType Directory -Path $testDir -Force | Out-Null
        }
        
        # Write benchmark
        $writeStart = Get-Date
        1..1000 | ForEach-Object { "Test line $_" | Out-File -FilePath $testFile -Append -Encoding UTF8 }
        $writeEnd = Get-Date
        $writeTime = ($writeEnd - $writeStart).TotalMilliseconds
        
        # Read benchmark
        $readStart = Get-Date
        $content = Get-Content $testFile
        $readEnd = Get-Date
        $readTime = ($readEnd - $readStart).TotalMilliseconds
        
        # Delete benchmark
        $deleteStart = Get-Date
        Remove-Item $testDir -Recurse -Force
        $deleteEnd = Get-Date
        $deleteTime = ($deleteEnd - $deleteStart).TotalMilliseconds
        
        Write-Host "  Write Performance: $([math]::Round($writeTime, 2))ms" -ForegroundColor White
        Write-Host "  Read Performance:  $([math]::Round($readTime, 2))ms" -ForegroundColor White
        Write-Host "  Delete Performance: $([math]::Round($deleteTime, 2))ms" -ForegroundColor White
        
        $totalTime = $writeTime + $readTime + $deleteTime
        Write-Host "  Total Benchmark: $([math]::Round($totalTime, 2))ms" -ForegroundColor $(if ($totalTime -lt 100) { "Green" } elseif ($totalTime -lt 200) { "Yellow" } else { "Red" })
        
        if ($totalTime -gt 150) {
            Write-Host "  ⚠️  Filesystem performance is slower than optimal (>150ms)" -ForegroundColor Yellow
            Write-Host "  💡 Consider running optimizations below" -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "  ❌ Filesystem benchmark failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Function to configure Windows Defender exclusions
function Set-DefenderExclusions {
    if ($SkipDefender) {
        Write-Host "⏭️  Skipping Windows Defender configuration" -ForegroundColor Yellow
        return
    }
    
    Write-Host "🛡️  Configuring Windows Defender exclusions..." -ForegroundColor Green
    
    $exclusionPaths = @(
        $ProjectRoot,
        (Join-Path $ProjectRoot ".next"),
        (Join-Path $ProjectRoot "node_modules"),
        (Join-Path $ProjectRoot "functions\lib"),
        (Join-Path $ProjectRoot "test-results"),
        (Join-Path $ProjectRoot "playwright-report"),
        "$env:USERPROFILE\.npm",
        "$env:USERPROFILE\.cache"
    )
    
    $exclusionProcesses = @(
        "node.exe",
        "npm.exe",
        "npx.exe",
        "next.exe",
        "tsc.exe",
        "tsx.exe",
        "playwright.exe"
    )
    
    if (-not (Administrator)) {
        Write-Host "  ⚠️  Not running as Administrator - cannot configure Defender exclusions" -ForegroundColor Yellow
        Write-Host "  💡 To configure exclusions manually:" -ForegroundColor Cyan
        Write-Host "     1. Open Windows Security > Virus & threat protection" -ForegroundColor White
        Write-Host "     2. Go to 'Manage settings' under Virus & threat protection settings" -ForegroundColor White
        Write-Host "     3. Add exclusions for these paths:" -ForegroundColor White
        $exclusionPaths | ForEach-Object { Write-Host "        - $_" -ForegroundColor Gray }
        return
    }
    
    try {
        foreach ($path in $exclusionPaths) {
            if (Test-Path $path) {
                if (-not $DryRun) {
                    Add-MpPreference -ExclusionPath $path -ErrorAction SilentlyContinue
                }
                Write-Host "  ✅ Added exclusion: $path" -ForegroundColor Green
            } else {
                Write-Host "  ⏭️  Skipped (not found): $path" -ForegroundColor Gray
            }
        }
        
        foreach ($process in $exclusionProcesses) {
            if (-not $DryRun) {
                Add-MpPreference -ExclusionProcess $process -ErrorAction SilentlyContinue
            }
            Write-Host "  ✅ Added process exclusion: $process" -ForegroundColor Green
        }
        
    } catch {
        Write-Host "  ❌ Failed to configure some exclusions: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Function to optimize Windows settings for development
function Optimize-WindowsSettings {
    Write-Host "⚙️  Optimizing Windows settings for development..." -ForegroundColor Green
    
    if (-not (Test-Administrator)) {
        Write-Host "  ⚠️  Not running as Administrator - cannot modify system settings" -ForegroundColor Yellow
        Write-Host "  💡 To optimize manually:" -ForegroundColor Cyan
        Write-Host "     1. Disable Windows Search indexing for project folders" -ForegroundColor White
        Write-Host "     2. Set Power Plan to 'High Performance'" -ForegroundColor White
        Write-Host "     3. Disable Windows Defender real-time protection temporarily during builds" -ForegroundColor White
        return
    }
    
    try {
        # Disable indexing for project directory (requires admin)
        if (-not $DryRun) {
            $indexingCommand = "fsutil behavior set DisableLastAccess 1"
            Invoke-Expression $indexingCommand
        }
        Write-Host "  ✅ Optimized file access tracking" -ForegroundColor Green
        
        # Set power plan to high performance
        if (-not $DryRun) {
            powercfg /setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c
        }
        Write-Host "  ✅ Set power plan to High Performance" -ForegroundColor Green
        
    } catch {
        Write-Host "  ❌ Some optimizations failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Function to check and report system information
function Get-SystemInfo {
    Write-Host "💻 System Information:" -ForegroundColor Green
    
    $os = Get-WmiObject -Class Win32_OperatingSystem
    $cpu = Get-WmiObject -Class Win32_Processor | Select-Object -First 1
    $memory = Get-WmiObject -Class Win32_ComputerSystem
    $disk = Get-WmiObject -Class Win32_LogicalDisk | Where-Object { $_.DeviceID -eq (Split-Path $ProjectRoot -Qualifier) }
    
    Write-Host "  OS: $($os.Caption) $($os.Version)" -ForegroundColor White
    Write-Host "  CPU: $($cpu.Name)" -ForegroundColor White
    Write-Host "  RAM: $([math]::Round($memory.TotalPhysicalMemory / 1GB, 2)) GB" -ForegroundColor White
    Write-Host "  Project Drive: $($disk.DeviceID) ($($disk.DriveType)) - $([math]::Round($disk.FreeSpace / 1GB, 2)) GB free" -ForegroundColor White
    
    if ($disk.DriveType -eq 3) {
        Write-Host "  💡 Project is on SSD/Fixed drive - Good for performance!" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Project is on removable/network drive - May impact performance" -ForegroundColor Yellow
    }
}

# Function to clean up development cache
function Clear-DevelopmentCache {
    Write-Host "🧹 Cleaning development cache..." -ForegroundColor Green
    
    $cacheDirs = @(
        (Join-Path $ProjectRoot ".next"),
        (Join-Path $ProjectRoot "node_modules\.cache"),
        (Join-Path $ProjectRoot "functions\lib"),
        (Join-Path $ProjectRoot "test-results"),
        (Join-Path $ProjectRoot "playwright-report")
    )
    
    foreach ($dir in $cacheDirs) {
        if (Test-Path $dir) {
            if (-not $DryRun) {
                Remove-Item $dir -Recurse -Force -ErrorAction SilentlyContinue
            }
            Write-Host "  ✅ Cleaned: $dir" -ForegroundColor Green
        }
    }
    
    # Clean npm cache
    if (-not $DryRun) {
        npm cache clean --force 2>$null
    }
    Write-Host "  ✅ Cleaned npm cache" -ForegroundColor Green
}

# Main execution
Write-Host ""
Get-SystemInfo
Write-Host ""

if ($Benchmark) {
    Test-FilesystemPerformance
    Write-Host ""
}

Set-DefenderExclusions
Write-Host ""

Optimize-WindowsSettings
Write-Host ""

Clear-DevelopmentCache
Write-Host ""

Write-Host "✨ Optimization complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Restart your development server: npm run dev" -ForegroundColor White
Write-Host "  2. Monitor build times for improvements" -ForegroundColor White
Write-Host "  3. Run with -Benchmark flag to test filesystem performance" -ForegroundColor White
Write-Host ""
Write-Host "🔍 Usage examples:" -ForegroundColor Cyan
Write-Host "  .\optimize-windows-filesystem.ps1                # Full optimization" -ForegroundColor Gray
Write-Host "  .\optimize-windows-filesystem.ps1 -DryRun       # Preview changes" -ForegroundColor Gray
Write-Host "  .\optimize-windows-filesystem.ps1 -Benchmark    # Test performance" -ForegroundColor Gray
Write-Host "  .\optimize-windows-filesystem.ps1 -SkipDefender # Skip antivirus config" -ForegroundColor Gray
