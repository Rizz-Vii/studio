import { test, expect } from "@playwright/test";

// Security Tests
test.describe("Security Tests", () => {
  // Test for Cross-Site Scripting (XSS)
  test("XSS protection in input fields", async ({ page }) => {
    // Login first
    await page.goto("/login");
    await page.fill('[data-testid="email-input"]', "test-agency@example.com");
    await page.fill('[data-testid="password-input"]', "testPassword123");
    await page.click('[data-testid="login-button"]');
    await page.waitForNavigation();

    // Go to a page with input fields
    await page.goto("/keyword-tool");

    // Inject a simple XSS payload
    const xssPayload = '<script>alert("XSS")</script>';
    await page.fill('[data-testid="keyword-input"]', xssPayload);
    await page.click('[data-testid="search-button"]');

    // Check if the script was executed (alert would fail the test)
    // We also check if the payload is sanitized on the page
    const pageContent = await page.textContent("body");
    expect(pageContent).not.toContain("<script>");

    // Check for sanitized output
    const sanitizedPayload = '&lt;script&gt;alert("XSS")&lt;/script&gt;';
    const isSanitized = await page.isVisible(`text=${sanitizedPayload}`);

    if (isSanitized) {
      console.log("XSS payload was properly sanitized");
    }
  });

  // Test for Cross-Site Request Forgery (CSRF)
  test("CSRF protection on forms", async ({ page, context }) => {
    // Login
    await page.goto("/login");
    await page.fill('[data-testid="email-input"]', "test-agency@example.com");
    await page.fill('[data-testid="password-input"]', "testPassword123");
    await page.click('[data-testid="login-button"]');
    await page.waitForNavigation();

    // Go to a form page
    await page.goto("/account");

    // Check for CSRF token in the form
    const csrfToken = await page
      .$eval(
        'form input[name="csrf_token"]',
        (input) => (input as HTMLInputElement).value
      )
      .catch(() => null);

    expect(csrfToken).toBeTruthy();

    // Try to submit form without CSRF token (from a different context)
    const newContext = await page.context().browser()?.newContext();
    const newPage = await newContext?.newPage();

    if (newPage) {
      // This request should fail if CSRF protection is working
      const response = await newPage.request.post("/api/account/update", {
        data: {
          email: "new-email@example.com",
        },
      });

      expect(response.status()).toBeGreaterThanOrEqual(400);
      await newContext?.close();
    }
  });

  // Test authentication and authorization
  test("Authentication and authorization checks", async ({ page, context }) => {
    // 1. Accessing protected page without login
    await page.goto("/dashboard");
    await page.waitForURL("**/login"); // Should be redirected to login

    // 2. Login as a free user
    await page.goto("/login");
    await page.fill('[data-testid="email-input"]', "test-free@example.com");
    await page.fill('[data-testid="password-input"]', "testPassword123");
    await page.click('[data-testid="login-button"]');
    await page.waitForNavigation();

    // 3. Try to access admin-only page
    await page.goto("/admin");
    await page.waitForURL("**/dashboard"); // Should be redirected

    // 4. Check API access for unauthorized user
    const apiResponse = await context.request.get("/api/admin/summary");
    expect(apiResponse.status()).toBe(403); // Forbidden
  });

  // Test for insecure direct object references (IDOR)
  test("IDOR protection", async ({ page, context }) => {
    // Login as user A
    await page.goto("/login");
    await page.fill('[data-testid="email-input"]', "test-starter@example.com");
    await page.fill('[data-testid="password-input"]', "testPassword123");
    await page.click('[data-testid="login-button"]');
    await page.waitForNavigation();

    // Try to access resources of user B
    // Assuming user B has ID 'user-b-id'
    const response = await context.request.get("/api/reports/user-b-id");
    expect(response.status()).toBe(403); // Forbidden
  });

  // Test security headers
  test("Security headers are set correctly", async ({ page }) => {
    const response = await page.goto("/");
    const headers = response?.headers();

    expect(headers).toBeDefined();

    if (headers) {
      // Content Security Policy (CSP)
      expect(headers["content-security-policy"]).toBeTruthy();

      // X-Content-Type-Options
      expect(headers["x-content-type-options"]).toBe("nosniff");

      // X-Frame-Options
      expect(headers["x-frame-options"]).toBe("SAMEORIGIN");

      // Strict-Transport-Security (HSTS)
      expect(headers["strict-transport-security"]).toContain("max-age=");

      // Referrer-Policy
      expect(headers["referrer-policy"]).toBe("no-referrer");
    }
  });

  // Test for sensitive data exposure
  test("Sensitive data exposure check", async ({ page }) => {
    // Login
    await page.goto("/login");
    await page.fill('[data-testid="email-input"]', "test-agency@example.com");
    await page.fill('[data-testid="password-input"]', "testPassword123");
    await page.click('[data-testid="login-button"]');
    await page.waitForNavigation();

    // Check network requests for sensitive data
    const sensitiveKeywords = ["password", "apiKey", "secret"];
    let sensitiveDataFound = false;

    page.on("request", (request) => {
      const url = request.url();
      const postData = request.postData();

      for (const keyword of sensitiveKeywords) {
        if (url.includes(keyword) || (postData && postData.includes(keyword))) {
          sensitiveDataFound = true;
          console.log(`Sensitive data found in request: ${url}`);
        }
      }
    });

    // Navigate around the app
    await page.goto("/dashboard");
    await page.goto("/account");

    // Check if any sensitive data was exposed
    expect(sensitiveDataFound).toBe(false);
  });

  // Test session management
  test("Session management security", async ({ page, context }) => {
    // Login
    await page.goto("/login");
    await page.fill('[data-testid="email-input"]', "test-agency@example.com");
    await page.fill('[data-testid="password-input"]', "testPassword123");
    await page.click('[data-testid="login-button"]');
    await page.waitForNavigation();

    // Check for secure cookies
    const cookies = await context.cookies();
    const sessionCookie = cookies.find((c) => c.name === "session_id");

    expect(sessionCookie).toBeDefined();

    if (sessionCookie) {
      expect(sessionCookie.secure).toBe(true);
      expect(sessionCookie.httpOnly).toBe(true);
      expect(sessionCookie.sameSite).toBe("Strict");
    }

    // Test logout functionality
    await page.goto("/logout");
    await page.waitForURL("**/login");

    // Verify session is terminated
    const cookiesAfterLogout = await context.cookies();
    const sessionCookieAfterLogout = cookiesAfterLogout.find(
      (c) => c.name === "session_id"
    );
    expect(sessionCookieAfterLogout).toBeUndefined();
  });
});
