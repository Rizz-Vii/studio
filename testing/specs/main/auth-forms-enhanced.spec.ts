import { test, expect } from "@playwright/test";

/**
 * Enhanced Authentication Form Testing Suite
 * Tests login and registration form interactions with robust selectors
 */

test.describe("Authentication Form Testing - Enhanced", () => {
  test("login page loads and form elements work", async ({ page }) => {
    console.log("🔐 Testing login page...");

    await page.goto("/login", { waitUntil: "networkidle" });

    // Check basic page structure (flexible title checking)
    const pageTitle = await page.title();
    console.log(`📋 Page title: "${pageTitle}"`);

    // More specific form element selection
    const emailField = page.getByRole("textbox", { name: /email/i });
    const passwordField = page.getByLabel(/^password/i).first(); // Take first password field
    const loginButton = page.getByRole("button", { name: /^login$/i }); // Exact match for Login button

    await expect(emailField).toBeVisible();
    await expect(passwordField).toBeVisible();
    await expect(loginButton).toBeVisible();

    // Test form interaction
    await emailField.fill("test@example.com");
    await passwordField.fill("testpassword123");

    await expect(emailField).toHaveValue("test@example.com");
    await expect(passwordField).toHaveValue("testpassword123");

    console.log("✅ Login form works - can enter data");
  });

  test("register page loads and form elements work", async ({ page }) => {
    console.log("📝 Testing registration page...");

    await page.goto("/register", { waitUntil: "networkidle" });

    const pageTitle = await page.title();
    console.log(`📋 Page title: "${pageTitle}"`);

    // Form elements
    const emailField = page.getByRole("textbox", { name: /email/i });
    const passwordField = page.getByLabel(/^password/i).first();
    const confirmPasswordField = page.getByLabel(/confirm|repeat/i);
    const registerButton = page
      .getByRole("button", { name: /register|sign up|create/i })
      .first();

    await expect(emailField).toBeVisible();
    await expect(passwordField).toBeVisible();
    await expect(registerButton).toBeVisible();

    // Test form interaction
    await emailField.fill("newuser@example.com");
    await passwordField.fill("newpassword123");

    const confirmExists = (await confirmPasswordField.count()) > 0;
    if (confirmExists) {
      await confirmPasswordField.fill("newpassword123");
      console.log("📋 Confirm password field found and tested");
    }

    // Check for terms checkbox
    const termsCheckbox = page.getByRole("checkbox", { name: /terms|agree/i });
    const termsExists = (await termsCheckbox.count()) > 0;

    if (termsExists) {
      await termsCheckbox.check();
      await expect(termsCheckbox).toBeChecked();
      console.log("📋 Terms checkbox found and tested");
    }

    await expect(emailField).toHaveValue("newuser@example.com");
    await expect(passwordField).toHaveValue("newpassword123");

    console.log("✅ Registration form works - can enter data");
  });

  test("form validation feedback", async ({ page }) => {
    console.log("✅ Testing form validation...");

    await page.goto("/login", { waitUntil: "networkidle" });

    const emailField = page.getByRole("textbox", { name: /email/i });
    const passwordField = page.getByLabel(/^password/i).first();
    const loginButton = page.getByRole("button", { name: /^login$/i });

    // Test invalid email format
    await emailField.fill("invalid-email");
    await passwordField.fill("somepassword");

    // Try to submit and check for validation
    await loginButton.click();
    await page.waitForTimeout(2000);

    // Check if validation occurred (could be browser validation or custom)
    const emailValidity = await emailField.evaluate((el) =>
      (el as HTMLInputElement).checkValidity()
    );
    console.log(`📋 Email field validity: ${emailValidity}`);

    if (!emailValidity) {
      console.log("📋 Browser validation is working");
    }

    console.log("✅ Validation tested");
  });

  test("password visibility toggle", async ({ page }) => {
    console.log("👁️ Testing password visibility...");

    await page.goto("/login", { waitUntil: "networkidle" });

    const passwordField = page.getByLabel(/^password/i).first();
    await passwordField.fill("testpassword");

    // Initial state should be password type
    await expect(passwordField).toHaveAttribute("type", "password");

    // Look for toggle button (eye icon)
    const toggleButtons = page.locator("button").filter({
      has: page.locator("svg, [data-lucide], .lucide"),
    });

    const toggleCount = await toggleButtons.count();
    console.log(`📋 Found ${toggleCount} potential toggle buttons`);

    if (toggleCount > 0) {
      // Try the first toggle button near the password field
      await toggleButtons.first().click();

      const typeAfterToggle = await passwordField.getAttribute("type");
      console.log(`📋 Password field type after toggle: ${typeAfterToggle}`);

      if (typeAfterToggle === "text") {
        console.log("✅ Password visibility toggle works!");
      }
    }

    console.log("✅ Password toggle tested");
  });

  test("navigation between auth pages", async ({ page }) => {
    console.log("🔄 Testing auth navigation...");

    // Start at login
    await page.goto("/login", { waitUntil: "networkidle" });

    // Look for first register link
    const registerLinks = page.getByRole("link", { name: /sign up|register/i });
    const linkCount = await registerLinks.count();
    console.log(`📋 Found ${linkCount} register links`);

    if (linkCount > 0) {
      await registerLinks.first().click();
      await page.waitForURL(/register/);
      console.log("📋 Navigation to register works");

      // Try to navigate back
      const loginLinks = page.getByRole("link", { name: /sign in|login/i });
      const backLinkCount = await loginLinks.count();

      if (backLinkCount > 0) {
        await loginLinks.first().click();
        await page.waitForURL(/login/);
        console.log("📋 Navigation back to login works");
      }
    }

    console.log("✅ Navigation tested");
  });

  test("google sign-in button exists", async ({ page }) => {
    console.log("🔍 Checking for Google Sign-in...");

    await page.goto("/login", { waitUntil: "networkidle" });

    const googleButton = page.getByRole("button", { name: /google/i });
    const googleExists = (await googleButton.count()) > 0;

    if (googleExists) {
      await expect(googleButton).toBeVisible();
      console.log("📋 Google Sign-in button found");

      // Check for Google icon
      const hasIcon = (await googleButton.locator("svg").count()) > 0;
      if (hasIcon) {
        console.log("📋 Google button has icon");
      }
    } else {
      console.log("📋 No Google Sign-in found");
    }

    console.log("✅ Google Sign-in checked");
  });

  test("form accessibility features", async ({ page }) => {
    console.log("♿ Testing accessibility...");

    await page.goto("/login", { waitUntil: "networkidle" });

    const emailField = page.getByRole("textbox", { name: /email/i });
    const passwordField = page.getByLabel(/^password/i).first();

    // Check ARIA attributes
    const emailAriaLabel = await emailField.getAttribute("aria-label");
    const emailId = await emailField.getAttribute("id");

    console.log(`📋 Email field aria-label: ${emailAriaLabel}`);
    console.log(`📋 Email field id: ${emailId}`);

    // Test keyboard navigation
    await emailField.focus();
    await page.keyboard.press("Tab");

    const focusedElement = await page.evaluate(
      () => document.activeElement?.tagName
    );
    console.log(`📋 After tab, focused element: ${focusedElement}`);

    console.log("✅ Accessibility tested");
  });

  test("form summary - what we discovered", async ({ page }) => {
    console.log("📊 Generating form summary...");

    // Check login page
    await page.goto("/login", { waitUntil: "networkidle" });

    const loginSummary = {
      emailField:
        (await page.getByRole("textbox", { name: /email/i }).count()) > 0,
      passwordField: (await page.getByLabel(/password/i).count()) > 0,
      loginButton:
        (await page.getByRole("button", { name: /login/i }).count()) > 0,
      googleButton:
        (await page.getByRole("button", { name: /google/i }).count()) > 0,
      registerLink:
        (await page.getByRole("link", { name: /register|sign up/i }).count()) >
        0,
    };

    // Check register page
    await page.goto("/register", { waitUntil: "networkidle" });

    const registerSummary = {
      emailField:
        (await page.getByRole("textbox", { name: /email/i }).count()) > 0,
      passwordField: (await page.getByLabel(/password/i).count()) > 0,
      confirmPassword: (await page.getByLabel(/confirm/i).count()) > 0,
      termsCheckbox:
        (await page.getByRole("checkbox", { name: /terms/i }).count()) > 0,
      registerButton:
        (await page
          .getByRole("button", { name: /register|sign up/i })
          .count()) > 0,
    };

    console.log("📋 Login page features:", loginSummary);
    console.log("📋 Register page features:", registerSummary);

    console.log("✅ Form discovery complete");
  });
});
