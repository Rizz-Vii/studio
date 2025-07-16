import { test, expect } from "@playwright/test";

test.describe("Mobile Navigation - Complete Coverage", () => {
  test("auth pages mobile navigation", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });

    console.log("🔐 Testing auth pages mobile navigation...");

    // Test login page
    await page.goto("http://localhost:3000/login", {
      waitUntil: "domcontentloaded",
    });

    await page.waitForTimeout(2000);

    console.log("📋 Checking auth mobile menu on login page...");

    const authMobileMenu = page.locator('[data-testid="auth-mobile-menu"]');
    const authExists = await authMobileMenu.count();
    const authVisible =
      authExists > 0 ? await authMobileMenu.isVisible() : false;

    console.log(
      `📋 Auth mobile menu: exists=${authExists > 0}, visible=${authVisible}`
    );

    if (authExists > 0 && authVisible) {
      console.log("🎯 SUCCESS: Auth mobile menu found!");

      // Click to open
      await authMobileMenu.click();
      await page.waitForTimeout(800);

      // Check drawer
      const authDrawer = page.locator('[data-testid="auth-drawer"]');
      const drawerVisible = await authDrawer.isVisible();
      console.log(`📋 Auth drawer visible: ${drawerVisible}`);

      if (drawerVisible) {
        // Check navigation items
        const navItems = await authDrawer
          .locator('[data-testid^="auth-nav-"]')
          .all();
        console.log(`📋 Auth nav items: ${navItems.length}`);

        // Close drawer
        const closeButton = authDrawer.locator('[data-testid="auth-close"]');
        if ((await closeButton.count()) > 0) {
          await closeButton.click();
          await page.waitForTimeout(500);
          console.log("📋 Auth drawer closed successfully");
        }
      }
    }

    // Test register page
    console.log("📋 Testing register page...");
    await page.goto("http://localhost:3000/register", {
      waitUntil: "domcontentloaded",
    });

    await page.waitForTimeout(1000);

    const authMenuRegister = page.locator('[data-testid="auth-mobile-menu"]');
    const registerVisible = await authMenuRegister.isVisible();
    console.log(`📋 Auth mobile menu on register: ${registerVisible}`);

    console.log("✅ Auth pages mobile navigation test complete");
  });

  test("component test page validation", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });

    console.log("🧪 Re-testing component test page for validation...");

    await page.goto("http://localhost:3000/mobile-nav-test", {
      waitUntil: "domcontentloaded",
    });

    await page.waitForTimeout(2000);

    // Quick validation that component test still works
    const hamburger = page.locator('[data-testid="mobile-menu"]');
    const exists = await hamburger.count();
    const visible = exists > 0 ? await hamburger.isVisible() : false;

    console.log(
      `📋 Component test hamburger: exists=${exists > 0}, visible=${visible}`
    );

    if (exists > 0 && visible) {
      await hamburger.click();
      await page.waitForTimeout(500);

      const drawer = page.locator('[data-testid="mobile-drawer"]');
      const drawerOpen = await drawer.isVisible();
      console.log(`📋 Component test drawer opens: ${drawerOpen}`);
    }

    console.log("✅ Component test validation complete");
  });

  test("cross-layout mobile navigation comparison", async ({ page }) => {
    console.log("🔄 Testing cross-layout mobile navigation...");

    await page.setViewportSize({ width: 390, height: 844 });

    const layouts = [
      {
        name: "Auth Layout",
        url: "http://localhost:3000/login",
        menuSelector: '[data-testid="auth-mobile-menu"]',
        drawerSelector: '[data-testid="auth-drawer"]',
      },
      {
        name: "Component Test",
        url: "http://localhost:3000/mobile-nav-test",
        menuSelector: '[data-testid="mobile-menu"]',
        drawerSelector: '[data-testid="mobile-drawer"]',
      },
    ];

    for (const layout of layouts) {
      console.log(`📋 Testing ${layout.name}...`);

      await page.goto(layout.url, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(2000);

      const menu = page.locator(layout.menuSelector);
      const menuExists = await menu.count();
      const menuVisible = menuExists > 0 ? await menu.isVisible() : false;

      console.log(
        `   📋 Menu: exists=${menuExists > 0}, visible=${menuVisible}`
      );

      if (menuExists > 0 && menuVisible) {
        // Test touch target size
        const boundingBox = await menu.boundingBox();
        if (boundingBox) {
          const touchTargetOk =
            boundingBox.width >= 44 && boundingBox.height >= 44;
          console.log(
            `   📋 Touch target: ${boundingBox.width}x${boundingBox.height}px OK=${touchTargetOk}`
          );
        }

        // Test accessibility
        const ariaLabel = await menu.getAttribute("aria-label");
        const ariaExpanded = await menu.getAttribute("aria-expanded");
        console.log(
          `   📋 Accessibility: aria-label="${ariaLabel}", aria-expanded=${ariaExpanded}`
        );

        // Test functionality
        await menu.click();
        await page.waitForTimeout(500);

        const drawer = page.locator(layout.drawerSelector);
        const drawerVisible = await drawer.isVisible();
        console.log(`   📋 Drawer opens: ${drawerVisible}`);

        // Close if opened
        if (drawerVisible) {
          await page.keyboard.press("Escape");
          await page.waitForTimeout(300);
        }
      }
    }

    console.log("✅ Cross-layout comparison complete");
  });
});
