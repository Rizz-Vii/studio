import { test, expect } from "@playwright/test";

test.describe("Homepage Tests", () => {
  test("basic homepage functionality and performance", async ({ page }) => {
    const startTime = Date.now();

    // Navigate to the homepage
    await test.step("Navigate to homepage", async () => {
      const response = await page.goto("https://rankpilot-h3jpc.web.app/");
      expect(response?.ok()).toBeTruthy();
    });

    // Check load time
    const loadTime = Date.now() - startTime;
    console.log(`Page load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(3000); // Expected load time under 3 seconds

    // Check main elements visibility
    await test.step("Verify critical elements", async () => {
      // Check header
      await expect(
        page.getByRole("heading", { name: /SEO Insights/i })
      ).toBeVisible();

      // Check navigation links
      await expect(page.getByRole("link", { name: /Features/i })).toBeVisible();
      await expect(page.getByRole("link", { name: /Pricing/i })).toBeVisible();
      await expect(page.getByRole("link", { name: /FAQ/i })).toBeVisible();

      // Check CTA buttons
      await expect(
        page.getByRole("link", { name: /Start Free/i })
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: /Request Demo/i })
      ).toBeVisible();
    });

    // Check console for errors
    await test.step("Check console errors", async () => {
      const errors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") {
          errors.push(msg.text());
        }
      });
      expect(errors.length).toBe(0);
    });

    // Check network requests
    await test.step("Verify network requests", async () => {
      const failedRequests: string[] = [];
      page.on("requestfailed", (request) => {
        failedRequests.push(
          `${request.url()} - ${request.failure()?.errorText}`
        );
      });
      expect(failedRequests.length).toBe(0);
    });

    // Performance check using evaluation
    await test.step("Check performance metrics", async () => {
      const performance = await page.evaluate(() => ({
        memory: (window as any).performance?.memory?.usedJSHeapSize || 0,
        timing: window.performance.timing,
      }));

      if (performance.memory) {
        const heapSizeMB = Math.round(performance.memory / 1024 / 1024);
        console.log("JS Heap Size:", heapSizeMB, "MB");
        expect(heapSizeMB).toBeLessThan(100); // Less than 100MB
      }

      // Log performance timing metrics
      const navigationStart = performance.timing.navigationStart;
      const loadEventEnd = performance.timing.loadEventEnd;
      console.log(
        "Total page load time:",
        loadEventEnd - navigationStart,
        "ms"
      );
    });
  });
});
