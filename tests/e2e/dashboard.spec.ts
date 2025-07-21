import { test, expect, Page } from "@playwright/test";

/**
 * Logs in a user with the provided credentials and navigates to the dashboard.
 * @param page The Playwright Page object.
 * @param email The user's email.
 * @param password The user's password.
 */
const loginAndGoToDashboard = async (
  page: Page,
  email: string,
  password = "testPassword123"
) => {
  await page.goto("/login");
  await page.locator('[data-testid="email-input"]').fill(email);
  await page.locator('[data-testid="password-input"]').fill(password);
  await page.locator('[data-testid="login-button"]').click();
  await page.waitForURL("**/dashboard", { waitUntil: "networkidle" });
  await expect(page.locator('[data-testid="dashboard-content"]')).toBeVisible();
};

test.describe("E2E Tests for Agency User Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    // Log in as the primary test user (agency) before each test
    await loginAndGoToDashboard(page, "test-agency@example.com");
  });

  test("should display the main dashboard overview correctly", async ({
    page,
  }) => {
    await expect(page.locator("h1")).toContainText("Dashboard");
    await expect(page.locator('[data-testid="main-navigation"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="dashboard-summary"]')
    ).toBeVisible();
    await expect(page.locator('[data-testid="user-info"]')).toContainText(
      "Agency"
    );
  });

  const navigationLinks = [
    { name: "Keywords", path: "/keyword-tool", title: "Keyword" },
    { name: "Content", path: "/content-analyzer", title: "Content" },
    { name: "NeuroSEO", path: "/neuroseo", title: "NeuroSEO" },
    { name: "Dashboard", path: "/dashboard", title: "Dashboard" },
  ];

  for (const link of navigationLinks) {
    test(`should navigate to the ${link.name} page correctly`, async ({
      page,
    }) => {
      await page
        .locator(`[data-testid="main-navigation"] >> text=${link.name}`)
        .click();
      await page.waitForURL(`**${link.path}`);
      await expect(page.locator("h1")).toContainText(link.title);
    });
  }

  test("should allow interaction with dashboard widgets", async ({ page }) => {
    // This test assumes dashboard cards link to other pages.
    const firstCard = page.locator('[data-testid="dashboard-card"]').first();
    await expect(firstCard).toBeVisible();

    // Example: Get the link from the card and verify it's valid
    const cardLink = await firstCard.getAttribute("href");
    expect(cardLink).not.toBeNull();

    await firstCard.click();
    await page.waitForURL(`**${cardLink}`);

    // Verify navigation was successful by checking the URL or a title on the new page
    expect(page.url()).toContain(cardLink);
  });

  test("should have a functional search on the dashboard", async ({ page }) => {
    const searchBar = page.locator('[data-testid="dashboard-search"]');
    await expect(searchBar).toBeVisible();

    await searchBar.fill("Test Search");
    await searchBar.press("Enter");

    await page.waitForURL("**/search?q=Test+Search");
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await expect(page.locator("body")).toContainText("Test Search");
  });
});

test.describe("Tier-Specific Dashboard Features", () => {
  test("Free tier user should see upgrade prompts and limited features", async ({
    page,
  }) => {
    await loginAndGoToDashboard(page, "test-free@example.com");

    await expect(page.locator('[data-testid="user-tier"]')).toContainText(
      "Free"
    );
    await expect(page.locator('[data-testid="upgrade-prompt"]')).toBeVisible();

    // Attempt to access a paid feature
    await page.goto("/neuroseo");
    await expect(
      page.locator('[data-testid="limited-access-message"]')
    ).toBeVisible();
    await expect(page.url()).toContain("/pricing"); // Or wherever upgrade prompts lead
  });

  test("Enterprise tier user should see enterprise features", async ({
    page,
  }) => {
    await loginAndGoToDashboard(page, "test-enterprise@example.com");

    await expect(page.locator('[data-testid="user-tier"]')).toContainText(
      "Enterprise"
    );
    await expect(
      page.locator('[data-testid="enterprise-feature"]')
    ).toBeVisible();

    // Verify no upgrade prompts are visible
    await expect(
      page.locator('[data-testid="upgrade-prompt"]')
    ).not.toBeVisible();

    // Attempt to access a team management feature
    await page.goto("/team-management");
    await expect(page.locator("h1")).toContainText("Team Management");
  });
});
