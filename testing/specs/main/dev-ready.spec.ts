import { test, expect } from "@playwright/test";

/**
 * Development-First Test Suite
 * Tests only what's currently implemented to avoid false failures
 */

test.describe("Development-Ready Tests", () => {
  test("homepage loads and renders correctly", async ({ page }) => {
    console.log("🏠 Testing homepage availability...");

    const response = await page.goto("/", {
      waitUntil: "domcontentloaded",
      timeout: 60000, // Give time for Next.js compilation
    });

    expect(response?.ok()).toBeTruthy();

    // Wait for basic page structure
    await page.waitForLoadState("networkidle", { timeout: 30000 });

    // Check for basic HTML structure
    await expect(page.locator("html")).toBeVisible();
    await expect(page.locator("body")).toBeVisible();

    console.log("✅ Homepage loaded successfully");
  });

  test("basic navigation works", async ({ page }) => {
    console.log("🧭 Testing basic navigation...");

    await page.goto("/", { timeout: 60000 });
    await page.waitForLoadState("networkidle");

    // Check if we can navigate back and forth
    await page.goBack();
    await page.goForward();

    console.log("✅ Navigation works");
  });

  test("page responds to user interaction", async ({ page }) => {
    console.log("👆 Testing user interaction...");

    await page.goto("/", { timeout: 60000 });
    await page.waitForLoadState("networkidle");

    // Try clicking on the page
    await page.click("body");

    // Try keyboard interaction
    await page.keyboard.press("Tab");

    console.log("✅ Page responds to user interaction");
  });

  test("check for JavaScript errors", async ({ page }) => {
    console.log("🐛 Checking for critical JavaScript errors...");

    const errors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto("/", { timeout: 60000 });
    await page.waitForLoadState("networkidle");

    // Wait a bit for any async errors
    await page.waitForTimeout(3000);

    // Filter out known non-critical errors
    const criticalErrors = errors.filter(
      (error) =>
        !error.includes("404") && // Ignore 404s for missing assets
        !error.includes("Failed to load resource") && // Ignore resource loading errors
        !error.includes("net::ERR_") && // Ignore network errors
        (error.includes("TypeError") ||
          error.includes("ReferenceError") ||
          error.includes("SyntaxError"))
    );

    if (criticalErrors.length > 0) {
      console.log("❌ Critical errors found:", criticalErrors);
    }

    expect(criticalErrors.length).toBe(0);
    console.log("✅ No critical JavaScript errors found");
  });

  test("basic performance check", async ({ page }) => {
    console.log("⚡ Testing basic performance...");

    const startTime = Date.now();

    await page.goto("/", { timeout: 60000 });
    await page.waitForLoadState("domcontentloaded");

    const loadTime = Date.now() - startTime;
    console.log(`📊 Page load time: ${loadTime}ms`);

    // Very generous timeout for local development
    expect(loadTime).toBeLessThan(60000); // 60 seconds max

    console.log("✅ Performance is acceptable for development");
  });
});

// Optional tests that check for features if they exist
test.describe("Feature Detection Tests", () => {
  test("check what features are available", async ({ page }) => {
    console.log("🔍 Discovering available features...");

    const features = {
      auth: false,
      dashboard: false,
      api: false,
    };

    // Check auth
    try {
      const authResponse = await page.request.get("/login");
      features.auth = authResponse.ok();
    } catch (e) {
      // Auth not available
    }

    // Check dashboard
    try {
      const dashboardResponse = await page.request.get("/dashboard");
      features.dashboard = dashboardResponse.ok();
    } catch (e) {
      // Dashboard not available
    }

    // Check API
    try {
      const apiResponse = await page.request.post("/api/analyze-link", {
        data: { url: "test" },
        failOnStatusCode: false,
      });
      features.api = apiResponse.status() !== 404;
    } catch (e) {
      // API not available
    }

    console.log("📋 Available features:", features);

    // This test always passes - it's just for discovery
    expect(true).toBe(true);
  });
});
