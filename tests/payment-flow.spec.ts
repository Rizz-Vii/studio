import { test, expect, Page } from "@playwright/test";

// Test data
const testPlans = {
  starter: { name: "Starter", price: "29", yearlyPrice: "290" },
  professional: { name: "Professional", price: "79", yearlyPrice: "790" },
  enterprise: { name: "Enterprise", price: "199", yearlyPrice: "1990" },
};

const testUser = {
  email: "test@example.com",
  password: "TestPassword123!",
  name: "Test User",
};

// Helper functions
async function loginUser(page: Page) {
  await page.goto("/login");
  await page.fill('[data-testid="email-input"]', testUser.email);
  await page.fill('[data-testid="password-input"]', testUser.password);
  await page.click('[data-testid="login-button"]');
  await page.waitForURL("/dashboard");
}

async function navigateToPricing(page: Page) {
  await page.goto("/pricing");
  await expect(page.locator("h1")).toContainText("Choose Your Plan");
}

async function selectPlan(page: Page, plan: keyof typeof testPlans) {
  const planCard = page.locator(`[data-testid="plan-${plan}"]`);
  await expect(planCard).toBeVisible();
  await planCard.locator('[data-testid="select-plan-button"]').click();
}

async function selectBillingCycle(page: Page, cycle: "monthly" | "yearly") {
  await page.click(`[data-testid="billing-${cycle}"]`);
}

// Payment Flow Tests
test.describe("Payment Flow - Complete Journey", () => {
  test.beforeEach(async ({ page }) => {
    // Mock Stripe and PayPal for testing
    await page.route("**/api/stripe/create-checkout-session", (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ sessionId: "test_session_123" }),
      });
    });

    await page.route("**/api/paypal/create-order", (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ orderID: "test_order_123" }),
      });
    });
  });

  test("should complete full payment flow with Stripe", async ({ page }) => {
    // Step 1: Navigate to pricing
    await navigateToPricing(page);

    // Step 2: Select Professional plan
    await selectPlan(page, "professional");

    // Step 3: Verify checkout page loads
    await expect(page).toHaveURL(/.*checkout.*plan=professional/);
    await expect(page.locator("h1")).toContainText(
      "Complete Your Subscription"
    );

    // Step 4: Verify plan details
    await expect(page.locator('[data-testid="plan-name"]')).toContainText(
      "Professional"
    );
    await expect(page.locator('[data-testid="plan-price"]')).toContainText(
      "$79"
    );

    // Step 5: Select Stripe payment method
    await page.click('[data-testid="payment-method-stripe"]');
    await expect(
      page.locator('[data-testid="payment-method-stripe"]')
    ).toHaveClass(/selected/);

    // Step 6: Click pay button
    await page.click('[data-testid="pay-button"]');

    // Step 7: Verify redirect to success page
    await page.waitForURL(/.*payment-success/);
    await expect(page.locator("h1")).toContainText("Payment Successful");
  });

  test("should complete payment flow with PayPal", async ({ page }) => {
    await navigateToPricing(page);
    await selectPlan(page, "professional");

    // Select PayPal payment method
    await page.click('[data-testid="payment-method-paypal"]');
    await expect(
      page.locator('[data-testid="payment-method-paypal"]')
    ).toHaveClass(/selected/);

    // Mock PayPal approval
    await page.click('[data-testid="paypal-button"]');
    await page.waitForURL(/.*payment-success/);
    await expect(page.locator("h1")).toContainText("Payment Successful");
  });

  test("should handle yearly billing discount calculation", async ({
    page,
  }) => {
    await navigateToPricing(page);
    await selectBillingCycle(page, "yearly");
    await selectPlan(page, "professional");

    // Verify yearly pricing and savings display
    const savingsAmount = 79 * 12 - 790; // Monthly * 12 - Yearly
    await expect(page.locator('[data-testid="savings-amount"]')).toContainText(
      `Save $${savingsAmount}`
    );
    await expect(page.locator('[data-testid="plan-price"]')).toContainText(
      "$790"
    );
  });

  test("should require authentication for checkout", async ({ page }) => {
    await navigateToPricing(page);
    await selectPlan(page, "professional");

    // Should redirect to login if not authenticated
    await expect(page).toHaveURL(/.*login.*redirect=/);
  });

  test("should validate plan selection and pricing", async ({ page }) => {
    await navigateToPricing(page);

    // Test each plan
    for (const [planKey, planData] of Object.entries(testPlans)) {
      await selectPlan(page, planKey as keyof typeof testPlans);
      await expect(page.locator('[data-testid="plan-name"]')).toContainText(
        planData.name
      );
      await expect(page.locator('[data-testid="plan-price"]')).toContainText(
        `$${planData.price}`
      );
      await page.goBack();
    }
  });
});

