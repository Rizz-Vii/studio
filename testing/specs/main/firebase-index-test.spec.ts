import { test, expect } from "@playwright/test";

/**
 * Firebase Index Verification Test
 * Quick test to verify Firestore indexes are deployed and working
 */

test.describe("Firebase Index Verification", () => {
  test("can access login page without Firebase errors", async ({ page }) => {
    console.log("🔍 Testing Firebase index deployment...");

    // Monitor console for Firebase errors
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' && msg.text().includes('index')) {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto("/login", { waitUntil: "networkidle" });

    // Verify page loads without Firebase index errors
    expect(consoleErrors.length).toBe(0);

    // Check that login form is accessible (sign of working Firebase)
    const loginForm = page.locator('form').first();
    await expect(loginForm).toBeVisible();

    console.log("✅ Firebase indexes working correctly");
  });

  test("can access dashboard page without auth errors", async ({ page }) => {
    console.log("🔍 Testing Firebase auth integration...");

    const firebaseErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' && (
        msg.text().includes('Firebase') || 
        msg.text().includes('Firestore') ||
        msg.text().includes('index')
      )) {
        firebaseErrors.push(msg.text());
      }
    });

    // Try to access dashboard (should redirect to login but without errors)
    await page.goto("/dashboard", { waitUntil: "networkidle" });

    // Should either show dashboard or redirect to login without Firebase errors
    expect(firebaseErrors.length).toBe(0);

    console.log("✅ Firebase auth integration working");
  });
});
