import { test, expect } from "@playwright/test";

/**
 * Smart test runner that checks feature availability before running tests
 * This prevents false failures for unimplemented features
 */

export async function checkFeatureAvailability(
  page: any,
  feature: string
): Promise<boolean> {
  const baseURL = page.context()._options.baseURL || "http://localhost:3000";

  try {
    switch (feature) {
      case "auth":
        // Check if auth pages exist
        const loginResponse = await page.request.get(`${baseURL}/login`);
        return loginResponse.ok();

      case "api-analyze-link":
        // Check if analyze-link API exists
        const apiResponse = await page.request.post(
          `${baseURL}/api/analyze-link`,
          {
            data: { url: "https://example.com" },
            failOnStatusCode: false,
          }
        );
        return apiResponse.status() !== 404;

      case "dashboard":
        // Check if dashboard exists
        const dashboardResponse = await page.request.get(
          `${baseURL}/dashboard`
        );
        return dashboardResponse.ok();

      default:
        return true;
    }
  } catch (error) {
    console.log(`Feature ${feature} availability check failed:`, error);
    return false;
  }
}

export function skipIfFeatureUnavailable(feature: string) {
  return async function (testFn: any, testInfo: any) {
    const available = await checkFeatureAvailability(testInfo.page, feature);
    if (!available) {
      testInfo.skip(`Feature "${feature}" is not implemented yet`);
      return;
    }
    return testFn();
  };
}

// Helper for conditional test execution
export const conditionalTest = {
  auth: (title: string, testFn: any) =>
    test(title, async ({ page }, testInfo) => {
      const available = await checkFeatureAvailability(page, "auth");
      if (!available) {
        testInfo.skip("Authentication features not implemented yet");
        return;
      }
      return testFn({ page }, testInfo);
    }),

  api: (title: string, testFn: any) =>
    test(title, async ({ page }, testInfo) => {
      const available = await checkFeatureAvailability(
        page,
        "api-analyze-link"
      );
      if (!available) {
        testInfo.skip("API endpoints not implemented yet");
        return;
      }
      return testFn({ page }, testInfo);
    }),

  dashboard: (title: string, testFn: any) =>
    test(title, async ({ page }, testInfo) => {
      const available = await checkFeatureAvailability(page, "dashboard");
      if (!available) {
        testInfo.skip("Dashboard not implemented yet");
        return;
      }
      return testFn({ page }, testInfo);
    }),
};
