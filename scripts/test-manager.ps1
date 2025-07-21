# RankPilot Studio - Test Management Script
# Handles long wait times gracefully for Windows development

Write-Host "🧪 RankPilot Studio Test Manager" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

function Test-ServerStatus {
    Write-Host "🏥 Checking server health..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Server is running and responsive" -ForegroundColor Green
            return $true
        }
    }
    catch {
        Write-Host "❌ Server is not responsive" -ForegroundColor Red
        return $false
    }
}

function Start-DevServer {
    Write-Host "🚀 Starting development server..." -ForegroundColor Yellow
    
    # Check if server is already running
    if (Test-ServerStatus) {
        Write-Host "ℹ️ Server already running, continuing..." -ForegroundColor Blue
        return
    }
    
    # Start server in background
    Write-Host "📦 Starting npm dev server..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-Command", "cd '$PWD'; npm run dev-no-turbopack" -WindowStyle Minimized
    
    # Wait for server to be ready
    $attempts = 0
    $maxAttempts = 12 # 60 seconds total
    
    do {
        Start-Sleep 5
        $attempts++
        Write-Host "⏳ Waiting for server... (attempt $attempts/$maxAttempts)" -ForegroundColor Yellow
        
        if (Test-ServerStatus) {
            Write-Host "✅ Server is ready!" -ForegroundColor Green
            return
        }
    } while ($attempts -lt $maxAttempts)
    
    Write-Host "⚠️ Server may still be starting. Continuing with tests..." -ForegroundColor Yellow
}

function Run-GracefulTests {
    param(
        [string]$TestType = "stable"
    )
    
    Write-Host "🧪 Running graceful tests ($TestType)..." -ForegroundColor Yellow
    
    # Ensure server is running
    Start-DevServer
    
    # Run tests based on type
    switch ($TestType) {
        "stable" {
            Write-Host "🐌 Running stable tests (single worker, extended timeouts)..." -ForegroundColor Blue
            npm run test:stable
        }
        "graceful" {
            Write-Host "🤝 Running graceful tests (all basic tests)..." -ForegroundColor Blue
            npm run test:graceful
        }
        "critical" {
            Write-Host "⚡ Running critical tests (optimized config)..." -ForegroundColor Blue
            npm run test:critical
        }
        default {
            Write-Host "❓ Unknown test type. Running stable tests..." -ForegroundColor Yellow
            npm run test:stable
        }
    }
}

function Show-TestOptions {
    Write-Host ""
    Write-Host "Available test configurations:" -ForegroundColor Cyan
    Write-Host "1. stable   - Single worker, 90s timeouts, maximum stability" -ForegroundColor Green
    Write-Host "2. graceful - All tests with graceful error handling" -ForegroundColor Blue
    Write-Host "3. critical - Optimized performance testing" -ForegroundColor Yellow
    Write-Host ""
}

# Main execution
if ($args.Count -eq 0) {
    Show-TestOptions
    
    $choice = Read-Host "Select test type (1-3) or press Enter for stable"
    
    switch ($choice) {
        "1" { Run-GracefulTests "stable" }
        "2" { Run-GracefulTests "graceful" }
        "3" { Run-GracefulTests "critical" }
        "" { Run-GracefulTests "stable" }
        default { 
            Write-Host "Invalid choice. Running stable tests..." -ForegroundColor Yellow
            Run-GracefulTests "stable" 
        }
    }
} else {
    Run-GracefulTests $args[0]
}

Write-Host ""
Write-Host "🎉 Test session completed!" -ForegroundColor Green
