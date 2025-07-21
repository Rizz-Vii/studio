# Mobile Performance Testing Strategy

## Overview

This document outlines the testing strategy for the mobile performance optimization enhancements in the RankPilot project. The goal is to ensure that all mobile optimizations are properly validated and that the application performs well across different device sizes and network conditions.

## Test Types

### 1. Performance Tests

Tests that specifically validate performance aspects of the application:

- **Loading States**: Verifies proper loading indicators and performance feedback elements
- **Responsive Design**: Tests UI across various breakpoints (320px to 1440px)
- **Mobile Navigation**: Validates mobile navigation components and touch targets
- **Performance Metrics**: Monitors for performance-related content and indicators

### 2. Authentication Tests

Tests that verify login functionality works correctly:

- **Login Flow**: Tests the authentication process
- **Protected Routes**: Ensures authenticated routes work correctly with proper login
- **Dev Mode Authentication**: Uses development convenience options for testing

### 3. Accessibility Tests

Tests that ensure mobile experience is accessible:

- **Touch Targets**: Validates minimum 48px touch targets for mobile elements
- **Navigation**: Tests keyboard and touch navigation options
- **Responsive Layout**: Ensures content is properly accessible at all screen sizes

## Testing Configuration

### Local Testing Setup

```typescript
// Key configuration for local testing
test.setTimeout(120000); // Increased timeout for slower local environments
page.setDefaultNavigationTimeout(30000); // Longer navigation timeouts
page.setDefaultTimeout(30000); // Longer action timeouts
```

### Authentication Helper

```typescript
// Helper function for authentication
async function loginUser(page: Page) {
  try {
    await page.goto("/login");

    // Wait for form elements to be available
    await page.waitForSelector("#email", { timeout: 10000 });
    await page.waitForSelector("#password", { timeout: 5000 });

    // Fill in credentials
    await page.fill("#email", "abbas_ali_rizvi@hotmail.com");
    await page.fill("#password", "123456");

    // Use Dev mode quick login button
    await page.click('button:has-text("Login as Free User (Abbas)")');

    // Wait for navigation to complete
    await page.waitForURL("/dashboard", { timeout: 30000 });
  } catch (error) {
    console.error("Login failed:", error);
    await page.screenshot({
      path: `test-results/login-failure-${Date.now()}.png`,
    });
    throw error;
  }
}
```

## Running Tests

### Commands

- Run all performance tests:

  ```
  npx playwright test tests/performance.spec.ts
  ```

- Run specific test:

  ```
  npx playwright test -g "test name pattern"
  ```

- Run tests with visible browser:

  ```
  npx playwright test tests/performance.spec.ts --headed
  ```

### Environment Setup

1. Ensure the development server is running on `localhost:3000`
2. Use the following configuration in `playwright.config.ts`:

   ```typescript
   use: {
     baseURL: process.env.TEST_BASE_URL || "http://localhost:3000",
     actionTimeout: 15000,
     navigationTimeout: 15000,
   }
   ```

## Troubleshooting Common Issues

1. **Timeout Errors**:
   - Increase timeouts in test config
   - Check if the dev server is responsive
   - Look at debug screenshots in test-results folder

2. **Authentication Failures**:
   - Verify login credentials are correct
   - Check if the dev login buttons are available
   - Verify proper selectors are being used

3. **Selector Issues**:
   - Use more robust selectors (e.g., role-based selectors)
   - Add additional waiting for elements
   - Check if CSS classes have changed

## Mobile-Specific Test Coverage

| Feature           | Test Type     | Test File           |
| ----------------- | ------------- | ------------------- |
| Touch Targets     | Accessibility | performance.spec.ts |
| Responsive Design | Visual        | performance.spec.ts |
| Mobile Navigation | Functional    | performance.spec.ts |
| Network Handling  | Performance   | performance.spec.ts |

## Future Improvements

- Implement automated Core Web Vitals measurement
- Add more detailed mobile-specific assertions
- Create dedicated mobile test suite
- Add device emulation tests for common mobile devices

---

Last Updated: July 21, 2025
