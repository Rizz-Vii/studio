import { test, expect } from "@playwright/test";
import { SerpViewPage } from "../pages/serp-view-page";
import { performance } from "perf_hooks";

test.describe("Performance Tests", () => {
  let serpPage: SerpViewPage;

  test.beforeEach(async ({ page }) => {
    serpPage = new SerpViewPage(page);
  });

  test("page load performance metrics", async ({ page }) => {
    // Start performance measurement
    const startTime = performance.now();

    // Enable performance logging
    await page.route("**/*", (route) => {
      route.continue();
    });

    // Navigate and wait for load
    await serpPage.navigateTo("/serp-view");

    // Get performance metrics
    const metrics = await page.evaluate(() =>
      JSON.stringify({
        fpaint: performance.getEntriesByName("first-paint")[0],
        fcpaint: performance.getEntriesByName("first-contentful-paint")[0],
        lcp: performance.getEntriesByName("largest-contentful-paint")[0],
        fid: performance.getEntriesByName("first-input-delay")[0],
        cls: performance.getEntriesByName("cumulative-layout-shift")[0],
      })
    );

    const perfMetrics = JSON.parse(metrics);

    // Performance assertions
    expect(perfMetrics.fcpaint?.startTime).toBeLessThan(1000); // 1s
    expect(perfMetrics.lcp?.startTime).toBeLessThan(2500); // 2.5s
    expect(perfMetrics.cls?.value).toBeLessThan(0.1); // Good CLS score
  });

  test("analysis response time", async ({ page }) => {
    await serpPage.navigateTo("/serp-view");

    const startTime = performance.now();
    await serpPage.analyze("https://example.com", "test keyword");
    const endTime = performance.now();

    const responseTime = endTime - startTime;
    expect(responseTime).toBeLessThan(5000); // 5s max
  });

  test("memory usage remains stable", async ({ page }) => {
    const getMemoryUsage = () =>
      page.evaluate(() => {
        // @ts-ignore - Chrome-specific API
        return JSON.stringify(performance.memory);
      });

    // Initial memory usage
    await serpPage.navigateTo("/serp-view");
    const initialMemory = JSON.parse(await getMemoryUsage());

    // Perform multiple analyses
    for (let i = 0; i < 5; i++) {
      await serpPage.analyze(`https://example${i}.com`, `keyword ${i}`);
    }

    // Check final memory usage
    const finalMemory = JSON.parse(await getMemoryUsage());

    // Ensure memory growth is reasonable (less than 50%)
    expect(finalMemory.usedJSHeapSize).toBeLessThan(
      initialMemory.usedJSHeapSize * 1.5
    );
  });
});
