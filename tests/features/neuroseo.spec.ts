import { test, expect } from "@playwright/test";

test.describe("NeuroSEO Suite Tests", () => {
  test.setTimeout(120000); // 2 minute timeout for complex NeuroSEO operations

  // Test for different user tiers
  const tiers = [
    { role: "free", limitations: true, features: ["basic"] },
    {
      role: "starter",
      limitations: true,
      features: ["neural-crawler", "semantic-map"],
    },
    {
      role: "agency",
      limitations: false,
      features: [
        "neural-crawler",
        "semantic-map",
        "ai-visibility",
        "trust-block",
      ],
    },
    {
      role: "enterprise",
      limitations: false,
      features: [
        "neural-crawler",
        "semantic-map",
        "ai-visibility",
        "trust-block",
        "unlimited",
      ],
    },
  ];

  for (const tier of tiers) {
    test(`NeuroSEO features for ${tier.role} tier`, async ({ page }) => {
      // Login as the appropriate tier user
      await page.goto("/login");
      await page.fill(
        '[data-testid="email-input"]',
        `test-${tier.role}@example.com`
      );
      await page.fill('[data-testid="password-input"]', "testPassword123");
      await page.click('[data-testid="login-button"]');

      // Navigate to NeuroSEO page
      await page.goto("/neuroseo");
      await page.waitForLoadState("domcontentloaded");

      // Check tier-specific features
      if (tier.features.includes("neural-crawler")) {
        await expect(page.locator("text=Neural Crawler")).toBeVisible();
      }

      if (tier.features.includes("semantic-map")) {
        await expect(page.locator("text=Semantic Map")).toBeVisible();
      }

      if (tier.features.includes("ai-visibility")) {
        await expect(page.locator("text=AI Visibility")).toBeVisible();
      }

      if (tier.features.includes("trust-block")) {
        await expect(page.locator("text=TrustBlock")).toBeVisible();
      }

      if (tier.features.includes("unlimited")) {
        await expect(page.locator("text=Unlimited")).toBeVisible();
      }

      // Check for expected limitations/upgrade prompts
      if (tier.limitations) {
        const upgradeElements = await page
          .locator("text=/upgrade|unlock|premium/i")
          .count();
        expect(upgradeElements).toBeGreaterThan(0);
      } else {
        const upgradeElements = await page
          .locator("text=/upgrade|unlock|premium/i")
          .count();
        expect(upgradeElements).toBe(0);
      }

      // Take screenshot for this tier
      await page.screenshot({
        path: `test-results/neuroseo-${tier.role}-tier-${Date.now()}.png`,
      });
    });
  }

  test("Neural Crawler functionality test", async ({ page }) => {
    // Login as agency user who has access to full NeuroSEO features
    await page.goto("/login");
    await page.fill('[data-testid="email-input"]', "test-agency@example.com");
    await page.fill('[data-testid="password-input"]', "testPassword123");
    await page.click('[data-testid="login-button"]');

    // Navigate to NeuroSEO page
    await page.goto("/neuroseo");

    // Enter URL for analysis
    await page
      .locator("input[type='url'], input[placeholder*='url']")
      .fill("https://example.com");

    // Check for advanced options
    const advancedOptionsToggle = page.locator("text=Advanced Options");
    if ((await advancedOptionsToggle.count()) > 0) {
      await advancedOptionsToggle.click();

      // Configure advanced options
      const depthSelector = page.locator(
        "select[name='crawl-depth'], [data-testid='crawl-depth-selector']"
      );
      if ((await depthSelector.count()) > 0) {
        await depthSelector.selectOption("2"); // Select depth of 2
      }

      // Enable AI analysis if available
      const aiAnalysisCheckbox = page.locator(
        "input[type='checkbox'][name*='ai'], [data-testid='enable-ai-analysis']"
      );
      if ((await aiAnalysisCheckbox.count()) > 0) {
        await aiAnalysisCheckbox.check();
      }
    }

    // Start crawling
    await page.locator("button:has-text(/analyze|crawl|start/i)").click();

    // Wait for analysis to complete (may take a while)
    await page.waitForSelector(
      "text=/crawl complete|analysis complete|results/i",
      { timeout: 60000 }
    );

    // Verify results are displayed
    await expect(
      page.locator('[data-testid="neural-crawler-results"]')
    ).toBeVisible();

    // Check for common result elements
    const resultElements = [
      "Page Titles",
      "Meta Descriptions",
      "Keywords",
      "Content Analysis",
    ];

    for (const element of resultElements) {
      await expect(page.locator(`text=${element}`)).toBeVisible();
    }

    // Take screenshot of results
    await page.screenshot({
      path: `test-results/neural-crawler-results-${Date.now()}.png`,
    });
  });

  test("Semantic Map visualization test", async ({ page }) => {
    // Login as agency user
    await page.goto("/login");
    await page.fill('[data-testid="email-input"]', "test-agency@example.com");
    await page.fill('[data-testid="password-input"]', "testPassword123");
    await page.click('[data-testid="login-button"]');

    // Navigate to NeuroSEO page
    await page.goto("/neuroseo/semantic-map");

    // Enter keywords for analysis
    await page
      .locator("input[type='text'], textarea")
      .fill("SEO, content marketing, digital marketing");

    // Start semantic mapping
    await page.locator("button:has-text(/generate|analyze|map/i)").click();

    // Wait for visualization to appear
    await page.waitForSelector(
      "svg, canvas, [data-testid='semantic-map-visualization']",
      { timeout: 60000 }
    );

    // Verify map is interactive
    const mapElement = page.locator(
      "svg, canvas, [data-testid='semantic-map-visualization']"
    );
    await expect(mapElement).toBeVisible();

    // Try interacting with the map
    const mapBox = await mapElement.boundingBox();
    if (mapBox) {
      // Click on a node
      await page.mouse.click(
        mapBox.x + mapBox.width / 2,
        mapBox.y + mapBox.height / 2
      );

      // Check for node selection feedback
      await page.waitForTimeout(1000); // Wait for any visual feedback

      // Take screenshot of the interactive map
      await page.screenshot({
        path: `test-results/semantic-map-interactive-${Date.now()}.png`,
      });
    }
  });

  test("AI Visibility analysis test", async ({ page }) => {
    // Login as enterprise user
    await page.goto("/login");
    await page.fill(
      '[data-testid="email-input"]',
      "test-enterprise@example.com"
    );
    await page.fill('[data-testid="password-input"]', "testPassword123");
    await page.click('[data-testid="login-button"]');

    // Navigate to AI Visibility page
    await page.goto("/neuroseo/ai-visibility");

    // Enter URL for analysis
    await page
      .locator("input[type='url'], input[placeholder*='url']")
      .fill("https://example.com");

    // Start analysis
    await page.locator("button:has-text(/analyze|check|scan/i)").click();

    // Wait for analysis to complete
    await page.waitForSelector(
      "[data-testid='ai-visibility-results'], text=/analysis complete|results/i",
      { timeout: 60000 }
    );

    // Verify results components
    const resultSections = [
      "AI Visibility Score",
      "Content Visibility",
      "Structured Data",
      "Recommendations",
    ];

    for (const section of resultSections) {
      // Use a relaxed selector that looks for text containing the section name
      await expect(
        page.locator(
          `text=${section}, text=/${section}/i, h2:has-text("${section}")`
        )
      ).toBeVisible();
    }

    // Check for score visualization
    await expect(
      page.locator(
        "[data-testid='ai-visibility-score'], [class*='score'], [class*='gauge']"
      )
    ).toBeVisible();

    // Take screenshot of results
    await page.screenshot({
      path: `test-results/ai-visibility-results-${Date.now()}.png`,
      fullPage: true,
    });
  });

  test("TrustBlock verification test", async ({ page }) => {
    // Login as enterprise user
    await page.goto("/login");
    await page.fill(
      '[data-testid="email-input"]',
      "test-enterprise@example.com"
    );
    await page.fill('[data-testid="password-input"]', "testPassword123");
    await page.click('[data-testid="login-button"]');

    // Navigate to TrustBlock page
    await page.goto("/neuroseo/trust-block");

    // Enter domain for analysis
    await page
      .locator(
        "input[type='url'], input[placeholder*='domain'], input[placeholder*='url']"
      )
      .fill("example.com");

    // Start trust analysis
    await page.locator("button:has-text(/analyze|verify|check/i)").click();

    // Wait for analysis to complete
    await page.waitForSelector(
      "[data-testid='trust-block-results'], text=/analysis complete|results/i",
      { timeout: 60000 }
    );

    // Verify trust metrics are displayed
    const trustMetrics = [
      "Domain Authority",
      "Trust Score",
      "Security",
      "Authenticity",
    ];

    for (const metric of trustMetrics) {
      // Use a relaxed selector that looks for text containing the metric name
      await expect(
        page.locator(
          `text=${metric}, text=/${metric}/i, [data-testid*='${metric.toLowerCase().replace(/\s+/g, "-")}']`
        )
      ).toBeVisible();
    }

    // Check for TrustBlock preview
    await expect(
      page.locator(
        "[data-testid='trust-block-preview'], [class*='preview'], [class*='trust-block']"
      )
    ).toBeVisible();

    // Take screenshot of results
    await page.screenshot({
      path: `test-results/trust-block-results-${Date.now()}.png`,
    });
  });

  test("NeuroSEO mobile responsiveness", async ({ page }) => {
    // Login as agency user
    await page.goto("/login");
    await page.fill('[data-testid="email-input"]', "test-agency@example.com");
    await page.fill('[data-testid="password-input"]', "testPassword123");
    await page.click('[data-testid="login-button"]');

    // Set viewport to mobile size
    await page.setViewportSize({ width: 390, height: 844 });

    // Test NeuroSEO features on mobile
    const neuroSeoPages = [
      "/neuroseo",
      "/neuroseo/neural-crawler",
      "/neuroseo/semantic-map",
      "/neuroseo/ai-visibility",
    ];

    for (const pageUrl of neuroSeoPages) {
      await page.goto(pageUrl);
      await page.waitForLoadState("domcontentloaded");

      // Check that form elements are usable on mobile
      const inputs = page.locator(
        "input, textarea, select, button[type='submit']"
      );
      await expect(inputs.first()).toBeVisible();

      // Check that no horizontal scrollbar appears
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.body.scrollWidth > window.innerWidth;
      });

      expect(hasHorizontalScroll).toBe(false);

      // Take screenshot for visual verification
      await page.screenshot({
        path: `test-results/neuroseo-mobile-${pageUrl.replace(/\//g, "-")}-${Date.now()}.png`,
        fullPage: true,
      });
    }
  });

  test("NeuroSEO performance metrics", async ({ page }) => {
    // Login as enterprise user to access all features
    await page.goto("/login");
    await page.fill(
      '[data-testid="email-input"]',
      "test-enterprise@example.com"
    );
    await page.fill('[data-testid="password-input"]', "testPassword123");
    await page.click('[data-testid="login-button"]');

    // Navigate to NeuroSEO
    await page.goto("/neuroseo");

    // Enable performance measurement
    await page.evaluate(() => {
      (window as any).performanceMetrics = {
        loadStart: Date.now(),
      };
    });

    // Start a Neural Crawler analysis
    await page.locator("input[type='url']").fill("https://example.com");
    await page.locator("button:has-text(/analyze|crawl/i)").click();

    // Wait for results to appear
    await page.waitForSelector(
      "[data-testid='neural-crawler-results'], [data-testid='results-container']",
      { timeout: 60000 }
    );

    // Measure rendering time
    const renderTime = await page.evaluate(() => {
      return Date.now() - (window as any).performanceMetrics.loadStart;
    });

    console.log(`NeuroSEO render time: ${renderTime}ms`);

    // Results should render within 30 seconds at most
    expect(renderTime).toBeLessThan(30000);

    // Check memory usage if browser supports it
    try {
      const memoryUsage = await page.evaluate(() => {
        // @ts-ignore
        return performance.memory?.usedJSHeapSize || null;
      });

      if (memoryUsage) {
        // Convert to MB for easier reading
        const usedInMB = memoryUsage / (1024 * 1024);
        console.log(`Memory usage: ${usedInMB.toFixed(2)} MB`);

        // Should be under 200MB for reasonable performance
        expect(usedInMB).toBeLessThan(200);
      }
    } catch (e) {
      console.log("Memory metrics not available in this browser");
    }
  });
});
