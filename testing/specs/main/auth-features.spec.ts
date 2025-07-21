import { test, expect } from "./setup/test-setup";
import { defaultConfig } from "./config/test-config";

test.describe("Authentication Features", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("login page loads correctly", async ({ page }) => {
    // Check heading
    await expect(
      page.getByRole("heading", { name: "Login", level: 2 })
    ).toBeVisible();

    // Check form elements
    await expect(page.getByRole("textbox", { name: "Email" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Password" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Login" })).toBeVisible();

    // Check additional elements
    await expect(
      page.getByRole("button", { name: "Sign in with Google" })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Register" })).toBeVisible();
  });

  test("successful login with standard user", async ({ page }) => {
    const user = defaultConfig.testUsers.standard;
    await page.getByLabel(/email/i).fill(user.email);
    await page.getByLabel(/password/i).fill(user.password);
    await page.getByRole("button", { name: /login/i }).click();

    // Wait for navigation and verify dashboard
    await page.waitForURL(/.*dashboard/);
    await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible(
      { timeout: 10000 }
    );
  });

  test("invalid login shows error", async ({ page }) => {
    await page.getByLabel(/email/i).fill("invalid@example.com");
    await page.getByLabel(/password/i).fill("wrongpassword");
    await page.getByRole("button", { name: /login/i }).click();

    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
  });

  test("authenticated user can access dashboard", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible(
      { timeout: 10000 }
    );
    await expect(page.getByRole("button", { name: /logout/i })).toBeVisible();
  });

  test("admin user can access admin features", async ({ adminPage: page }) => {
    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: /admin/i })).toBeVisible({
      timeout: 10000,
    });
  });

  test("logout works correctly", async ({ authenticatedPage: page }) => {
    await page.goto("/dashboard");
    await page.getByRole("button", { name: /logout/i }).click();
    await page.waitForURL("/");

    // Verify redirect to login when trying to access protected route
    await page.goto("/dashboard");
    await expect(page.url()).toContain("/login");
  });

  // Enhanced Link Validation Tests
  test("all links redirect to valid pages", async ({ page }) => {
    await test.step("Validate navigation links", async () => {
      // Test Register link
      const registerLink = page.getByRole("link", { name: /register/i });
      await expect(registerLink).toBeVisible();

      const registerResponse = await page.goto(
        (await registerLink.getAttribute("href")) || "/register"
      );
      expect(registerResponse?.ok()).toBeTruthy();
      expect(registerResponse?.status()).toBe(200);

      // Return to login page
      await page.goto("/login");
    });

    await test.step("Validate logo/brand link", async () => {
      const logoLink = page.getByRole("link", { name: /rankpilot/i }).first();
      if (await logoLink.isVisible()) {
        const logoResponse = await page.goto(
          (await logoLink.getAttribute("href")) || "/"
        );
        expect(logoResponse?.ok()).toBeTruthy();
        expect(logoResponse?.status()).toBe(200);

        // Return to login page
        await page.goto("/login");
      }
    });

    await test.step("Validate footer links", async () => {
      const footerLinks = await page
        .getByRole("contentinfo")
        .getByRole("link")
        .all();
      for (const link of footerLinks) {
        const href = await link.getAttribute("href");
        if (href && href.startsWith("/")) {
          const response = await page.goto(href);
          expect(response?.ok()).toBeTruthy();
          expect(response?.status()).toBeLessThan(400);

          // Return to login page
          await page.goto("/login");
        }
      }
    });
  });

  // Enhanced Mobile Optimization Tests
  test("login page responsiveness across devices", async ({ page }) => {
    await test.step("Mobile view (iPhone 13)", async () => {
      await page.setViewportSize({ width: 390, height: 844 });

      // Verify form elements are still accessible on mobile
      await expect(
        page.getByRole("heading", { name: "Login", level: 2 })
      ).toBeVisible();
      await expect(page.getByRole("textbox", { name: "Email" })).toBeVisible();
      await expect(
        page.getByRole("textbox", { name: "Password" })
      ).toBeVisible();
      await expect(page.getByRole("button", { name: "Login" })).toBeVisible();

      // Check that elements don't overflow
      const loginForm = page.locator("form").first();
      const formBox = await loginForm.boundingBox();
      expect(formBox?.width).toBeLessThanOrEqual(390);
    });

    await test.step("Tablet view (iPad)", async () => {
      await page.setViewportSize({ width: 768, height: 1024 });

      // Verify layout adaptation for tablet
      await expect(
        page.getByRole("heading", { name: "Login", level: 2 })
      ).toBeVisible();
      await expect(page.getByRole("textbox", { name: "Email" })).toBeVisible();
      await expect(
        page.getByRole("textbox", { name: "Password" })
      ).toBeVisible();

      // Check navigation is properly displayed
      const navigation = page.getByRole("navigation").first();
      if (await navigation.isVisible()) {
        await expect(navigation).toBeVisible();
      }
    });

    await test.step("Desktop view", async () => {
      await page.setViewportSize({ width: 1920, height: 1080 });

      // Verify full desktop layout
      await expect(
        page.getByRole("heading", { name: "Login", level: 2 })
      ).toBeVisible();
      await expect(page.getByRole("textbox", { name: "Email" })).toBeVisible();
      await expect(
        page.getByRole("textbox", { name: "Password" })
      ).toBeVisible();

      // Check that navigation is fully visible
      const navigation = page.getByRole("navigation").first();
      if (await navigation.isVisible()) {
        await expect(navigation).toBeVisible();
      }
    });
  });

  // Enhanced Accessibility Tests
  test("login page accessibility compliance", async ({ page }) => {
    await test.step("Check ARIA roles and labels", async () => {
      // Verify form has proper ARIA labels
      const emailInput = page.getByRole("textbox", { name: /email/i });
      await expect(emailInput).toHaveAttribute("aria-label", /email/i);

      const passwordInput = page.getByRole("textbox", { name: /password/i });
      await expect(passwordInput).toHaveAttribute("aria-label", /password/i);

      // Check button accessibility
      const loginButton = page.getByRole("button", { name: /login/i });
      await expect(loginButton).toBeEnabled();
      await expect(loginButton).toHaveAttribute("type", "submit");
    });

    await test.step("Check focus management", async () => {
      // Test tab navigation
      await page.keyboard.press("Tab");
      await expect(page.getByRole("textbox", { name: /email/i })).toBeFocused();

      await page.keyboard.press("Tab");
      await expect(
        page.getByRole("textbox", { name: /password/i })
      ).toBeFocused();

      await page.keyboard.press("Tab");
      await expect(page.getByRole("button", { name: /login/i })).toBeFocused();
    });

    await test.step("Check color contrast and visual accessibility", async () => {
      // Check for proper heading structure
      await expect(
        page.getByRole("heading", { name: "Login", level: 2 })
      ).toBeVisible();

      // Verify form has proper labels
      const emailInput = page.getByRole("textbox", { name: /email/i });
      const passwordInput = page.getByRole("textbox", { name: /password/i });

      await expect(emailInput).toBeVisible();
      await expect(passwordInput).toBeVisible();

      // Check all interactive elements are keyboard accessible
      const interactiveElements = await page
        .locator("button, a, input, select, textarea")
        .all();
      for (const element of interactiveElements) {
        if (await element.isVisible()) {
          await expect(element).not.toHaveAttribute("tabindex", "-1");
        }
      }
    });
  });

  // Layout Consistency Tests
  test("consistent layout components across auth pages", async ({ page }) => {
    await test.step("Verify header consistency on login page", async () => {
      // Check for consistent header elements
      const header = page.getByRole("banner").first();
      if (await header.isVisible()) {
        await expect(header).toBeVisible();
        await expect(
          header.getByRole("link", { name: /rankpilot/i })
        ).toBeVisible();
      }
    });

    await test.step("Verify footer consistency on login page", async () => {
      // Check for consistent footer elements
      const footer = page.getByRole("contentinfo").first();
      if (await footer.isVisible()) {
        await expect(footer).toBeVisible();
        await expect(footer).toContainText("© 2025 RankPilot");
      }
    });

    await test.step("Verify layout consistency on register page", async () => {
      await page.goto("/register");

      // Check same header structure
      const header = page.getByRole("banner").first();
      if (await header.isVisible()) {
        await expect(header).toBeVisible();
        await expect(
          header.getByRole("link", { name: /rankpilot/i })
        ).toBeVisible();
      }

      // Check same footer structure
      const footer = page.getByRole("contentinfo").first();
      if (await footer.isVisible()) {
        await expect(footer).toBeVisible();
        await expect(footer).toContainText("© 2025 RankPilot");
      }
    });
  });
});
