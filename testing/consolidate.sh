#!/bin/bash

# Testing Folder Consolidation Script
# Deletes redundant test files and configs

echo "🧹 Starting Testing Folder Consolidation..."

# Navigate to testing directory
cd /workspaces/studio/testing

# Delete redundant config files (keep only test.config.ts)
echo "🗂️ Cleaning up config files..."
rm -f configs/playwright.config.auth.ts
rm -f configs/playwright.config.base.mjs
rm -f configs/playwright.config.base.ts
rm -f configs/playwright.config.ci.ts
rm -f configs/playwright.config.dashboard.ts
rm -f configs/playwright.config.graceful.ts
rm -f configs/playwright.config.local.ts
rm -f configs/playwright.config.optimized.ts
rm -f configs/playwright.config.simple.ts
rm -f configs/playwright.config.ts

# Delete redundant auth tests (keep auth-consolidated.spec.ts)
echo "🔐 Cleaning up auth tests..."
cd specs/main
rm -f auth-forms.spec.ts
rm -f auth-forms-enhanced.spec.ts
rm -f auth-features.spec.ts
rm -rf auth/  # Remove auth directory
rm -f e2e/auth.spec.ts

# Delete redundant mobile navigation tests (keep mobile-nav-consolidated.spec.ts)
echo "📱 Cleaning up mobile navigation tests..."
rm -f mobile-nav-auth-bypass.spec.ts
rm -f mobile-nav-authenticated.spec.ts
rm -f mobile-nav-check.spec.ts
rm -f mobile-nav-complete.spec.ts
rm -f mobile-nav-component.spec.ts
rm -f debug-mobile-nav.spec.ts
rm -f mobile-accessibility.spec.ts
rm -rf mobile/  # Remove mobile directory

# Delete redundant visual tests (keep visual-regression.spec.ts)
echo "👁️ Cleaning up visual tests..."
cd visual/
rm -f cross-browser.spec.ts
rm -f dashboard.visual.spec.ts
rm -f generate-baselines.spec.ts
rm -f visual-regression.new.spec.ts
rm -f visual-flow.spec.ts
cd ..

# Delete redundant performance tests
echo "⚡ Cleaning up performance tests..."
rm -rf performance/  # Remove performance directory (keep main performance.spec.ts)

# Delete miscellaneous redundant files
echo "🗑️ Cleaning up miscellaneous files..."
rm -f basic.spec.ts
rm -f dashboard.spec.ts
rm -f deployment.spec.ts
rm -f dev-ready.spec.ts
rm -f home.spec.ts
rm -f payment-flow.spec.ts

# Create consolidated test structure
echo "📁 Creating consolidated structure..."

# Rename visual-regression.spec.ts to be in root
mv visual/visual-regression.spec.ts ./visual-regression.spec.ts

# Rename a11y.spec.ts to accessibility.spec.ts
mv accessibility/a11y.spec.ts ./accessibility.spec.ts

# Rename serp-api.spec.ts to api-contracts.spec.ts
mv network/serp-api.spec.ts ./api-contracts.spec.ts

# Rename public-pages.spec.ts from e2e
mv e2e/public-pages.spec.ts ./public-pages.spec.ts

# Clean up empty directories
rmdir visual/ 2>/dev/null || true
rmdir accessibility/ 2>/dev/null || true
rmdir network/ 2>/dev/null || true
rmdir e2e/ 2>/dev/null || true
rmdir state/ 2>/dev/null || true
rmdir setup/ 2>/dev/null || true
rmdir pages/ 2>/dev/null || true
rmdir fixtures/ 2>/dev/null || true
rmdir utils/ 2>/dev/null || true

echo "✅ Testing folder consolidation complete!"
echo "📊 Final structure:"
find /workspaces/studio/testing -name "*.spec.ts" | sort
