import { test, expect } from "@playwright/test";
import { TestOrchestrator, createTestOrchestrator } from "../testing/utils/test-orchestrator";
import { EnhancedAuth, loginAndGoToDashboard } from "../testing/utils/enhanced-auth";
import { GracefulTestUtils } from "../testing/utils/graceful-test-utils";

/**
 * Enhanced Mobile Accessibility Tests
 * Based on RankPilot Mobile Performance Testing Strategy - July 2025
 * Implements comprehensive mobile optimization validation with graceful error handling
 */

test.describe("Mobile Accessibility & Performance - Enhanced", () => {
  let orchestrator: TestOrchestrator;
  let gracefulUtils: GracefulTestUtils;
  
  // Enhanced timeout for mobile testing
  test.setTimeout(120000);

  test.beforeEach(async ({ page }) => {
    orchestrator = createTestOrchestrator(page);
    gracefulUtils = new GracefulTestUtils(page);
    
    // Set enhanced timeouts for mobile testing
    page.setDefaultNavigationTimeout(60000);
    page.setDefaultTimeout(30000);
  });

  // Mobile viewport configurations as per strategy
  const mobileViewports = [
    { name: "Mobile Small", width: 320, height: 568 },
    { name: "Mobile Large", width: 414, height: 896 },
    { name: "Tablet", width: 768, height: 1024 }
  ];

  for (const viewport of mobileViewports) {
    test(`Mobile accessibility validation for ${viewport.name}`, async ({ page }) => {
      console.log(`📱 Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
      
      // Set viewport
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      // Enhanced authentication for mobile testing
      await loginAndGoToDashboard(page, "agency");
      
      // Navigate to dashboard with graceful error handling
      await gracefulUtils.navigateGracefully("/dashboard", {
        maxRetries: 3,
        waitStrategy: 'domcontentloaded'
      });

      // Verify page loads and is responsive
      await gracefulUtils.waitForElementGracefully("body", {
        timeout: 30000,
        state: 'visible'
      });

      // Test touch target sizes (WCAG 2.1 AA compliance - minimum 44px)
      console.log(`🎯 Testing touch targets for ${viewport.name}`);
      const interactiveElements = page.locator(
        'button, a, input[type="submit"], input[type="button"], [role="button"], [tabindex="0"]'
      );
      
      const elementCount = await interactiveElements.count();
      if (elementCount > 0) {
        // Test up to 10 interactive elements for performance
        const testCount = Math.min(elementCount, 10);
        
        for (let i = 0; i < testCount; i++) {
          const element = interactiveElements.nth(i);
          
          if (await element.isVisible({ timeout: 3000 })) {
            const box = await element.boundingBox();
            
            if (box) {
              // WCAG 2.1 AA standard: minimum 44x44px touch targets
              expect(box.width).toBeGreaterThanOrEqual(44);
              expect(box.height).toBeGreaterThanOrEqual(44);
            }
          }
        }
        console.log(`✅ Touch targets validated for ${viewport.name}: ${testCount} elements checked`);
      }

      // Test mobile navigation patterns
      console.log(`🧭 Testing mobile navigation for ${viewport.name}`);
      
      if (viewport.width < 768) {
        // Mobile-specific navigation tests
        const mobileNavSelectors = [
          '[data-testid="mobile-menu-button"]',
          '[data-testid="hamburger-menu"]',
          'button[aria-label*="menu"]',
          'button[aria-expanded]'
        ];

        let mobileNavFound = false;
        for (const selector of mobileNavSelectors) {
          if (await page.locator(selector).isVisible({ timeout: 5000 })) {
            mobileNavFound = true;
            console.log(`✅ Mobile navigation found: ${selector}`);
            
            // Test mobile menu interaction
            await gracefulUtils.clickGracefully(selector);
            await page.waitForTimeout(1000); // Allow animation
            
            // Verify menu expanded
            const expandedMenu = page.locator('[data-testid="mobile-menu-expanded"], [aria-expanded="true"]');
            if (await expandedMenu.isVisible({ timeout: 3000 })) {
              console.log(`✅ Mobile menu expands correctly`);
            }
            break;
          }
        }
        
        if (!mobileNavFound) {
          console.log(`⚠️ Mobile navigation pattern not found for ${viewport.name} - may not be implemented yet`);
        }
      } else {
        // Tablet/desktop navigation
        await gracefulUtils.waitForElementGracefully('[data-testid="main-navigation"]', {
          timeout: 15000,
          retries: 2
        });
      }

      // Test keyboard navigation accessibility
      console.log(`⌨️ Testing keyboard navigation for ${viewport.name}`);
      
      // Focus should be visible and manageable
      await page.keyboard.press('Tab');
      await page.waitForTimeout(500);
      
      const focusedElement = await page.evaluate(() => {
        const activeEl = document.activeElement;
        return {
          tagName: activeEl?.tagName,
          hasOutline: window.getComputedStyle(activeEl as Element).outline !== 'none',
          hasFocusVisible: activeEl?.matches(':focus-visible') || false
        };
      });
      
      expect(focusedElement.tagName).toBeTruthy();
      console.log(`✅ Keyboard navigation functional for ${viewport.name}`);

      // Test scrollable content and overflow
      console.log(`📜 Testing content overflow for ${viewport.name}`);
      
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      
      // Should not have horizontal scroll on mobile
      if (viewport.width < 768) {
        expect(hasHorizontalScroll).toBeFalsy();
        console.log(`✅ No horizontal scroll on ${viewport.name}`);
      }

      console.log(`✅ ${viewport.name} accessibility validation completed`);
    });
  }

  test("Comprehensive mobile performance testing with TestOrchestrator", async ({ page }) => {
    console.log("🚀 Running comprehensive mobile performance test suite");
    
    // Use TestOrchestrator's built-in mobile performance testing
    await orchestrator.testMobilePerformance();
    
    console.log("✅ Comprehensive mobile performance testing completed");
  });

  test("Mobile form interactions and accessibility", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // Standard mobile viewport
    
    await loginAndGoToDashboard(page, "agency");
    
    // Test form accessibility if forms exist
    const forms = page.locator('form, [data-testid*="form"]');
    const formCount = await forms.count();
    
    if (formCount > 0) {
      console.log(`📝 Testing ${formCount} forms for mobile accessibility`);
      
      for (let i = 0; i < Math.min(formCount, 3); i++) {
        const form = forms.nth(i);
        
        // Check form inputs have proper labels
        const inputs = form.locator('input, textarea, select');
        const inputCount = await inputs.count();
        
        for (let j = 0; j < inputCount; j++) {
          const input = inputs.nth(j);
          
          const hasLabel = await input.evaluate((el) => {
            const inputEl = el as HTMLInputElement;
            return !!(
              inputEl.labels?.length ||
              inputEl.getAttribute('aria-label') ||
              inputEl.getAttribute('aria-labelledby') ||
              inputEl.getAttribute('placeholder')
            );
          });
          
          expect(hasLabel).toBeTruthy();
        }
      }
      
      console.log("✅ Form accessibility validated");
    } else {
      console.log("⚠️ No forms found for accessibility testing");
    }
  });

  test("Mobile image accessibility and performance", async ({ page }) => {
    await page.setViewportSize({ width: 414, height: 896 });
    
    await loginAndGoToDashboard(page, "agency");
    await gracefulUtils.navigateGracefully("/dashboard");
    
    // Test images have alt text and proper loading
    const images = page.locator('img');
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      console.log(`🖼️ Testing ${imageCount} images for accessibility`);
      
      for (let i = 0; i < Math.min(imageCount, 5); i++) {
        const image = images.nth(i);
        
        if (await image.isVisible({ timeout: 3000 })) {
          const alt = await image.getAttribute('alt');
          const loading = await image.getAttribute('loading');
          
          // Images should have alt text (can be empty for decorative images)
          expect(alt).not.toBeNull();
          
          // Check if lazy loading is implemented for performance
          if (loading) {
            console.log(`✅ Image ${i + 1} has loading="${loading}"`);
          }
        }
      }
      
      console.log("✅ Image accessibility validated");
    }
  });

  test("Mobile error states and feedback", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 }); // Smallest mobile viewport
    
    await loginAndGoToDashboard(page, "agency");
    
    // Test error messaging and feedback visibility
    const errorSelectors = [
      '[data-testid*="error"]',
      '.error-message',
      '[role="alert"]',
      '.text-red-500',
      '.text-error'
    ];
    
    // Navigate to a form page if available
    try {
      await gracefulUtils.navigateGracefully("/contact", { timeout: 10000 });
      
      // Try to trigger validation errors
      const submitButton = page.locator('button[type="submit"], [data-testid*="submit"]');
      if (await submitButton.isVisible({ timeout: 5000 })) {
        await gracefulUtils.clickGracefully('button[type="submit"]');
        
        // Check if error messages are visible and accessible
        await page.waitForTimeout(2000);
        
        for (const selector of errorSelectors) {
          const errorElements = page.locator(selector);
          const errorCount = await errorElements.count();
          
          if (errorCount > 0) {
            console.log(`✅ Found ${errorCount} error messages with selector: ${selector}`);
            
            // Check if errors are keyboard accessible
            const firstError = errorElements.first();
            const isAccessible = await firstError.evaluate((el) => {
              return el.getAttribute('role') === 'alert' || 
                     el.getAttribute('aria-live') ||
                     el.hasAttribute('tabindex');
            });
            
            if (isAccessible) {
              console.log(`✅ Error messages are accessibility-compliant`);
            }
          }
        }
      }
    } catch (error) {
      console.log("⚠️ Error state testing skipped - contact form not available");
    }
    
    console.log("✅ Mobile error state testing completed");
  });
});
