import { Page } from '@playwright/test';
import testConfig from '../../test.config.json';

export async function login(page: Page, userType: 'standard' | 'admin' = 'standard') {
  const user = testConfig.testUsers[userType];
  
  // Navigate to login page
  await page.goto('/login');
  
  // Fill in login form
  await page.getByLabel(/email/i).fill(user.email);
  await page.getByLabel(/password/i).fill(user.password);
  
  // Submit form
  await page.getByRole('button', { name: /login/i }).click();
  
  // Wait for navigation to complete and dashboard to be visible
  await Promise.all([
    page.waitForURL('/dashboard'),
    page.waitForSelector('h1:has-text("Dashboard")', { state: 'visible', timeout: 10000 })
  ]);
}

export async function logout(page: Page) {
  await page.goto("/logout");
  // Wait for navigation to complete
  await page.waitForURL("/");
}

// Storage state management for faster login
export async function saveAuthenticationState(page: Page, userType: 'standard' | 'admin' = 'standard') {
  await login(page, userType);
  await page.context().storageState({ path: `./tests/state/auth-${userType}.json` });
}

// Test data from config
export const TEST_USERS = testConfig.testUsers;
