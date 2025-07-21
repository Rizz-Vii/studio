import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/login-page";

test.describe("Authentication Features", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigateTo();
  });

  test("login page loads correctly", async ({ page }) => {
    await expect(page).toHaveTitle(/Sign In/);
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
  });

  test("form validation - login", async () => {
    await loginPage.emailInput.fill("invalid");
    await loginPage.loginButton.click();
    await expect(loginPage.errorMessage).toBeVisible();
  });

  test("successful login with standard user", async ({ page }) => {
    await loginPage.login(
      process.env.TEST_USER_EMAIL!,
      process.env.TEST_USER_PASSWORD!
    );
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test("unsuccessful login with invalid credentials", async () => {
    await loginPage.login("wrong@example.com", "wrongpassword");
    await loginPage.expectError("Invalid email or password");
  });
});
