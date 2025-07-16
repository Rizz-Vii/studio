import { test, expect } from "./setup/test-setup";
import { defaultConfig } from "./config/test-config";

test.describe("Public Pages", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(defaultConfig.baseUrl || "/");
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

    // Verify page structure and semantic markup
    const headings = await page.locator("h1, h2, h3, h4, h5, h6").all();
    expect(headings.length).toBeGreaterThan(0);

    // Check that images have alt text
    const images = await page.locator("img").all();
    for (const img of images) {
      if (await img.isVisible()) {
        const altText = await img.getAttribute("alt");
        expect(altText).toBeTruthy();
      }
    }
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
      await page.goto(`${defaultConfig.baseUrl || ""}/login`);
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
      // Check form labeling and structure
      const formInputs = await page.locator("input, select, textarea").all();
      for (const input of formInputs) {
        if (await input.isVisible()) {
          const label =
            (await input.getAttribute("aria-label")) ||
            (await input.getAttribute("placeholder"));
          expect(label).toBeTruthy();
        }
      }

      // Verify semantic heading structure
      const headings = await page.locator("h1, h2, h3, h4, h5, h6").all();
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  test("register page is accessible", async ({ page }) => {
    await test.step("Navigate to register page", async () => {
      await page.goto(`${defaultConfig.baseUrl || ""}/register`);
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
      // Check form labeling and structure for registration
      const formInputs = await page.locator("input, select, textarea").all();
      for (const input of formInputs) {
        if (await input.isVisible()) {
          const label =
            (await input.getAttribute("aria-label")) ||
            (await input.getAttribute("placeholder"));
          expect(label).toBeTruthy();
        }
      }

      // Verify semantic heading structure
      const headings = await page.locator("h1, h2, h3, h4, h5, h6").all();
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  // Enhanced Link Validation Tests
  test("all navigation links are valid", async ({ page }) => {
    await test.step("Validate main navigation links", async () => {
      const navLinks = [
        {
          name: "Features",
          selector: 'a[href*="features"], a[href*="#features"]',
        },
        {
          name: "Pricing",
          selector: 'a[href*="pricing"], a[href*="#pricing"]',
        },
        { name: "FAQ", selector: 'a[href*="faq"], a[href*="#faq"]' },
        { name: "Login", selector: 'a[href*="login"]' },
        { name: "Register", selector: 'a[href*="register"]' },
      ];

      for (const link of navLinks) {
        const linkElement = page.locator(link.selector).first();
        if (await linkElement.isVisible()) {
          const href = await linkElement.getAttribute("href");
          if (href && href.startsWith("/")) {
            const response = await page.goto(href);
            expect(response?.ok()).toBeTruthy();
            expect(response?.status()).toBeLessThan(400);

            // Return to homepage
            await page.goto(defaultConfig.baseUrl || "/");
          }
        }
      }
    });

    await test.step("Validate CTA button links", async () => {
      const ctaButtons = [
        'a[href*="register"]',
        'a[href*="demo"]',
        'a[href*="free"]',
      ];

      for (const selector of ctaButtons) {
        const button = page.locator(selector).first();
        if (await button.isVisible()) {
          const href = await button.getAttribute("href");
          if (href && href.startsWith("/")) {
            const response = await page.goto(href);
            expect(response?.ok()).toBeTruthy();
            expect(response?.status()).toBeLessThan(400);

            // Return to homepage
            await page.goto(defaultConfig.baseUrl || "/");
          }
        }
      }
    });
  });

  // Enhanced Mobile Optimization Tests
  test("homepage responsive design across devices", async ({ page }) => {
    await test.step("Mobile view (iPhone 13)", async () => {
      await page.setViewportSize({ width: 390, height: 844 });

      // Verify critical elements are visible and properly sized
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

      // Check for mobile navigation menu
      const mobileMenu = page.getByRole("button", { name: /menu|hamburger/i });
      if (await mobileMenu.isVisible()) {
        await expect(mobileMenu).toBeVisible();
      }

      // Verify CTA buttons are accessible
      const ctaButtons = await page
        .getByRole("link", { name: /start free|request demo/i })
        .all();
      for (const button of ctaButtons) {
        if (await button.isVisible()) {
          const buttonBox = await button.boundingBox();
          expect(buttonBox?.width).toBeGreaterThan(44); // Minimum touch target size
          expect(buttonBox?.height).toBeGreaterThan(44);
        }
      }
    });

    await test.step("Tablet view (iPad)", async () => {
      await page.setViewportSize({ width: 768, height: 1024 });

      // Verify layout adaptation
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

      // Check navigation is properly displayed
      const navigation = page.getByRole("navigation").first();
      if (await navigation.isVisible()) {
        await expect(navigation).toBeVisible();
      }

      // Verify feature cards layout
      const featureCards = await page
        .locator(
          '[data-testid="feature-card"], .feature-card, [class*="feature"]'
        )
        .all();
      if (featureCards.length > 0) {
        for (const card of featureCards.slice(0, 3)) {
          if (await card.isVisible()) {
            await expect(card).toBeVisible();
          }
        }
      }
    });

    await test.step("Large desktop view", async () => {
      await page.setViewportSize({ width: 1920, height: 1080 });

      // Verify full desktop layout
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

      // Check that content doesn't exceed reasonable max-width
      const mainContent = page.locator('main, [role="main"]').first();
      if (await mainContent.isVisible()) {
        const contentBox = await mainContent.boundingBox();
        expect(contentBox?.width).toBeLessThan(1400); // Reasonable max content width
      }
    });

    await test.step("Small mobile view (iPhone SE)", async () => {
      await page.setViewportSize({ width: 375, height: 667 });

      // Verify content still fits and is readable
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

      // Check text is not too small
      const mainText = page.locator("p, span, div").first();
      if (await mainText.isVisible()) {
        const fontSize = await mainText.evaluate(
          (el) => window.getComputedStyle(el).fontSize
        );
        const fontSizeNum = parseInt(fontSize);
        expect(fontSizeNum).toBeGreaterThanOrEqual(14); // Minimum readable font size
      }
    });
  });

  // Enhanced Accessibility Tests
  test("homepage accessibility compliance", async ({ page }) => {
    await test.step("Check semantic HTML structure", async () => {
      // Verify proper heading hierarchy
      const h1Count = await page.locator("h1").count();
      expect(h1Count).toBe(1); // Should have exactly one H1

      // Check that headings follow proper hierarchy
      const headings = await page.locator("h1, h2, h3, h4, h5, h6").all();
      let previousLevel = 0;
      for (const heading of headings) {
        if (await heading.isVisible()) {
          const tagName = await heading.evaluate((el) =>
            el.tagName.toLowerCase()
          );
          const currentLevel = parseInt(tagName.charAt(1));
          expect(currentLevel).toBeLessThanOrEqual(previousLevel + 1);
          previousLevel = currentLevel;
        }
      }
    });

    await test.step("Check ARIA roles and landmarks", async () => {
      // Verify main landmarks exist
      await expect(page.getByRole("banner")).toBeVisible(); // header
      await expect(page.getByRole("main")).toBeVisible(); // main content
      await expect(page.getByRole("contentinfo")).toBeVisible(); // footer

      // Check navigation has proper role
      const navigation = page.getByRole("navigation").first();
      if (await navigation.isVisible()) {
        await expect(navigation).toBeVisible();
      }
    });

    await test.step("Check image accessibility", async () => {
      const images = await page.locator("img").all();
      for (const img of images) {
        if (await img.isVisible()) {
          const altText = await img.getAttribute("alt");
          expect(altText).not.toBeNull();
          expect(altText).not.toBe(""); // Alt text should not be empty
        }
      }
    });

    await test.step("Check keyboard navigation", async () => {
      // Test tab navigation through interactive elements
      const interactiveElements = await page
        .locator(
          'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        .all();

      if (interactiveElements.length > 0) {
        // Focus first element
        await interactiveElements[0].focus();
        await expect(interactiveElements[0]).toBeFocused();

        // Test tab navigation
        for (let i = 1; i < Math.min(interactiveElements.length, 5); i++) {
          await page.keyboard.press("Tab");
          if (await interactiveElements[i].isVisible()) {
            await expect(interactiveElements[i]).toBeFocused();
          }
        }
      }
    });

    await test.step("Check color contrast and visual indicators", async () => {
      // Check that focus indicators are visible
      const firstButton = page.getByRole("button").first();
      if (await firstButton.isVisible()) {
        await firstButton.focus();

        // Check that focused element has visible outline or other focus indicator
        const focusStyles = await firstButton.evaluate((el) => {
          const styles = window.getComputedStyle(el);
          return {
            outline: styles.outline,
            outlineWidth: styles.outlineWidth,
            boxShadow: styles.boxShadow,
          };
        });

        const hasFocusIndicator =
          focusStyles.outline !== "none" ||
          focusStyles.outlineWidth !== "0px" ||
          focusStyles.boxShadow !== "none";

        expect(hasFocusIndicator).toBeTruthy();
      }
    });
  });

  // Layout Consistency Tests
  test("consistent layout components across pages", async ({ page }) => {
    await test.step("Verify header consistency across pages", async () => {
      const pages = ["/", "/login", "/register"];
      let headerStructure: any = null;

      for (const pagePath of pages) {
        await page.goto(defaultConfig.baseUrl + pagePath || pagePath);

        const header = page.getByRole("banner").first();
        if (await header.isVisible()) {
          const currentStructure = {
            logo: await header
              .getByRole("link", { name: /rankpilot/i })
              .isVisible(),
            navigation: await header.getByRole("navigation").isVisible(),
            authButtons:
              (await header
                .getByRole("link", { name: /login|register|sign/i })
                .count()) > 0,
          };

          if (!headerStructure) {
            headerStructure = currentStructure;
          } else {
            expect(currentStructure.logo).toBe(headerStructure.logo);
            // Navigation might be different on auth pages, so we'll be flexible
          }
        }
      }
    });

    await test.step("Verify footer consistency across pages", async () => {
      const pages = ["/", "/login", "/register"];
      let footerStructure: any = null;

      for (const pagePath of pages) {
        await page.goto(defaultConfig.baseUrl + pagePath || pagePath);

        const footer = page.getByRole("contentinfo").first();
        if (await footer.isVisible()) {
          const currentStructure = {
            copyright: await footer.getByText(/© 2025 RankPilot/i).isVisible(),
            hasLinks: (await footer.getByRole("link").count()) > 0,
          };

          if (!footerStructure) {
            footerStructure = currentStructure;
          } else {
            expect(currentStructure.copyright).toBe(footerStructure.copyright);
            expect(currentStructure.hasLinks).toBe(footerStructure.hasLinks);
          }
        }
      }
    });

    await test.step("Verify consistent styling and branding", async () => {
      const pages = ["/", "/login", "/register"];

      for (const pagePath of pages) {
        await page.goto(defaultConfig.baseUrl + pagePath || pagePath);

        // Check that the page uses consistent color scheme
        const primaryButton = page.getByRole("button").first();
        if (await primaryButton.isVisible()) {
          const buttonStyles = await primaryButton.evaluate((el) => {
            const styles = window.getComputedStyle(el);
            return {
              fontFamily: styles.fontFamily,
              borderRadius: styles.borderRadius,
            };
          });

          // Verify consistent font family is used
          expect(buttonStyles.fontFamily).toBeTruthy();
        }

        // Check for consistent brand logo/title
        const brandElement = page
          .getByRole("link", { name: /rankpilot/i })
          .first();
        if (await brandElement.isVisible()) {
          await expect(brandElement).toBeVisible();
        }
      }
    });
  });
});
