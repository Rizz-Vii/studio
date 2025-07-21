import { test, expect } from "@playwright/test";

test.describe("Main User Flow E2E Test", () => {
  test("should allow a user to navigate from homepage, log in, and view the dashboard", async ({
    page,
  }) => {
    // 1. Start at the homepage
    await page.goto("/");
    await expect(page).toHaveTitle(/RankPilot/);
    await expect(page.locator("h1")).toBeVisible();

    // 2. Navigate to the login page
    await page.click('a[href="/login"]');
    await page.waitForURL("**/login");
    await expect(page.locator("h2")).toContainText("Welcome Back");

    // 3. Log in with a test user (agency tier for feature access)
    await page.fill('[data-testid="email-input"]', "agency.user1@test.com");
    await page.fill('[data-testid="password-input"]', "password123"); // Use a secure password
    await page.click('button[type="submit"]');

    // 4. Wait for successful login and redirection to the dashboard
    await page.waitForURL("**/dashboard", { timeout: 15000 });
    await expect(page.locator("h1")).toContainText("Dashboard");

    // 5. Verify key dashboard elements are visible
    await expect(
      page.locator('[data-testid="dashboard-summary"]')
    ).toBeVisible();
    await expect(page.locator('[data-testid="recent-activity"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-info"]')).toContainText(
      "Agency"
    );

    // 6. Navigate to a core feature: NeuroSEO™ Suite
    await page.click("nav >> text=NeuroSEO™ Suite");
    await page.click('a[href="/neuroseo"]');
    await page.waitForURL("**/neuroseo");
    await expect(page.locator("h1")).toContainText("NeuroSEO™ Suite");

    // 7. Interact with the NeuroSEO™ tool
    await page.fill('[data-testid="urls-input"]', "https://example.com");
    await page.fill('[data-testid="keywords-input"]', "seo, performance");
    await page.click('button:has-text("Start Analysis")');

    // 8. Verify analysis starts and loading state appears
    await expect(page.locator('[data-testid="loading-indicator"]')).toBeVisible(
      { timeout: 10000 }
    );
    await expect(page.locator('[data-testid="analysis-results"]')).toBeVisible({
      timeout: 60000,
    });

    // 9. Log out
    await page.click('[data-testid="user-avatar"]');
    await page.click('button:has-text("Log Out")');
    await page.waitForURL("**/login");
    await expect(page.locator("h2")).toContainText("Welcome Back");
  });
});
