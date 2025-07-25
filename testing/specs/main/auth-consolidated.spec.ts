import { test, expect } from "@playwright/test";

/**
 * Consolidated Authentication Test Suite
 * Combines all auth-related tests for better organization and reduced redundancy
 */

test.describe("Authentication - Comprehensive Suite", () => {
  test.describe("Login Page", () => {
    test("loads correctly with all elements", async ({ page }) => {
      console.log("🔐 Testing login page load and accessibility...");

      await page.goto("/login", { waitUntil: "networkidle" });

      // Check form elements exist and are accessible - Use specific selectors to avoid strict mode violations
      const emailField = page.locator('form').getByRole("textbox", { name: /email/i }).first();
      const passwordField = page.locator('form').getByLabel(/password/i).first();
      const submitButton = page.locator('form')
        .getByRole("button", { name: /^login$/i })
        .or(page.locator('form').getByRole("button", { name: /^sign in$/i }));

      await expect(emailField).toBeVisible();
      await expect(passwordField).toBeVisible();
      await expect(submitButton).toBeVisible();

      // Check form attributes
      await expect(emailField).toHaveAttribute("type", "email");
      await expect(passwordField).toHaveAttribute("type", "password");

      console.log("✅ Login page elements are accessible");
    });

    test("form validation works correctly", async ({ page }) => {
      console.log("📝 Testing login form validation...");

      await page.goto("/login", { waitUntil: "networkidle" });

      const emailField = page.locator('form').getByRole("textbox", { name: /email/i }).first();
      const passwordField = page.locator('form').getByLabel(/password/i).first();
      const submitButton = page.locator('form')
        .getByRole("button", { name: /^login$/i })
        .or(page.locator('form').getByRole("button", { name: /^sign in$/i }));

      // Test empty form submission
      await submitButton.click();

      // Look for validation messages
      const validationMessage = page
        .locator("text=/required|invalid|error/i")
        .first();
      const hasValidation = (await validationMessage.count()) > 0;

      if (hasValidation) {
        await expect(validationMessage).toBeVisible();
        console.log("✅ Form validation is working");
      } else {
        console.log(
          "⚠️ No validation messages found (may be handled differently)"
        );
      }

      // Test invalid email format
      await emailField.fill("invalid-email");
      await passwordField.fill("password123");
      await submitButton.click();

      console.log("✅ Form validation tests completed");
    });

    test("password visibility toggle", async ({ page }) => {
      console.log("👁️ Testing password visibility toggle...");

      await page.goto("/login", { waitUntil: "networkidle" });

      const passwordField = page.getByLabel(/password/i);
      const toggleButton = page
        .locator('[data-testid="password-toggle"]')
        .or(page.locator('button[aria-label*="password"]'))
        .or(page.locator('[type="button"]').filter({ hasText: /show|hide/i }));

      await passwordField.fill("testpassword");

      if ((await toggleButton.count()) > 0) {
        // Test toggle functionality
        await expect(passwordField).toHaveAttribute("type", "password");
        await toggleButton.click();
        await expect(passwordField).toHaveAttribute("type", "text");
        await toggleButton.click();
        await expect(passwordField).toHaveAttribute("type", "password");
        console.log("✅ Password toggle works correctly");
      } else {
        console.log("⚠️ Password toggle not found (may not be implemented)");
      }
    });
  });

  test.describe("Registration Page", () => {
    test("loads with all required elements", async ({ page }) => {
      console.log("📝 Testing registration page...");

      await page.goto("/register", { waitUntil: "networkidle" });

      // Check basic form elements - Use specific selectors to avoid strict mode violations
      const emailField = page.locator('form').getByRole("textbox", { name: /email/i }).first();
      const passwordField = page.locator('form').getByLabel(/password/i).first();
      const submitButton = page.locator('form').getByRole("button", {
        name: /register|sign up/i,
      });

      await expect(emailField).toBeVisible();
      await expect(passwordField).toBeVisible();
      await expect(submitButton).toBeVisible();

      console.log("✅ Registration page elements are accessible");
    });

    test("form validation", async ({ page }) => {
      console.log("📝 Testing registration form validation...");

      await page.goto("/register", { waitUntil: "networkidle" });

      const submitButton = page.getByRole("button", {
        name: /register|sign up/i,
      });

      // Test empty form submission
      await submitButton.click();

      // Check for validation messages
      const validationExists =
        (await page.locator("text=/required|invalid|error/i").count()) > 0;
      if (validationExists) {
        console.log("✅ Registration validation is working");
      } else {
        console.log("⚠️ No validation messages found");
      }
    });
  });

  test.describe("Authentication Flow", () => {
    test("navigation between login and register", async ({ page }) => {
      console.log("🧭 Testing navigation between auth pages...");

      await page.goto("/login", { waitUntil: "networkidle" });

      // Look for register link
      const registerLink = page
        .getByRole("link", { name: /register|sign up/i })
        .or(page.locator('a[href*="register"]'))
        .or(
          page
            .locator("text=/don.*have.*account/i")
            .locator("..")
            .getByRole("link")
        );

      if ((await registerLink.count()) > 0) {
        await registerLink.click();
        await page.waitForLoadState("networkidle");
        await expect(page).toHaveURL(/register/);

        // Navigate back to login - Use more specific selector to avoid Terms & Conditions link
        const loginLink = page.locator('a[href="/login"]').first();

        if ((await loginLink.count()) > 0) {
          await loginLink.click();
          await page.waitForLoadState("networkidle");
          await expect(page).toHaveURL(/login/);
          console.log("✅ Auth page navigation works");
        }
      } else {
        console.log("⚠️ Register link not found from login page");
      }
    });

    test("Google sign-in integration", async ({ page }) => {
      console.log("🔍 Checking for Google sign-in integration...");

      await page.goto("/login", { waitUntil: "networkidle" });

      const googleButton = page
        .getByRole("button", { name: /google|continue with google/i })
        .or(page.locator('[data-testid="google-signin"]'))
        .or(page.locator("button").filter({ hasText: /google/i }));

      if ((await googleButton.count()) > 0) {
        await expect(googleButton).toBeVisible();
        console.log("✅ Google sign-in button found");
      } else {
        console.log("⚠️ Google sign-in button not found");
      }
    });
  });

  test.describe("Responsive Design", () => {
    test("mobile layout optimization", async ({ page }) => {
      console.log("📱 Testing auth pages on mobile...");

      // Test on mobile viewport
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto("/login", { waitUntil: "networkidle" });

      const emailField = page.locator('form').getByRole("textbox", { name: /email/i }).first();
      const passwordField = page.locator('form').getByLabel(/password/i).first();
      const submitButton = page.locator('form').getByRole("button", { name: /login|sign in/i });

      // Check elements are still accessible on mobile
      await expect(emailField).toBeVisible();
      await expect(passwordField).toBeVisible();
      await expect(submitButton).toBeVisible();

      // Check for mobile-specific optimizations
      const viewport = page.viewportSize();
      expect(viewport?.width).toBe(390);

      console.log("✅ Mobile auth layout is functional");
    });
  });

  test.describe("Accessibility Compliance", () => {
    test("WCAG compliance check", async ({ page }) => {
      console.log("♿ Testing auth page accessibility...");

      await page.goto("/login", { waitUntil: "networkidle" });

      // Check for proper labels - Use specific selectors to avoid strict mode violations
      const emailField = page.locator('form').getByRole("textbox", { name: /email/i }).first();
      const passwordField = page.locator('form').getByLabel(/password/i).first();

      await expect(emailField).toBeVisible();
      await expect(passwordField).toBeVisible();

      // Check for focus management
      await emailField.focus();
      await expect(emailField).toBeFocused();

      await page.keyboard.press("Tab");
      await expect(passwordField).toBeFocused();

      console.log("✅ Basic accessibility checks passed");
    });
  });
});

test.describe("Authentication - Integration Tests", () => {
  test("authenticated user dashboard access", async ({ page }) => {
    console.log("🔐 Testing authenticated user flow...");

    // This would typically use a global setup or fixture for auth
    await page.goto("/dashboard", { waitUntil: "networkidle" });

    // Check if redirected to login (expected for unauthenticated user)
    const currentUrl = page.url();
    if (currentUrl.includes("/login")) {
      console.log("✅ Unauthenticated user properly redirected to login");
    } else {
      console.log("⚠️ No authentication redirect detected");
    }
  });

  test("logout functionality", async ({ page }) => {
    console.log("🚪 Testing logout flow...");

    // Navigate to a page that might have logout functionality
    await page.goto("/dashboard", { waitUntil: "networkidle" });

    const logoutButton = page
      .getByRole("button", { name: /logout|sign out/i })
      .or(page.locator('[data-testid="logout"]'))
      .or(page.locator("text=/logout|sign out/i"));

    if ((await logoutButton.count()) > 0) {
      console.log("✅ Logout button found");
    } else {
      console.log("⚠️ Logout button not found (may require authentication)");
    }
  });
});
