# EMFILE Error Prevention and Recovery Script
# Comprehensive Windows file handle monitoring and optimization
# Author: RankPilot Engineering Team
# Version: 1.0
# Last Updated: July 21, 2025

param(
    [string]$Mode = "check",
    [int]$WarningThreshold = 8000,
    [int]$CriticalThreshold = 15000,
    [int]$MonitorInterval = 30,
    [switch]$AutoFix = $false,
    [switch]$Verbose = $false
)

# Color output functions
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Write-Success { 
    param([string]$Message) 
    Write-ColorOutput $Message "Green" 
}

function Write-Warning { 
    param([string]$Message) 
    Write-ColorOutput $Message "Yellow" 
}

function Write-Error { 
    param([string]$Message) 
    Write-ColorOutput $Message "Red" 
}

function Write-Info { 
    param([string]$Message) 
    Write-ColorOutput $Message "Cyan" 
}

# Get current file handle count
function Get-FileHandleCount {
    try {
        $handles = Get-Process | ForEach-Object { $_.HandleCount } | Measure-Object -Sum
        return $handles.Sum
    }
    catch {
        Write-Warning "Could not get precise handle count, using estimate"
        return (Get-Process | Measure-Object).Count * 50
    }
}

# Get VS Code processes and their handle counts
function Get-VSCodeProcesses {
    $vscodeProcesses = @()
    $processNames = @("Code", "node", "electron", "typescript", "eslint")
    
    foreach ($processName in $processNames) {
        try {
            $processes = Get-Process -Name $processName -ErrorAction SilentlyContinue
            foreach ($process in $processes) {
                $vscodeProcesses += [PSCustomObject]@{
                    Name = $process.Name
                    PID = $process.Id
                    HandleCount = $process.HandleCount
                    WorkingSet = [math]::Round($process.WorkingSet / 1MB, 2)
                    Path = try { $process.Path } catch { "N/A" }
                }
            }
        }
        catch {
            # Silently continue if process not found
        }
    }
    
    return $vscodeProcesses | Sort-Object HandleCount -Descending
}

# Clean temporary files and caches
function Clear-DevelopmentCaches {
    Write-Info "Cleaning development caches and temporary files..."
    
    $cachePaths = @(
        "$env:APPDATA\npm-cache",
        "$env:LOCALAPPDATA\Microsoft\TypeScript",
        "$env:LOCALAPPDATA\temp\npm-*",
        "$env:TEMP\vscode-*",
        ".next\cache",
        "node_modules\.cache",
        ".eslintcache",
        ".turbo"
    )
    
    foreach ($path in $cachePaths) {
        if (Test-Path $path) {
            try {
                Remove-Item $path -Recurse -Force -ErrorAction SilentlyContinue
                Write-Success "Cleaned: $path"
            }
            catch {
                Write-Warning "Could not clean: $path"
            }
        }
    }
}

# Optimize VS Code settings for file handle efficiency
function Optimize-VSCodeSettings {
    Write-Info "Optimizing VS Code workspace settings..."
    
    $workspaceSettingsPath = ".vscode\settings.json"
    $settingsDir = ".vscode"
    
    if (!(Test-Path $settingsDir)) {
        New-Item -ItemType Directory -Path $settingsDir -Force | Out-Null
    }
    
    $optimizedSettings = @{
        "files.watcherExclude" = @{
            "**/.git/objects/**" = $true
            "**/.git/subtree-cache/**" = $true
            "**/node_modules/*/**" = $true
            "**/.next/**" = $true
            "**/.turbo/**" = $true
            "**/dist/**" = $true
            "**/build/**" = $true
            "**/.cache/**" = $true
            "**/coverage/**" = $true
        }
        "search.exclude" = @{
            "**/node_modules" = $true
            "**/bower_components" = $true
            "**/.next" = $true
            "**/.turbo" = $true
            "**/dist" = $true
            "**/build" = $true
            "**/.cache" = $true
        }
        "files.exclude" = @{
            "**/.git" = $true
            "**/.svn" = $true
            "**/.hg" = $true
            "**/CVS" = $true
            "**/.DS_Store" = $true
            "**/node_modules" = $true
        }
        "typescript.preferences.includePackageJsonAutoImports" = "off"
        "typescript.suggest.autoImports" = $false
        "javascript.suggest.autoImports" = $false
        "extensions.autoUpdate" = $false
        "extensions.autoCheckUpdates" = $false
        "files.hotExit" = "onExitAndWindowClose"
        "workbench.settings.enableNaturalLanguageSearch" = $false
        "telemetry.telemetryLevel" = "off"
    }
    
    $settingsJson = $optimizedSettings | ConvertTo-Json -Depth 10
    Set-Content -Path $workspaceSettingsPath -Value $settingsJson -Encoding UTF8
    Write-Success "VS Code settings optimized"
}

