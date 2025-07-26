#!/bin/bash
# 
# Development Hyperloop - Execute instant lean deployment with CI feedback
#
# Provides instant continuous deployment for rapid development feedback:
# 1. Builds lean version of the app (no type checking, minimal ESLint)
# 2. Deploys to Firebase hosting channel
# 3. Triggers CI/CD tests against the deployed channel
# 4. Returns URL and live feedback
#
# Usage: ./pilotScripts/workflow/hyperloop-dev.sh
#
# Part of the RankPilot Development Hyperloop system
#

# Enable error handling
set -e

# Config
PROJECT_ID="rankpilot-h3jpc"
REGION="australia-southeast2"
BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)

# Use existing stable channel for consistent URL
CHANNEL_ID="lean-branch-testing"

# Script header
echo -e "\e[1;36m🚀 DEVELOPMENT HYPERLOOP - INSTANT LEAN DEPLOYMENT\e[0m"
echo -e "\e[1;36m=================================================\e[0m"
echo -e "\e[1;33mBranch: $BRANCH_NAME\e[0m"
echo -e "\e[1;33mChannel ID: $CHANNEL_ID\e[0m"
echo -e "\e[1;33mFirebase Project: $PROJECT_ID\e[0m"
echo ""

# Step 1: Verify prerequisites
echo -e "\e[1;35m🔍 Checking prerequisites...\e[0m"

# Check for Firebase CLI
if ! command -v firebase &> /dev/null; then
  echo -e "\e[1;31m❌ Firebase CLI not found. Install with: npm install -g firebase-tools\e[0m"
  exit 1
fi

# Check for Git
if ! command -v git &> /dev/null; then
  echo -e "\e[1;31m❌ Git not found. Required for branch information.\e[0m"
  exit 1
fi

# Check Firebase login
if ! firebase projects:list --json > /dev/null; then
  echo -e "\e[1;31m❌ Not logged in to Firebase. Run 'firebase login' first.\e[0m"
  exit 1
fi

# Step 2: Execute lean build
echo -e "\e[1;35m🛠️ Building lean version...\e[0m"

# Use the existing script if available, otherwise run the build directly
if [ -f "./scripts/build-lean-instant.sh" ]; then
  bash ./scripts/build-lean-instant.sh
else
  # Fallback to direct commands
  echo "Using fallback build process..."
  export NODE_OPTIONS="--max-old-space-size=3072"
  
  # Backup the original ESLint config
  cp eslint.config.mjs eslint.config.mjs.bak
  
  # Create a minimal ESLint config if emergency one doesn't exist
  if [ ! -f "eslint.config.emergency.mjs" ]; then
    echo "Creating minimal ESLint config..."
    echo "export default [];" > eslint.config.mjs
  else
    cp eslint.config.emergency.mjs eslint.config.mjs
  fi
  
  # Run the build with Next.js for Firebase SSR
  echo "Building with Next.js for Firebase SSR..."
  # Use the hyperloop config that supports SSR
  cp next.config.hyperloop.ts next.config.ts.bak
  mv next.config.ts next.config.ts.original
  cp next.config.hyperloop.ts next.config.ts
  
  # Build for Firebase Framework (supports SSR + API routes)
  NEXT_PUBLIC_BUILD_MODE=firebase npm run build -- --no-lint
  
  # Restore the original config
  mv next.config.ts.original next.config.ts
  mv next.config.ts.bak next.config.hyperloop.ts
  
  # Restore original ESLint config
  mv eslint.config.mjs.bak eslint.config.mjs
fi

if [ $? -ne 0 ]; then
  echo -e "\e[1;31m❌ Lean build failed\e[0m"
  exit 1
fi

echo -e "\e[1;32m✅ Lean build completed successfully\e[0m"
echo ""

# Step 3: Deploy to Firebase with Framework support
echo -e "\e[1;35m🚀 Deploying to Firebase with SSR support: $CHANNEL_ID...\e[0m"

