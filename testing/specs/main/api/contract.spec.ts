import { test, expect } from "@playwright/test";
import { randomDelay } from "../utils/test-utils";

interface APIResponse<T> {
  data?: T;
  error?: {
    message: string;
    code: string;
  };
}

interface AnalysisResult {
  url: string;
  metrics: {
    authority: number;
    trustFlow: number;
    citationFlow: number;
    backlinks: number;
  };
  backlinks: Array<{
    url: string;
    authority: number;
    anchor: string;
  }>;
}

test.describe("API Contract Tests", () => {
  const baseUrl = process.env.API_BASE_URL || "http://localhost:3000/api";

  test("link analysis endpoint follows contract", async ({ request }) => {
    await randomDelay();

    const response = await request.post(`${baseUrl}/analyze-link`, {
      data: {
        url: "https://example.com",
      },
    });

    expect(response.ok()).toBeTruthy();

    const result = (await response.json()) as APIResponse<AnalysisResult>;

    // Verify response structure
    expect(result.data).toBeDefined();
    expect(result.error).toBeUndefined();

    const { metrics, backlinks } = result.data!;

    // Verify metrics
    expect(metrics).toMatchObject({
      authority: expect.any(Number),
      trustFlow: expect.any(Number),
      citationFlow: expect.any(Number),
      backlinks: expect.any(Number),
    });

    // Verify backlinks
    expect(Array.isArray(backlinks)).toBeTruthy();
    if (backlinks.length > 0) {
      expect(backlinks[0]).toMatchObject({
        url: expect.any(String),
        authority: expect.any(Number),
        anchor: expect.any(String),
      });
    }
  });

  test("error responses follow contract", async ({ request }) => {
    await randomDelay();

    const response = await request.post(`${baseUrl}/analyze-link`, {
      data: {
        url: "invalid-url",
      },
    });

    expect(response.status()).toBe(400);

    const result = (await response.json()) as APIResponse<never>;

    // Verify error structure
    expect(result.data).toBeUndefined();
    expect(result.error).toMatchObject({
      message: expect.any(String),
      code: expect.any(String),
    });
  });

  test("rate limiting headers are present", async ({ request }) => {
    await randomDelay();

    const response = await request.get(`${baseUrl}/rate-limit-test`);

    expect(response.headers()["x-ratelimit-limit"]).toBeDefined();
    expect(response.headers()["x-ratelimit-remaining"]).toBeDefined();
    expect(response.headers()["x-ratelimit-reset"]).toBeDefined();
  });

  test("pagination follows contract", async ({ request }) => {
    await randomDelay();

    const response = await request.get(`${baseUrl}/backlinks?page=1&limit=10`);

    expect(response.ok()).toBeTruthy();

    const result = await response.json();

    expect(result).toMatchObject({
      data: expect.any(Array),
      pagination: {
        currentPage: expect.any(Number),
        totalPages: expect.any(Number),
        totalItems: expect.any(Number),
        itemsPerPage: expect.any(Number),
      },
    });
  });
});
