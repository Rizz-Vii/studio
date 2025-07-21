import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/login-page";

test.describe("Authentication Features", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigateTo();
  });

  test("login page loads correctly", async ({ page }) => {
    await expect(page).toHaveTitle(/RankPilot/);
    await expect(page.locator('h2:has-text("Login")')).toBeVisible();
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
  });

  test("form validation - login", async ({ page }) => {
    await loginPage.emailInput.fill("invalid");
    await loginPage.loginButton.click();
    // Wait for error to appear and validate it - looking for email validation error specifically
    await expect(page.getByText("Invalid email address")).toBeVisible({
      timeout: 5000,
    });
  });

  test("successful login with standard user", async ({ page }) => {
    await loginPage.login("abbas_ali_rizvi@hotmail.com", "123456");
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test("unsuccessful login with invalid credentials", async ({ page }) => {
    await loginPage.emailInput.fill("wrong@example.com");
    await loginPage.passwordInput.fill("wrongpassword");
    await loginPage.loginButton.click();

    // Wait for Firebase authentication error
    // Errors are typically shown with the .text-red-600 class
    // and contain text related to invalid credentials
    const errorSelector = ".text-red-600";
    await expect(page.locator(errorSelector)).toBeVisible({ timeout: 5000 });

    // Verify we're still on the login page (didn't navigate to dashboard)
    await expect(page).not.toHaveURL(/.*dashboard/);
  });
});
