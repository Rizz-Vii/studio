import { test, expect } from "./setup/test-setup";
import testConfig from "../test.config.json";

test.describe("Public Pages", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(testConfig.baseURL);
  });

  test("homepage loads correctly", async ({ page }) => {
    // Wait for critical elements
    await expect(page).toHaveTitle(/RankPilot/, { timeout: 10000 });

    // Check main heading and subheading
    const mainHeading = page.getByRole("heading", { level: 1 });
    await expect(mainHeading).toBeVisible();
    await expect(mainHeading).toContainText("SEO Insights");
    await expect(mainHeading).toContainText("Supercharged by AI");

    // Verify hero section
    await expect(
      page.getByText("Unlock technical, content, and off-page SEO intelligence")
    ).toBeVisible();

    // Verify CTA buttons
    await expect(page.getByRole("link", { name: "Start Free" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Request Demo" })
    ).toBeVisible();

    // Check feature cards
    const features = [
      {
        title: "Site Audit",
        desc: "Crawl your site broken links, indexability, page speed, meta issues, and more.",
      },
      {
        title: "Keyword Intelligence",
        desc: "Track keywords, visibility scores, and keyword gaps with real-time updates.",
      },
      {
        title: "Competitor Tracking",
        desc: "Benchmark your SEO progress against your top rivals with historical trend graphs.",
      },
    ];

    for (const feature of features) {
      await test.step(`Verify ${feature.title} feature card`, async () => {
        await expect(
          page.getByRole("heading", { name: feature.title })
        ).toBeVisible();
        await expect(page.getByText(feature.desc)).toBeVisible();
      });
    }

    // Verify dashboard section
    await expect(
      page.getByRole("heading", { name: "Your SEO Command Center" })
    ).toBeVisible();
    await expect(page.getByAltText("SEO Dashboard Screenshot")).toBeVisible();

    // Verify testimonials section
    await expect(
      page.getByRole("heading", { name: "What Our Users Say" })
    ).toBeVisible();
    const testimonials = ["Sophie M.", "James T.", "Leila A."];
    for (const name of testimonials) {
      await expect(page.getByText(name, { exact: false })).toBeVisible();
    }

    // Verify FAQ section
    await expect(
      page.getByRole("heading", { name: "Frequently Asked Questions" })
    ).toBeVisible();
    const faqs = [
      "Do I need a credit card to sign up?",
      "What engines do you track?",
      "Can I cancel anytime?",
    ];
    for (const question of faqs) {
      await expect(page.getByText(question)).toBeVisible();
    }

    // Verify pricing section
    await expect(
      page.getByRole("heading", { name: "Simple, Transparent Pricing" })
    ).toBeVisible();

    // Verify accessibility
    await expect(page).toBeAccessible();
  });

  test("navigation works", async ({ page }) => {
    // Test main navigation links with proper error handling
    const sections = ["features", "about", "faq", "pricing"];

    for (const section of sections) {
      await test.step(`Navigate to ${section} section`, async () => {
        // Find the section element
        const sectionElement = page.locator(`#${section}`);

        // Scroll section into view
        await sectionElement.scrollIntoViewIfNeeded();

        // Verify section is visible
        await expect(sectionElement).toBeVisible();

        // Verify URL hash updates (if applicable)
        if (page.url().includes("#")) {
          expect(page.url()).toContain(`#${section}`);
        }
      });
    }
  });

  test("login page is accessible", async ({ page }) => {
    await test.step("Navigate to login page", async () => {
      await page.goto(`${testConfig.baseURL}/login`);
      await page.waitForLoadState("networkidle");
    });

    await test.step("Verify login form elements", async () => {
      // Check heading
      await expect(page.getByRole("heading", { name: /login/i })).toBeVisible();

      // Check form elements
      const formElements = {
        email: page.getByLabel(/email/i),
        password: page.getByLabel(/password/i),
        loginButton: page.getByRole("button", { name: /login/i }),
      };

      for (const [name, element] of Object.entries(formElements)) {
        await expect(element).toBeVisible({ timeout: 5000 });
        await expect(element).toBeEnabled();
      }

      // Check "Register" link
      await expect(page.getByRole("link", { name: /register/i })).toBeVisible();
    });

    await test.step("Check accessibility", async () => {
      await expect(page).toBeAccessible();
    });
  });

  test("register page is accessible", async ({ page }) => {
    await test.step("Navigate to register page", async () => {
      await page.goto(`${testConfig.baseURL}/register`);
      await page.waitForLoadState("networkidle");
    });

    await test.step("Verify registration form elements", async () => {
      // Check heading
      await expect(
        page.getByRole("heading", { name: /register/i })
      ).toBeVisible();

      // Check form elements
      const formElements = {
        email: page.getByLabel(/email/i),
        password: page.getByLabel(/password/i),
        confirmPassword: page.getByLabel(/confirm password/i),
        registerButton: page.getByRole("button", { name: /register/i }),
      };

      for (const [name, element] of Object.entries(formElements)) {
        await expect(element).toBeVisible({ timeout: 5000 });
        await expect(element).toBeEnabled();
      }

      // Check "Login" link
      await expect(page.getByRole("link", { name: /login/i })).toBeVisible();
    });

    await test.step("Check accessibility", async () => {
      await expect(page).toBeAccessible();
    });
  });
});
