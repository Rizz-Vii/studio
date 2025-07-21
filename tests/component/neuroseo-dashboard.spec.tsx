import { test, expect } from "@playwright/experimental-ct-react";
import NeuroSEODashboard from "@/components/NeuroSEODashboard";
import { AuthProvider } from "@/context/AuthContext";
import { HydrationProvider } from "@/components/HydrationContext";
import React from "react";

// Mock Auth Context
const MockAuthContext = ({ children, user }) => (
  <AuthProvider
    value={{ user, loading: false, role: "user", profile: {}, activities: [] }}
  >
    {children}
  </AuthProvider>
);

// Mock Hydration Context
const MockHydrationContext = ({ children, isHydrated }) => (
  <HydrationProvider value={isHydrated}>{children}</HydrationProvider>
);

test.describe("NeuroSEODashboard Component", () => {
  const mockUser = {
    uid: "123",
    email: "test@example.com",
    getIdToken: async () => "fake-token",
  };

  test("should render the main dashboard structure", async ({ mount }) => {
    const component = await mount(
      <MockAuthContext user={mockUser}>
        <MockHydrationContext isHydrated={true}>
          <NeuroSEODashboard />
        </MockHydrationContext>
      </MockAuthContext>
    );

    await expect(
      component.locator('h2:has-text("NeuroSEO™ Suite")')
    ).toBeVisible();
    await expect(
      component.locator('button:has-text("Start New Analysis")')
    ).toBeVisible();
    await expect(
      component.locator('label:has-text("Target URLs *")')
    ).toBeVisible();
    await expect(
      component.locator('label:has-text("Target Keywords *")')
    ).toBeVisible();
  });

  test("should have analysis button disabled when form is incomplete", async ({
    mount,
  }) => {
    const component = await mount(
      <MockAuthContext user={mockUser}>
        <MockHydrationContext isHydrated={true}>
          <NeuroSEODashboard />
        </MockHydrationContext>
      </MockAuthContext>
    );

    const analysisButton = component.locator(
      'button:has-text("Start Analysis")'
    );
    await expect(analysisButton).toBeDisabled();
  });

  test("should enable analysis button when required fields are filled", async ({
    mount,
  }) => {
    const component = await mount(
      <MockAuthContext user={mockUser}>
        <MockHydrationContext isHydrated={true}>
          <NeuroSEODashboard />
        </MockHydrationContext>
      </MockAuthContext>
    );

    await component
      .locator('input[aria-label="Target URLs *"]')
      .fill("https://example.com");
    await component
      .locator('input[aria-label="Target Keywords *"]')
      .fill("seo");

    const analysisButton = component.locator(
      'button:has-text("Start Analysis")'
    );
    await expect(analysisButton).not.toBeDisabled();
  });

  test("should show loading state when analysis is running", async ({
    mount,
    page,
  }) => {
    await page.route("**/api/neuroseo", async (route) => {
      await new Promise((f) => setTimeout(f, 1000));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ overallScore: 85 }),
      });
    });

    const component = await mount(
      <MockAuthContext user={mockUser}>
        <MockHydrationContext isHydrated={true}>
          <NeuroSEODashboard />
        </MockHydrationContext>
      </MockAuthContext>
    );

    await component
      .locator('input[aria-label="Target URLs *"]')
      .fill("https://example.com");
    await component
      .locator('input[aria-label="Target Keywords *"]')
      .fill("seo");
    await component.locator('button:has-text("Start Analysis")').click();

    await expect(
      component.locator("text=/Running NeuroSEO™ Analysis/")
    ).toBeVisible();
    await expect(component.locator('[role="progressbar"]')).toBeVisible();
  });

  test("should display an error message if analysis fails", async ({
    mount,
    page,
  }) => {
    await page.route("**/api/neuroseo", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Test error" }),
      });
    });

    const component = await mount(
      <MockAuthContext user={mockUser}>
        <MockHydrationContext isHydrated={true}>
          <NeuroSEODashboard />
        </MockHydrationContext>
      </MockAuthContext>
    );

    await component
      .locator('input[aria-label="Target URLs *"]')
      .fill("https://example.com");
    await component
      .locator('input[aria-label="Target Keywords *"]')
      .fill("seo");
    await component.locator('button:has-text("Start Analysis")').click();

    await expect(component.locator("text=/Test error/")).toBeVisible();
  });

  test("should display the analysis report upon successful completion", async ({
    mount,
    page,
  }) => {
    const mockReport = {
      overallScore: 85,
      timestamp: new Date().toISOString(),
      keyInsights: [],
      crawlResults: [],
      visibilityAnalysis: [],
      trustAnalysis: [],
      actionableTasks: [],
    };

    await page.route("**/api/neuroseo", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockReport),
      });
    });

    const component = await mount(
      <MockAuthContext user={mockUser}>
        <MockHydrationContext isHydrated={true}>
          <NeuroSEODashboard />
        </MockHydrationContext>
      </MockAuthContext>
    );

    await component
      .locator('input[aria-label="Target URLs *"]')
      .fill("https://example.com");
    await component
      .locator('input[aria-label="Target Keywords *"]')
      .fill("seo");
    await component.locator('button:has-text("Start Analysis")').click();

    await expect(
      component.locator('h3:has-text("NeuroSEO™ Analysis Results")')
    ).toBeVisible();
    await expect(component.locator('text="85/100"')).toBeVisible();
  });
});
