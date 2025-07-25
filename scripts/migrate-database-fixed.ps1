# Simple PowerShell script to trigger migration via API
param(
    [switch]$DryRun = $false
)

Write-Host "🚨 Database Migration Tool" -ForegroundColor Yellow
Write-Host "=========================" -ForegroundColor Yellow

if ($DryRun) {
    Write-Host "📋 DRY RUN MODE - No changes will be made" -ForegroundColor Cyan
    Write-Host "🌐 Opening migration tool in browser..." -ForegroundColor Green
    Start-Process "http://localhost:3000/migration-tool.html"
    exit 0
}

Write-Host "🌐 Opening migration tool in browser..." -ForegroundColor Green
Start-Process "http://localhost:3000/migration-tool.html"

Write-Host ""
Write-Host "📋 Manual steps:" -ForegroundColor Cyan
Write-Host "  1. Ensure dev server is running (npm run dev-no-turbopack)" -ForegroundColor White
Write-Host "  2. Click 'Execute Migration' button in the browser" -ForegroundColor White
Write-Host "  3. Monitor the output for results" -ForegroundColor White
Write-Host ""

Write-Host "🔄 Attempting automatic execution..." -ForegroundColor Yellow

# Wait a moment for browser to load
Start-Sleep -Seconds 3

# Try to execute via PowerShell
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/migrate-db" -Method POST -ContentType "application/json"
    
    if ($response.success) {
        Write-Host "✅ MIGRATION COMPLETED SUCCESSFULLY!" -ForegroundColor Green
        Write-Host "📊 Total activities scanned: $($response.totalScanned)" -ForegroundColor White
        Write-Host "🔄 Activities updated: $($response.updated)" -ForegroundColor White
        
        if ($response.migrations -and $response.migrations.Count -gt 0) {
            Write-Host "📋 Migration details:" -ForegroundColor Cyan
            foreach ($migration in $response.migrations) {
                Write-Host "  $($migration.currentType) → $($migration.newType)" -ForegroundColor White
            }
        }
    } else {
        Write-Host "❌ Migration failed: $($response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "⚠️  Automatic execution failed. Please use the browser interface." -ForegroundColor Yellow
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ Migration tool ready!" -ForegroundColor Green
