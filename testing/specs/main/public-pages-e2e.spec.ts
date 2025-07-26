import { test, expect } from "@playwright/test";

test.describe("Public Pages", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("homepage elements and navigation", async ({ page }) => {
    // Header elements
    await expect(page.getByRole("link", { name: /RankPilot/i })).toBeVisible();
    await expect(page.getByRole("navigation")).toBeVisible();

    // Main navigation links
    const navLinks = ["Features", "Pricing", "FAQ"];
    for (const link of navLinks) {
      await expect(
        page.getByRole("link", { name: new RegExp(link, "i") })
      ).toBeVisible();
    }

    // Auth buttons
    await expect(page.getByRole("link", { name: /login/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /sign up/i })).toBeVisible();
  });

  test("pricing page content and plans", async ({ page }) => {
    await page.click("text=Pricing");
    await expect(page).toHaveURL(/.*pricing/);

    // Check pricing tiers
    const pricingTiers = ["Free", "Pro", "Agency"];
    for (const tier of pricingTiers) {
      await expect(page.getByText(tier, { exact: true })).toBeVisible();
    }
  });

  test("features page sections", async ({ page }) => {
    await page.click("text=Features");
    await expect(page).toHaveURL(/.*features/);

    // Check main feature sections
    const features = [
      "Site Audit",
      "Keyword Intelligence",
      "Competitor Tracking",
    ];
    for (const feature of features) {
      await expect(page.getByText(feature, { exact: true })).toBeVisible();
    }
  });

  test("FAQ page content", async ({ page }) => {
    await page.click("text=FAQ");
    await expect(page).toHaveURL(/.*faq/);

    // Check FAQ questions
    await expect(
      page.getByText("Do I need a credit card to sign up?")
    ).toBeVisible();
    await expect(page.getByText("What engines do you track?")).toBeVisible();
    await expect(page.getByText("Can I cancel anytime?")).toBeVisible();
  });

  test("responsive design", async ({ page }) => {
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByRole("button", { name: /menu/i })).toBeVisible();

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByRole("navigation")).toBeVisible();

    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.getByRole("navigation")).toBeVisible();
  });
});