// Subscription Management Tests
test.describe("Subscription Management", () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page);
  });

  test("should display current subscription in billing settings", async ({
    page,
  }) => {
    await page.goto("/profile?tab=billing");

    // Verify billing tab is active
    await expect(page.locator('[data-testid="billing-tab"]')).toHaveClass(
      /active/
    );

    // Check subscription status
    await expect(
      page.locator('[data-testid="subscription-status"]')
    ).toBeVisible();
    await expect(page.locator('[data-testid="current-plan"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="next-billing-date"]')
    ).toBeVisible();
  });

  test("should allow plan upgrade", async ({ page }) => {
    await page.goto("/profile?tab=billing");

    // Click upgrade button
    await page.click('[data-testid="upgrade-plan-button"]');

    // Should navigate to pricing with upgrade context
    await expect(page).toHaveURL(/.*pricing.*upgrade=true/);
  });

  test("should allow plan downgrade", async ({ page }) => {
    await page.goto("/profile?tab=billing");

    // Click downgrade button
    await page.click('[data-testid="downgrade-plan-button"]');

    // Should show downgrade confirmation modal
    await expect(page.locator('[data-testid="downgrade-modal"]')).toBeVisible();

    // Confirm downgrade
    await page.click('[data-testid="confirm-downgrade"]');

    // Should show success message
    await expect(page.locator('[data-testid="success-message"]')).toContainText(
      "Plan downgraded"
    );
  });

  test("should display payment method and allow updates", async ({ page }) => {
    await page.goto("/profile?tab=billing");

    // Check payment method display
    await expect(page.locator('[data-testid="payment-method"]')).toBeVisible();

    // Click update payment method
    await page.click('[data-testid="update-payment-method"]');

    // Should redirect to customer portal
    await expect(page).toHaveURL(/.*customer-portal/);
  });

  test("should allow subscription cancellation", async ({ page }) => {
    await page.goto("/profile?tab=billing");

    // Click cancel subscription
    await page.click('[data-testid="cancel-subscription"]');

    // Should show cancellation modal with confirmation
    await expect(page.locator('[data-testid="cancel-modal"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="cancel-confirmation"]')
    ).toContainText("cancel your subscription");

    // Confirm cancellation
    await page.fill(
      '[data-testid="cancel-reason"]',
      "Testing cancellation flow"
    );
    await page.click('[data-testid="confirm-cancel"]');

    // Should show cancellation success
    await expect(page.locator('[data-testid="cancel-success"]')).toContainText(
      "Subscription cancelled"
    );
  });
});

// Invoice and Billing Tests
test.describe("Invoice and Billing", () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page);
  });

  test("should display invoice history", async ({ page }) => {
    await page.goto("/profile?tab=billing");

    // Check invoice history section
    await expect(page.locator('[data-testid="invoice-history"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="invoice-item"]').first()
    ).toBeVisible();
  });

  test("should allow invoice download", async ({ page }) => {
    await page.goto("/profile?tab=billing");

    // Mock the download
    const downloadPromise = page.waitForEvent("download");
    await page.click('[data-testid="download-invoice"].first()');
    const download = await downloadPromise;

    // Verify download
    expect(download.suggestedFilename()).toMatch(/invoice.*\.pdf/);
  });

  test("should display usage statistics", async ({ page }) => {
    await page.goto("/profile?tab=billing");

    // Check usage section
    await expect(page.locator('[data-testid="usage-stats"]')).toBeVisible();
    await expect(page.locator('[data-testid="usage-progress"]')).toBeVisible();
    await expect(page.locator('[data-testid="usage-limit"]')).toBeVisible();
  });
});

