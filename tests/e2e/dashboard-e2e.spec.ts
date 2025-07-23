import { test, expect } from "@playwright/test";

// End-to-End Dashboard Tests
test.describe("Dashboard E2E Tests", () => {
  // Define test users for different tiers
  const testUsers = {
    free: {
      email: "test-free@example.com",
      password: "testPassword123",
    },
    starter: {
      email: "test-starter@example.com",
      password: "testPassword123",
    },
    agency: {
      email: "test-agency@example.com",
      password: "testPassword123",
    },
    enterprise: {
      email: "test-enterprise@example.com",
      password: "testPassword123",
    },
  };

  // Setup before each test - login and go to dashboard
  test.beforeEach(async ({ page }, testInfo) => {
    // Determine which user to use based on test title
    let user = testUsers.agency; // Default to agency tier

    if (testInfo.title.includes("Free tier")) {
      user = testUsers.free;
    } else if (testInfo.title.includes("Starter tier")) {
      user = testUsers.starter;
    } else if (testInfo.title.includes("Enterprise tier")) {
      user = testUsers.enterprise;
    }

    // Login with the selected user
    await page.goto("/login");
    await page.fill('[data-testid="email-input"]', user.email);
    await page.fill('[data-testid="password-input"]', user.password);
    await page.click('[data-testid="login-button"]');

    // Wait for dashboard to load
    await page.waitForURL("**/dashboard");

    // Ensure dashboard is fully loaded
    await page.waitForSelector('[data-testid="dashboard-content"]');
  });

  // Test dashboard overview (Agency tier)
  test("Dashboard overview loads correctly", async ({ page }) => {
    // Check main components are present
    await expect(page.locator("h1")).toContainText("Dashboard");

    // Check navigation
    await expect(page.locator('[data-testid="main-navigation"]')).toBeVisible();

    // Check dashboard widgets are present
    await expect(
      page.locator('[data-testid="dashboard-summary"]')
    ).toBeVisible();
    await expect(page.locator('[data-testid="recent-activity"]')).toBeVisible();

    // Check quick action buttons
    await expect(page.locator("text=New Analysis")).toBeVisible();
    await expect(page.locator("text=Reports")).toBeVisible();

    // Verify user info is displayed correctly
    await expect(page.locator('[data-testid="user-info"]')).toContainText(
      "Agency"
    );
  });

  // Test navigation between dashboard sections
  test("Dashboard navigation works correctly", async ({ page }) => {
    // Go to Keywords section
    await page.click("text=Keywords");
    await page.waitForURL("**/keyword-tool");
    await expect(page.locator("h1")).toContainText("Keyword");

    // Go to Content section
    await page.click("text=Content");
    await page.waitForURL("**/content-analyzer");
    await expect(page.locator("h1")).toContainText("Content");

    // Go to NeuroSEO section
    await page.click("text=NeuroSEO");
    await page.waitForURL("**/neuroseo");
    await expect(page.locator("h1")).toContainText("NeuroSEO");

    // Return to Dashboard
    await page.click("text=Dashboard");
    await page.waitForURL("**/dashboard");
    await expect(page.locator("h1")).toContainText("Dashboard");
  });

  // Test dashboard functionality with card interactions
  test("Dashboard card interactions work correctly", async ({ page }) => {
    // Find dashboard cards
    const cards = await page.locator('[data-testid="dashboard-card"]').all();
    expect(cards.length).toBeGreaterThan(0);

    // Click on first card
    await cards[0].click();

    // Wait for card details or linked page to load
    await page.waitForLoadState("networkidle");

    // Check if we navigated to a new page or if a detail view opened
    const currentUrl = page.url();
    const detailViewVisible = await page.isVisible(
      '[data-testid="card-details"]'
    );

    if (currentUrl.includes("/dashboard")) {
      // If we're still on dashboard, a detail view should be visible
      expect(detailViewVisible).toBe(true);

      // Close detail view if there's a close button
      if (await page.isVisible('[data-testid="close-details"]')) {
        await page.click('[data-testid="close-details"]');
        await expect(
          page.locator('[data-testid="card-details"]')
        ).not.toBeVisible();
      }
    } else {
      // If we navigated away, make sure we're on a valid page
      expect(currentUrl).not.toContain("undefined");
      expect(currentUrl).not.toContain("null");

      // Go back to dashboard
      await page.goto("/dashboard");
      await page.waitForSelector('[data-testid="dashboard-content"]');
    }
  });

  // Test dashboard data refresh
  test("Dashboard data refresh works correctly", async ({ page }) => {
    // Check if refresh button exists
    const hasRefreshButton = await page.isVisible(
      '[data-testid="refresh-dashboard"]'
    );

    if (hasRefreshButton) {
      // Get current timestamps or data before refresh
      const beforeRefresh = await page
        .locator('[data-testid="last-updated"]')
        .textContent();

      // Click refresh
      await page.click('[data-testid="refresh-dashboard"]');

      // Wait for refresh to complete
      await page.waitForLoadState("networkidle");

      // Get timestamps or data after refresh
      const afterRefresh = await page
        .locator('[data-testid="last-updated"]')
        .textContent();

      // Check if data was updated (timestamps should be different)
      expect(beforeRefresh).not.toBe(afterRefresh);
    } else {
      // Test alternative refresh method if button doesn't exist
      // For example, pull-to-refresh or auto-refresh
      console.log("No refresh button found, skipping refresh test");
    }
  });

  // Test dashboard filters
  test("Dashboard filters work correctly", async ({ page }) => {
    // Check if filters exist
    const hasFilters = await page.isVisible(
      '[data-testid="dashboard-filters"]'
    );

    if (hasFilters) {
      // Get initial data count or state
      const initialState = await page
        .locator('[data-testid="dashboard-summary"]')
        .textContent();

      // Apply a filter
      await page.click('[data-testid="dashboard-filters"]');
      await page.click('[data-testid="filter-option"]:first-child');

      // Wait for filters to apply
      await page.waitForLoadState("networkidle");

      // Get filtered data state
      const filteredState = await page
        .locator('[data-testid="dashboard-summary"]')
        .textContent();

      // Check if data state changed
      expect(initialState).not.toBe(filteredState);

      // Reset filters if reset button exists
      if (await page.isVisible('[data-testid="reset-filters"]')) {
        await page.click('[data-testid="reset-filters"]');
        await page.waitForLoadState("networkidle");

        // Verify data returns to initial state
        const resetState = await page
          .locator('[data-testid="dashboard-summary"]')
          .textContent();
        expect(resetState).toBe(initialState);
      }
    } else {
      console.log("No dashboard filters found, skipping filter test");
    }
  });

  // Test dashboard customization (if available)
  test("Dashboard customization works correctly", async ({ page }) => {
    // Check if customization option exists
    const hasCustomize = await page.isVisible(
      '[data-testid="customize-dashboard"]'
    );

    if (hasCustomize) {
      // Click customize button
      await page.click('[data-testid="customize-dashboard"]');

      // Check if customization menu appears
      await expect(
        page.locator('[data-testid="customization-menu"]')
      ).toBeVisible();

      // Try to rearrange widgets if drag handles exist
      const hasDragHandles = await page.isVisible(
        '[data-testid="drag-handle"]'
      );

      if (hasDragHandles) {
        const dragHandle = page.locator('[data-testid="drag-handle"]').first();
        const targetArea = page.locator('[data-testid="drop-area"]').last();

        // Get widget order before drag
        const widgetsBefore = await page
          .locator('[data-testid="dashboard-widget"]')
          .all();
        const widgetCountBefore = widgetsBefore.length;

        // Perform drag and drop
        await dragHandle.dragTo(targetArea);

        // Get widget order after drag
        const widgetsAfter = await page
          .locator('[data-testid="dashboard-widget"]')
          .all();
        const widgetCountAfter = widgetsAfter.length;

        // Widget count should remain the same
        expect(widgetCountAfter).toBe(widgetCountBefore);
      }

      // Toggle widget visibility if option exists
      const hasToggleWidgets = await page.isVisible(
        '[data-testid="toggle-widget"]'
      );

      if (hasToggleWidgets) {
        // Get widget count before toggle
        const widgetCountBefore = await page
          .locator('[data-testid="dashboard-widget"]')
          .count();

        // Toggle first widget off
        await page.click('[data-testid="toggle-widget"]');

        // Get widget count after toggle
        const widgetCountAfter = await page
          .locator('[data-testid="dashboard-widget"]')
          .count();

        // Widget count should change
        expect(widgetCountAfter).toBe(widgetCountBefore - 1);

        // Toggle widget back on
        await page.click('[data-testid="toggle-widget"]');

        // Widget count should be back to original
        const widgetCountReset = await page
          .locator('[data-testid="dashboard-widget"]')
          .count();
        expect(widgetCountReset).toBe(widgetCountBefore);
      }

      // Save customization if save button exists
      if (await page.isVisible('[data-testid="save-customization"]')) {
        await page.click('[data-testid="save-customization"]');
        await page.waitForLoadState("networkidle");

        // Verify success message
        await expect(
          page.locator("text=Dashboard customization saved")
        ).toBeVisible();
      }

      // Close customization menu if it's still open
      if (await page.isVisible('[data-testid="close-customization"]')) {
        await page.click('[data-testid="close-customization"]');
      }
    } else {
      console.log(
        "No dashboard customization found, skipping customization test"
      );
    }
  });

  // Test dashboard notifications
  test("Dashboard notifications work correctly", async ({ page }) => {
    // Check if notification bell exists
    const hasNotifications = await page.isVisible(
      '[data-testid="notifications-icon"]'
    );

    if (hasNotifications) {
      // Check initial notification state (badge, count, etc.)
      const initialBadge = await page.isVisible(
        '[data-testid="notification-badge"]'
      );

      // Click notification bell
      await page.click('[data-testid="notifications-icon"]');

      // Check if notification panel opens
      await expect(
        page.locator('[data-testid="notifications-panel"]')
      ).toBeVisible();

      // Check if notifications are listed
      const notificationsList = page.locator(
        '[data-testid="notification-item"]'
      );
      const notificationsCount = await notificationsList.count();

      // Click on a notification if any exist
      if (notificationsCount > 0) {
        await notificationsList.first().click();

        // Wait for any navigation or detail view to appear
        await page.waitForLoadState("networkidle");

        // Check if we navigated somewhere or a detail view opened
        const detailViewVisible = await page.isVisible(
          '[data-testid="notification-details"]'
        );

        if (detailViewVisible) {
          // Close detail view if there's a close button
          if (
            await page.isVisible('[data-testid="close-notification-details"]')
          ) {
            await page.click('[data-testid="close-notification-details"]');
          }
        } else {
          // If we navigated away, go back to dashboard
          await page.goto("/dashboard");
          await page.waitForSelector('[data-testid="dashboard-content"]');
        }
      }

      // Test mark-all-read functionality if it exists
      if (await page.isVisible('[data-testid="mark-all-read"]')) {
        await page.click('[data-testid="mark-all-read"]');

        // Verify badge disappeared
        await expect(
          page.locator('[data-testid="notification-badge"]')
        ).not.toBeVisible();
      }

      // Close notification panel if it's still open
      if (await page.isVisible('[data-testid="close-notifications"]')) {
        await page.click('[data-testid="close-notifications"]');
      } else if (await page.isVisible('[data-testid="notifications-panel"]')) {
        // Click outside to close
        await page.click("h1");
      }
    } else {
      console.log("No notifications icon found, skipping notifications test");
    }
  });

  // Test dashboard charts and graphs
  test("Dashboard charts and graphs work correctly", async ({ page }) => {
    // Check if charts exist
    const hasCharts = await page.isVisible('[data-testid="dashboard-chart"]');

    if (hasCharts) {
      // Get all charts
      const charts = await page
        .locator('[data-testid="dashboard-chart"]')
        .all();

      for (let i = 0; i < charts.length; i++) {
        // Check if chart is visible and rendered
        await expect(charts[i]).toBeVisible();

        // Check for chart controls like time period selectors
        const chartControls = page.locator(
          `[data-testid="chart-controls-${i}"]`
        );

        if (await chartControls.isVisible()) {
          // Change time period if control exists
          await chartControls.click();
          await page.click('[data-testid="time-period-option"]:nth-child(2)');

          // Wait for chart to update
          await page.waitForLoadState("networkidle");

          // Check if chart is still visible after update
          await expect(charts[i]).toBeVisible();
        }

        // Check for data point interactions if chart supports it
        const dataPoints = page.locator(
          `[data-testid="chart-${i}"] [data-testid="data-point"]`
        );

        if ((await dataPoints.count()) > 0) {
          // Hover over a data point
          await dataPoints.first().hover();

          // Check if tooltip appears
          await expect(
            page.locator('[data-testid="chart-tooltip"]')
          ).toBeVisible();
        }
      }
    } else {
      console.log("No charts found, skipping chart test");
    }
  });

  // Test dashboard export functionality
  test("Dashboard export works correctly", async ({ page }) => {
    // Check if export button exists
    const hasExport = await page.isVisible('[data-testid="export-dashboard"]');

    if (hasExport) {
      // Set up download handler
      const downloadPromise = page.waitForEvent("download");

      // Click export button
      await page.click('[data-testid="export-dashboard"]');

      // Check if export format options appear
      if (await page.isVisible('[data-testid="export-options"]')) {
        // Choose PDF export
        await page.click('[data-testid="export-pdf"]');
      }

      // Wait for download to start
      const download = await downloadPromise;

      // Verify download started
      expect(download.suggestedFilename()).toContain("dashboard");

      // Wait for download to complete
      const path = await download.path();
      expect(path).not.toBeNull();

      // Check for success message
      await expect(page.locator("text=Export complete")).toBeVisible();
    } else {
      console.log("No export button found, skipping export test");
    }
  });

  // Test dashboard search functionality
  test("Dashboard search works correctly", async ({ page }) => {
    // Check if search bar exists
    const hasSearch = await page.isVisible('[data-testid="dashboard-search"]');

    if (hasSearch) {
      // Enter search term
      await page.fill('[data-testid="dashboard-search"]', "SEO");
      await page.press('[data-testid="dashboard-search"]', "Enter");

      // Wait for search results
      await page.waitForSelector('[data-testid="search-results"]');

      // Check if results are displayed
      const resultsCount = await page
        .locator('[data-testid="search-result-item"]')
        .count();
      expect(resultsCount).toBeGreaterThan(0);

      // Click on first result
      await page.click('[data-testid="search-result-item"]:first-child');

      // Wait for navigation or detail view
      await page.waitForLoadState("networkidle");

      // Check if search query is reflected in the content
      const pageContent = await page.textContent("body");
      expect(pageContent?.toLowerCase()).toContain("seo");

      // Go back to dashboard
      await page.goto("/dashboard");

      // Clear search if still active
      if (await page.isVisible('[data-testid="clear-search"]')) {
        await page.click('[data-testid="clear-search"]');

        // Verify search results are cleared
        await expect(
          page.locator('[data-testid="search-results"]')
        ).not.toBeVisible();
      }
    } else {
      console.log("No search bar found, skipping search test");
    }
  });

  // Test tier-specific dashboard features
  test("Free tier dashboard shows appropriate features", async ({ page }) => {
    // Log out first
    await page.goto("/account");
    await page.click('[data-testid="logout-button"]');

    // Log in as free tier user
    await page.goto("/login");
    await page.fill('[data-testid="email-input"]', testUsers.free.email);
    await page.fill('[data-testid="password-input"]', testUsers.free.password);
    await page.click('[data-testid="login-button"]');

    // Wait for dashboard to load
    await page.waitForURL("**/dashboard");
    await page.waitForSelector('[data-testid="dashboard-content"]');

    // Check tier-specific UI elements
    await expect(page.locator('[data-testid="user-tier"]')).toContainText(
      "Free"
    );

    // Check for upgrade prompts
    await expect(page.locator('[data-testid="upgrade-prompt"]')).toBeVisible();

    // Check for limited feature indicators
    const limitedFeatures = await page
      .locator('[data-testid="limited-feature"]')
      .count();
    expect(limitedFeatures).toBeGreaterThan(0);

    // Check navigation for limited features
    await page.click("text=NeuroSEO");

    // Should see limited access message
    await expect(
      page.locator('[data-testid="limited-access-message"]')
    ).toBeVisible();
  });

  test("Enterprise tier dashboard shows all features", async ({ page }) => {
    // Log out first
    await page.goto("/account");
    await page.click('[data-testid="logout-button"]');

    // Log in as enterprise tier user
    await page.goto("/login");
    await page.fill('[data-testid="email-input"]', testUsers.enterprise.email);
    await page.fill(
      '[data-testid="password-input"]',
      testUsers.enterprise.password
    );
    await page.click('[data-testid="login-button"]');

    // Wait for dashboard to load
    await page.waitForURL("**/dashboard");
    await page.waitForSelector('[data-testid="dashboard-content"]');

    // Check tier-specific UI elements
    await expect(page.locator('[data-testid="user-tier"]')).toContainText(
      "Enterprise"
    );

    // Check for enterprise-only features
    await expect(
      page.locator('[data-testid="enterprise-feature"]')
    ).toBeVisible();

    // Check navigation for full access
    await page.click("text=NeuroSEO");

    // Should not see limited access message
    await expect(
      page.locator('[data-testid="limited-access-message"]')
    ).not.toBeVisible();

    // Check for team management features
    await page.goto("/team-management");
    await expect(page.locator("h1")).toContainText("Team Management");
  });

  // Test dashboard responsiveness
  test("Dashboard is responsive on different screen sizes", async ({
    page,
  }) => {
    // Test on different viewport sizes
    const viewports = [
      { width: 1920, height: 1080, name: "Large Desktop" },
      { width: 1366, height: 768, name: "Desktop" },
      { width: 768, height: 1024, name: "Tablet" },
      { width: 390, height: 844, name: "Mobile" },
    ];

    for (const viewport of viewports) {
      console.log(
        `Testing on ${viewport.name}: ${viewport.width}x${viewport.height}`
      );

      // Set viewport size
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });

      // Reload dashboard
      await page.goto("/dashboard");
      await page.waitForSelector('[data-testid="dashboard-content"]');

      // Check if main content is visible
      await expect(
        page.locator('[data-testid="dashboard-content"]')
      ).toBeVisible();

      // Check for responsive navigation
      if (viewport.width < 768) {
        // Mobile navigation should be collapsed
        const mainNav = await page.isVisible(
          '[data-testid="main-navigation"] a'
        );

        if (!mainNav) {
          // Check for hamburger menu
          await expect(
            page.locator('[data-testid="mobile-menu-button"]')
          ).toBeVisible();

          // Open mobile menu
          await page.click('[data-testid="mobile-menu-button"]');

          // Check if navigation appears
          await expect(
            page.locator('[data-testid="mobile-navigation"]')
          ).toBeVisible();

          // Close mobile menu
          if (await page.isVisible('[data-testid="close-mobile-menu"]')) {
            await page.click('[data-testid="close-mobile-menu"]');
          } else {
            // Click outside to close
            await page.click("h1");
          }
        }
      } else {
        // Desktop navigation should be expanded
        await expect(
          page.locator('[data-testid="main-navigation"] a')
        ).toBeVisible();
      }

      // Check layout integrity
      const hasOverflow = await page.evaluate(() => {
        const body = document.body;
        return body.scrollWidth > window.innerWidth;
      });

      // No horizontal overflow should occur in responsive layout
      expect(hasOverflow).toBe(false);
    }
  });

  // Test dashboard loading states
  test("Dashboard displays proper loading states", async ({ page }) => {
    // Force slow network to see loading states
    await page.route("**/*", async (route) => {
      // Delay all requests by 1 second
      await new Promise((r) => setTimeout(r, 1000));
      await route.continue();
    });

    // Navigate to dashboard
    await page.goto("/dashboard");

    // Check for loading indicators
    await expect(
      page.locator('[data-testid="loading-indicator"]')
    ).toBeVisible();

    // Wait for content to load
    await page.waitForSelector('[data-testid="dashboard-content"]', {
      state: "visible",
    });

    // Loading indicator should disappear
    await expect(
      page.locator('[data-testid="loading-indicator"]')
    ).not.toBeVisible();

    // Remove the delay
    await page.unroute("**/*");
  });

  // Test dashboard error handling
  test("Dashboard handles errors gracefully", async ({ page }) => {
    // Mock API error
    await page.route("/api/dashboard/summary", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Internal server error" }),
      });
    });

    // Navigate to dashboard
    await page.goto("/dashboard");

    // Check for error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();

    // Test retry button if it exists
    if (await page.isVisible('[data-testid="retry-button"]')) {
      // Remove the error mock before retrying
      await page.unroute("/api/dashboard/summary");

      // Click retry
      await page.click('[data-testid="retry-button"]');

      // Wait for content to load successfully
      await page.waitForSelector('[data-testid="dashboard-content"]', {
        state: "visible",
      });

      // Error message should disappear
      await expect(
        page.locator('[data-testid="error-message"]')
      ).not.toBeVisible();
    }
  });
});