# Close resource-heavy processes safely
function Close-ResourceHeavyProcesses {
    param([switch]$Force = $false)
    
    Write-Info "Identifying resource-heavy processes..."
    
    $heavyProcesses = Get-Process | Where-Object { 
        $_.HandleCount -gt 1000 -and 
        $_.Name -in @("node", "Code", "electron") 
    } | Sort-Object HandleCount -Descending
    
    if ($heavyProcesses.Count -eq 0) {
        Write-Success "No resource-heavy processes found"
        return
    }
    
    foreach ($process in $heavyProcesses) {
        Write-Warning "High handle count process: $($process.Name) (PID: $($process.Id)) - $($process.HandleCount) handles"
        
        if ($Force) {
            try {
                Stop-Process -Id $process.Id -Force
                Write-Success "Terminated process: $($process.Name)"
            }
            catch {
                Write-Error "Failed to terminate process: $($process.Name)"
            }
        }
    }
    
    if (!$Force) {
        Write-Info "Use -Force parameter to automatically terminate these processes"
    }
}

# Check system status
function Test-SystemStatus {
    Write-Info "=== EMFILE Error Prevention System Status ==="
    Write-Info "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    Write-Info ""
    
    # File handle count
    $totalHandles = Get-FileHandleCount
    Write-Info "Total System File Handles: $totalHandles"
    
    if ($totalHandles -gt $CriticalThreshold) {
        Write-Error "CRITICAL: File handle count exceeds threshold ($CriticalThreshold)"
        return $false
    }
    elseif ($totalHandles -gt $WarningThreshold) {
        Write-Warning "WARNING: File handle count approaching threshold ($WarningThreshold)"
    }
    else {
        Write-Success "OK: File handle count within normal range"
    }
    
    # VS Code processes
    $vscodeProcs = Get-VSCodeProcesses
    if ($vscodeProcs.Count -gt 0) {
        Write-Info ""
        Write-Info "VS Code Related Processes:"
        $vscodeProcs | ForEach-Object {
            if ($_.HandleCount -gt 2000) { 
                $status = "CRITICAL" 
            } elseif ($_.HandleCount -gt 1000) { 
                $status = "WARNING" 
            } else { 
                $status = "OK" 
            }
            Write-Info "$status $($_.Name) (PID: $($_.PID)) - $($_.HandleCount) handles, $($_.WorkingSet) MB"
        }
    }
    
    # Memory status
    $memory = Get-WmiObject -Class Win32_OperatingSystem
    $freeMemory = [math]::Round($memory.FreePhysicalMemory / 1MB, 2)
    $totalMemory = [math]::Round($memory.TotalVisibleMemorySize / 1MB, 2)
    $memoryUsage = [math]::Round((($totalMemory - $freeMemory) / $totalMemory) * 100, 2)
    
    Write-Info ""
    Write-Info "Memory Status: $memoryUsage% used ($freeMemory GB free of $totalMemory GB total)"
    
    return $totalHandles -lt $CriticalThreshold
}

