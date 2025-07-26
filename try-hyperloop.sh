#!/usr/bin/env bash
#
# Quick start script for trying out the Development Hyperloop
# Optimized for Linux environments in VS Code
#

# Print header
echo -e "\e[1;36m🚀 Development Hyperloop - Quick Start\e[0m"
echo -e "\e[1;36m===================================\e[0m"
echo ""
echo -e "\e[1;32m✨ Using stable channel: lean-branch-testing\e[0m"
echo -e "\e[1;32m✨ Preview URL: https://rankpilot-h3jpc--lean-branch-testing-o2qips67.web.app\e[0m"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d ".github" ]; then
  echo -e "\e[1;31m❌ Error: Please run this script from the project root directory\e[0m"
  exit 1
fi

# Check if git is available
if ! command -v git &> /dev/null; then
  echo -e "\e[1;31m❌ Error: Git is required but not installed\e[0m"
  exit 1
fi

# Check if firebase CLI is available
if ! command -v firebase &> /dev/null; then
  echo -e "\e[1;33m⚠️ Warning: Firebase CLI not found. Installing...\e[0m"
  npm install -g firebase-tools
fi

# Check Firebase login
echo -e "\e[1;35m🔑 Checking Firebase authentication...\e[0m"
if ! firebase projects:list --json &> /dev/null; then
  echo -e "\e[1;33m⚠️ Not logged in to Firebase. Please login:\e[0m"
  firebase login
fi

# Ensure our scripts are executable
echo -e "\e[1;35m📜 Setting correct permissions for scripts...\e[0m"
chmod +x ./pilotScripts/workflow/hyperloop-dev.sh

# Make sure we have dependencies
echo -e "\e[1;35m📦 Checking dependencies...\e[0m"
if [ ! -d "node_modules" ]; then
  echo -e "\e[1;33m⚠️ Node modules not found. Installing...\e[0m"
  npm ci
else
  echo -e "\e[1;32m✅ Dependencies found\e[0m"
fi

# Create a temporary feature branch if needed
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ "$CURRENT_BRANCH" != "feature/"* && "$CURRENT_BRANCH" != "bugfix/"* && "$CURRENT_BRANCH" != "hotfix/"* ]]; then
  echo -e "\e[1;33m⚠️ Current branch ($CURRENT_BRANCH) is not a feature branch.\e[0m"
  echo -e "\e[1;33m   Creating a temporary feature branch for testing...\e[0m"
  
  TEMP_BRANCH="feature/hyperloop-test-$(date +%Y%m%d-%H%M%S)"
  git checkout -b "$TEMP_BRANCH"
  echo -e "\e[1;32m✅ Created temporary branch: $TEMP_BRANCH\e[0m"
fi

# Show options
echo ""
echo -e "\e[1;36m📋 Development Hyperloop Options:\e[0m"
echo -e "\e[1;36m----------------------------\e[0m"
echo -e "1. \e[1;32mRun Development Hyperloop\e[0m"
echo -e "2. \e[1;34mRead Hyperloop Documentation\e[0m"
echo -e "3. \e[1;35mRun Lean Tests Against Latest Channel\e[0m"
echo -e "4. \e[1;31mExit\e[0m"
echo ""
echo -e "\e[1;33mChoose an option (1-4):\e[0m"

read -r option

case $option in
  1)
    echo -e "\e[1;32m🚀 Launching Development Hyperloop...\e[0m"
    
    # Check if we have a lean build directory already
    if [ ! -d ".next" ]; then
      echo -e "\e[1;33m⚠️ No build directory found. Running lean build first...\e[0m"
      export LEAN_MODE=true
      export SKIP_TYPE_CHECK=true
      npm run build -- --no-lint
    fi
    
    # Get branch name and create a unique channel ID
    BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)
    TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
    SAFE_BRANCH=$(echo "$BRANCH_NAME" | sed 's/[^a-zA-Z0-9]/-/g' | tr '[:upper:]' '[:lower:]')
    if [ ${#SAFE_BRANCH} -gt 50 ]; then
      SAFE_BRANCH=${SAFE_BRANCH:0:50}
    fi
    CHANNEL_ID="lean-$SAFE_BRANCH-$TIMESTAMP"
    
    # Deploy to Firebase
    echo -e "\e[1;35m🚀 Deploying to Firebase channel: $CHANNEL_ID...\e[0m"
    DEPLOY_OUTPUT=$(firebase hosting:channel:deploy $CHANNEL_ID --only hosting --expires 1d --project rankpilot-h3jpc)
    
    # Extract URL from output
    CHANNEL_URL=$(echo "$DEPLOY_OUTPUT" | grep -o 'https://[^ ]*' | head -1)
    
    if [ -z "$CHANNEL_URL" ]; then
      echo -e "\e[1;31m❌ Failed to extract channel URL. See the full output above.\e[0m"
      echo -e "\e[1;33mFull command output:\e[0m"
      echo "$DEPLOY_OUTPUT"
    else
      echo -e "\e[1;32m✅ Deployment successful!\e[0m"
      echo -e "\e[1;36m🌐 Channel URL: $CHANNEL_URL\e[0m"
      echo -e "\e[1;33m⏰ Expires: In 24 hours\e[0m"
      echo -e "\e[1;36m📱 Mobile Testing QR Code: https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=$CHANNEL_URL\e[0m"
      
      # Open in browser if possible
      if command -v xdg-open &> /dev/null; then
        xdg-open "$CHANNEL_URL" &
      elif command -v open &> /dev/null; then
        open "$CHANNEL_URL" &
      else
        echo -e "\e[1;33m⚠️ Could not open browser automatically. Please visit:\e[0m"
        echo -e "\e[1;36m$CHANNEL_URL\e[0m"
      fi
    fi
    ;;
  2)
    echo -e "\e[1;34m📖 Opening Documentation...\e[0m"
    if command -v code &> /dev/null; then
      code ./docs/DEVELOPMENT_HYPERLOOP.md
    else
      echo -e "\e[1;33m⚠️ VS Code not found in path. Opening with default editor:\e[0m"
      if command -v xdg-open &> /dev/null; then
        xdg-open ./docs/DEVELOPMENT_HYPERLOOP.md
      elif command -v open &> /dev/null; then
        open ./docs/DEVELOPMENT_HYPERLOOP.md
      else
        cat ./docs/DEVELOPMENT_HYPERLOOP.md | more
      fi
    fi
    ;;
  3)
    echo -e "\e[1;35m🧪 Running Lean Tests Against Latest Channel...\e[0m"
    npm run test:lean:url
    ;;
  4)
    echo -e "\e[1;31m👋 Exiting...\e[0m"
    exit 0
    ;;
  *)
    echo -e "\e[1;31m❌ Invalid option\e[0m"
    exit 1
    ;;
esac

echo ""
echo -e "\e[1;32m✅ Done! The Development Hyperloop system is ready to use.\e[0m"
echo -e "\e[1;33mRemember to check docs/DEVELOPMENT_HYPERLOOP.md for more details.\e[0m"
