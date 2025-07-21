import { test, expect } from "@playwright/test";

test.describe("Connectivity Debug", () => {
  test("check if localhost:3000 is accessible", async ({ page }) => {
    console.log("🌐 Testing connectivity to localhost:3000...");
    
    try {
      const response = await page.goto("http://localhost:3000", { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      console.log(`📊 Response status: ${response?.status()}`);
      console.log(`📍 Final URL: ${page.url()}`);
      
      const title = await page.title();
      console.log(`📄 Page title: ${title}`);
      
      const bodyContent = await page.locator("body").textContent();
      console.log(`📝 Body content length: ${bodyContent?.length || 0} characters`);
      
      if (bodyContent && bodyContent.length > 0) {
        console.log(`📝 First 200 chars: ${bodyContent.substring(0, 200)}...`);
      }
      
      // Check for basic HTML elements
      const hasHtml = await page.locator("html").count();
      const hasBody = await page.locator("body").count();
      const hasHeader = await page.locator("header").count();
      const hasNav = await page.locator("nav").count();
      
      console.log(`🔍 Element counts - HTML: ${hasHtml}, BODY: ${hasBody}, HEADER: ${hasHeader}, NAV: ${hasNav}`);
      
      // Take screenshot for inspection
      await page.screenshot({ path: "test-results/connectivity-debug.png", fullPage: true });
      
      expect(response?.status()).toBe(200);
      expect(hasBody).toBeGreaterThan(0);
      
    } catch (error) {
      console.error("❌ Connectivity test failed:", error);
      
      // Try to get more debug info
      try {
        const currentUrl = page.url();
        console.log(`📍 Current URL at error: ${currentUrl}`);
        await page.screenshot({ path: "test-results/connectivity-error.png", fullPage: true });
      } catch (debugError) {
        console.error("❌ Could not capture debug info:", debugError);
      }
      
      throw error;
    }
  });
});
