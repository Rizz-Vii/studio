import { test, expect } from "@playwright/test";

test.describe("Authentication Flows", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("login page elements", async ({ page }) => {
    // Check form elements
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /login/i })).toBeVisible();

    // Check additional elements
    await expect(
      page.getByRole("link", { name: /forgot password/i })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /sign up/i })).toBeVisible();
  });

  test("registration page elements", async ({ page }) => {
    await page.goto("/register");

    // Check form elements
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /sign up|register/i })
    ).toBeVisible();

    // Check additional elements
    await expect(page.getByRole("link", { name: /login/i })).toBeVisible();
    await expect(page.getByText(/already have an account/i)).toBeVisible();
  });

  test("form validation - login", async ({ page }) => {
    const loginButton = page.getByRole("button", { name: /login/i });

    // Empty form submission
    await loginButton.click();
    await expect(page.getByText(/email is required/i)).toBeVisible();

    // Invalid email
    await page.getByLabel(/email/i).fill("invalid-email");
    await loginButton.click();
    await expect(page.getByText(/invalid email/i)).toBeVisible();

    // Empty password
    await page.getByLabel(/email/i).fill("test@example.com");
    await loginButton.click();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });

  test("form validation - registration", async ({ page }) => {
    await page.goto("/register");
    const registerButton = page.getByRole("button", {
      name: /sign up|register/i,
    });

    // Empty form submission
    await registerButton.click();
    await expect(page.getByText(/email is required/i)).toBeVisible();

    // Invalid email
    await page.getByLabel(/email/i).fill("invalid-email");
    await registerButton.click();
    await expect(page.getByText(/invalid email/i)).toBeVisible();

    // Password requirements
    await page.getByLabel(/email/i).fill("test@example.com");
    await page.getByLabel(/password/i).fill("short");
    await registerButton.click();
    await expect(page.getByText(/password must be at least/i)).toBeVisible();
  });

  // This test requires auth credentials
  test.skip("successful login flow", async ({ page }) => {
    // TODO: Add credentials when provided
    await page.getByLabel(/email/i).fill("$TEST_EMAIL");
    await page.getByLabel(/password/i).fill("$TEST_PASSWORD");
    await page.getByRole("button", { name: /login/i }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
  });
});