// Error Handling Tests
test.describe("Error Handling", () => {
  test("should handle payment failures gracefully", async ({ page }) => {
    // Mock payment failure
    await page.route("**/api/stripe/create-checkout-session", (route) => {
      route.fulfill({
        status: 400,
        body: JSON.stringify({ error: "Payment failed" }),
      });
    });

    await navigateToPricing(page);
    await selectPlan(page, "professional");
    await page.click('[data-testid="payment-method-stripe"]');
    await page.click('[data-testid="pay-button"]');

    // Should show error message
    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      "Payment failed"
    );
  });

  test("should handle network errors", async ({ page }) => {
    // Mock network failure
    await page.route("**/api/**", (route) => route.abort());

    await navigateToPricing(page);
    await selectPlan(page, "professional");

    // Should show network error
    await expect(page.locator('[data-testid="network-error"]')).toBeVisible();
  });

  test("should validate required fields", async ({ page }) => {
    await page.goto("/checkout?plan=professional");

    // Try to submit without selecting payment method
    await page.click('[data-testid="pay-button"]');

    // Should show validation error
    await expect(
      page.locator('[data-testid="validation-error"]')
    ).toContainText("payment method");
  });
});

// Analytics and Tracking Tests
test.describe("Analytics Tracking", () => {
  test("should track pricing page views", async ({ page }) => {
    // Mock analytics
    let analyticsEvents: any[] = [];
    await page.route("**/analytics/**", (route) => {
      analyticsEvents.push(route.request().postDataJSON());
      route.fulfill({ status: 200, body: "{}" });
    });

    await navigateToPricing(page);

    // Verify analytics event was tracked
    expect(
      analyticsEvents.some((event) => event.eventName === "view_pricing")
    ).toBeTruthy();
  });

  test("should track checkout initiation", async ({ page }) => {
    let analyticsEvents: any[] = [];
    await page.route("**/analytics/**", (route) => {
      analyticsEvents.push(route.request().postDataJSON());
      route.fulfill({ status: 200, body: "{}" });
    });

    await navigateToPricing(page);
    await selectPlan(page, "professional");

    // Verify checkout tracking
    expect(
      analyticsEvents.some((event) => event.eventName === "begin_checkout")
    ).toBeTruthy();
  });

  test("should track successful purchases", async ({ page }) => {
    let analyticsEvents: any[] = [];
    await page.route("**/analytics/**", (route) => {
      analyticsEvents.push(route.request().postDataJSON());
      route.fulfill({ status: 200, body: "{}" });
    });

    await navigateToPricing(page);
    await selectPlan(page, "professional");
    await page.click('[data-testid="payment-method-stripe"]');
    await page.click('[data-testid="pay-button"]');

    // Verify purchase tracking
    expect(
      analyticsEvents.some((event) => event.eventName === "purchase")
    ).toBeTruthy();
  });
});

// Mobile Responsiveness Tests
test.describe("Mobile Payment Flow", () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test("should work on mobile devices", async ({ page }) => {
    await navigateToPricing(page);

    // Verify mobile layout
    await expect(page.locator('[data-testid="mobile-pricing"]')).toBeVisible();

    await selectPlan(page, "professional");

    // Should work on mobile checkout
    await expect(page.locator('[data-testid="mobile-checkout"]')).toBeVisible();
    await expect(page.locator('[data-testid="pay-button"]')).toBeVisible();
  });
});

// Performance Tests
test.describe("Performance", () => {
  test("should load pricing page quickly", async ({ page }) => {
    const startTime = Date.now();
    await page.goto("/pricing");
    await page.waitForLoadState("networkidle");
    const loadTime = Date.now() - startTime;

    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test("should handle concurrent checkout requests", async ({ browser }) => {
    const promises = [];

    // Create multiple checkout sessions concurrently
    for (let i = 0; i < 5; i++) {
      const context = await browser.newContext();
      const page = await context.newPage();
      promises.push(
        page.goto("/checkout?plan=professional").then(() => page.close())
      );
    }

    // All should complete successfully
    await Promise.all(promises);
  });
});
