import { test, expect } from "../setup/test-setup";
import { LinkViewPage } from "../pages/link-view-page";

test.describe("Link Analysis Features", () => {
  let linkPage: LinkViewPage;

  test.beforeEach(async ({ authenticatedPage: page }) => {
    linkPage = new LinkViewPage(page);
    await linkPage.navigateTo("/link-view");
  });

  test("analyzes single link successfully", async ({ page }) => {
    const testUrl = "https://example.com/test-page";

    await linkPage.analyzeSingleLink(testUrl);

    // Verify basic metrics are visible
    await expect(linkPage.metricCards).toBeVisible();
    await expect(linkPage.resultsContainer).toBeVisible();
    await expect(linkPage.statusIndicator).toHaveText(/success/i);
  });

  test("handles batch link analysis", async ({ page }) => {
    const testUrls = [
      "https://example.com/page1",
      "https://example.com/page2",
      "https://example.com/page3",
    ];

    await linkPage.analyzeBatchLinks(testUrls);

    // Verify batch results
    await expect(linkPage.getBatchProgress()).toBeVisible();
    const results = await linkPage.getBatchResults();
    expect(results).toHaveLength(testUrls.length);
  });

  test("exports analysis results", async ({ page }) => {
    const testUrl = "https://example.com/export-test";

    await linkPage.analyzeSingleLink(testUrl);

    // Test export functionality
    const downloadPromise = linkPage.exportResults("csv");
    await expect(
      page.locator('[data-testid="download-notification"]')
    ).toBeVisible();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain(".csv");
  });

  test("saves and compares analyses", async ({ page }) => {
    const urls = [
      "https://example.com/compare1",
      "https://example.com/compare2",
    ];

    // Analyze and save multiple URLs
    for (const url of urls) {
      await linkPage.analyzeSingleLink(url);
      await linkPage.addToComparison();
    }

    // View comparison
    await linkPage.viewComparison();

    // Verify comparison view
    await expect(linkPage.comparisonView).toBeVisible();
    await expect(linkPage.metricCards).toHaveCount(urls.length);
  });

  test("handles invalid URLs gracefully", async ({ page }) => {
    const invalidUrl = "not-a-valid-url";

    await linkPage.analyzeSingleLink(invalidUrl);

    // Verify error handling
    await expect(linkPage.errorMessage).toBeVisible();
    await expect(linkPage.errorMessage).toContainText(/invalid url/i);
  });

  test("displays domain metrics correctly", async ({ page }) => {
    const testUrl = "https://example.com";
    await linkPage.analyzeDomain(testUrl);

    const metrics = await linkPage.getMetrics();
    expect(metrics).toBeDefined();
    expect(Object.keys(metrics)).toContain("authority");
  });

  test("shows backlinks data", async ({ page }) => {
    const testUrl = "https://example.com";
    await linkPage.analyzeDomain(testUrl);

    const backlinks = await linkPage.getBacklinks();
    expect(backlinks.length).toBeGreaterThan(0);
    expect(backlinks[0]).toHaveProperty("url");
    expect(backlinks[0]).toHaveProperty("authority");
  });
});
