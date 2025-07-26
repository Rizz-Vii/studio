#!/usr/bin/env bash
#
# Linux-optimized Development Hyperloop script
# For quick deployment of lean preview channels
#

# Enable error handling
set -e

# Config
PROJECT_ID="rankpilot-h3jpc"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)
SAFE_BRANCH=$(echo "$BRANCH_NAME" | sed 's/[^a-zA-Z0-9]/-/g' | tr '[:upper:]' '[:lower:]')
if [ ${#SAFE_BRANCH} -gt 50 ]; then
  SAFE_BRANCH=${SAFE_BRANCH:0:50}
fi
CHANNEL_ID="lean-$SAFE_BRANCH-$TIMESTAMP"

# Print header
echo "🚀 DEVELOPMENT HYPERLOOP - LINUX OPTIMIZED"
echo "========================================="
echo "Branch: $BRANCH_NAME"
echo "Channel ID: $CHANNEL_ID"
echo "Firebase Project: $PROJECT_ID"
echo ""

# Check for Firebase CLI
if ! command -v firebase &> /dev/null; then
  echo "❌ Firebase CLI not found. Installing..."
  npm install -g firebase-tools
  echo "✅ Firebase CLI installed"
fi

# Check Firebase login
if ! firebase projects:list &> /dev/null; then
  echo "❌ Not logged in to Firebase. Please login:"
  firebase login
fi

# Check if we have a build directory already
if [ -d ".next" ]; then
  echo "✅ Found existing build directory. Skipping build step..."
  echo "   (To force a new build, delete the .next directory)"
else
  # Run lean build
  echo "🛠️ Building lean version..."
  export LEAN_MODE=true
  export SKIP_TYPE_CHECK=true
  NODE_OPTIONS="--max-old-space-size=3072" npm run build -- --no-lint
  echo "✅ Lean build completed"
fi

# Deploy to Firebase channel
echo "🚀 Deploying to Firebase channel: $CHANNEL_ID..."
DEPLOY_OUTPUT=$(firebase hosting:channel:deploy $CHANNEL_ID --only hosting --expires 1d --project $PROJECT_ID)

# Extract URL
CHANNEL_URL=$(echo "$DEPLOY_OUTPUT" | grep -o 'https://[^ ]*' | head -1)

if [ -z "$CHANNEL_URL" ]; then
  echo "❌ Failed to extract channel URL"
  echo "Full output:"
  echo "$DEPLOY_OUTPUT"
  exit 1
fi

# Generate QR code URL
QR_URL="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=$CHANNEL_URL"

# Final summary
echo ""
echo "📋 DEPLOYMENT SUMMARY"
echo "==============================================="
echo "🌐 Preview URL: $CHANNEL_URL"
echo "🔖 Channel ID: $CHANNEL_ID"
echo "⏳ Expires: In 24 hours"
echo "🌿 Branch: $BRANCH_NAME"
echo ""
echo "📱 Mobile Testing QR Code: $QR_URL"

# Open in browser
echo "🌐 Opening preview in browser..."
if command -v xdg-open &> /dev/null; then
  xdg-open "$CHANNEL_URL" &
elif command -v open &> /dev/null; then
  open "$CHANNEL_URL" &
else
  echo "⚠️ Could not open browser automatically. Please visit:"
  echo "$CHANNEL_URL"
fi

echo ""
echo "✅ Development Hyperloop process complete!"