# Add verbose debugging for Firebase deployment
if [ "$HYPERLOOP_DEBUG" = "true" ]; then
  echo "DEBUG: Running command: firebase hosting:channel:deploy $CHANNEL_ID --expires 1d --project $PROJECT_ID"
  firebase hosting:channel:deploy $CHANNEL_ID --expires 1d --project $PROJECT_ID
  if [ $? -ne 0 ]; then
    echo -e "\e[1;31m❌ Firebase deployment failed\e[0m"
    exit 1
  fi
  # Get the URL manually when in debug mode
  echo "DEBUG: Getting channel URL..."
  CHANNEL_URL="https://$PROJECT_ID--$CHANNEL_ID-o2qips67.web.app"
else
  DEPLOY_OUTPUT=$(firebase hosting:channel:deploy $CHANNEL_ID --expires 1d --project $PROJECT_ID --json)
  if [ $? -ne 0 ]; then
    echo -e "\e[1;31m❌ Firebase deployment failed\e[0m"
    exit 1
  fi

  # Parse the deployment JSON output to get the URL
  CHANNEL_URL=$(echo $DEPLOY_OUTPUT | grep -o '"url":"[^"]*"' | cut -d'"' -f4)
fi

echo -e "\e[1;32m✅ Deployment successful!\e[0m"
echo -e "\e[1;36m🌐 Channel URL: $CHANNEL_URL\e[0m"
echo ""

# Step 4: Trigger GitHub Actions workflow for testing
echo -e "\e[1;35m🧪 Triggering tests via GitHub Actions...\e[0m"

# Use the GitHub CLI to trigger the workflow if available
if command -v gh &> /dev/null; then
  gh workflow run lean-channel-tests.yml --ref $BRANCH_NAME -f channelId=$CHANNEL_ID
  
  if [ $? -eq 0 ]; then
    echo -e "\e[1;32m✅ Test workflow triggered successfully\e[0m"
    echo -e "\e[1;36m📊 View test results: https://github.com/your-org/rankpilot/actions\e[0m"
  else
    echo -e "\e[1;33m⚠️ Could not trigger test workflow. Tests will run automatically.\e[0m"
  fi
else
  echo -e "\e[1;33m⚠️ GitHub CLI not installed. Tests will run automatically from the CI pipeline.\e[0m"
  echo -e "\e[1;36m📊 View test results: https://github.com/your-org/rankpilot/actions\e[0m"
fi

# Step 5: Final summary with expiration information
EXPIRATION_DATE=$(date -d "+1 day" "+%Y-%m-%d %H:%M:%S")
if [ $? -ne 0 ]; then
  # For macOS compatibility
  EXPIRATION_DATE=$(date -v+1d "+%Y-%m-%d %H:%M:%S")
fi

echo ""
echo -e "\e[1;36m📋 DEPLOYMENT SUMMARY\e[0m"
echo -e "\e[1;36m===============================================\e[0m"
echo -e "\e[1;32m🌐 Preview URL: $CHANNEL_URL\e[0m"
echo -e "\e[1;32m🔖 Channel ID: $CHANNEL_ID\e[0m"
echo -e "\e[1;33m⏳ Expires: $EXPIRATION_DATE\e[0m"
echo -e "\e[1;33m🌿 Branch: $BRANCH_NAME\e[0m"
echo ""
echo -e "\e[1;35m📱 Mobile Testing:\e[0m"
echo -e "\e[1;36m   Open Chrome DevTools > Toggle Device Toolbar > Test responsive design\e[0m"

# Generate QR code for mobile testing using a web service
echo ""
echo -e "\e[1;35m📱 Scan this URL for QR code for mobile testing:\e[0m"
QR_URL="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=$(echo $CHANNEL_URL | jq -s -R -r @uri)"
echo -e "\e[1;36m$QR_URL\e[0m"

# Step 6: Open preview in browser
echo ""
echo -e "\e[1;35m🌐 Opening preview in browser...\e[0m"
if command -v xdg-open &> /dev/null; then
  xdg-open "$CHANNEL_URL" &
elif command -v open &> /dev/null; then
  open "$CHANNEL_URL" &
else
  echo -e "\e[1;33m⚠️ Could not open browser automatically. Please visit:\e[0m"
  echo -e "\e[1;36m$CHANNEL_URL\e[0m"
fi

echo ""
echo -e "\e[1;32m✅ Development Hyperloop process complete!\e[0m"
