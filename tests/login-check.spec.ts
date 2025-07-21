import { test, expect } from "@playwright/test";

test.describe("Login Page Check", () => {
  // Increase timeout
  test.setTimeout(120000);

  test("login page structure", async ({ page }) => {
    console.log("Navigating to login page...");
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    console.log("Taking screenshot of login page");
    await page.screenshot({ path: "test-results/login-page.png" });

    // Log all input elements to see what's available
    const inputElements = await page.locator("input").all();
    console.log(`Found ${inputElements.length} input elements`);

    for (let i = 0; i < inputElements.length; i++) {
      const element = inputElements[i];
      const id = await element.getAttribute("id");
      const type = await element.getAttribute("type");
      const name = await element.getAttribute("name");

      console.log(`Input ${i + 1}: id=${id}, type=${type}, name=${name}`);
    }

    // Log all buttons
    const buttons = await page.locator("button").all();
    console.log(`Found ${buttons.length} button elements`);

    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      const text = await button.textContent();
      const type = await button.getAttribute("type");

      console.log(`Button ${i + 1}: text=${text?.trim()}, type=${type}`);
    }
  });
});
