import { test, expect } from "./setup/test-setup";
import testConfig from "../test.config.json";

test.describe("Authentication Features", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("login page loads correctly", async ({ page }) => {
    // Check heading
    await expect(page.getByRole("heading", { name: "Login", level: 2 })).toBeVisible();
    
    // Check form elements
    await expect(page.getByRole("textbox", { name: "Email" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Password" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Login" })).toBeVisible();
    
    // Check additional elements
    await expect(page.getByRole("button", { name: "Sign in with Google" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Register" })).toBeVisible();
  });

  test("successful login with standard user", async ({ page }) => {
    const user = testConfig.testUsers.standard;
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
});
