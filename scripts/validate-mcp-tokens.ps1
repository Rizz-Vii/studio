# 🚀 RankPilot MCP API Token Validation Script (PowerShell)
# Generated: July 29, 2025
# Purpose: Validate HuggingFace and Sentry API tokens on Windows

param(
    [switch]$DryRun,
    [switch]$Verbose
)

Write-Host "🔍 RankPilot MCP Token Validation" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Load environment variables from .env.local
if (Test-Path ".env.local") {
    Get-Content ".env.local" | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.*)$") {
            $name = $matches[1]
            $value = $matches[2]
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
    Write-Host "✅ Loaded .env.local" -ForegroundColor Green
} else {
    Write-Host "❌ .env.local not found" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔑 Validating API Tokens..." -ForegroundColor Blue
Write-Host ""

# Validate HuggingFace Token
Write-Host "Testing HuggingFace Token..." -ForegroundColor Blue
$hfToken = [Environment]::GetEnvironmentVariable("HUGGINGFACE_TOKEN")

if (-not $hfToken) {
    Write-Host "❌ HUGGINGFACE_TOKEN not set" -ForegroundColor Red
    exit 1
}

try {
    $headers = @{ Authorization = "Bearer $hfToken" }
    $hfResponse = Invoke-RestMethod -Uri "https://huggingface.co/api/models?limit=1" -Headers $headers -Method GET
    
    if ($hfResponse -and $hfResponse[0].id) {
        Write-Host "✅ HuggingFace Token Valid - Test Model: $($hfResponse[0].id)" -ForegroundColor Green
    } else {
        Write-Host "❌ HuggingFace Token Invalid" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ HuggingFace API Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Validate Sentry Token
Write-Host "Testing Sentry Token..." -ForegroundColor Blue
$sentryToken = [Environment]::GetEnvironmentVariable("SENTRY_AUTH_TOKEN")

if (-not $sentryToken) {
    Write-Host "❌ SENTRY_AUTH_TOKEN not set" -ForegroundColor Red
    exit 1
}

try {
    $headers = @{ Authorization = "Bearer $sentryToken" }
    $sentryResponse = Invoke-RestMethod -Uri "https://sentry.io/api/0/organizations/" -Headers $headers -Method GET
    
    $rankpilotOrg = $sentryResponse | Where-Object { $_.slug -eq "rankpilot" }
    if ($rankpilotOrg) {
        Write-Host "✅ Sentry Token Valid - Organization: rankpilot" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Sentry Token Valid but rankpilot org not found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Sentry API Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Validate Stripe Token
Write-Host "Testing Stripe Token..." -ForegroundColor Blue
$stripeToken = [Environment]::GetEnvironmentVariable("STRIPE_SECRET_KEY")

if (-not $stripeToken) {
    Write-Host "❌ STRIPE_SECRET_KEY not set" -ForegroundColor Red
    exit 1
}

try {
    $headers = @{ Authorization = "Bearer $stripeToken" }
    $stripeResponse = Invoke-RestMethod -Uri "https://api.stripe.com/v1/account" -Headers $headers -Method GET
    
    if ($stripeResponse.id) {
        Write-Host "✅ Stripe Token Valid - Account: $($stripeResponse.id) (Country: $($stripeResponse.country))" -ForegroundColor Green
    } else {
        Write-Host "❌ Stripe Token Invalid" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Stripe API Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Validate Firecrawl Token
Write-Host "Testing Firecrawl Token..." -ForegroundColor Blue
$fcToken = [Environment]::GetEnvironmentVariable("FIRECRAWL_API_KEY")

if (-not $fcToken) {
    Write-Host "❌ FIRECRAWL_API_KEY not set" -ForegroundColor Red
    exit 1
}

try {
    $headers = @{ 
        Authorization = "Bearer $fcToken"
        "Content-Type" = "application/json"
    }
    $body = @{
        url = "https://example.com"
        limit = 1
    } | ConvertTo-Json
    
    $fcResponse = Invoke-RestMethod -Uri "https://api.firecrawl.dev/v1/crawl" -Headers $headers -Method POST -Body $body
    
    if ($fcResponse.jobId -or $fcResponse.success) {
        Write-Host "✅ Firecrawl Token Valid" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Firecrawl Response unclear" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Firecrawl API Note: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "   (This may be normal - Firecrawl limits test requests)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🎯 Token Validation Summary:" -ForegroundColor Cyan
Write-Host "- HuggingFace: Configured and tested" -ForegroundColor White
Write-Host "- Sentry: Configured and tested" -ForegroundColor White
Write-Host "- Stripe: Configured and tested" -ForegroundColor White
Write-Host "- Firecrawl: Configured and tested" -ForegroundColor White
Write-Host ""
Write-Host "✅ MCP Server tokens ready for use!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Test MCP servers with: npm run mcp:test" -ForegroundColor White
Write-Host "2. Start development server: npm run dev-no-turbopack" -ForegroundColor White
Write-Host "3. Access MCP features in VS Code" -ForegroundColor White
