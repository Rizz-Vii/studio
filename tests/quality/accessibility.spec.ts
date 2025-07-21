import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Comprehensive Accessibility Tests", () => {
  // Define key pages to test
  const pagesToTest = [
    { name: "Home Page", path: "/" },
    { name: "Dashboard", path: "/dashboard", requiresAuth: true },
    { name: "Keyword Tool", path: "/keyword-tool", requiresAuth: true },
    { name: "Content Analyzer", path: "/content-analyzer", requiresAuth: true },
    { name: "NeuroSEO", path: "/neuroseo", requiresAuth: true },
    { name: "Account Settings", path: "/account", requiresAuth: true },
    { name: "Login Page", path: "/login" },
    { name: "Signup Page", path: "/signup" },
  ];

  // Test all pages
  for (const pageInfo of pagesToTest) {
    test(`${pageInfo.name} - accessibility check`, async ({ page }) => {
      if (pageInfo.requiresAuth) {
        // Login first
        await page.goto("/login");
        await page.fill(
          '[data-testid="email-input"]',
          "test-agency@example.com"
        );
        await page.fill('[data-testid="password-input"]', "testPassword123");
        await page.click('[data-testid="login-button"]');
        await page.waitForURL("**/dashboard");
      }

      // Navigate to the page
      await page.goto(pageInfo.path);
      await page.waitForLoadState("domcontentloaded");

      // Run axe accessibility tests with WCAG 2.1 AA standards
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      // Assert no violations
      expect(accessibilityScanResults.violations).toEqual([]);
    });
  }

  // Test forms for accessibility
  const formsToTest = [
    { name: "Login Form", path: "/login", selector: "form" },
    { name: "Signup Form", path: "/signup", selector: "form" },
    {
      name: "Keyword Tool Form",
      path: "/keyword-tool",
      selector: "form",
      requiresAuth: true,
    },
  ];

  for (const formInfo of formsToTest) {
    test(`${formInfo.name} - form accessibility check`, async ({ page }) => {
      if (formInfo.requiresAuth) {
        await page.goto("/login");
        await page.fill(
          '[data-testid="email-input"]',
          "test-agency@example.com"
        );
        await page.fill('[data-testid="password-input"]', "testPassword123");
        await page.click('[data-testid="login-button"]');
        await page.waitForURL("**/dashboard");
      }

      await page.goto(formInfo.path);
      await page.waitForLoadState("domcontentloaded");

      const formSelector = page.locator(formInfo.selector);
      await expect(formSelector).toBeVisible();

      const formAccessibilityScan = await new AxeBuilder({ page })
        .include(formInfo.selector)
        .analyze();

      expect(formAccessibilityScan.violations).toEqual([]);

      // Check that all form inputs have associated labels
      const inputs = await formSelector
        .locator('input:not([type="hidden"]), select, textarea')
        .all();
      for (const input of inputs) {
        const inputId = await input.getAttribute("id");
        let hasLabel = false;
        if (inputId) {
          const labelFor = formSelector.locator(`label[for="${inputId}"]`);
          if ((await labelFor.count()) > 0) {
            hasLabel = true;
          }
        }
        const ariaLabel = await input.getAttribute("aria-label");
        const ariaLabelledBy = await input.getAttribute("aria-labelledby");

        expect(hasLabel || !!ariaLabel || !!ariaLabelledBy).toBe(true);
      }
    });
  }

  // Test keyboard navigation
  test("keyboard navigation is logical", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("domcontentloaded");

    const focusableElements = await page
      .locator(
        'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      .all();

    let previousElement: any = null;
    for (let i = 0; i < focusableElements.length && i < 15; i++) {
      await page.keyboard.press("Tab");
      const activeElement = await page.evaluateHandle(
        () => document.activeElement
      );
      if (previousElement) {
        // A simple check: y position should generally not decrease, and x should increase or reset
        const prevBox = await previousElement.boundingBox();
        const activeBox = await activeElement.boundingBox();
        if (prevBox && activeBox) {
          const yPositionIncreasedOrSame = activeBox.y >= prevBox.y;
          const xPositionIncreased = activeBox.x > prevBox.x;
          const yPositionIncreasedSignificantly =
            activeBox.y > prevBox.y + prevBox.height;

          // if y position increased, x can be anything. if y is same, x must increase.
          expect(
            yPositionIncreasedSignificantly ||
              (yPositionIncreasedOrSame && xPositionIncreased)
          ).toBe(true);
        }
      }
      previousElement = activeElement;
    }
  });

  // Test color contrast on key pages
  test("color contrast meets WCAG AA standards", async ({ page }) => {
    for (const pageInfo of pagesToTest) {
      await page.goto(pageInfo.path);
      await page.waitForLoadState("domcontentloaded");

      const contrastResults = await new AxeBuilder({ page })
        .withTags(["color-contrast"])
        .analyze();

      expect(contrastResults.violations).toEqual([]);
    }
  });

  // Test screen reader accessibility landmarks and roles
  test("screen reader landmarks and roles are correct", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator('header, [role="banner"]')).toHaveCount(1);
    await expect(page.locator('nav, [role="navigation"]')).toHaveCount(1);
    await expect(page.locator('main, [role="main"]')).toHaveCount(1);
    await expect(page.locator('footer, [role="contentinfo"]')).toHaveCount(1);

    const ariaScanResults = await new AxeBuilder({ page })
      .withTags(["aria"])
      .analyze();

    expect(ariaScanResults.violations).toEqual([]);
  });

  // Mobile accessibility tests
  test("mobile viewport accessibility check", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    for (const pageInfo of pagesToTest) {
      await page.goto(pageInfo.path);
      await page.waitForLoadState("domcontentloaded");

      // Check tap target sizes
      const interactiveElements = await page
        .locator('a, button, input, [role="button"]')
        .all();
      for (const el of interactiveElements) {
        const box = await el.boundingBox();
        if (box) {
          expect(box.width).toBeGreaterThanOrEqual(44);
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
      }

      const mobileA11yResults = await new AxeBuilder({ page }).analyze();
      expect(mobileA11yResults.violations).toEqual([]);
    }
  });
});
