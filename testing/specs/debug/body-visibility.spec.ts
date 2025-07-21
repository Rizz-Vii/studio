import { test, expect } from "@playwright/test";

test.describe("Simple Health Check", () => {
  test("body visibility debug test", async ({ page }) => {
    console.log("🏠 Starting simple body visibility test...");
    
    try {
      // Simple navigation
      console.log("🌐 Navigating to homepage...");
      await page.goto("/", { waitUntil: 'domcontentloaded', timeout: 30000 });
      
      console.log("📍 Current URL:", page.url());
      
      // Wait for DOM to be ready
      await page.waitForLoadState('domcontentloaded');
      console.log("✅ DOM content loaded");
      
      // Check basic HTML structure
      const htmlCount = await page.locator("html").count();
      const bodyCount = await page.locator("body").count();
      console.log(`📊 HTML elements: ${htmlCount}, BODY elements: ${bodyCount}`);
      
      // Get detailed body information
      const bodyInfo = await page.evaluate(() => {
        const body = document.body;
        const html = document.documentElement;
        const styles = window.getComputedStyle(body);
        
        return {
          bodyExists: !!body,
          bodyTagName: body ? body.tagName : 'none',
          bodyClasses: body ? body.className : 'none',
          bodyId: body ? body.id : 'none',
          visibility: styles.visibility,
          display: styles.display,
          opacity: styles.opacity,
          height: body ? body.offsetHeight : 0,
          width: body ? body.offsetWidth : 0,
          scrollHeight: body ? body.scrollHeight : 0,
          childrenCount: body ? body.children.length : 0,
          innerHTML: body ? body.innerHTML.substring(0, 200) + '...' : 'none',
          readyState: document.readyState,
          htmlClasses: html ? html.className : 'none',
        };
      });
      
      console.log("📊 Detailed body info:", bodyInfo);
      
      // Try waiting for display to change from none
      if (bodyInfo.display === 'none') {
        console.log("⚠️ Body display is 'none', waiting for it to show...");
        
        // Wait for body display to change from none
        await page.waitForFunction(
          () => {
            const body = document.body;
            const styles = window.getComputedStyle(body);
            return styles.display !== 'none';
          },
          { timeout: 30000 }
        );
        
        console.log("✅ Body display changed from 'none'!");
      }
      
      // Also wait for visibility if needed
      if (bodyInfo.visibility === 'hidden') {
        console.log("⚠️ Body is hidden, waiting for it to become visible...");
        
        // Wait for body to become visible
        await page.waitForFunction(
          () => {
            const body = document.body;
            const styles = window.getComputedStyle(body);
            return styles.visibility === 'visible';
          },
          { timeout: 30000 }
        );
        
        console.log("✅ Body became visible!");
      }
      
      // Now check visibility
      await expect(page.locator("body")).toBeVisible({ timeout: 5000 });
      
      console.log("✅ Body visibility test passed!");
      
    } catch (error) {
      console.error("❌ Test failed:", error);
      
      // Take screenshot for debugging
      await page.screenshot({ 
        path: "test-results/body-visibility-debug.png", 
        fullPage: true 
      });
      
      throw error;
    }
  });
});
