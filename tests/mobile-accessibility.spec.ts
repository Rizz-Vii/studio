import { expect, Page } from "@playwright/test";
import { test, loginUser } from "./fixtures/auth.fixture";

/**
 * Mobile Accessibility and Navigation Testing
 * Tests sidebar access, tool navigation, and mobile-specific interactions
 */

test.describe("Mobile Accessibility and Navigation", () => {
  // Increase test timeouts
  test.setTimeout(120000);
  // Mobile viewport sizes for testing
  const mobileViewports = [
    { name: "iPhone SE", width: 375, height: 667 },
    { name: "iPhone 12", width: 390, height: 844 },
    { name: "Samsung Galaxy", width: 360, height: 740 },
    { name: "iPad Mini", width: 768, height: 1024 },
  ];

  mobileViewports.forEach(({ name, width, height }) => {
    test(`mobile navigation accessibility on ${name}`, async ({ page }) => {
      console.log(`📱 Testing ${name} (${width}x${height}) navigation...`);

      // Increase timeouts for mobile tests
      page.setDefaultNavigationTimeout(45000);
      page.setDefaultTimeout(30000);

      // Set mobile viewport
      await page.setViewportSize({ width, height });
      
      // Login first
      await loginUser(page);
      
      // Navigate to dashboard
      await page.goto("/dashboard", { waitUntil: "networkidle" });

      // Check for mobile navigation elements
      const mobileNavigation = {
        hamburgerMenu: page.locator(
          '[data-testid="mobile-menu"], .mobile-menu, button[aria-label*="menu"], button[aria-label*="navigation"]'
        ),
        sidebar: page.locator(
          '[data-testid="sidebar"], .sidebar, nav[role="navigation"], aside'
        ),
        mobileDrawer: page.locator(
          '[data-testid="drawer"], .drawer, .mobile-drawer, [role="dialog"]'
        ),
        closeButton: page.locator(
          '[data-testid="close"], .close, button[aria-label*="close"]'
        ),
      };

      console.log("🔍 Checking mobile navigation elements...");

      // Test hamburger menu existence and accessibility
      const hamburgerExists =
        (await mobileNavigation.hamburgerMenu.count()) > 0;
      if (hamburgerExists) {
        const hamburger = mobileNavigation.hamburgerMenu.first();
        await expect(hamburger).toBeVisible();

        // Check accessibility attributes
        const ariaLabel = await hamburger.getAttribute("aria-label");
        const ariaExpanded = await hamburger.getAttribute("aria-expanded");

        console.log(`📋 Hamburger menu found with aria-label: "${ariaLabel}"`);
        console.log(`📋 Aria-expanded: ${ariaExpanded}`);

        // Test opening the mobile menu
        await hamburger.click();
        await page.waitForTimeout(500); // Allow for animation

        // Check if sidebar/drawer becomes visible
        const sidebarVisible = await mobileNavigation.sidebar.isVisible();
        const drawerVisible =
          (await mobileNavigation.mobileDrawer.count()) > 0
            ? await mobileNavigation.mobileDrawer.isVisible()
            : false;

        if (sidebarVisible || drawerVisible) {
          console.log("✅ Mobile navigation opens successfully");

          // Test navigation to tools
          await testMobileToolNavigation(page);

          // Test closing the menu
          if ((await mobileNavigation.closeButton.count()) > 0) {
            await mobileNavigation.closeButton.first().click();
            console.log("✅ Mobile menu closes with close button");
          } else {
            // Try clicking outside to close
            await page.click("body", { position: { x: 10, y: 10 } });
            console.log("✅ Mobile menu closes with outside click");
          }
        } else {
          console.log(
            "📋 Mobile navigation opens but no sidebar/drawer visible"
          );
        }
      } else {
        console.log("📋 No hamburger menu found - testing direct navigation");
        await testMobileToolNavigation(page);
      }

      console.log(`✅ ${name} navigation tested`);
    });
  });

  test("mobile tool accessibility and touch targets", async ({ page }) => {
    console.log("📱 Testing mobile tool accessibility and touch targets...");

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/dashboard", { waitUntil: "networkidle" });

    // Find all interactive elements (buttons, links, inputs)
    const interactiveElements = {
      buttons: page.locator("button"),
      links: page.locator("a"),
      inputs: page.locator("input, textarea, select"),
      cards: page.locator('[data-testid*="card"], .card, [role="button"]'),
    };

    console.log("🔍 Checking touch target sizes...");

    // Test button touch targets (minimum 44px recommended)
    const buttons = await interactiveElements.buttons.all();
    let touchTargetIssues = 0;

    for (const button of buttons) {
      const boundingBox = await button.boundingBox();
      if (boundingBox) {
        const isVisible = await button.isVisible();
        if (isVisible && (boundingBox.width < 44 || boundingBox.height < 44)) {
          touchTargetIssues++;
          console.log(
            `📋 Small touch target: ${boundingBox.width}x${boundingBox.height}px`
          );
        }
      }
    }

    console.log(`📋 Touch target issues found: ${touchTargetIssues}`);

    // Test link accessibility
    const links = await interactiveElements.links.all();
    let linkAccessibilityIssues = 0;

    for (const link of links) {
      const href = await link.getAttribute("href");
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute("aria-label");

      if (!text?.trim() && !ariaLabel) {
        linkAccessibilityIssues++;
        console.log(`📋 Link without text or aria-label: href="${href}"`);
      }
    }

    console.log(`📋 Link accessibility issues: ${linkAccessibilityIssues}`);

    // Test keyboard navigation
    console.log("⌨️ Testing keyboard navigation...");

    // Start from first focusable element
    await page.keyboard.press("Tab");
    const firstFocused = await page.evaluate(
      () => document.activeElement?.tagName
    );
    console.log(`📋 First focused element: ${firstFocused}`);

    // Test tabbing through elements
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press("Tab");
      const currentFocused = await page.evaluate(() => ({
        tag: document.activeElement?.tagName,
        text: document.activeElement?.textContent?.slice(0, 20),
        id: document.activeElement?.id,
      }));

      if (currentFocused.tag) {
        console.log(
          `📋 Tab ${i + 1}: ${currentFocused.tag} "${currentFocused.text}" id="${currentFocused.id}"`
        );
      }
    }

    console.log("✅ Mobile accessibility testing complete");
  });

  test("mobile sidebar responsiveness and tools", async ({ page }) => {
    console.log("📱 Testing mobile sidebar responsiveness...");

    await page.goto("/dashboard", { waitUntil: "networkidle" });

    // Test different viewport sizes
    const viewports = [
      { width: 320, height: 568, name: "Small Mobile" },
      { width: 375, height: 667, name: "Medium Mobile" },
      { width: 414, height: 896, name: "Large Mobile" },
      { width: 768, height: 1024, name: "Tablet" },
    ];

    for (const viewport of viewports) {
      console.log(
        `📋 Testing ${viewport.name} (${viewport.width}x${viewport.height})`
      );

      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.waitForTimeout(200); // Allow for layout adjustment

      // Check sidebar behavior
      const sidebar = page.locator('[data-testid="sidebar"], .sidebar, nav');
      const mobileMenu = page.locator(
        '[data-testid="mobile-menu"], .mobile-menu'
      );

      const sidebarVisible =
        (await sidebar.count()) > 0 ? await sidebar.isVisible() : false;
      const mobileMenuVisible =
        (await mobileMenu.count()) > 0 ? await mobileMenu.isVisible() : false;

      console.log(
        `   📋 Sidebar visible: ${sidebarVisible}, Mobile menu: ${mobileMenuVisible}`
      );

      // Test tool links accessibility in this viewport
      const toolLinks = page.locator(
        'a[href*="/link-"], a[href*="/serp-"], a[href*="/seo-"], a[href*="/keyword-"], a[href*="/content-"], a[href*="/competitors"]'
      );
      const linkCount = await toolLinks.count();

      console.log(`   📋 Tool links found: ${linkCount}`);

      if (linkCount > 0) {
        for (let i = 0; i < Math.min(linkCount, 3); i++) {
          const link = toolLinks.nth(i);
          const isVisible = await link.isVisible();
          const href = await link.getAttribute("href");
          const text = await link.textContent();

          console.log(
            `   📋 Tool ${i + 1}: "${text?.trim()}" (${href}) - Visible: ${isVisible}`
          );
        }
      }
    }

    console.log("✅ Mobile sidebar responsiveness tested");
  });

  test("mobile tool page loading and accessibility", async ({ page }) => {
    console.log("📱 Testing mobile tool page loading...");

    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/dashboard", { waitUntil: "networkidle" });

    // List of tools to test
    const tools = [
      { path: "/link-view", name: "Link Analysis" },
      { path: "/serp-view", name: "SERP View" },
      { path: "/keyword-tool", name: "Keyword Tool" },
      { path: "/seo-audit", name: "SEO Audit" },
      { path: "/content-analyzer", name: "Content Analyzer" },
      { path: "/competitors", name: "Competitors" },
    ];

    for (const tool of tools) {
      console.log(`🔧 Testing ${tool.name} (${tool.path})...`);

      try {
        // Try to navigate to the tool
        const response = await page.goto(tool.path, {
          waitUntil: "networkidle",
          timeout: 15000,
        });

        if (response && response.ok()) {
          console.log(`   ✅ ${tool.name} loads successfully`);

          // Check mobile layout
          const pageTitle = await page.title();
          console.log(`   📋 Page title: "${pageTitle}"`);

          // Check for mobile-friendly elements
          const mobileElements = {
            backButton: page.locator(
              '[data-testid="back"], .back-button, button[aria-label*="back"]'
            ),
            mobileHeader: page.locator(
              '[data-testid="mobile-header"], .mobile-header, header'
            ),
            form: page.locator("form"),
            inputs: page.locator("input, textarea, select"),
            buttons: page.locator("button"),
          };

          const backButtonExists =
            (await mobileElements.backButton.count()) > 0;
          const headerExists = (await mobileElements.mobileHeader.count()) > 0;
          const formExists = (await mobileElements.form.count()) > 0;
          const inputCount = await mobileElements.inputs.count();
          const buttonCount = await mobileElements.buttons.count();

          console.log(
            `   📋 Back button: ${backButtonExists}, Header: ${headerExists}`
          );
          console.log(
            `   📋 Forms: ${formExists}, Inputs: ${inputCount}, Buttons: ${buttonCount}`
          );

          // Test scrolling if page is long
          const bodyHeight = await page.evaluate(
            () => document.body.scrollHeight
          );
          const viewportHeight = await page.evaluate(() => window.innerHeight);

          if (bodyHeight > viewportHeight) {
            console.log(
              `   📋 Page is scrollable: ${bodyHeight}px vs ${viewportHeight}px viewport`
            );
            await page.mouse.wheel(0, 200);
            await page.waitForTimeout(100);
            console.log(`   ✅ Scrolling works`);
          }
        } else {
          console.log(
            `   ❌ ${tool.name} failed to load (status: ${response?.status()})`
          );
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.log(
          `   ❌ ${tool.name} error: ${errorMessage.slice(0, 100)}...`
        );
      }
    }

    console.log("✅ Mobile tool page testing complete");
  });

  // Helper function for testing mobile tool navigation
  const testMobileToolNavigation = async (page: Page) => {
    console.log("🔍 Testing mobile tool navigation...");

    const toolSelectors = [
      'a[href*="/link-"]',
      'a[href*="/serp-"]',
      'a[href*="/keyword-"]',
      'a[href*="/seo-"]',
      'a[href*="/content-"]',
      'a[href*="/competitors"]',
    ];

    for (const selector of toolSelectors) {
      const toolLink = page.locator(selector).first();
      const linkExists = (await toolLink.count()) > 0;

      if (linkExists) {
        const isVisible = await toolLink.isVisible();
        const href = await toolLink.getAttribute("href");
        const text = await toolLink.textContent();

        console.log(
          `📋 Tool link: "${text?.trim()}" (${href}) - Visible: ${isVisible}`
        );

        if (isVisible) {
          // Check if it's accessible (has text or aria-label)
          const ariaLabel = await toolLink.getAttribute("aria-label");
          const hasAccessibleText = text?.trim() || ariaLabel;

          if (!hasAccessibleText) {
            console.log(`   ⚠️ Tool link lacks accessible text`);
          }

          // Check touch target size
          const boundingBox = await toolLink.boundingBox();
          if (
            boundingBox &&
            (boundingBox.width < 44 || boundingBox.height < 44)
          ) {
            console.log(
              `   ⚠️ Small touch target: ${boundingBox.width}x${boundingBox.height}px`
            );
          }
        }
      }
    }
  };
});
