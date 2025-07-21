# Testing Strategy for RankPilot

## Overview

**Last Updated**: July 21, 2025  
**Status**: ✅ **Recently Refactored**

This document outlines the comprehensive testing strategy for RankPilot, including the major test suite refactoring completed in July 2025.

## Current Situation

- Production URL: <https://rankpilot-h3jpc.web.app>
- Local development: Optimized with Turbopack configuration
- Test Suite: Recently refactored for improved maintainability and reliability
- Test Framework: Playwright with TypeScript for all test types

## Test Architecture

### Refactored Test Structure (July 2025)

The test suite has been completely reorganized into logical categories:

```
tests/
├── quality/
│   ├── seo.spec.ts                    # ✅ Refactored - SEO quality validation
│   ├── visual-regression.spec.ts      # ✅ Refactored - Playwright native visual testing
│   ├── performance.spec.ts            # Performance benchmarks
│   └── accessibility.spec.ts          # WCAG compliance testing
├── integration/
│   ├── api.spec.ts                    # ✅ Refactored - Streamlined API testing
│   └── network/                       # Network and external service tests
├── e2e/
│   ├── dashboard.spec.ts              # ✅ Refactored - Complete overhaul
│   ├── auth.spec.ts                   # Authentication flows
│   └── role-based/                    # Tier-specific functionality tests
└── fixtures/
    ├── auth.fixture.ts                # Authentication helpers
    └── test-data/                     # Test data and utilities
```

### Modern Testing Patterns

#### 1. Data-Driven Testing

```typescript
// Example from refactored dashboard tests
const navigationItems = [
  { name: "Profile", url: "/profile" },
  { name: "Performance", url: "/performance" },
  { name: "Keyword Analysis", url: "/keyword-analysis" },
];

for (const item of navigationItems) {
  test(`should navigate to ${item.name}`, async ({ page }) => {
    await page.click(`a[href="${item.url}"]`);
    await page.waitForURL(item.url);
    await expect(page).toHaveURL(item.url);
  });
}
```

#### 2. Robust Authentication Helper

```typescript
// Centralized authentication logic
async function loginAndGoToDashboard(page: Page) {
  await page.goto("/login");
  await page.fill("#email", "abbas_ali_rizvi@hotmail.com");
  await page.fill("#password", "123456");
  await page.click('button:has-text("Login as Free User (Abbas)")');
  await page.waitForURL("/dashboard", { timeout: 30000 });
}
```

#### 3. Visual Testing with Playwright Native Tools

```typescript
// Enhanced visual regression testing
test("visual regression test", async ({ page }) => {
  await page.goto("/dashboard");
  await page.waitForLoadState("networkidle");

  // Playwright native visual comparison
  await expect(page).toHaveScreenshot("dashboard-view.png", {
    fullPage: true,
    threshold: 0.2,
  });
});
```

### Role-Based Test Pattern

We use a standardized pattern for all role-based testing across subscription tiers. This ensures consistency and makes tests easier to maintain.

```typescript
// Standard role-based test structure for RankPilot
import { test, expect } from "@playwright/test";
import { TestOrchestrator } from "../utils/test-orchestrator";
import { tierUserFlows } from "../flows/role-based-flows"; // tier = free, starter, agency, etc.

test.describe("Tier User Tests", () => {
  let orchestrator: TestOrchestrator;

  test.beforeEach(async ({ page }) => {
    orchestrator = new TestOrchestrator(page);
    page.setDefaultNavigationTimeout(30000);
    page.setDefaultTimeout(20000);
  });

  test("Tier User - Feature Access", async ({ page }) => {
    // Find specific flow from predefined flows
    const featureFlow = tierUserFlows.find((flow) =>
      flow.name.includes("FeatureName")
    );

    // Execute flow via orchestrator
    await orchestrator.executeFlow(featureFlow);

    // Verify tier-specific elements
    await expect(page.locator('[data-testid="feature-results"]')).toBeVisible();
  });

  test("Tier User - Access Restrictions", async ({ page }) => {
    await orchestrator.userManager.loginAs("tierName"); // free, starter, agency, enterprise, admin
    await page.goto("/restricted-feature");
    await expect(
      page.locator("text=/upgrade|premium|subscribe/i")
    ).toBeVisible();
  });
});
```

### TestOrchestrator

The `TestOrchestrator` class centralizes test execution logic:

1. Manages authentication across user tiers
2. Executes predefined flows for each feature
3. Provides utility methods for common test patterns
4. Ensures consistent test execution across all test suites

## Current Test Status

The tests are failing because they expect features that may not be in production:

- Specific navigation links (Features, Pricing, FAQ)
- Specific heading text ("SEO Insights")
- Specific CTA buttons ("Start Free", "Request Demo")
- Performance expectations (3s load time)

## Immediate Actions

1. **Start local development server**
2. **Update playwright config for local testing**
3. **Run tests against localhost**
4. **Fix any issues found**
5. **Deploy to production**
6. **Re-run production tests**

## Commands to Use

```bash
# Start dev server
npm run dev

# Test against localhost (with updated config)
npm run test:local

# Test against production
npm run test:prod
```
