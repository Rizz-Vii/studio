import { test, expect } from "@playwright/test";
import { DashboardPage } from "../pages/dashboard-page";
import { LinkViewPage } from "../pages/link-view-page";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibility Tests", () => {
  test("dashboard page meets WCAG standards", async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.navigateTo("/dashboard");

    // Run axe accessibility tests
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test("link analysis form is keyboard accessible", async ({ page }) => {
    const linkView = new LinkViewPage(page);
    await linkView.navigateTo("/link-view");

    // Test tab navigation
    await page.keyboard.press("Tab");
    expect(
      await page.evaluate(() =>
        document.activeElement?.getAttribute("data-testid")
      )
    ).toBe("link-input");

    await page.keyboard.press("Tab");
    expect(
      await page.evaluate(() =>
        document.activeElement?.getAttribute("data-testid")
      )
    ).toBe("analyze-button");

    // Test form submission with keyboard
    await page.keyboard.type("https://example.com");
    await page.keyboard.press("Enter");
    await linkView.waitForLoadingComplete();

    expect(await linkView.resultsContainer.isVisible()).toBe(true);
  });

  test("color contrast meets WCAG requirements", async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.navigateTo("/dashboard");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2aa"])
      .options({
        rules: {
          "color-contrast": { enabled: true },
        },
      })
      .analyze();

    const contrastErrors = results.violations.filter(
      (violation: { id: string }) => violation.id === "color-contrast"
    );
    expect(contrastErrors).toEqual([]);
  });

  test("dynamic content updates are announced to screen readers", async ({
    page,
  }) => {
    const linkView = new LinkViewPage(page);
    await linkView.navigateTo("/link-view");

    // Monitor aria-live regions
    const liveAnnouncements: string[] = [];
    await page.on("console", (msg) => {
      if (
        msg.type() === "log" &&
        msg.text().startsWith("Live region updated:")
      ) {
        liveAnnouncements.push(msg.text());
      }
    });

    await linkView.analyzeDomain("https://example.com");

    // Verify loading state announcement
    expect(liveAnnouncements).toContain(
      "Live region updated: Analysis in progress"
    );
    // Verify results announcement
    expect(liveAnnouncements).toContain(
      "Live region updated: Analysis complete"
    );
  });

  test("form validation errors are properly announced", async ({ page }) => {
    const linkView = new LinkViewPage(page);
    await linkView.navigateTo("/link-view");

    // Submit empty form
    await linkView.analyzeButton.click();

    // Check error handling
    const errorMessage = page.locator('[role="alert"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveAttribute("aria-live", "assertive");

    // Verify error is associated with input
    const input = linkView.linkInput;
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(input).toHaveAttribute("aria-errormessage");
  });
});
