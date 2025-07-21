import { test, expect } from "@playwright/test";

test.describe("Mobile Navigation - Component Test", () => {
  test("mobile nav component functionality", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });

    console.log("🧪 Testing mobile nav component on test page...");

    // Navigate to test page
    await page.goto("http://localhost:3000/mobile-nav-test", {
      waitUntil: "domcontentloaded",
    });

    // Wait for React hydration
    await page.waitForTimeout(2000);

    console.log("📋 Checking for hamburger menu...");

    // Check for hamburger menu
    const hamburger = page.locator('[data-testid="mobile-menu"]');
    const hamburgerExists = await hamburger.count();
    const hamburgerVisible =
      hamburgerExists > 0 ? await hamburger.isVisible() : false;

    console.log(
      `📋 Hamburger menu: exists=${hamburgerExists > 0}, visible=${hamburgerVisible}`
    );

    if (hamburgerExists > 0 && hamburgerVisible) {
      console.log("🎯 SUCCESS: Hamburger menu found!");

      // Test hamburger button attributes
      const ariaLabel = await hamburger.getAttribute("aria-label");
      const ariaExpanded = await hamburger.getAttribute("aria-expanded");
      console.log(
        `📋 Aria-label: "${ariaLabel}", Aria-expanded: ${ariaExpanded}`
      );

      // Click hamburger to open drawer
      console.log("📋 Clicking hamburger menu...");
      await hamburger.click();
      await page.waitForTimeout(800); // Wait for animation

      // Check for drawer
      const drawer = page.locator('[data-testid="mobile-drawer"]');
      const drawerExists = await drawer.count();
      const drawerVisible = drawerExists > 0 ? await drawer.isVisible() : false;

      console.log(
        `📋 Drawer: exists=${drawerExists > 0}, visible=${drawerVisible}`
      );

      if (drawerExists > 0 && drawerVisible) {
        console.log("🎯 SUCCESS: Drawer opens correctly!");

        // Test navigation items
        const navItems = await drawer
          .locator('[data-testid^="nav-item-"]')
          .all();
        console.log(`📋 Navigation items found: ${navItems.length}`);

        for (let i = 0; i < Math.min(navItems.length, 5); i++) {
          const item = navItems[i];
          const text = await item.textContent();
          const testId = await item.getAttribute("data-testid");
          const isVisible = await item.isVisible();

          console.log(
            `📋 Nav item ${i + 1}: "${text?.trim()}" (${testId}) visible=${isVisible}`
          );
        }

        // Test close button
        const closeButton = drawer.locator('[data-testid="mobile-close"]');
        const closeExists = await closeButton.count();

        if (closeExists > 0) {
          console.log("📋 Testing close button...");
          await closeButton.click();
          await page.waitForTimeout(500);

          const drawerStillVisible = await drawer.isVisible();
          console.log(`📋 Drawer closed: ${!drawerStillVisible}`);

          if (!drawerStillVisible) {
            console.log("🎯 SUCCESS: Close button works!");
          }
        }

        // Test overlay click to close
        if (await drawer.isVisible()) {
          console.log("📋 Testing overlay click to close...");
          // Re-open if closed
          await hamburger.click();
          await page.waitForTimeout(500);

          // Click overlay
          await page.click("body", { position: { x: 10, y: 10 } });
          await page.waitForTimeout(500);

          const drawerClosed = !(await drawer.isVisible());
          console.log(`📋 Overlay click closes drawer: ${drawerClosed}`);
        }
      } else {
        console.log("❌ FAIL: Drawer does not open");
      }
    } else {
      console.log("❌ FAIL: Hamburger menu not found or not visible");
    }

    // Check touch target sizes
    console.log("📋 Checking touch target sizes...");
    const buttons = await page.locator("button").all();
    let touchTargetIssues = 0;

    for (const button of buttons) {
      const boundingBox = await button.boundingBox();
      if (boundingBox) {
        const isVisible = await button.isVisible();
        if (isVisible && (boundingBox.width < 44 || boundingBox.height < 44)) {
          touchTargetIssues++;
          const testId = await button.getAttribute("data-testid");
          console.log(
            `📋 Small touch target: ${boundingBox.width}x${boundingBox.height}px (${testId})`
          );
        }
      }
    }

    console.log(`📋 Touch target issues: ${touchTargetIssues}`);

    // Take screenshot for debugging
    await page.screenshot({
      path: "debug-mobile-nav-component.png",
      fullPage: true,
    });

    console.log("✅ Mobile nav component test complete");
  });

  test("mobile nav responsive behavior", async ({ page }) => {
    console.log("📱 Testing responsive behavior...");

    await page.goto("http://localhost:3000/mobile-nav-test", {
      waitUntil: "domcontentloaded",
    });

    // Test different viewport sizes
    const viewports = [
      { width: 320, height: 568, name: "Small Mobile", shouldShow: true },
      { width: 390, height: 844, name: "Medium Mobile", shouldShow: true },
      { width: 768, height: 1024, name: "Tablet", shouldShow: false },
      { width: 1024, height: 768, name: "Desktop", shouldShow: false },
    ];

    for (const viewport of viewports) {
      console.log(
        `📋 Testing ${viewport.name} (${viewport.width}x${viewport.height})`
      );

      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.waitForTimeout(500);

      const hamburger = page.locator('[data-testid="mobile-menu"]');
      const isVisible = await hamburger.isVisible();

      console.log(
        `   📋 Hamburger visible: ${isVisible} (expected: ${viewport.shouldShow})`
      );

      if (isVisible === viewport.shouldShow) {
        console.log(`   ✅ Correct behavior for ${viewport.name}`);
      } else {
        console.log(`   ❌ Wrong behavior for ${viewport.name}`);
      }
    }

    console.log("✅ Responsive behavior test complete");
  });
});
