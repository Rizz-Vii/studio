# Database Migration PowerShell Script
# Executes critical schema fixes using Next.js TypeScript environment

param(
    [switch]$FixActivities,
    [switch]$FixTiers,
    [switch]$All,
    [switch]$DryRun
)

Write-Host "🚨 RankPilot Database Migration Utility" -ForegroundColor Red
Write-Host "=====================================" -ForegroundColor Red

# Check if we're in the correct directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Must run from RankPilot root directory" -ForegroundColor Red
    exit 1
}

# Function to run TypeScript migration scripts
function Invoke-Migration {
    param(
        [string]$ScriptName,
        [string]$Description
    )
    
    Write-Host "`n🔧 $Description..." -ForegroundColor Yellow
    
    if ($DryRun) {
        Write-Host "🔍 DRY RUN: Would execute $ScriptName" -ForegroundColor Cyan
        return
    }
    
    try {
        # Use npx tsx to execute TypeScript directly
        $result = npx tsx $ScriptName
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $Description completed successfully!" -ForegroundColor Green
        } else {
            Write-Host "❌ $Description failed with exit code $LASTEXITCODE" -ForegroundColor Red
            throw "Migration failed"
        }
    }
    catch {
        Write-Host "❌ Error executing $Description : $($_.Exception.Message)" -ForegroundColor Red
        throw
    }
}

try {
    # Check if tsx is available
    Write-Host "🔍 Checking TypeScript execution environment..." -ForegroundColor Cyan
    $tsxCheck = npx tsx --version 2>$null
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "📦 Installing tsx for TypeScript execution..." -ForegroundColor Yellow
        npm install -g tsx
    }
    
    # Execute requested migrations
    if ($All -or $FixActivities) {
        Invoke-Migration "scripts/fix-activity-schema-conflicts.ts" "Activity Schema Migration"
    }
    
    if ($All -or $FixTiers) {
        Invoke-Migration "src/lib/user-tier-migration.ts" "Subscription Tier Migration"
    }
    
    if (-not ($All -or $FixActivities -or $FixTiers)) {
        Write-Host "`n📋 Available Operations:" -ForegroundColor Cyan
        Write-Host "  -FixActivities  : Fix activity type schema conflicts" -ForegroundColor White
        Write-Host "  -FixTiers      : Migrate legacy subscription tiers" -ForegroundColor White
        Write-Host "  -All           : Run all migrations" -ForegroundColor White
        Write-Host "  -DryRun        : Preview operations without execution" -ForegroundColor White
        Write-Host "`n💡 Example: .\scripts\migrate-database.ps1 -All" -ForegroundColor Yellow
    }
    
    Write-Host "`n🎉 Database migration operations completed!" -ForegroundColor Green
    
} catch {
    Write-Host "`n💥 MIGRATION FAILED: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "🔧 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  1. Ensure you're in the RankPilot root directory" -ForegroundColor White
    Write-Host "  2. Check Firebase credentials are configured" -ForegroundColor White
    Write-Host "  3. Verify network connectivity to Firebase" -ForegroundColor White
    exit 1
}
