# RankPilot Safe Testing Commands
# Prevents DDoS on production while maintaining comprehensive testing

# 🏠 Local Development - Full Testing Suite
function Test-Development {
    Write-Host "🚀 Running full test suite in development environment" -ForegroundColor Green
    $env:NODE_ENV = "development"
    npm run test:safe
}

# 🎭 Preview Channel Testing - Safe Load Testing
function Test-Preview {
    param([string]$PreviewUrl)
    Write-Host "🎭 Running preview channel tests with safe load testing" -ForegroundColor Cyan
    $env:PREVIEW_URL = $PreviewUrl
    npm run test:preview
}

# 🔒 Production Monitoring - NO LOAD TESTING
function Test-Production-Safe {
    Write-Host "🛡️ Running SAFE production monitoring (no load testing)" -ForegroundColor Yellow
    Write-Host "   ✅ Single requests only" -ForegroundColor Yellow
    Write-Host "   ✅ 2 second delays between requests" -ForegroundColor Yellow
    Write-Host "   ✅ Health checks only" -ForegroundColor Yellow
    
    $env:NODE_ENV = "production"
    npx playwright test --config=playwright.config.safe.ts safe-production-monitoring
}

# 🔍 Environment Check
function Check-Test-Environment {
    Write-Host "🔍 Current Test Environment Configuration:" -ForegroundColor Magenta
    
    $nodeEnv = $env:NODE_ENV ?? "development"
    $previewUrl = $env:PREVIEW_URL ?? "none"
    
    Write-Host "   NODE_ENV: $nodeEnv" -ForegroundColor White
    Write-Host "   PREVIEW_URL: $previewUrl" -ForegroundColor White
    
    if ($nodeEnv -eq "production") {
        Write-Host "   🚨 PRODUCTION MODE - Load testing DISABLED" -ForegroundColor Red
    } else {
        Write-Host "   ✅ Load testing available" -ForegroundColor Green
    }
}

# 📊 Run Specific Test Category
function Test-Category {
    param(
        [ValidateSet("smoke", "critical", "load", "security", "mobile")]
        [string]$Category
    )
    
    Write-Host "🎯 Running $Category tests with environment safety checks" -ForegroundColor Blue
    
    switch ($Category) {
        "smoke" { 
            npx playwright test --config=playwright.config.safe.ts --grep="smoke"
        }
        "critical" { 
            npx playwright test --config=playwright.config.safe.ts critical-
        }
        "load" { 
            Check-Test-Environment
            if ($env:NODE_ENV -eq "production") {
                Write-Host "🚨 Load testing disabled in production" -ForegroundColor Red
                return
            }
            npx playwright test --config=playwright.config.safe.ts load
        }
        "security" { 
            npx playwright test --config=playwright.config.safe.ts --grep="security"
        }
        "mobile" { 
            npx playwright test --config=playwright.config.safe.ts --grep="mobile"
        }
    }
}

# 🚀 Quick Commands
Write-Host "🚀 RankPilot Safe Testing Commands Available:" -ForegroundColor Green
Write-Host "   Test-Development          # Full testing in dev environment" -ForegroundColor White
Write-Host "   Test-Preview -PreviewUrl <url>  # Safe testing on preview channel" -ForegroundColor White
Write-Host "   Test-Production-Safe      # SAFE production monitoring only" -ForegroundColor White
Write-Host "   Check-Test-Environment    # Check current environment config" -ForegroundColor White
Write-Host "   Test-Category -Category <type>  # Run specific test category" -ForegroundColor White
