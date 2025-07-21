# 📦 Testing & Scraping Framework

## Overview

**Last Updated**: July 21, 2025  
**Status**: ✅ **Recently Refactored**

This project uses Playwright for end-to-end testing, visual regression testing, and data extraction. The testing framework includes anti-bot measures and LLM-assisted validation. The test suite underwent major refactoring in July 2025 for improved maintainability and reliability.

## Recent Updates (July 2025)

### Major Refactoring Completed

- **Quality Tests**: SEO and visual regression tests modernized with Playwright native tools
- **Integration Tests**: API testing streamlined with improved authentication handling
- **E2E Tests**: Dashboard tests completely overhauled with data-driven approach
- **Authentication**: Centralized `loginAndGoToDashboard` helper for consistent login flows
- **Test Organization**: Structured tests into logical describe blocks for better maintainability

## Setup

1. Install dependencies:

```bash
npm install
npx playwright install
```

2. Configure environment variables:
   Create a `.env` file with:

```env
TEST_BASE_URL=https://rankpilot-h3jpc.web.app
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=your_test_password
PROXY_SERVER=http://proxy.example.com:8080
PROXY_USERNAME=proxy_user
PROXY_PASSWORD=proxy_pass
OPENAI_API_KEY=your_openai_key
```

## Running Tests

### Refactored Test Structure

The test suite is now organized into logical categories:

```bash
# Quality Tests (Refactored)
npx playwright test tests/quality/seo.spec.ts           # SEO validation
npx playwright test tests/quality/visual-regression.spec.ts  # Visual testing

# Integration Tests (Refactored)
npx playwright test tests/integration/api.spec.ts      # API testing

# E2E Tests (Major Overhaul)
npx playwright test tests/e2e/dashboard.spec.ts        # Dashboard functionality
```

### Standard Test Commands

Run all tests:

```bash
npx playwright test
```

Run specific test file:

```bash
npx playwright test tests/auth/auth.spec.ts
```

Run tests in headed mode:

```bash
npx playwright test --headed
```

### New Test Patterns (July 2025)

#### Data-Driven Navigation Testing

```typescript
const navigationItems = [
  { name: "Profile", url: "/profile" },
  { name: "Performance", url: "/performance" },
];

for (const item of navigationItems) {
  test(`should navigate to ${item.name}`, async ({ page }) => {
    await page.click(`a[href="${item.url}"]`);
    await expect(page).toHaveURL(item.url);
  });
}
```

#### Centralized Authentication

```typescript
async function loginAndGoToDashboard(page: Page) {
  await page.goto("/login");
  await page.fill("#email", "abbas_ali_rizvi@hotmail.com");
  await page.fill("#password", "123456");
  await page.click('button:has-text("Login as Free User (Abbas)")');
  await page.waitForURL("/dashboard", { timeout: 30000 });
}
```

## Test Reports

View HTML report:

```bash
npx playwright show-report
```

Reports include:

- Screenshots of failed tests
- Trace viewer for debugging
- Visual comparison results

## Visual Regression Testing

Baseline screenshots are stored in `tests/snapshots/`.
To update baselines:

```bash
npx playwright test --update-snapshots
```

## Maintenance

1. Update visual baselines when making UI changes
2. Keep test data isolated and cleaned up
3. Regularly rotate test credentials
4. Monitor proxy health and rotation
5. Update user agents periodically

## Common Issues

1. Flaky Tests
   - Increase timeout in config
   - Add explicit waits
   - Check network conditions

2. Visual Differences
   - Verify environment consistency
   - Check dynamic content
   - Adjust comparison threshold

3. Rate Limiting
   - Implement proxy rotation
   - Add delays between actions
   - Use multiple test accounts
