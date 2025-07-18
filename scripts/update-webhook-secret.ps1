# PowerShell script to update webhook secret after creating webhook in Stripe Dashboard
# Replace WEBHOOK_SECRET_HERE with the actual secret from Stripe

param(
    [Parameter(Mandatory=$true)]
    [string]$WebhookSecret
)

if ($WebhookSecret -eq "WEBHOOK_SECRET_HERE" -or $WebhookSecret -eq "") {
    Write-Host "❌ Error: Please provide the actual webhook secret from Stripe Dashboard" -ForegroundColor Red
    Write-Host "Usage: .\update-webhook-secret.ps1 -WebhookSecret 'whsec_your_actual_secret_here'" -ForegroundColor Yellow
    exit 1
}

if (-not $WebhookSecret.StartsWith("whsec_")) {
    Write-Host "⚠️  Warning: Webhook secret should start with 'whsec_'" -ForegroundColor Yellow
    $confirm = Read-Host "Continue anyway? (y/N)"
    if ($confirm -ne "y" -and $confirm -ne "Y") {
        exit 1
    }
}

Write-Host "🔧 Updating Firebase Secret..." -ForegroundColor Blue
echo $WebhookSecret | firebase functions:secrets:set STRIPE_WEBHOOK_SECRET --project rankpilot-h3jpc

Write-Host "🔧 Updating Firebase Functions Config..." -ForegroundColor Blue
firebase functions:config:set stripe.webhook_secret="$WebhookSecret" --project rankpilot-h3jpc

Write-Host "🔧 Updating local .env.local file..." -ForegroundColor Blue
$envPath = ".\.env.local"
if (Test-Path $envPath) {
    $envContent = Get-Content $envPath
    $newContent = @()
    $webhookUpdated = $false
    
    foreach ($line in $envContent) {
        if ($line -match "^STRIPE_WEBHOOK_SECRET=") {
            $newContent += "STRIPE_WEBHOOK_SECRET=$WebhookSecret"
            $webhookUpdated = $true
        } else {
            $newContent += $line
        }
    }
    
    if (-not $webhookUpdated) {
        $newContent += "STRIPE_WEBHOOK_SECRET=$WebhookSecret"
    }
    
    $newContent | Set-Content $envPath
    Write-Host "✅ Updated .env.local with webhook secret" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env.local file not found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Webhook secret updated successfully!" -ForegroundColor Green
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Deploy functions: firebase deploy --only functions" -ForegroundColor White
Write-Host "   2. Test webhook: Create a test payment in Stripe Dashboard" -ForegroundColor White
Write-Host "   3. Check Firebase Functions logs for webhook events" -ForegroundColor White
