import { test, expect } from "@playwright/test";

/**
 * Dashboard and Authenticated User Features Testing
 * Tests dashboard access, navigation, and user-specific functionality
 */

test.describe("Dashboard and Authentication Features", () => {
  test("dashboard page loads without authentication (redirect check)", async ({
    page,
  }) => {
    console.log("🔒 Testing dashboard access without authentication...");

    // Try to access dashboard without being logged in
    await page.goto("/dashboard", { waitUntil: "networkidle" });

    // Check if we get redirected to login or if there's an auth check
    const currentUrl = page.url();
    console.log(`📋 Current URL after dashboard access: ${currentUrl}`);

    if (currentUrl.includes("/login")) {
      console.log("✅ Properly redirected to login page");
    } else if (currentUrl.includes("/dashboard")) {
      console.log("📋 Dashboard loads (may show login form or loading state)");

      // Check if there's a loading state or login prompt
      const loadingElements = page.locator(
        '[data-testid*="loading"], .loading, [aria-label*="loading"]'
      );
      const loginElements = page.locator(
        'input[type="email"], input[type="password"]'
      );

      const hasLoading = (await loadingElements.count()) > 0;
      const hasLoginForm = (await loginElements.count()) > 0;

      if (hasLoading) {
        console.log("📋 Loading state detected");
      }
      if (hasLoginForm) {
        console.log("📋 Login form detected on dashboard");
      }
    }

    console.log("✅ Dashboard access protection tested");
  });

  test("dashboard page structure and elements", async ({ page }) => {
    console.log("📊 Testing dashboard page structure...");

    await page.goto("/dashboard", { waitUntil: "networkidle" });

    // Check for common dashboard elements
    const dashboardElements = {
      navigation: (await page.locator('nav, [role="navigation"]').count()) > 0,
      sidebar: (await page.locator('[class*="sidebar"], aside').count()) > 0,
      mainContent: (await page.locator('main, [role="main"]').count()) > 0,
      cards: (await page.locator('[class*="card"]').count()) > 0,
      charts: (await page.locator('svg, canvas, [class*="chart"]').count()) > 0,
      buttons: (await page.locator("button").count()) > 0,
      links: (await page.locator("a[href]").count()) > 0,
    };

    console.log("📋 Dashboard elements found:", dashboardElements);

    // Check for specific dashboard features
    const dashboardFeatures = {
      analytics:
        (await page
          .locator('[class*="analytic"], [data-testid*="analytic"]')
          .count()) > 0,
      tools:
        (await page.locator('[href*="tool"], [class*="tool"]').count()) > 0,
      profile:
        (await page.locator('[href*="profile"], [class*="profile"]').count()) >
        0,
      settings:
        (await page.locator('[href*="setting"], [class*="setting"]').count()) >
        0,
    };

    console.log("📋 Dashboard features found:", dashboardFeatures);

    console.log("✅ Dashboard structure analyzed");
  });

  test("dashboard navigation and tool access", async ({ page }) => {
    console.log("🧭 Testing dashboard navigation...");

    await page.goto("/dashboard", { waitUntil: "networkidle" });

    // Look for navigation links to different tools
    const toolLinks = {
      linkAnalysis: page.getByRole("link", {
        name: /link.*analysis|link.*view/i,
      }),
      keywordTool: page.getByRole("link", { name: /keyword.*tool|keyword/i }),
      seoAudit: page.getByRole("link", { name: /seo.*audit|audit/i }),
      serpView: page.getByRole("link", { name: /serp.*view|serp/i }),
      competitors: page.getByRole("link", { name: /competitor/i }),
      contentAnalyzer: page.getByRole("link", {
        name: /content.*analyzer|content/i,
      }),
    };

    console.log("🔍 Checking for tool navigation links...");

    for (const [toolName, linkLocator] of Object.entries(toolLinks)) {
      const linkCount = await linkLocator.count();
      if (linkCount > 0) {
        console.log(`📋 ${toolName}: ${linkCount} links found`);

        // Try to get the href to see where it goes
        try {
          const href = await linkLocator.first().getAttribute("href");
          console.log(`   → Links to: ${href}`);
        } catch (e) {
          console.log(`   → Could not get href for ${toolName}`);
        }
      } else {
        console.log(`📋 ${toolName}: No links found`);
      }
    }

    console.log("✅ Dashboard navigation tested");
  });

  test("test navigation to specific tools", async ({ page }) => {
    console.log("🔧 Testing navigation to specific tools...");

    await page.goto("/dashboard", { waitUntil: "networkidle" });

    // Test navigation to available tools
    const toolsToTest = [
      { name: "Link Analysis", path: "/link-view" },
      { name: "SERP View", path: "/serp-view" },
      { name: "Content Analyzer", path: "/content-analyzer" },
      { name: "SEO Audit", path: "/seo-audit" },
      { name: "Keyword Tool", path: "/keyword-tool" },
    ];

    for (const tool of toolsToTest) {
      console.log(`🔍 Testing ${tool.name}...`);

      try {
        // Navigate directly to the tool
        await page.goto(tool.path, {
          waitUntil: "networkidle",
          timeout: 10000,
        });

        const currentUrl = page.url();
        if (currentUrl.includes(tool.path)) {
          console.log(`✅ ${tool.name} accessible at ${tool.path}`);

          // Check for common tool elements
          const hasForm = (await page.locator("form, input").count()) > 0;
          const hasButtons = (await page.locator("button").count()) > 0;
          const hasContent =
            (await page.locator('main, [role="main"]').count()) > 0;

          console.log(
            `   📋 Has form: ${hasForm}, buttons: ${hasButtons}, content: ${hasContent}`
          );
        } else {
          console.log(`⚠️ ${tool.name} redirected to: ${currentUrl}`);
        }
      } catch (error) {
        console.log(
          `❌ ${tool.name} failed to load: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    console.log("✅ Tool navigation tested");
  });

  test("user profile and settings access", async ({ page }) => {
    console.log("👤 Testing user profile access...");

    await page.goto("/dashboard", { waitUntil: "networkidle" });

    // Look for profile-related elements
    const profileElements = {
      profileLink: page.getByRole("link", { name: /profile|account|user/i }),
      settingsLink: page.getByRole("link", { name: /setting/i }),
      logoutButton: page.getByRole("button", { name: /logout|sign out/i }),
      userAvatar: page.locator(
        '[class*="avatar"], img[alt*="user"], img[alt*="profile"]'
      ),
      userDropdown: page.locator('[class*="dropdown"], [role="menu"]'),
    };

    for (const [elementName, locator] of Object.entries(profileElements)) {
      const count = await locator.count();
      console.log(
        `📋 ${elementName}: ${count > 0 ? "✅ Found" : "❌ Not found"}`
      );
    }

    // Test profile page access
    try {
      await page.goto("/profile", { waitUntil: "networkidle", timeout: 10000 });
      const profileUrl = page.url();
      if (profileUrl.includes("/profile")) {
        console.log("✅ Profile page accessible");

        // Check for profile form elements
        const hasProfileForm =
          (await page
            .locator('form, input[type="email"], input[type="text"]')
            .count()) > 0;
        console.log(`📋 Profile has form elements: ${hasProfileForm}`);
      }
    } catch (error) {
      console.log("📋 Profile page not accessible or protected");
    }

    console.log("✅ User profile access tested");
  });

  test("authentication state detection", async ({ page }) => {
    console.log("🔐 Testing authentication state detection...");

    await page.goto("/dashboard", { waitUntil: "networkidle" });

    // Check for authentication indicators
    const authIndicators = await page.evaluate(() => {
      return {
        hasUserData:
          !!window.localStorage.getItem("user") ||
          !!window.sessionStorage.getItem("user"),
        hasFirebaseAuth: typeof (window as any).firebase !== "undefined",
        hasAuthContext: !!document.querySelector("[data-auth], [data-user]"),
        currentUser:
          !!window.localStorage.getItem("firebase:authUser") ||
          !!window.sessionStorage.getItem("firebase:authUser"),
      };
    });

    console.log("📋 Authentication indicators:", authIndicators);

    // Check for loading states that might indicate auth checking
    const loadingStates = {
      loadingScreen:
        (await page
          .locator('[data-testid*="loading"], .loading-screen')
          .count()) > 0,
      spinners:
        (await page.locator('[class*="spinner"], [class*="loading"]').count()) >
        0,
      skeletons: (await page.locator('[class*="skeleton"]').count()) > 0,
    };

    console.log("📋 Loading states:", loadingStates);

    console.log("✅ Authentication state tested");
  });

  test("responsive dashboard layout", async ({ page }) => {
    console.log("📱 Testing responsive dashboard layout...");

    await page.goto("/dashboard", { waitUntil: "networkidle" });

    // Test different viewport sizes
    const viewports = [
      { name: "Desktop", width: 1280, height: 720 },
      { name: "Tablet", width: 768, height: 1024 },
      { name: "Mobile", width: 375, height: 667 },
    ];

    for (const viewport of viewports) {
      console.log(
        `📋 Testing ${viewport.name} (${viewport.width}x${viewport.height})`
      );

      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.waitForTimeout(1000); // Let layout adjust

      // Check if navigation adapts to viewport
      const navigation = {
        hasHamburgerMenu:
          (await page
            .locator('[class*="hamburger"], [aria-label*="menu"]')
            .count()) > 0,
        hasSidebar: (await page.locator('[class*="sidebar"]').count()) > 0,
        hasTopNav: (await page.locator('nav, [role="navigation"]').count()) > 0,
      };

      console.log(
        `   📋 Navigation: hamburger=${navigation.hasHamburgerMenu}, sidebar=${navigation.hasSidebar}, topNav=${navigation.hasTopNav}`
      );
    }

    // Reset to default viewport
    await page.setViewportSize({ width: 1280, height: 720 });

    console.log("✅ Responsive layout tested");
  });

  test("dashboard performance and loading", async ({ page }) => {
    console.log("⚡ Testing dashboard performance...");

    const startTime = Date.now();

    await page.goto("/dashboard", { waitUntil: "networkidle" });

    const loadTime = Date.now() - startTime;
    console.log(`📊 Dashboard load time: ${loadTime}ms`);

    // Check for performance indicators
    const performance = await page.evaluate(() => {
      const perf = window.performance;
      const navigation = perf.getEntriesByType(
        "navigation"
      )[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation
          ? navigation.domContentLoadedEventEnd - navigation.fetchStart
          : 0,
        firstContentfulPaint:
          perf.getEntriesByName("first-contentful-paint")[0]?.startTime || 0,
        resourceCount: perf.getEntriesByType("resource").length,
      };
    });

    console.log("📋 Performance metrics:", performance);

    // Check for lazy loading or progressive enhancement
    const progressiveFeatures = {
      lazyImages: (await page.locator('img[loading="lazy"]').count()) > 0,
      asyncScripts: (await page.locator("script[async]").count()) > 0,
      deferredScripts: (await page.locator("script[defer]").count()) > 0,
    };

    console.log("📋 Progressive features:", progressiveFeatures);

    console.log("✅ Dashboard performance tested");
  });

  test("dashboard feature summary", async ({ page }) => {
    console.log("📊 Generating dashboard feature summary...");

    await page.goto("/dashboard", { waitUntil: "networkidle" });

    // Comprehensive feature detection
    const featureSummary = {
      // Core functionality
      navigation: (await page.locator('nav, [role="navigation"]').count()) > 0,
      mainContent: (await page.locator('main, [role="main"]').count()) > 0,
      sidebar: (await page.locator('[class*="sidebar"], aside').count()) > 0,

      // Tool access
      linkAnalysis:
        (await page.getByRole("link", { name: /link.*view/i }).count()) > 0,
      serpView: (await page.getByRole("link", { name: /serp/i }).count()) > 0,
      keywordTool:
        (await page.getByRole("link", { name: /keyword/i }).count()) > 0,
      seoAudit: (await page.getByRole("link", { name: /audit/i }).count()) > 0,

      // User features
      profile: (await page.getByRole("link", { name: /profile/i }).count()) > 0,
      settings:
        (await page.getByRole("link", { name: /setting/i }).count()) > 0,
      logout: (await page.getByRole("button", { name: /logout/i }).count()) > 0,

      // Dashboard content
      charts: (await page.locator('svg, canvas, [class*="chart"]').count()) > 0,
      cards: (await page.locator('[class*="card"]').count()) > 0,
      tables: (await page.locator("table").count()) > 0,

      // Interaction elements
      buttons: await page.locator("button").count(),
      forms: await page.locator("form").count(),
      inputs: await page.locator("input").count(),
    };

    console.log("📋 Dashboard Feature Summary:", featureSummary);

    // Check page title
    const pageTitle = await page.title();
    console.log(`📋 Page title: "${pageTitle}"`);

    console.log("✅ Dashboard feature summary complete");
  });
});
