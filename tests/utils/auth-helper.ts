import { Page } from "@playwright/test";
import { type TestUser } from "../config/test-config";

export type UserType = "standard" | "admin";

export async function login(page: Page, user: TestUser | UserType) {
  // Navigate to login page
  await page.goto("/login");

  // Get credentials based on input type
  const credentials =
    typeof user === "string"
      ? {
          email:
            process.env[`TEST_${user.toUpperCase()}_EMAIL`] ||
            `${user}@example.com`,
          password:
            process.env[`TEST_${user.toUpperCase()}_PASSWORD`] ||
            `${user}pass123`,
        }
      : user;

  // Fill in login form
  await page.getByLabel(/email/i).fill(credentials.email);
  await page.getByLabel(/password/i).fill(credentials.password);

  // Submit form
  await page.getByRole("button", { name: /login/i }).click();

  // Wait for navigation to complete and dashboard to be visible
  await Promise.all([
    page.waitForURL("/dashboard"),
    page.waitForSelector('h1:has-text("Dashboard")', {
      state: "visible",
      timeout: 10000,
    }),
  ]);
}

export async function logout(page: Page) {
  await page.goto("/logout");
  // Wait for navigation to complete
  await page.waitForURL("/");
}

// Storage state management for faster login
export async function saveAuthenticationState(
  page: Page,
  user: TestUser | UserType
) {
  await login(page, user);
  const userType = typeof user === "string" ? user : "custom";
  await page
    .context()
    .storageState({ path: `./tests/state/auth-${userType}.json` });
}
