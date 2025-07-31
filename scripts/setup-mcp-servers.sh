#!/bin/bash

# 🔧 RankPilot MCP Server Setup Script
# This script helps set up Model Context Protocol (MCP) servers for enhanced AI capabilities

echo "🚀 RankPilot MCP Server Setup"
echo "============================="
echo ""

# Check if mcp.json exists
if [ ! -f "mcp.json" ]; then
    echo "❌ mcp.json not found. Please ensure you're in the project root directory."
    exit 1
fi

echo "✅ Found mcp.json configuration"
echo ""

# Display current MCP server configuration
echo "📋 Current MCP Server Configuration:"
echo "======================================"
echo ""

# Check for required MCP servers
servers=(
    "markitdown"
    "playwright" 
    "sequentialthinking"
    "firecrawl"
    "stripe"
    "sentry"
    "huggingface"
    "zapier"
    "github"
    "filesystem"
    "brave-search"
)

echo "🔧 Configured MCP Servers (11 total):"
for server in "${servers[@]}"; do
    if grep -q "\"$server\"" mcp.json; then
        echo "  ✅ $server"
    else
        echo "  ❌ $server (not found)"
    fi
done

echo ""
echo "🔑 Required API Keys Setup:"
echo "=========================="
echo ""

echo "1. 🤗 HuggingFace Token:"
echo "   URL: https://huggingface.co/settings/tokens"
echo "   Action: Create token with 'Read' permission"
echo "   Variable: huggingface_token"
echo ""

echo "2. 🔥 Firecrawl API Key:"
echo "   URL: https://www.firecrawl.dev/app/api-keys"
echo "   Action: Sign up and create API key"
echo "   Variable: firecrawl_api_key"
echo ""

echo "3. 💳 Stripe API Key:"
echo "   URL: https://dashboard.stripe.com/apikeys"
echo "   Action: Copy your test/live secret key"
echo "   Variable: stripe_api_key"
echo ""

echo "4. 🛡️ Sentry Auth Token:"
echo "   URL: Your Sentry project settings → Auth Tokens"
echo "   Action: Create token with project:read permission"
echo "   Variable: sentry_auth_token"
echo ""

echo "5. ⚡ Zapier API Key:"
echo "   URL: https://developer.zapier.com/partner-settings/deploy-keys"
echo "   Action: Create API key"
echo "   Variable: zapier_api_key"
echo ""

echo "6. 🐙 GitHub Token (Optional):"
echo "   URL: https://github.com/settings/tokens"
echo "   Action: Create token with repo permissions"
echo "   Variable: github_token"
echo ""

echo "7. 🔍 Brave Search API Key (Optional):"
echo "   URL: https://brave.com/search/api/"
echo "   Action: Sign up and get API key"
echo "   Variable: brave_api_key"
echo ""

# Check if VS Code is available
if command -v code &> /dev/null; then
    echo "🎯 Quick Actions:"
    echo "================"
    echo ""
    echo "1. Install MCP dependencies:"
    echo "   npm install -g @modelcontextprotocol/server-sequential-thinking"
    echo "   npm install -g firecrawl-mcp"
    echo "   npm install -g @playwright/mcp"
    echo ""
    
    echo "2. Test MCP server connections:"
    echo "   npx @modelcontextprotocol/server-sequential-thinking --version"
    echo "   npx firecrawl-mcp --help"
    echo ""
    
    echo "3. Open configuration files:"
    echo "   code mcp.json"
    echo "   code masterKeys.md"
    echo "   code docs/ENVIRONMENT_VARIABLES.md"
    echo ""
fi

echo "🔒 Security Notes:"
echo "=================="
echo ""
echo "- All API keys are securely prompted when MCP servers start"
echo "- Keys are not stored in plain text in configuration files"
echo "- Use environment variables or secure key management"
echo "- Never commit actual API keys to version control"
echo ""

echo "✨ Enhanced AI Capabilities with MCP:"
echo "====================================="
echo ""
echo "- 🌐 Web scraping with Firecrawl"
echo "- 🤖 Advanced AI models via HuggingFace"
echo "- 💳 Payment processing with Stripe"
echo "- 🛡️ Error monitoring with Sentry"
echo "- ⚡ Workflow automation with Zapier"
echo "- 🎭 Browser automation with Playwright"
echo "- 🧠 Sequential thinking for complex problems"
echo "- 📄 Document processing with MarkItDown"
echo "- 🐙 GitHub repository management"
echo "- 📁 Local filesystem operations"
echo "- 🔍 Web search with Brave Search"
echo ""

echo "🚀 Ready to enhance your AI development workflow!"
echo "Check VS Code for MCP server prompts when using AI features."
