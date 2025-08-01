import { test, expect } from "@playwright/test";

test.describe("Debug Mobile Navigation", () => {
    test("capture mobile navigation elements", async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });

        // Go to homepage
        await page.goto("/", { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(3000); // Wait for React hydration

        // Take screenshot
        await page.screenshot({ path: "debug-mobile-nav.png", fullPage: true });

        // Log all buttons on the page
        const buttons = await page.locator("button").all();
        console.log(`Found ${buttons.length} buttons on the page`);

        for (let i = 0; i < buttons.length; i++) {
            const button = buttons[i];
            const testId = await button.getAttribute("data-testid");
            const ariaLabel = await button.getAttribute("aria-label");
            const text = await button.textContent();
            const isVisible = await button.isVisible();

            console.log(`Button ${i}: testid="${testId}", aria-label="${ariaLabel}", text="${text}", visible=${isVisible}`);
        }

        // Specifically look for mobile menu button
        const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]');
        const count = await mobileMenuButton.count();
        console.log(`Mobile menu button count: ${count}`);

        if (count > 0) {
            const isVisible = await mobileMenuButton.isVisible();
            const isHidden = await mobileMenuButton.isHidden();
            console.log(`Mobile menu button visible: ${isVisible}, hidden: ${isHidden}`);
        }
    });
});
