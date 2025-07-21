import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Comprehensive Accessibility Tests", () => {
  // Define key pages to test
  const pagesToTest = [
    { name: "Home Page", path: "/" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Keyword Tool", path: "/keyword-tool" },
    { name: "Content Analyzer", path: "/content-analyzer" },
    { name: "NeuroSEO", path: "/neuroseo" },
    { name: "Account Settings", path: "/account" },
    { name: "Login Page", path: "/login" },
    { name: "Signup Page", path: "/signup" },
  ];

  // Test all pages without authentication
  for (const page of pagesToTest) {
    test(`${page.name} - unauthenticated accessibility check`, async ({
      page: pageObj,
    }) => {
      // Navigate to the page (will likely redirect to login for authenticated pages)
      await pageObj.goto(page.path);
      await pageObj.waitForLoadState("domcontentloaded");

      // Run axe accessibility tests with WCAG 2.1 AA standards
      const results = await new AxeBuilder({ page: pageObj })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      // Log accessibility issues for debugging
      if (results.violations.length > 0) {
        console.log(
          `Found ${results.violations.length} accessibility violations on ${page.name}`
        );
        for (const violation of results.violations) {
          console.log(`- ${violation.id}: ${violation.description}`);
          console.log(`  Impact: ${violation.impact}`);
          console.log(`  Affected nodes: ${violation.nodes.length}`);
        }
      }

      // Assert no violations - we might need to adjust this if there are known issues
      // that cannot be fixed immediately
      const criticalViolations = results.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious"
      );
      expect(criticalViolations.length).toBe(0);

      // Take screenshot for reference
      await pageObj.screenshot({
        path: `test-results/accessibility-unauthenticated-${page.path.replace(/\//g, "-")}-${Date.now()}.png`,
      });
    });
  }

  // Test authenticated pages with a logged-in user
  // Use agency tier for testing most features
  for (const page of pagesToTest.filter(
    (p) => p.path !== "/login" && p.path !== "/signup"
  )) {
    test(`${page.name} - authenticated accessibility check`, async ({
      page: pageObj,
    }) => {
      // Login first
      await pageObj.goto("/login");
      await pageObj.fill(
        '[data-testid="email-input"]',
        "test-agency@example.com"
      );
      await pageObj.fill('[data-testid="password-input"]', "testPassword123");
      await pageObj.click('[data-testid="login-button"]');

      // Navigate to the test page
      await pageObj.goto(page.path);
      await pageObj.waitForLoadState("domcontentloaded");

      // Run axe accessibility tests with WCAG 2.1 AA standards
      const results = await new AxeBuilder({ page: pageObj })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      // Log accessibility issues for debugging
      if (results.violations.length > 0) {
        console.log(
          `Found ${results.violations.length} accessibility violations on ${page.name} (authenticated)`
        );
        for (const violation of results.violations) {
          console.log(`- ${violation.id}: ${violation.description}`);
          console.log(`  Impact: ${violation.impact}`);
          console.log(`  Affected nodes: ${violation.nodes.length}`);
        }
      }

      // Assert no critical violations
      const criticalViolations = results.violations.filter(
        (v) => v.impact === "critical"
      );
      expect(criticalViolations.length).toBe(0);

      // Take screenshot for reference
      await pageObj.screenshot({
        path: `test-results/accessibility-authenticated-${page.path.replace(/\//g, "-")}-${Date.now()}.png`,
      });
    });
  }

  // Test forms for accessibility
  const formsToTest = [
    { name: "Login Form", path: "/login", selector: "form" },
    { name: "Signup Form", path: "/signup", selector: "form" },
    { name: "Contact Form", path: "/contact", selector: "form" },
    {
      name: "Keyword Tool Form",
      path: "/keyword-tool",
      selector: "form, [role='form']",
      requiresAuth: true,
    },
  ];

  for (const form of formsToTest) {
    test(`${form.name} - form accessibility check`, async ({
      page: pageObj,
    }) => {
      // Login if required
      if (form.requiresAuth) {
        await pageObj.goto("/login");
        await pageObj.fill(
          '[data-testid="email-input"]',
          "test-agency@example.com"
        );
        await pageObj.fill('[data-testid="password-input"]', "testPassword123");
        await pageObj.click('[data-testid="login-button"]');
      }

      // Navigate to the page containing the form
      await pageObj.goto(form.path);
      await pageObj.waitForLoadState("domcontentloaded");

      // Verify the form exists
      await expect(pageObj.locator(form.selector)).toBeVisible();

      // Check for form-specific accessibility issues
      const formAccessibility = await new AxeBuilder({ page: pageObj })
        .include(form.selector)
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "forms"])
        .analyze();

      // Log form-specific issues
      if (formAccessibility.violations.length > 0) {
        console.log(
          `Found ${formAccessibility.violations.length} accessibility violations in ${form.name}`
        );
        for (const violation of formAccessibility.violations) {
          console.log(`- ${violation.id}: ${violation.description}`);
          console.log(`  Impact: ${violation.impact}`);
          console.log(`  Affected nodes: ${violation.nodes.length}`);
        }
      }

      // Check specific form accessibility requirements

      // 1. All form inputs should have associated labels
      const inputsWithoutLabels = await pageObj.$$eval(
        `${form.selector} input:not([type="hidden"]), ${form.selector} select, ${form.selector} textarea`,
        (inputs) =>
          inputs.filter((input) => {
            // Check for explicit label
            if (input.id) {
              const hasLabel = document.querySelector(
                `label[for="${input.id}"]`
              );
              if (hasLabel) return false;
            }

            // Check for aria-label
            if (input.getAttribute("aria-label")) return false;

            // Check for aria-labelledby
            if (input.getAttribute("aria-labelledby")) return false;

            // Check if input is inside a label
            let parent = input.parentElement;
            while (parent) {
              if (parent.tagName === "LABEL") return false;
              parent = parent.parentElement;
            }

            return true;
          }).length
      );

      expect(inputsWithoutLabels).toBe(0);

      // 2. Form should have proper submission feedback
      const submitButton = pageObj.locator(
        `${form.selector} button[type="submit"], ${form.selector} input[type="submit"]`
      );
      if ((await submitButton.count()) > 0) {
        expect(await submitButton.getAttribute("aria-disabled")).not.toBe(
          "true"
        );
      }

      // Take screenshot of the form
      await pageObj.screenshot({
        path: `test-results/accessibility-form-${form.name.replace(/\s+/g, "-")}-${Date.now()}.png`,
      });
    });
  }

  // Test keyboard navigation
  test("keyboard navigation accessibility test", async ({ page }) => {
    // Login first
    await page.goto("/login");
    await page.fill('[data-testid="email-input"]', "test-agency@example.com");
    await page.fill('[data-testid="password-input"]', "testPassword123");
    await page.click('[data-testid="login-button"]');

    // Navigate to dashboard
    await page.goto("/dashboard");
    await page.waitForLoadState("domcontentloaded");

    // Start keyboard navigation test
    await page.keyboard.press("Tab"); // First tab should focus on skip-to-content or first focusable element

    // Test that we can tab through all focusable elements
    const focusableElements = [
      "a[href]",
      "button",
      "input",
      "select",
      "textarea",
      "[tabindex]:not([tabindex='-1'])",
    ];

    // Press tab multiple times and track how many elements we can focus
    let focusedElementsCount = 0;
    const maxTabPresses = 30; // Reasonable number of tab presses to expect

    for (let i = 0; i < maxTabPresses; i++) {
      const activeElement = await page.evaluate(() => {
        const active = document.activeElement;
        return active
          ? {
              tag: active.tagName,
              id: active.id,
              text: active.textContent?.trim(),
            }
          : null;
      });

      if (
        activeElement &&
        activeElement.tag !== "BODY" &&
        activeElement.tag !== "HTML"
      ) {
        focusedElementsCount++;
        console.log(
          `Tab index ${i}: Focused on ${activeElement.tag}${activeElement.id ? ` #${activeElement.id}` : ""}`
        );
      }

      await page.keyboard.press("Tab");
      await page.waitForTimeout(100); // Small wait to ensure focus changes
    }

    // We should be able to focus on at least a few elements
    expect(focusedElementsCount).toBeGreaterThan(5);

    // Check focus visibility
    const hasFocusStyles = await page.evaluate(() => {
      const style = window.getComputedStyle(document.activeElement!);
      return (
        style.outlineWidth !== "0px" ||
        style.boxShadow !== "none" ||
        style.borderWidth !== "0px"
      );
    });

    expect(hasFocusStyles).toBe(true);
  });

  // Test color contrast
  test("color contrast accessibility check", async ({ page }) => {
    // Check multiple pages for contrast issues
    const pagesToCheck = ["/", "/dashboard", "/login"];

    for (const pagePath of pagesToCheck) {
      await page.goto(pagePath);
      await page.waitForLoadState("domcontentloaded");

      // Run axe with focus on contrast issues
      const contrastResults = await new AxeBuilder({ page })
        .withTags(["color-contrast"])
        .analyze();

      // Log contrast issues
      if (contrastResults.violations.length > 0) {
        console.log(
          `Found ${contrastResults.violations.length} contrast issues on ${pagePath}`
        );
        for (const violation of contrastResults.violations) {
          console.log(`- ${violation.id}: ${violation.description}`);
          console.log(`  Impact: ${violation.impact}`);
          console.log(`  Affected nodes: ${violation.nodes.length}`);
        }
      }

      // Assert no critical contrast issues
      const criticalContrastIssues = contrastResults.violations.filter(
        (v) => v.impact === "critical"
      );
      expect(criticalContrastIssues.length).toBe(0);
    }
  });

  // Test screen reader accessibility
  test("aria attributes and landmarks check", async ({ page }) => {
    // Login first
    await page.goto("/login");
    await page.fill('[data-testid="email-input"]', "test-agency@example.com");
    await page.fill('[data-testid="password-input"]', "testPassword123");
    await page.click('[data-testid="login-button"]');

    // Navigate to dashboard which should have rich UI
    await page.goto("/dashboard");
    await page.waitForLoadState("domcontentloaded");

    // Check for proper landmarks
    const landmarks = await page.evaluate(() => {
      return {
        hasHeader: document.querySelector('header, [role="banner"]') !== null,
        hasNav: document.querySelector('nav, [role="navigation"]') !== null,
        hasMain: document.querySelector('main, [role="main"]') !== null,
        hasFooter:
          document.querySelector('footer, [role="contentinfo"]') !== null,
      };
    });

    expect(landmarks.hasHeader).toBe(true);
    expect(landmarks.hasNav).toBe(true);
    expect(landmarks.hasMain).toBe(true);
    expect(landmarks.hasFooter).toBe(true);

    // Check for proper heading structure
    const headings = await page.evaluate(() => {
      const headingElements = Array.from(
        document.querySelectorAll("h1, h2, h3, h4, h5, h6")
      );
      return headingElements.map((h) => ({
        level: parseInt(h.tagName[1], 10),
        text: h.textContent?.trim() || "",
      }));
    });

    // Should have at least one h1
    const h1Count = headings.filter((h) => h.level === 1).length;
    expect(h1Count).toBe(1); // Should have exactly one h1 per page

    // Check for proper ARIA usage
    const ariaIssues = await new AxeBuilder({ page })
      .withTags(["aria", "wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    // Assert no critical ARIA issues
    const criticalAriaIssues = ariaIssues.violations.filter(
      (v) => v.impact === "critical"
    );
    expect(criticalAriaIssues.length).toBe(0);
  });

  // Mobile accessibility tests
  test("mobile accessibility check", async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 390, height: 844 });

    // Check key pages on mobile
    const mobilePages = ["/", "/login", "/dashboard"];

    for (const pagePath of mobilePages) {
      // For dashboard we need to login first
      if (pagePath === "/dashboard") {
        await page.goto("/login");
        await page.fill(
          '[data-testid="email-input"]',
          "test-agency@example.com"
        );
        await page.fill('[data-testid="password-input"]', "testPassword123");
        await page.click('[data-testid="login-button"]');
      }

      await page.goto(pagePath);
      await page.waitForLoadState("domcontentloaded");

      // Check tap target sizes
      const smallTapTargets = await page.evaluate(() => {
        const MIN_TAP_TARGET_SIZE = 44; // 44x44px is recommended minimum

        // Get all interactive elements
        const interactiveElements = Array.from(
          document.querySelectorAll(
            'a, button, input, select, textarea, [role="button"], [role="link"]'
          )
        );

        // Filter for those that are too small
        const tooSmall = interactiveElements.filter((el) => {
          const rect = el.getBoundingClientRect();
          return (
            rect.width < MIN_TAP_TARGET_SIZE ||
            rect.height < MIN_TAP_TARGET_SIZE
          );
        });

        return tooSmall.length;
      });

      console.log(
        `Found ${smallTapTargets} small tap targets on ${pagePath} (mobile)`
      );

      // Run standard accessibility tests on mobile viewport
      const mobileA11yResults = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      // Assert no critical mobile accessibility issues
      const criticalMobileIssues = mobileA11yResults.violations.filter(
        (v) => v.impact === "critical"
      );
      expect(criticalMobileIssues.length).toBe(0);

      // Take screenshot for reference
      await page.screenshot({
        path: `test-results/accessibility-mobile-${pagePath.replace(/\//g, "-")}-${Date.now()}.png`,
        fullPage: true,
      });
    }
  });
});
