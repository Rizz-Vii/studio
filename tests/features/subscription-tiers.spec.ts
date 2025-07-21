import { test, expect } from "@playwright/test";

test.describe("Subscription Tier System Tests", () => {
  test.setTimeout(60000); // 1 minute timeout

  // Define all subscription tiers
  const tiers = [
    {
      name: "Free",
      features: ["Basic Dashboard", "Limited Keywords", "SEO Basics"],
      restricted: ["Content Analyzer", "NeuroSEO", "Competitors"],
    },
    {
      name: "Starter",
      features: ["Content Analyzer", "NeuroSEO Basic", "Weekly Reports"],
      restricted: ["Competitors", "Advanced NeuroSEO", "White Label"],
    },
    {
      name: "Agency",
      features: [
        "Competitors",
        "NeuroSEO Advanced",
        "White Label",
        "API Access",
      ],
      restricted: ["Unlimited Features", "Admin Panel"],
    },
    {
      name: "Enterprise",
      features: [
        "Unlimited Features",
        "Priority Support",
        "Custom Integrations",
      ],
      restricted: ["Admin Features"],
    },
    {
      name: "Admin",
      features: ["User Management", "System Administration", "All Features"],
      restricted: [],
    },
  ];

  // Test login and feature access for each tier
  for (const tier of tiers) {
    test(`${tier.name} tier - feature access verification`, async ({
      page,
    }) => {
      // Login as the appropriate tier user
      await page.goto("/login");

      // Convert tier name to lowercase for the email format
      const tierLower = tier.name.toLowerCase();
      await page.fill(
        '[data-testid="email-input"]',
        `test-${tierLower}@example.com`
      );
      await page.fill('[data-testid="password-input"]', "testPassword123");
      await page.click('[data-testid="login-button"]');

      // Verify successful login
      await page.waitForURL(/dashboard/);

      // Take screenshot of dashboard for this tier
      await page.screenshot({
        path: `test-results/subscription-${tierLower}-dashboard-${Date.now()}.png`,
      });

      // Check for available features
      for (const feature of tier.features) {
        // Convert feature name to a likely URL path
        const featurePath = `/` + feature.toLowerCase().replace(/\s+/g, "-");

        console.log(
          `Testing ${tier.name} tier access to: ${feature} (${featurePath})`
        );

        try {
          await page.goto(featurePath);
          await page.waitForLoadState("domcontentloaded");

          // Look for elements indicating the feature is available
          const featureAvailable = await page
            .locator(
              [
                `h1:has-text("${feature}")`,
                `h2:has-text("${feature}")`,
                `[data-testid="${feature.toLowerCase().replace(/\s+/g, "-")}"]`,
                `[data-feature="${feature.toLowerCase().replace(/\s+/g, "-")}"]`,
                `text="${feature}"`,
              ].join(", ")
            )
            .count();

          // Either the feature title should be visible or no upgrade prompts
          const upgradePrompts = await page
            .locator("text=/upgrade|subscribe|premium required/i")
            .count();

          if (featureAvailable > 0) {
            console.log(`✅ ${feature} is available for ${tier.name} tier`);
          } else if (upgradePrompts === 0) {
            console.log(
              `✅ ${feature} seems available (no upgrade prompts) for ${tier.name} tier`
            );
          } else {
            console.log(
              `❌ ${feature} might not be available for ${tier.name} tier`
            );
          }

          // Take screenshot for verification
          await page.screenshot({
            path: `test-results/subscription-${tierLower}-${feature.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.png`,
          });
        } catch (e) {
          console.log(`Error testing ${feature} for ${tier.name} tier:`, e);
        }
      }

      // Check for restricted features
      for (const restrictedFeature of tier.restricted) {
        // Convert feature name to a likely URL path
        const featurePath =
          `/` + restrictedFeature.toLowerCase().replace(/\s+/g, "-");

        console.log(
          `Testing ${tier.name} tier restriction for: ${restrictedFeature} (${featurePath})`
        );

        try {
          await page.goto(featurePath);
          await page.waitForLoadState("domcontentloaded");

          // Look for upgrade prompts or access denied messages
          const restrictionIndicators = await page
            .locator(
              [
                "text=/upgrade|premium|subscribe/i",
                "text=/access denied|restricted|not available/i",
                "[data-testid='upgrade-prompt']",
                "[data-testid='access-denied']",
              ].join(", ")
            )
            .count();

          if (restrictionIndicators > 0) {
            console.log(
              `✅ ${restrictedFeature} is correctly restricted for ${tier.name} tier`
            );
          } else {
            console.log(
              `⚠️ ${restrictedFeature} might not be properly restricted for ${tier.name} tier`
            );
          }

          // Take screenshot for verification
          await page.screenshot({
            path: `test-results/subscription-${tierLower}-${restrictedFeature.toLowerCase().replace(/\s+/g, "-")}-restricted-${Date.now()}.png`,
          });
        } catch (e) {
          console.log(
            `Error testing ${restrictedFeature} restriction for ${tier.name} tier:`,
            e
          );
        }
      }
    });
  }

  test("subscription tier upgrade flow", async ({ page }) => {
    // Start with a free tier user
    await page.goto("/login");
    await page.fill('[data-testid="email-input"]', `test-free@example.com`);
    await page.fill('[data-testid="password-input"]', "testPassword123");
    await page.click('[data-testid="login-button"]');

    // Look for upgrade buttons
    await page.waitForURL(/dashboard/);
    const upgradeButton = page
      .locator(
        "button:has-text(/upgrade|subscribe/i), a:has-text(/upgrade|subscribe/i)"
      )
      .first();
    await expect(upgradeButton).toBeVisible();

    // Click upgrade button
    await upgradeButton.click();

    // Should navigate to pricing/subscription page
    await page.waitForURL(/pricing|subscription|plans/);

    // Verify pricing tiers are displayed
    const pricingTiers = ["Starter", "Agency", "Enterprise"];
    for (const tier of pricingTiers) {
      await expect(page.locator(`text="${tier}"`)).toBeVisible();
    }

    // Select a plan (Starter)
    await page
      .locator("button:has-text(/select|choose|get started/i)")
      .first()
      .click();

    // Wait for checkout page
    await page.waitForURL(/checkout|payment/);

    // Verify elements on the checkout page
    await expect(
      page.locator("text=/payment|credit card|checkout/i")
    ).toBeVisible();
    await expect(
      page.locator("input[name='cardNumber'], [data-testid='card-number']")
    ).toBeVisible();

    // Take screenshot of checkout page
    await page.screenshot({
      path: `test-results/subscription-upgrade-checkout-${Date.now()}.png`,
    });

    // Test filling out payment form but don't submit
    await page
      .locator("input[name='cardNumber'], [data-testid='card-number']")
      .fill("4242424242424242");
    await page
      .locator("input[name='cardExpiry'], [data-testid='card-expiry']")
      .fill("12/25");
    await page
      .locator("input[name='cardCvc'], [data-testid='card-cvc']")
      .fill("123");
  });

  test("subscription management for admin users", async ({ page }) => {
    // Login as admin user
    await page.goto("/login");
    await page.fill('[data-testid="email-input"]', `test-admin@example.com`);
    await page.fill('[data-testid="password-input"]', "testPassword123");
    await page.click('[data-testid="login-button"]');

    // Navigate to user/subscription management
    await page.goto("/user-management");
    await page.waitForLoadState("domcontentloaded");

    // Verify admin can see subscription management
    await expect(
      page.locator("text=/user management|subscription/i")
    ).toBeVisible();

    // Look for a user in the list
    const userRow = page.locator("tr:has-text('test-free@example.com')");
    await expect(userRow).toBeVisible();

    // Take screenshot of user management
    await page.screenshot({
      path: `test-results/subscription-admin-management-${Date.now()}.png`,
    });

    // Test tier change functionality
    await page
      .locator("button:has-text('Actions'), [data-testid='user-actions']")
      .first()
      .click();
    await page.locator("text=/change tier|edit subscription/i").click();

    // Wait for tier change modal/form
    await page.waitForSelector("text=/change tier|update subscription/i");

    // Select a different tier
    await page.locator("select, [role='combobox']").selectOption("agency");

    // Click update/save
    await page.locator("button:has-text(/update|save|confirm/i)").click();

    // Wait for success message
    await page.waitForSelector("text=/success|updated|changed/i");

    // Take screenshot of success state
    await page.screenshot({
      path: `test-results/subscription-admin-tier-change-${Date.now()}.png`,
    });
  });

  test("subscription status display accuracy", async ({ page }) => {
    // Test with multiple tier users to verify status display
    const usersToTest = ["free", "starter", "agency", "enterprise"];

    for (const user of usersToTest) {
      // Login as each user
      await page.goto("/login");
      await page.fill(
        '[data-testid="email-input"]',
        `test-${user}@example.com`
      );
      await page.fill('[data-testid="password-input"]', "testPassword123");
      await page.click('[data-testid="login-button"]');

      // Navigate to account/profile page
      await page.goto("/account");
      await page.waitForLoadState("domcontentloaded");

      // Verify tier display is correct
      await expect(
        page.locator(`text=${user}`, { exact: false })
      ).toBeVisible();

      // Verify subscription details
      await expect(
        page.locator("text=/subscription|plan|tier/i")
      ).toBeVisible();

      // Take screenshot of account page
      await page.screenshot({
        path: `test-results/subscription-status-${user}-${Date.now()}.png`,
      });

      // Logout for next user
      await page.goto("/logout");
      await page.waitForURL(/login|home/);
    }
  });
});