# Fix EMFILE issues
function Repair-EMFILEIssues {
    Write-Info "=== Starting EMFILE Error Recovery ==="
    
    # Step 1: Check current status
    $statusOk = Test-SystemStatus
    
    if ($statusOk -and !$AutoFix) {
        Write-Success "System status is healthy. Use -AutoFix to run cleanup anyway."
        return
    }
    
    # Step 2: Clean caches
    Clear-DevelopmentCaches
    
    # Step 3: Optimize VS Code settings
    Optimize-VSCodeSettings
    
    # Step 4: Close heavy processes if critical
    $currentHandles = Get-FileHandleCount
    if ($currentHandles -gt $CriticalThreshold) {
        Write-Warning "Critical threshold exceeded. Attempting to close heavy processes..."
        Close-ResourceHeavyProcesses -Force
    }
    
    # Step 5: Verify improvement
    Start-Sleep -Seconds 3
    Write-Info ""
    Write-Info "=== Post-Recovery Status ==="
    Test-SystemStatus | Out-Null
    
    Write-Info ""
    Write-Success "EMFILE error recovery completed"
    Write-Info "Recommended: Restart VS Code for best results"
}

# Monitor system continuously
function Start-SystemMonitoring {
    Write-Info "=== Starting Continuous EMFILE Monitoring ==="
    Write-Info "Monitoring interval: $MonitorInterval seconds"
    Write-Info "Warning threshold: $WarningThreshold handles"
    Write-Info "Critical threshold: $CriticalThreshold handles"
    Write-Info "Press Ctrl+C to stop monitoring"
    Write-Info ""
    
    $alertCount = 0
    
    while ($true) {
        $currentHandles = Get-FileHandleCount
        $timestamp = Get-Date -Format 'HH:mm:ss'
        
        if ($currentHandles -gt $CriticalThreshold) {
            $alertCount++
            Write-Error "[$timestamp] CRITICAL: $currentHandles handles (Alert #$alertCount)"
            
            if ($AutoFix) {
                Write-Info "Auto-fix enabled. Running recovery..."
                Repair-EMFILEIssues
            }
        }
        elseif ($currentHandles -gt $WarningThreshold) {
            Write-Warning "[$timestamp] WARNING: $currentHandles handles"
        }
        else {
            if ($Verbose) {
                Write-Success "[$timestamp] OK: $currentHandles handles"
            }
        }
        
        Start-Sleep -Seconds $MonitorInterval
    }
}

# Run preventive maintenance
function Start-PreventiveMaintenance {
    Write-Info "=== Running Preventive Maintenance ==="
    
    # Daily cleanup routine
    Clear-DevelopmentCaches
    
    # Optimize settings
    Optimize-VSCodeSettings
    
    # Check for Windows updates that might affect file handling
    Write-Info "Checking Windows performance settings..."
    
    # Set high performance power plan
    try {
        $powerPlan = powercfg /getactivescheme
        if ($powerPlan -notlike "*High performance*") {
            Write-Info "Setting high performance power plan..."
            powercfg /setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c
            Write-Success "Power plan optimized"
        }
    }
    catch {
        Write-Warning "Could not optimize power plan"
    }
    
    # Clean Windows temp files
    Write-Info "Cleaning Windows temporary files..."
    try {
        Remove-Item "$env:TEMP\*" -Recurse -Force -ErrorAction SilentlyContinue
        Write-Success "Windows temp files cleaned"
    }
    catch {
        Write-Warning "Some temp files could not be cleaned"
    }
    
    Write-Success "Preventive maintenance completed"
}

# Main execution logic
function Main {
    Write-Info "EMFILE Error Prevention & Recovery Tool v1.0"
    Write-Info "=============================================="
    Write-Info ""
    
    switch ($Mode.ToLower()) {
        "check" {
            Test-SystemStatus | Out-Null
        }
        "fix" {
            Repair-EMFILEIssues
        }
        "monitor" {
            Start-SystemMonitoring
        }
        "preventive" {
            Start-PreventiveMaintenance
        }
        default {
            Write-Error "Invalid mode: $Mode"
            Write-Info "Valid modes: check, fix, monitor, preventive"
            Write-Info ""
            Write-Info "Examples:"
            Write-Info "  .\fix-emfile-error.ps1 -Mode check"
            Write-Info "  .\fix-emfile-error.ps1 -Mode fix -AutoFix"
            Write-Info "  .\fix-emfile-error.ps1 -Mode monitor -MonitorInterval 60"
            Write-Info "  .\fix-emfile-error.ps1 -Mode preventive"
        }
    }
}

# Execute main function
try {
    Main
}
catch {
    Write-Error "An error occurred: $($_.Exception.Message)"
    Write-Info "Please run as Administrator if permission issues occur"
}
