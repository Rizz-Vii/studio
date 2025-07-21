import { test, expect } from "@playwright/experimental-ct-react";
import MobileNav from "@/components/mobile-nav";
import { AuthProvider } from "@/context/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import React from "react";

// Mock Subscription Hook
const mockUseSubscription = useSubscription as jest.Mock;
jest.mock("@/hooks/useSubscription");

// Mock Auth Context
const MockAuthContext = ({ children, user, role }) => (
  <AuthProvider
    value={{ user, role, loading: false, profile: {}, activities: [] }}
  >
    {children}
  </AuthProvider>
);

test.describe("MobileNav Component", () => {
  test.beforeEach(() => {
    mockUseSubscription.mockReturnValue({ subscription: null });
  });

  test("should render the menu button and be closed by default", async ({
    mount,
  }) => {
    const component = await mount(<MobileNav />);
    await expect(
      component.locator('[data-testid="mobile-menu"]')
    ).toBeVisible();
    await expect(component.locator('[aria-expanded="true"]')).not.toBeVisible();
  });

  test("should open the navigation menu on click", async ({ mount, page }) => {
    const component = await mount(<MobileNav />);
    await component.locator('[data-testid="mobile-menu"]').click();

    const navMenu = page.locator('div[data-testid="enhanced-mobile-nav"]');
    await expect(navMenu).toBeVisible();
    await expect(
      component.locator('[data-testid="mobile-menu"]')
    ).toHaveAttribute("aria-expanded", "true");
  });

  test("should close the menu when overlay is clicked", async ({
    mount,
    page,
  }) => {
    const component = await mount(<MobileNav />);

    // Open menu
    await component.locator('[data-testid="mobile-menu"]').click();
    const navMenu = page.locator('div[data-testid="enhanced-mobile-nav"]');
    await expect(navMenu).toBeVisible();

    // Click overlay to close
    await page.locator('div[data-testid="overlay"]').click();
    await expect(navMenu).not.toBeVisible();
    await expect(
      component.locator('[data-testid="mobile-menu"]')
    ).toHaveAttribute("aria-expanded", "false");
  });

  test("should display user info when authenticated", async ({
    mount,
    page,
  }) => {
    const mockUser = {
      uid: "123",
      email: "test@example.com",
    };

    mockUseSubscription.mockReturnValue({
      subscription: { tier: "starter" },
    });

    const component = await mount(
      <MockAuthContext user={mockUser} role="starter">
        <MobileNav />
      </MockAuthContext>
    );

    await component.locator('[data-testid="mobile-menu"]').click();

    const userEmail = page.locator("text=test@example.com");
    const userTier = page.locator("text=/starter/i");

    await expect(userEmail).toBeVisible();
    await expect(userTier).toBeVisible();
  });

  test("should show admin link for admin users", async ({ mount, page }) => {
    const mockUser = {
      uid: "456",
      email: "admin@example.com",
    };

    mockUseSubscription.mockReturnValue({
      subscription: { tier: "enterprise" },
    });

    const component = await mount(
      <MockAuthContext user={mockUser} role="admin">
        <MobileNav />
      </MockAuthContext>
    );

    await component.locator('[data-testid="mobile-menu"]').click();

    const adminLink = page.locator('a[href="/admin"]');
    await expect(adminLink).toBeVisible();
  });
});
