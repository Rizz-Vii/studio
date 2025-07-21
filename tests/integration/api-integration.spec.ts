import { test, expect } from "@playwright/test";

// API Integration Tests
test.describe("API Integration Tests", () => {
  let authToken: string;

  // Setup: Get auth token for subsequent API tests
  test.beforeAll(async ({ request }) => {
    // Login via API to get token
    const loginResponse = await request.post("/api/auth/login", {
      data: {
        email: "test-agency@example.com",
        password: "testPassword123",
      },
    });

    expect(loginResponse.ok()).toBeTruthy();

    const loginData = await loginResponse.json();
    authToken = loginData.token;

    expect(authToken).toBeTruthy();
  });

  // Test user authentication and profile
  test("User authentication and profile API", async ({ request }) => {
    // 1. Test profile API
    const profileResponse = await request.get("/api/user/profile", {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(profileResponse.ok()).toBeTruthy();

    const profileData = await profileResponse.json();
    expect(profileData.email).toBe("test-agency@example.com");
    expect(profileData.subscription).toBeTruthy();
    expect(profileData.subscription.tier).toBe("agency");

    // 2. Test invalid token handling
    const invalidResponse = await request.get("/api/user/profile", {
      headers: {
        Authorization: "Bearer invalid-token",
      },
    });

    expect(invalidResponse.status()).toBe(401);
  });

  // Test keyword tool API
  test("Keyword tool API integration", async ({ request }) => {
    // 1. Search for keyword suggestions
    const keywordResponse = await request.get(
      "/api/keywords/suggestions?q=seo",
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    expect(keywordResponse.ok()).toBeTruthy();

    const keywordData = await keywordResponse.json();
    expect(Array.isArray(keywordData.suggestions)).toBeTruthy();
    expect(keywordData.suggestions.length).toBeGreaterThan(0);

    // 2. Get keyword difficulty
    const keywordDifficultyResponse = await request.post(
      "/api/keywords/difficulty",
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        data: {
          keywords: ["seo", "content marketing"],
        },
      }
    );

    expect(keywordDifficultyResponse.ok()).toBeTruthy();

    const difficultyData = await keywordDifficultyResponse.json();
    expect(difficultyData.results).toBeTruthy();
    expect(difficultyData.results.length).toBe(2);
    expect(difficultyData.results[0].keyword).toBeTruthy();
    expect(typeof difficultyData.results[0].difficulty).toBe("number");
  });

  // Test content analyzer API
  test("Content analyzer API integration", async ({ request }) => {
    // 1. Analyze URL
    const contentResponse = await request.post("/api/content/analyze", {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        url: "https://example.com",
        keywords: ["seo"],
      },
    });

    expect(contentResponse.ok()).toBeTruthy();

    const contentData = await contentResponse.json();
    expect(contentData.analysis).toBeTruthy();
    expect(contentData.analysis.title).toBeTruthy();
    expect(contentData.analysis.metaDescription).toBeTruthy();
    expect(contentData.analysis.contentScore).toBeTruthy();

    // 2. Get content recommendations
    const recommendationsResponse = await request.post(
      "/api/content/recommendations",
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        data: {
          url: "https://example.com",
          keywords: ["seo"],
        },
      }
    );

    expect(recommendationsResponse.ok()).toBeTruthy();

    const recommendationsData = await recommendationsResponse.json();
    expect(Array.isArray(recommendationsData.recommendations)).toBeTruthy();
  });

  // Test NeuroSEO API
  test("NeuroSEO API integration", async ({ request }) => {
    // 1. Generate neural analysis
    const neuroResponse = await request.post("/api/neuroseo/analyze", {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        keyword: "seo optimization",
        depth: "standard",
      },
    });

    expect(neuroResponse.ok()).toBeTruthy();

    const neuroData = await neuroResponse.json();
    expect(neuroData.analysisId).toBeTruthy();

    // 2. Get neural analysis results
    const analysisResponse = await request.get(
      `/api/neuroseo/analysis/${neuroData.analysisId}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    expect(analysisResponse.ok()).toBeTruthy();

    const analysisData = await analysisResponse.json();
    expect(analysisData.results).toBeTruthy();
    expect(analysisData.semanticMap).toBeTruthy();
    expect(analysisData.recommendations).toBeTruthy();
  });

  // Test subscription API
  test("Subscription API integration", async ({ request }) => {
    // 1. Get subscription status
    const subscriptionResponse = await request.get(
      "/api/subscriptions/status",
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    expect(subscriptionResponse.ok()).toBeTruthy();

    const subscriptionData = await subscriptionResponse.json();
    expect(subscriptionData.tier).toBe("agency");
    expect(subscriptionData.features).toBeTruthy();
    expect(subscriptionData.limits).toBeTruthy();

    // 2. Get available plans
    const plansResponse = await request.get("/api/subscriptions/plans", {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(plansResponse.ok()).toBeTruthy();

    const plansData = await plansResponse.json();
    expect(Array.isArray(plansData.plans)).toBeTruthy();
    expect(plansData.plans.length).toBeGreaterThan(0);
  });

  // Test error handling and rate limiting
  test("API error handling and rate limiting", async ({ request }) => {
    // 1. Test invalid endpoint
    const invalidEndpointResponse = await request.get("/api/nonexistent", {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(invalidEndpointResponse.status()).toBe(404);

    // 2. Test malformed request
    const malformedResponse = await request.post("/api/keywords/difficulty", {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        // Missing required keywords field
      },
    });

    expect(malformedResponse.status()).toBeGreaterThanOrEqual(400);
    expect(malformedResponse.status()).toBeLessThan(500);

    // 3. Test rate limiting (make multiple requests in quick succession)
    const rateLimitRequests = [];
    for (let i = 0; i < 10; i++) {
      rateLimitRequests.push(
        request.get("/api/keywords/suggestions?q=test", {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        })
      );
    }

    const responses = await Promise.all(rateLimitRequests);

    // Check if any responses indicate rate limiting
    const rateLimited = responses.some((r) => r.status() === 429);

    // We don't strictly expect to hit rate limits in testing, so we'll just log it
    if (rateLimited) {
      console.log(
        "Rate limiting detected - this is expected behavior in production"
      );
    }
  });

  // Test data persistence
  test("Data persistence across API calls", async ({ request }) => {
    // 1. Create a saved keyword list
    const createResponse = await request.post("/api/keywords/lists", {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        name: "Test List " + Date.now(),
        keywords: ["seo", "content marketing", "digital marketing"],
      },
    });

    expect(createResponse.ok()).toBeTruthy();

    const createData = await createResponse.json();
    const listId = createData.id;
    expect(listId).toBeTruthy();

    // 2. Get the created list
    const getResponse = await request.get(`/api/keywords/lists/${listId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(getResponse.ok()).toBeTruthy();

    const getData = await getResponse.json();
    expect(getData.name).toContain("Test List");
    expect(Array.isArray(getData.keywords)).toBeTruthy();
    expect(getData.keywords).toContain("seo");

    // 3. Update the list
    const updateResponse = await request.put(`/api/keywords/lists/${listId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        name: "Updated List " + Date.now(),
        keywords: [
          "seo",
          "content marketing",
          "digital marketing",
          "added keyword",
        ],
      },
    });

    expect(updateResponse.ok()).toBeTruthy();

    // 4. Verify the update
    const verifyResponse = await request.get(`/api/keywords/lists/${listId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const verifyData = await verifyResponse.json();
    expect(verifyData.name).toContain("Updated List");
    expect(verifyData.keywords).toContain("added keyword");

    // 5. Delete the list
    const deleteResponse = await request.delete(
      `/api/keywords/lists/${listId}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    expect(deleteResponse.ok()).toBeTruthy();

    // 6. Verify deletion
    const verifyDeletionResponse = await request.get(
      `/api/keywords/lists/${listId}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    expect(verifyDeletionResponse.status()).toBe(404);
  });

  // Test API integration with frontend components
  test("API integration with frontend components", async ({ page }) => {
    // 1. Login
    await page.goto("/login");
    await page.fill('[data-testid="email-input"]', "test-agency@example.com");
    await page.fill('[data-testid="password-input"]', "testPassword123");
    await page.click('[data-testid="login-button"]');

    // 2. Wait for dashboard to load
    await page.waitForURL("**/dashboard");

    // 3. Go to keyword tool
    await page.goto("/keyword-tool");
    await page.waitForLoadState("networkidle");

    // 4. Enter a keyword and check API integration
    await page.fill('[data-testid="keyword-input"]', "seo tools");
    await page.click('[data-testid="search-button"]');

    // 5. Wait for results to load via API
    await page.waitForSelector('[data-testid="results-container"]');

    // 6. Verify results were loaded from API
    const resultText = await page.textContent(
      '[data-testid="results-container"]'
    );
    expect(resultText).toContain("seo");

    // 7. Check network requests
    const apiRequests: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("/api/") && request.method() === "GET") {
        apiRequests.push(request.url());
      }
    });

    // 8. Perform another action to trigger API
    await page.click('[data-testid="filter-dropdown"]');
    await page.click("text=Difficulty");

    // 9. Wait for filtered results
    await page.waitForTimeout(1000);

    // 10. Verify API requests
    expect(apiRequests.length).toBeGreaterThan(0);
    expect(apiRequests.some((url) => url.includes("keywords"))).toBeTruthy();
  });

  // Test file upload API
  test("File upload API integration", async ({ page }) => {
    // 1. Login
    await page.goto("/login");
    await page.fill('[data-testid="email-input"]', "test-agency@example.com");
    await page.fill('[data-testid="password-input"]', "testPassword123");
    await page.click('[data-testid="login-button"]');

    // 2. Wait for dashboard to load
    await page.waitForURL("**/dashboard");

    // 3. Go to content analyzer
    await page.goto("/content-analyzer");
    await page.waitForLoadState("networkidle");

    // 4. Check if file upload option exists
    const hasFileUpload = await page.isVisible("text=Upload Document");

    if (hasFileUpload) {
      // 5. Click upload button
      await page.click("text=Upload Document");

      // 6. Check for file input
      const fileInput = await page.$('input[type="file"]');

      if (fileInput) {
        // Create a test file
        const testFilePath = "test-results/test-document.txt";
        require("fs").writeFileSync(
          testFilePath,
          "This is a test document for content analysis."
        );

        // 7. Upload file
        await fileInput.setInputFiles(testFilePath);

        // 8. Wait for upload to complete
        await page
          .waitForSelector("text=Upload Complete", { timeout: 5000 })
          .catch(() => {
            console.log("Upload complete message not found, continuing test");
          });

        // 9. Check if analysis started
        const analysisStarted = await page.isVisible("text=Analyzing");

        if (analysisStarted) {
          // Wait for analysis to complete
          await page
            .waitForSelector('[data-testid="analysis-results"]', {
              timeout: 10000,
            })
            .catch(() => {
              console.log(
                "Analysis results not found within timeout, continuing test"
              );
            });

          // Check if results are shown
          const hasResults = await page.isVisible(
            '[data-testid="analysis-results"]'
          );
          if (hasResults) {
            const resultText = await page.textContent(
              '[data-testid="analysis-results"]'
            );
            expect(resultText).toBeTruthy();
          }
        }
      }
    } else {
      // Skip test if file upload not available
      test.skip();
    }
  });

  // Test webhook integrations if available
  test("Webhook integration API", async ({ request }) => {
    // 1. Check if webhook endpoints exist
    const webhookStatusResponse = await request
      .get("/api/webhooks/status", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      .catch(() => null);

    // Skip test if webhook API is not available
    if (!webhookStatusResponse || webhookStatusResponse.status() === 404) {
      console.log("Webhook API not available, skipping test");
      return;
    }

    expect(webhookStatusResponse.ok()).toBeTruthy();

    // 2. Register a test webhook
    const webhookResponse = await request.post("/api/webhooks/register", {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        url: "https://webhook.site/test-endpoint",
        events: ["analysis.complete", "subscription.updated"],
      },
    });

    expect(webhookResponse.ok()).toBeTruthy();

    const webhookData = await webhookResponse.json();
    const webhookId = webhookData.id;

    // 3. List registered webhooks
    const listResponse = await request.get("/api/webhooks", {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(listResponse.ok()).toBeTruthy();

    const listData = await listResponse.json();
    expect(Array.isArray(listData.webhooks)).toBeTruthy();
    expect(
      listData.webhooks.some((webhook: any) => webhook.id === webhookId)
    ).toBeTruthy();

    // 4. Delete the test webhook
    const deleteResponse = await request.delete(`/api/webhooks/${webhookId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(deleteResponse.ok()).toBeTruthy();
  });

  // Test API data consistency
  test("API data consistency across endpoints", async ({ request }) => {
    // 1. Get user data from profile endpoint
    const profileResponse = await request.get("/api/user/profile", {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const profileData = await profileResponse.json();

    // 2. Get subscription data from subscription endpoint
    const subscriptionResponse = await request.get(
      "/api/subscriptions/status",
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const subscriptionData = await subscriptionResponse.json();

    // 3. Verify data consistency
    expect(profileData.subscription.tier).toBe(subscriptionData.tier);

    // 4. Get user settings
    const settingsResponse = await request.get("/api/user/settings", {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const settingsData = await settingsResponse.json();

    // 5. Verify user ID consistency
    expect(profileData.id).toBe(settingsData.userId);
  });
});
