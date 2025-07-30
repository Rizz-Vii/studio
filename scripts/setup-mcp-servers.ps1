# 🔧 RankPilot MCP Server Setup Script (PowerShell)
# This script helps set up Model Context Protocol (MCP) servers for enhanced AI capabilities

Write-Host "🚀 RankPilot MCP Server Setup" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green
Write-Host ""

# Check if mcp.json exists
if (-not (Test-Path "mcp.json")) {
    Write-Host "❌ mcp.json not found. Please ensure you're in the project root directory." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Found mcp.json configuration" -ForegroundColor Green
Write-Host ""

# Display current MCP server configuration
Write-Host "📋 Current MCP Server Configuration:" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check for required MCP servers
$servers = @(
    "markitdown",
    "playwright", 
    "sequentialthinking",
    "firecrawl",
    "stripe",
    "sentry",
    "huggingface",
    "zapier",
    "github",
    "filesystem",
    "brave-search"
)

Write-Host "🔧 Configured MCP Servers (11 total):" -ForegroundColor Yellow
$mcpContent = Get-Content "mcp.json" -Raw
foreach ($server in $servers) {
    if ($mcpContent -match "`"$server`"") {
        Write-Host "  ✅ $server" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $server (not found)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🔑 Required API Keys Setup:" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. 🤗 HuggingFace Token:" -ForegroundColor Yellow
Write-Host "   URL: https://huggingface.co/settings/tokens" -ForegroundColor White
Write-Host "   Action: Create token with 'Read' permission" -ForegroundColor Gray
Write-Host "   Variable: huggingface_token" -ForegroundColor Gray
Write-Host ""

Write-Host "2. 🔥 Firecrawl API Key:" -ForegroundColor Yellow
Write-Host "   URL: https://www.firecrawl.dev/app/api-keys" -ForegroundColor White
Write-Host "   Action: Sign up and create API key" -ForegroundColor Gray
Write-Host "   Variable: firecrawl_api_key" -ForegroundColor Gray
Write-Host ""

Write-Host "3. 💳 Stripe API Key:" -ForegroundColor Yellow
Write-Host "   URL: https://dashboard.stripe.com/apikeys" -ForegroundColor White
Write-Host "   Action: Copy your test/live secret key" -ForegroundColor Gray
Write-Host "   Variable: stripe_api_key" -ForegroundColor Gray
Write-Host ""

Write-Host "4. 🛡️ Sentry Auth Token:" -ForegroundColor Yellow
Write-Host "   URL: Your Sentry project settings → Auth Tokens" -ForegroundColor White
Write-Host "   Action: Create token with project:read permission" -ForegroundColor Gray
Write-Host "   Variable: sentry_auth_token" -ForegroundColor Gray
Write-Host ""

Write-Host "5. ⚡ Zapier API Key:" -ForegroundColor Yellow
Write-Host "   URL: https://developer.zapier.com/partner-settings/deploy-keys" -ForegroundColor White
Write-Host "   Action: Create API key" -ForegroundColor Gray
Write-Host "   Variable: zapier_api_key" -ForegroundColor Gray
Write-Host ""

Write-Host "6. 🐙 GitHub Token (Optional):" -ForegroundColor Yellow
Write-Host "   URL: https://github.com/settings/tokens" -ForegroundColor White
Write-Host "   Action: Create token with repo permissions" -ForegroundColor Gray
Write-Host "   Variable: github_token" -ForegroundColor Gray
Write-Host ""

Write-Host "7. 🔍 Brave Search API Key (Optional):" -ForegroundColor Yellow
Write-Host "   URL: https://brave.com/search/api/" -ForegroundColor White
Write-Host "   Action: Sign up and get API key" -ForegroundColor Gray
Write-Host "   Variable: brave_api_key" -ForegroundColor Gray
Write-Host ""

# Check if VS Code is available
if (Get-Command code -ErrorAction SilentlyContinue) {
    Write-Host "🎯 Quick Actions:" -ForegroundColor Cyan
    Write-Host "================" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "1. Install MCP dependencies:" -ForegroundColor White
    Write-Host "   npm install -g @modelcontextprotocol/server-sequential-thinking" -ForegroundColor Gray
    Write-Host "   npm install -g firecrawl-mcp" -ForegroundColor Gray
    Write-Host "   npm install -g @playwright/mcp" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "2. Test MCP server connections:" -ForegroundColor White
    Write-Host "   npx @modelcontextprotocol/server-sequential-thinking --version" -ForegroundColor Gray
    Write-Host "   npx firecrawl-mcp --help" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "3. Open configuration files:" -ForegroundColor White
    Write-Host "   code mcp.json" -ForegroundColor Gray
    Write-Host "   code masterKeys.md" -ForegroundColor Gray
    Write-Host "   code docs/ENVIRONMENT_VARIABLES.md" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "🔒 Security Notes:" -ForegroundColor Cyan
Write-Host "==================" -ForegroundColor Cyan
Write-Host ""
Write-Host "- All API keys are securely prompted when MCP servers start" -ForegroundColor White
Write-Host "- Keys are not stored in plain text in configuration files" -ForegroundColor White
Write-Host "- Use environment variables or secure key management" -ForegroundColor White
Write-Host "- Never commit actual API keys to version control" -ForegroundColor White
Write-Host ""

Write-Host "✨ Enhanced AI Capabilities with MCP:" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "- 🌐 Web scraping with Firecrawl" -ForegroundColor White
Write-Host "- 🤖 Advanced AI models via HuggingFace" -ForegroundColor White
Write-Host "- 💳 Payment processing with Stripe" -ForegroundColor White
Write-Host "- 🛡️ Error monitoring with Sentry" -ForegroundColor White
Write-Host "- ⚡ Workflow automation with Zapier" -ForegroundColor White
Write-Host "- 🎭 Browser automation with Playwright" -ForegroundColor White
Write-Host "- 🧠 Sequential thinking for complex problems" -ForegroundColor White
Write-Host "- 📄 Document processing with MarkItDown" -ForegroundColor White
Write-Host "- 🐙 GitHub repository management" -ForegroundColor White
Write-Host "- 📁 Local filesystem operations" -ForegroundColor White
Write-Host "- 🔍 Web search with Brave Search" -ForegroundColor White
Write-Host ""

Write-Host "🚀 Ready to enhance your AI development workflow!" -ForegroundColor Green
Write-Host "Check VS Code for MCP server prompts when using AI features." -ForegroundColor White

# Prompt for quick setup
Write-Host ""
$response = Read-Host "Would you like to open the configuration files now? (y/n)"
if ($response -eq "y" -or $response -eq "Y") {
    if (Get-Command code -ErrorAction SilentlyContinue) {
        Write-Host "Opening configuration files..." -ForegroundColor Green
        code mcp.json
        code masterKeys.md
        code docs/ENVIRONMENT_VARIABLES.md
    } else {
        Write-Host "VS Code not found. Please open the files manually." -ForegroundColor Yellow
    }
}
