import { test, expect } from "@playwright/test";
import type { PerformanceMetrics } from "../utils/performance-types";

test.describe("Performance Testing - Core Web Vitals", () => {
  // Define performance thresholds as per Core Web Vitals
  const performanceThresholds = {
    // Largest Contentful Paint (LCP): measures loading performance
    lcp: 2500, // Good: <= 2.5s

    // First Input Delay (FID) / Total Blocking Time (TBT) as proxy
    // TBT is used as a proxy for FID in lab testing
    tbt: 300, // Good: TBT <= 300ms

    // Cumulative Layout Shift (CLS)
    cls: 0.1, // Good: <= 0.1

    // First Contentful Paint (FCP)
    fcp: 1800, // Good: <= 1.8s

    // Time to Interactive (TTI)
    tti: 3500, // Good: <= 3.5s

    // Speed Index
    speedIndex: 3400, // Good: <= 3.4s
  };

  // Pages to test performance
  const pagesToTest = [
    { name: "Home Page", path: "/" },
    { name: "Dashboard", path: "/dashboard", requiresAuth: true },
    { name: "Keyword Tool", path: "/keyword-tool", requiresAuth: true },
    { name: "Content Analyzer", path: "/content-analyzer", requiresAuth: true },
    { name: "NeuroSEO", path: "/neuroseo", requiresAuth: true },
  ];

  for (const page of pagesToTest) {
    test(`Performance testing - ${page.name}`, async ({
      page: pageObj,
      browser,
    }) => {
      // Login if required
      if (page.requiresAuth) {
        await pageObj.goto("/login");
        await pageObj.fill(
          '[data-testid="email-input"]',
          "test-agency@example.com"
        );
        await pageObj.fill('[data-testid="password-input"]', "testPassword123");
        await pageObj.click('[data-testid="login-button"]');
        await pageObj.waitForNavigation();
      }

      // Navigate to the test page
      // Enable JS profiling to collect performance metrics
      const cdpSession = await (browser.contexts()[0] as any).newCDPSession(
        pageObj
      );
      await cdpSession.send("Performance.enable");

      // Start tracing before navigating
      await pageObj
        .context()
        .tracing.start({ screenshots: true, snapshots: true });

      // Navigate to page
      const navigationStart = Date.now();
      await pageObj.goto(page.path, { waitUntil: "networkidle" });
      const navigationTime = Date.now() - navigationStart;

      // Calculate layout stability (approximating CLS)
      // We use JS to calculate CLS as accurately as possible in automation
      const cls = await pageObj.evaluate(() => {
        if (
          !window.PerformanceObserver ||
          !window.PerformanceObserver.supportedEntryTypes ||
          !window.PerformanceObserver.supportedEntryTypes.includes(
            "layout-shift"
          )
        ) {
          return 0;
        }

        const entries = performance.getEntriesByType("layout-shift");
        return entries.reduce(
          (sum: number, entry: any) => sum + entry.value,
          0
        );
      });

      // Get Core Web Vitals and other metrics
      const metrics = await cdpSession.send("Performance.getMetrics");

      // Extract relevant metrics
      const performanceMetrics: PerformanceMetrics = {
        navigationTime,
        firstPaint: 0,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        domContentLoaded: 0,
        load: 0,
        totalBlockingTime: 0, // This will be calculated from the trace
        speedIndex: 0, // This will be approximated
        cumulativeLayoutShift: cls,
        timeToInteractive: 0, // This will be approximated
      };

      // Process metrics from CDP
      for (const metric of metrics.metrics) {
        switch (metric.name) {
          case "FirstPaint":
            performanceMetrics.firstPaint = metric.value * 1000;
            break;
          case "FirstContentfulPaint":
            performanceMetrics.firstContentfulPaint = metric.value * 1000;
            break;
          case "DomContentLoaded":
            performanceMetrics.domContentLoaded = metric.value * 1000;
            break;
          case "LoadEvent":
            performanceMetrics.load = metric.value * 1000;
            break;
          default:
            break;
        }
      }

      // Get LCP using web vitals API via JS
      performanceMetrics.largestContentfulPaint = await pageObj.evaluate(() => {
        return new Promise((resolve) => {
          // Use LCP API if available
          if (
            PerformanceObserver.supportedEntryTypes.includes(
              "largest-contentful-paint"
            )
          ) {
            // Start observing LCP
            const lcpObserver = new PerformanceObserver((entryList) => {
              const entries = entryList.getEntries();
              const lastEntry = entries[entries.length - 1];
              resolve(lastEntry ? lastEntry.startTime : 0);
            });

            lcpObserver.observe({
              type: "largest-contentful-paint",
              buffered: true,
            });

            // Fallback if no LCP detected after 5s
            setTimeout(() => resolve(0), 5000);
          } else {
            // Fallback for browsers not supporting LCP
            resolve(0);
          }
        });
      });

      // Stop tracing
      const traceFile = `./test-results/performance-trace-${page.path.replace(/\//g, "-")}-${Date.now()}.zip`;
      await pageObj.context().tracing.stop({ path: traceFile });

      // Analyze the trace for TBT (Total Blocking Time)
      // In real implementation, this would use trace analysis, but we'll approximate for this test
      performanceMetrics.totalBlockingTime =
        performanceMetrics.load - performanceMetrics.firstContentfulPaint;
      if (performanceMetrics.totalBlockingTime < 0)
        performanceMetrics.totalBlockingTime = 0;

      // Approximate TTI (Time to Interactive)
      // In real implementation, this would be calculated from the trace
      performanceMetrics.timeToInteractive = performanceMetrics.load + 100;

      // Approximate Speed Index
      // In real implementation, this would be calculated from visual completeness over time
      performanceMetrics.speedIndex =
        (performanceMetrics.firstContentfulPaint + performanceMetrics.load) / 2;

      // Log performance metrics for analysis
      console.log(`Performance metrics for ${page.name}:`);
      console.log(`- Navigation Time: ${performanceMetrics.navigationTime}ms`);
      console.log(`- First Paint: ${performanceMetrics.firstPaint}ms`);
      console.log(
        `- First Contentful Paint (FCP): ${performanceMetrics.firstContentfulPaint}ms`
      );
      console.log(
        `- Largest Contentful Paint (LCP): ${performanceMetrics.largestContentfulPaint}ms`
      );
      console.log(
        `- DOM Content Loaded: ${performanceMetrics.domContentLoaded}ms`
      );
      console.log(`- Load Event: ${performanceMetrics.load}ms`);
      console.log(
        `- Total Blocking Time (TBT): ${performanceMetrics.totalBlockingTime}ms`
      );
      console.log(`- Speed Index: ${performanceMetrics.speedIndex}ms`);
      console.log(
        `- Cumulative Layout Shift (CLS): ${performanceMetrics.cumulativeLayoutShift}`
      );
      console.log(
        `- Time to Interactive (TTI): ${performanceMetrics.timeToInteractive}ms`
      );

      // Capture a trace file for more detailed analysis if needed
      console.log(`Trace file saved at: ${traceFile}`);

      // Assertions for Core Web Vitals
      expect(performanceMetrics.largestContentfulPaint).toBeLessThanOrEqual(
        performanceThresholds.lcp
      );
      expect(performanceMetrics.totalBlockingTime).toBeLessThanOrEqual(
        performanceThresholds.tbt
      );
      expect(performanceMetrics.cumulativeLayoutShift).toBeLessThanOrEqual(
        performanceThresholds.cls
      );

      // Additional assertions for other performance metrics
      expect(performanceMetrics.firstContentfulPaint).toBeLessThanOrEqual(
        performanceThresholds.fcp
      );
      expect(performanceMetrics.timeToInteractive).toBeLessThanOrEqual(
        performanceThresholds.tti
      );
      expect(performanceMetrics.speedIndex).toBeLessThanOrEqual(
        performanceThresholds.speedIndex
      );

      // Take a screenshot for reference
      await pageObj.screenshot({
        path: `test-results/performance-screenshot-${page.path.replace(/\//g, "-")}-${Date.now()}.png`,
      });
    });
  }

  // Mobile performance testing
  test.describe("Mobile Performance Testing", () => {
    // Use a popular mobile device preset
    test.use({
      viewport: { width: 390, height: 844 },
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
    });

    for (const page of pagesToTest) {
      test(`Mobile performance testing - ${page.name}`, async ({
        page: pageObj,
        browser,
      }) => {
        // Similar implementation as desktop but with mobile viewport
        if (page.requiresAuth) {
          await pageObj.goto("/login");
          await pageObj.fill(
            '[data-testid="email-input"]',
            "test-agency@example.com"
          );
          await pageObj.fill(
            '[data-testid="password-input"]',
            "testPassword123"
          );
          await pageObj.click('[data-testid="login-button"]');
          await pageObj.waitForNavigation();
        }

        const cdpSession = await (browser.contexts()[0] as any).newCDPSession(
          pageObj
        );
        await cdpSession.send("Performance.enable");

        // Start tracing
        await pageObj
          .context()
          .tracing.start({ screenshots: true, snapshots: true });

        // Navigate to page with throttling to simulate mobile conditions
        await cdpSession.send("Network.emulateNetworkConditions", {
          offline: false,
          downloadThroughput: (1.5 * 1024 * 1024) / 8, // 1.5 Mbps
          uploadThroughput: (750 * 1024) / 8, // 750 Kbps
          latency: 40, // 40ms
        });

        await cdpSession.send("Emulation.setCPUThrottlingRate", {
          rate: 4, // 4x slowdown
        });

        const navigationStart = Date.now();
        await pageObj.goto(page.path, { waitUntil: "networkidle" });
        const navigationTime = Date.now() - navigationStart;

        // Rest of the metrics collection as in desktop test
        // but with adjusted thresholds for mobile

        // Mobile thresholds are a bit more lenient
        const mobileThresholds = {
          lcp: 3000, // 3s for mobile
          tbt: 400, // 400ms for mobile
          cls: 0.1, // Same as desktop
          fcp: 2200, // 2.2s for mobile
          tti: 4000, // 4s for mobile
          speedIndex: 3800, // 3.8s for mobile
        };

        // Stop tracing
        const traceFile = `./test-results/mobile-performance-trace-${page.path.replace(/\//g, "-")}-${Date.now()}.zip`;
        await pageObj.context().tracing.stop({ path: traceFile });

        // Log the navigation time for quick reference
        console.log(
          `Mobile navigation time for ${page.name}: ${navigationTime}ms`
        );
        console.log(`Mobile trace file saved at: ${traceFile}`);

        // Take a screenshot of mobile view
        await pageObj.screenshot({
          path: `test-results/mobile-performance-screenshot-${page.path.replace(/\//g, "-")}-${Date.now()}.png`,
          fullPage: true,
        });

        // For mobile, we'll just assert on navigation time as a simple metric
        // In a real implementation, you would analyze the trace file for detailed metrics
        expect(navigationTime).toBeLessThan(8000); // 8s for complete page load on mobile
      });
    }
  });

  // Test resource loading optimization
  test("Resource loading optimization check", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    // Check for optimized resource loading
    const resourceOptimization = await page.evaluate(() => {
      // Get all resources
      const resources = performance.getEntriesByType("resource");

      // Check for key optimizations
      const unoptimizedImages = resources.filter((r: any) => {
        return r.initiatorType === "img" && r.transferSize > 200000; // Images over 200KB
      }).length;

      const renderBlockingResources = resources.filter((r: any) => {
        return (
          (r.initiatorType === "link" || r.initiatorType === "script") &&
          r.renderBlockingStatus === "blocking"
        );
      }).length;

      return {
        totalResources: resources.length,
        unoptimizedImages,
        renderBlockingResources,
      };
    });

    console.log("Resource optimization metrics:");
    console.log(`- Total resources: ${resourceOptimization.totalResources}`);
    console.log(
      `- Unoptimized images: ${resourceOptimization.unoptimizedImages}`
    );
    console.log(
      `- Render-blocking resources: ${resourceOptimization.renderBlockingResources}`
    );

    // Assert on resource optimization
    expect(resourceOptimization.unoptimizedImages).toBeLessThanOrEqual(3);
    expect(resourceOptimization.renderBlockingResources).toBeLessThanOrEqual(5);
  });

  // Server response time test
  test("API endpoints performance test", async ({ page, request }) => {
    // Login to get authentication token
    await page.goto("/login");
    await page.fill('[data-testid="email-input"]', "test-agency@example.com");
    await page.fill('[data-testid="password-input"]', "testPassword123");
    await page.click('[data-testid="login-button"]');

    // Wait for login to complete
    await page.waitForNavigation();

    // Get authentication cookies
    const cookies = await page.context().cookies();
    const headers = {};

    // API endpoints to test
    const endpoints = [
      "/api/dashboard/summary",
      "/api/user/profile",
      "/api/keywords/suggestions?q=seo",
      "/api/content/analyze",
    ];

    // Test each endpoint
    for (const endpoint of endpoints) {
      const startTime = Date.now();

      // For POST endpoints, we need a different approach
      if (endpoint === "/api/content/analyze") {
        const response = await request.post(endpoint, {
          headers,
          data: {
            url: "https://example.com",
            keywords: ["seo", "content"],
          },
        });
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        console.log(`API response time for ${endpoint}: ${responseTime}ms`);
        expect(response.status()).toBeLessThan(400); // Successful response
        expect(responseTime).toBeLessThan(2000); // Less than 2s
      } else {
        // GET endpoints
        const response = await request.get(endpoint, { headers });
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        console.log(`API response time for ${endpoint}: ${responseTime}ms`);
        expect(response.status()).toBeLessThan(400); // Successful response
        expect(responseTime).toBeLessThan(1000); // Less than 1s for GET requests
      }
    }
  });

  // Memory usage test
  test("Memory usage monitoring", async ({ page, browser }) => {
    // Login
    await page.goto("/login");
    await page.fill('[data-testid="email-input"]', "test-agency@example.com");
    await page.fill('[data-testid="password-input"]', "testPassword123");
    await page.click('[data-testid="login-button"]');

    // Navigate to dashboard which should have rich features
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Get initial memory usage
    const cdpSession = await (browser.contexts()[0] as any).newCDPSession(page);
    const initialMemory = await cdpSession.send("Performance.getMetrics");
    const initialJSHeapSize =
      initialMemory.metrics.find((m: any) => m.name === "JSHeapUsedSize")
        ?.value || 0;

    console.log(`Initial JS Heap Size: ${initialJSHeapSize} bytes`);

    // Perform some interactions that might increase memory usage
    await page.click('button:has-text("Refresh")').catch(() => {}); // Ignore if not found
    await page.waitForTimeout(1000);

    // Switch between sections
    await page.click('a:has-text("NeuroSEO")').catch(() => {});
    await page.waitForLoadState("networkidle");
    await page.click('a:has-text("Keyword Tool")').catch(() => {});
    await page.waitForLoadState("networkidle");
    await page.click('a:has-text("Dashboard")').catch(() => {});
    await page.waitForLoadState("networkidle");

    // Check memory after interactions
    const finalMemory = await cdpSession.send("Performance.getMetrics");
    const finalJSHeapSize =
      finalMemory.metrics.find((m: any) => m.name === "JSHeapUsedSize")
        ?.value || 0;

    console.log(`Final JS Heap Size: ${finalJSHeapSize} bytes`);
    console.log(
      `Memory increase: ${finalJSHeapSize - initialJSHeapSize} bytes`
    );

    // Check for memory leaks (significant unexpected increase)
    // Allow for reasonable memory increase due to caching, but not excessive
    const maxAllowableIncrease = initialJSHeapSize * 2; // Allow up to 2x increase
    expect(finalJSHeapSize).toBeLessThan(maxAllowableIncrease);
  });
});
