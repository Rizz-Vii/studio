import { test, expect } from "@playwright/test";

// Use a global setup for authentication or a beforeAll hook for the test file.
// This approach fetches the token once before any tests in this file run.
let authToken: string;

test.beforeAll(async ({ request }) => {
  const loginResponse = await request.post("/api/auth/login", {
    data: {
      email: "test-agency@example.com",
      password: "testPassword123",
    },
  });
  expect(
    loginResponse.ok(),
    "Login should be successful to get auth token"
  ).toBeTruthy();
  const loginData = await loginResponse.json();
  authToken = loginData.token;
  expect(authToken, "Auth token should be received").toBeTruthy();
});

// Helper to create authenticated requests
const createAuthenticatedRequest = (request: any) => {
  return {
    get: (url: string) =>
      request.get(url, { headers: { Authorization: `Bearer ${authToken}` } }),
    post: (url: string, data: any) =>
      request.post(url, {
        headers: { Authorization: `Bearer ${authToken}` },
        data,
      }),
    put: (url: string, data: any) =>
      request.put(url, {
        headers: { Authorization: `Bearer ${authToken}` },
        data,
      }),
    delete: (url: string) =>
      request.delete(url, {
        headers: { Authorization: `Bearer ${authToken}` },
      }),
  };
};

test.describe("Authenticated API Endpoints", () => {
  test.describe("User and Subscription API", () => {
    test("should fetch user profile and subscription data", async ({
      request,
    }) => {
      const api = createAuthenticatedRequest(request);
      const profileResponse = await api.get("/api/user/profile");

      expect(profileResponse.ok()).toBeTruthy();
      const profileData = await profileResponse.json();

      expect(profileData.email).toBe("test-agency@example.com");
      expect(profileData.subscription).toBeDefined();
      expect(profileData.subscription.tier).toBe("agency");
    });

    test("should return 401 for requests with an invalid token", async ({
      request,
    }) => {
      const response = await request.get("/api/user/profile", {
        headers: { Authorization: "Bearer invalid-token" },
      });
      expect(response.status()).toBe(401);
    });
  });

  test.describe("Keywords API", () => {
    test("should get keyword suggestions and difficulty", async ({
      request,
    }) => {
      const api = createAuthenticatedRequest(request);

      // Test suggestions
      const suggestionsResponse = await api.get(
        "/api/keywords/suggestions?q=seo"
      );
      expect(suggestionsResponse.ok()).toBeTruthy();
      const suggestionsData = await suggestionsResponse.json();
      expect(suggestionsData.suggestions).toBeInstanceOf(Array);
      expect(suggestionsData.suggestions.length).toBeGreaterThan(0);

      // Test difficulty
      const difficultyResponse = await api.post("/api/keywords/difficulty", {
        keywords: ["seo", "content marketing"],
      });
      expect(difficultyResponse.ok()).toBeTruthy();
      const difficultyData = await difficultyResponse.json();
      expect(difficultyData.results).toHaveLength(2);
      expect(typeof difficultyData.results[0].difficulty).toBe("number");
    });
  });

  test.describe("Content Analyzer API", () => {
    test("should analyze a URL and get recommendations", async ({
      request,
    }) => {
      const api = createAuthenticatedRequest(request);
      const payload = { url: "https://example.com", keywords: ["seo"] };

      // Test analysis
      const analyzeResponse = await api.post("/api/content/analyze", payload);
      expect(analyzeResponse.ok()).toBeTruthy();
      const analyzeData = await analyzeResponse.json();
      expect(analyzeData.analysis).toBeDefined();
      expect(typeof analyzeData.analysis.contentScore).toBe("number");

      // Test recommendations
      const recsResponse = await api.post(
        "/api/content/recommendations",
        payload
      );
      expect(recsResponse.ok()).toBeTruthy();
      const recsData = await recsResponse.json();
      expect(recsData.recommendations).toBeInstanceOf(Array);
    });
  });

  test.describe("NeuroSEO API", () => {
    test("should create and retrieve a NeuroSEO analysis", async ({
      request,
    }) => {
      const api = createAuthenticatedRequest(request);

      // Start analysis
      const startResponse = await api.post("/api/neuroseo/analyze", {
        keyword: "seo optimization",
        depth: "standard",
      });
      expect(startResponse.ok()).toBeTruthy();
      const startData = await startResponse.json();
      const analysisId = startData.analysisId;
      expect(analysisId).toBeDefined();

      // Retrieve results (assuming it's a quick process for the test)
      const resultsResponse = await api.get(
        `/api/neuroseo/analysis/${analysisId}`
      );
      expect(resultsResponse.ok()).toBeTruthy();
      const resultsData = await resultsResponse.json();
      expect(resultsData.results).toBeDefined();
      expect(resultsData.semanticMap).toBeDefined();
    });
  });

  test.describe("Keyword Lists API (CRUD)", () => {
    test("should perform CRUD operations on keyword lists", async ({
      request,
    }) => {
      const api = createAuthenticatedRequest(request);
      const listName = `Test List ${Date.now()}`;
      let listId: string;

      // 1. Create
      const createResponse = await api.post("/api/keywords/lists", {
        name: listName,
        keywords: ["initial keyword"],
      });
      expect(createResponse.ok()).toBeTruthy();
      const createData = await createResponse.json();
      listId = createData.id;
      expect(listId).toBeDefined();

      // 2. Read
      const readResponse = await api.get(`/api/keywords/lists/${listId}`);
      expect(readResponse.ok()).toBeTruthy();
      const readData = await readResponse.json();
      expect(readData.name).toBe(listName);
      expect(readData.keywords).toContain("initial keyword");

      // 3. Update
      const updatedName = `Updated List ${Date.now()}`;
      const updateResponse = await api.put(`/api/keywords/lists/${listId}`, {
        name: updatedName,
        keywords: ["initial keyword", "updated keyword"],
      });
      expect(updateResponse.ok()).toBeTruthy();

      // Verify update
      const verifyUpdateResponse = await api.get(
        `/api/keywords/lists/${listId}`
      );
      const verifyUpdateData = await verifyUpdateResponse.json();
      expect(verifyUpdateData.name).toBe(updatedName);
      expect(verifyUpdateData.keywords).toContain("updated keyword");

      // 4. Delete
      const deleteResponse = await api.delete(`/api/keywords/lists/${listId}`);
      expect(deleteResponse.ok()).toBeTruthy();

      // Verify deletion
      const verifyDeleteResponse = await api.get(
        `/api/keywords/lists/${listId}`
      );
      expect(verifyDeleteResponse.status()).toBe(404);
    });
  });

  test("should return 404 for an invalid endpoint", async ({ request }) => {
    const api = createAuthenticatedRequest(request);
    const response = await api.get("/api/invalid/endpoint");
    expect(response.status()).toBe(404);
  });

  test("should return 400 for a malformed request", async ({ request }) => {
    const api = createAuthenticatedRequest(request);
    // Missing 'keywords' field which is required
    const response = await api.post("/api/keywords/difficulty", {});
    expect(response.status()).toBe(400);
  });
});
