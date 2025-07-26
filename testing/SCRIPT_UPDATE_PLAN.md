# Essential Test Scripts Update

## Current Issue
All test scripts reference deleted config files (playwright.config.optimized.ts, etc.)

## Solution
Update to use only test.config.ts with consolidated approach

## New Test Scripts
```json
{
  "test": "cross-env NODE_OPTIONS='--max-old-space-size=2048' playwright test --config=testing/configs/test.config.ts",
  "test:critical": "cross-env NODE_OPTIONS='--max-old-space-size=2048' playwright test --config=testing/configs/test.config.ts testing/specs/main/auth-consolidated.spec.ts testing/specs/main/performance.spec.ts testing/specs/main/accessibility.spec.ts",
  "test:auth": "cross-env NODE_OPTIONS='--max-old-space-size=2048' playwright test --config=testing/configs/test.config.ts testing/specs/main/auth-consolidated.spec.ts",
  "test:mobile": "cross-env NODE_OPTIONS='--max-old-space-size=2048' playwright test --config=testing/configs/test.config.ts testing/specs/main/mobile-nav-consolidated.spec.ts",
  "test:visual": "cross-env NODE_OPTIONS='--max-old-space-size=2048' playwright test --config=testing/configs/test.config.ts testing/specs/main/visual-regression.spec.ts",
  "test:api": "cross-env NODE_OPTIONS='--max-old-space-size=2048' playwright test --config=testing/configs/test.config.ts testing/specs/main/api-contracts.spec.ts",
  "test:accessibility": "cross-env NODE_OPTIONS='--max-old-space-size=2048' playwright test --config=testing/configs/test.config.ts testing/specs/main/accessibility.spec.ts",
  "test:performance": "cross-env NODE_OPTIONS='--max-old-space-size=2048' playwright test --config=testing/configs/test.config.ts testing/specs/main/performance.spec.ts",
  "test:headed": "cross-env NODE_OPTIONS='--max-old-space-size=2048' playwright test --config=testing/configs/test.config.ts --headed",
  "test:ui": "cross-env NODE_OPTIONS='--max-old-space-size=2048' playwright test --config=testing/configs/test.config.ts --ui"
}
```
