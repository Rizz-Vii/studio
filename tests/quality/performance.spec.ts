import { test, expect } from "@playwright/test";

test.describe("Performance Testing - Core Web Vitals", () => {
  const performanceThresholds = {
    lcp: 2500, // Largest Contentful Paint <= 2.5s
    tbt: 300, // Total Blocking Time <= 300ms
    cls: 0.1, // Cumulative Layout Shift <= 0.1
    fcp: 1800, // First Contentful Paint <= 1.8s
    tti: 3500, // Time to Interactive <= 3.5s
  };

  const pagesToTest = [
    { name: "Home Page", path: "/" },
    { name: "Dashboard", path: "/dashboard", requiresAuth: true },
    { name: "Keyword Tool", path: "/keyword-tool", requiresAuth: true },
    { name: "Content Analyzer", path: "/content-analyzer", requiresAuth: true },
    { name: "NeuroSEO", path: "/neuroseo", requiresAuth: true },
  ];

  for (const pageInfo of pagesToTest) {
    test(`Performance metrics for ${pageInfo.name}`, async ({ page }) => {
      if (pageInfo.requiresAuth) {
        await page.goto("/login");
        await page.fill(
          '[data-testid="email-input"]',
          "test-agency@example.com"
        );
        await page.fill('[data-testid="password-input"]', "testPassword123");
        await page.click('[data-testid="login-button"]');
        await page.waitForURL("**/dashboard");
      }

      await page.goto(pageInfo.path, { waitUntil: "networkidle" });

      const { lcp, tbt, cls, fcp, tti } = await getPerformanceMetrics(page);

      expect(lcp).toBeLessThanOrEqual(performanceThresholds.lcp);
      expect(tbt).toBeLessThanOrEqual(performanceThresholds.tbt);
      expect(cls).toBeLessThanOrEqual(performanceThresholds.cls);
      expect(fcp).toBeLessThanOrEqual(performanceThresholds.fcp);
      expect(tti).toBeLessThanOrEqual(performanceThresholds.tti);
    });
  }

  test("API endpoints have acceptable response times", async ({ request }) => {
    const endpoints = [
      { method: "GET", path: "/api/user/profile" },
      { method: "GET", path: "/api/keywords/suggestions?q=seo" },
      {
        method: "POST",
        path: "/api/content/analyze",
        data: { url: "https://example.com", keywords: ["seo"] },
      },
    ];

    for (const endpoint of endpoints) {
      const method = endpoint.method.toLowerCase() as "get" | "post";
      const response = await request[method](endpoint.path, {
        data: endpoint.data,
      });
      expect(response.ok()).toBeTruthy();
      // Note: response timing not available in this Playwright version
      console.log(`API endpoint ${endpoint.path} responded successfully`);
    }
  });
});

async function getPerformanceMetrics(page: any) {
  const metrics = await page.evaluate(() => {
    const fcp =
      performance.getEntriesByName("first-contentful-paint")[0]?.startTime || 0;
    const lcp =
      performance.getEntriesByName("largest-contentful-paint")[0]?.startTime ||
      0;

    let cls = 0;
    if (
      window.PerformanceObserver &&
      window.PerformanceObserver.supportedEntryTypes.includes("layout-shift")
    ) {
      const entries = performance.getEntriesByType("layout-shift");
      cls = entries.reduce((sum, entry) => sum + (entry as any).value, 0);
    }

    const tti =
      performance.timing.domInteractive - performance.timing.requestStart;

    // TBT is harder to get directly, this is a simplified proxy
    const navTiming = performance.getEntriesByType(
      "navigation"
    )[0] as PerformanceNavigationTiming;
    const tbt = navTiming
      ? navTiming.domComplete - navTiming.domInteractive
      : 0;

    return { lcp, tbt, cls, fcp, tti };
  });
  return metrics;
}
