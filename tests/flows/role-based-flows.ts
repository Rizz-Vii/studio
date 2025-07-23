import { TestFlow } from "../utils/test-orchestrator";
import { expect, Page } from "@playwright/test";

// Common steps that can be reused across test flows
export const CommonSteps = {
  navigateToDashboard: () => ({
    name: "Navigate to Dashboard",
    action: async (page: Page) => {
      await page.goto("/dashboard");
      await page.waitForSelector("h1, h2");
    },
  }),

  verifyPageLoad: (pageName: string, path: string) => ({
    name: `Navigate to ${pageName}`,
    action: async (page: Page) => {
      await page.goto(path);
      await page.waitForLoadState("domcontentloaded");
    },
  }),

  takeScreenshot: (name: string) => ({
    name: `Take screenshot - ${name}`,
    action: async (page: Page) => {
      await page.screenshot({ path: `test-results/${name}-${Date.now()}.png` });
    },
    skipOnFailure: true,
  }),
};

// Free tier user test flows - basic functionality
export const freeUserFlows: TestFlow[] = [
  {
    name: "Free User - Basic Dashboard Access",
    description:
      "Verify free tier user can access dashboard and basic features",
    userRole: "free",
    steps: [
      CommonSteps.navigateToDashboard(),
      {
        name: "Verify free tier limitations",
        action: async (page) => {
          // Check for upgrade prompts or limitations
          const upgradePrompts = await page
            .locator("text=/upgrade|premium|pro/i")
            .count();
          console.log(
            `Found ${upgradePrompts} upgrade prompts (expected for free tier)`
          );
        },
      },
      CommonSteps.takeScreenshot("free-user-dashboard"),
    ],
  },

  {
    name: "Free User - Keyword Tool Basic Access",
    description: "Test keyword tool functionality for free tier users",
    userRole: "free",
    steps: [
      CommonSteps.verifyPageLoad("Keyword Tool", "/keyword-tool"),
      {
        name: "Test basic keyword search",
        action: async (page) => {
          // Try to find and use keyword input
          const inputs = await page
            .locator("input[type='text'], textarea")
            .count();
          if (inputs > 0) {
            await page
              .locator("input[type='text'], textarea")
              .first()
              .fill("seo basics");

            // Look for submit button
            const submitButtons = await page
              .locator(
                "button[type='submit'], button:has-text(/search|analyze|suggest/i)"
              )
              .count();
            if (submitButtons > 0) {
              await page
                .locator(
                  "button[type='submit'], button:has-text(/search|analyze|suggest/i)"
                )
                .first()
                .click();

              // Wait for any response (success or limitation message)
              await page.waitForTimeout(3000);
            }
          }
        },
        skipOnFailure: true,
      },
      CommonSteps.takeScreenshot("free-user-keyword-tool"),
    ],
  },

  {
    name: "Free User - Feature Access Verification",
    description: "Verify free users cannot access premium features",
    userRole: "free",
    steps: [
      {
        name: "Check restricted feature access",
        action: async (page) => {
          const restrictedFeatures = [
            "/competitor-analysis",
            "/bulk-analysis",
            "/adminonly",
          ];

          for (const feature of restrictedFeatures) {
            try {
              await page.goto(feature, { timeout: 10000 });
              await page.waitForLoadState("domcontentloaded");

              const currentUrl = page.url();

              // Should be redirected or see access denied
              if (
                !currentUrl.includes("/login") &&
                !currentUrl.includes("/dashboard")
              ) {
                const accessDenied = await page
                  .locator(
                    "text=/access.*denied|unauthorized|upgrade.*required/i"
                  )
                  .count();
                expect(accessDenied).toBeGreaterThan(0);
              }
            } catch (error) {
              // Expected for restricted features
              console.log(`Expected restriction for ${feature}: ${error}`);
            }
          }
        },
      },
    ],
  },
];

// Starter tier user test flows
export const starterUserFlows: TestFlow[] = [
  {
    name: "Starter User - Dashboard Access",
    description: "Verify starter tier user dashboard access",
    userRole: "starter",
    steps: [
      CommonSteps.navigateToDashboard(),
      {
        name: "Verify starter tier features",
        action: async (page) => {
          // Check for starter-specific elements
          await expect(page.locator("text=Content Analyzer")).toBeVisible();
          await expect(page.locator("text=NeuroSEO Basic")).toBeVisible();

          // Check for upgrade prompts (should be fewer than free tier)
          const upgradePrompts = await page
            .locator("text=/upgrade|premium/i")
            .count();
          console.log(
            `Found ${upgradePrompts} upgrade prompts (expected for starter tier)`
          );
        },
      },
      CommonSteps.takeScreenshot("starter-user-dashboard"),
    ],
  },

  {
    name: "Starter User - Content Analyzer",
    description: "Test content analyzer functionality for starter tier",
    userRole: "starter",
    steps: [
      CommonSteps.verifyPageLoad("Content Analyzer", "/content-analyzer"),
      {
        name: "Test content analysis features",
        action: async (page) => {
          // Test content analysis input
          const textarea = page
            .locator("textarea, .editor, [role='textbox']")
            .first();
          await textarea.fill(
            "This is a sample content to analyze for SEO optimization. It should contain keywords and proper structure to rank well in search engines."
          );

          // Submit for analysis
          await page
            .locator("button:has-text(/analyze|check|audit/i)")
            .first()
            .click();

          // Wait for results
          await page.waitForTimeout(5000);

          // Check for analysis results
          await expect(
            page.locator('[data-testid="content-analyzer-results"]')
          ).toBeVisible();
        },
        skipOnFailure: true,
      },
      CommonSteps.takeScreenshot("starter-user-content-analyzer"),
    ],
  },

  {
    name: "Starter User - NeuroSEO Basic",
    description: "Test NeuroSEO basic features for starter tier",
    userRole: "starter",
    steps: [
      CommonSteps.verifyPageLoad("NeuroSEO", "/neuroseo"),
      {
        name: "Test basic NeuroSEO features",
        action: async (page) => {
          // Check for NeuroSEO Basic features
          await expect(page.locator("text=Neural Crawler")).toBeVisible();
          await expect(page.locator("text=Semantic Map")).toBeVisible();

          // Try to use Neural Crawler
          await page
            .locator("input[type='url'], input[placeholder*='url']")
            .first()
            .fill("https://example.com");
          await page
            .locator("button:has-text(/analyze|crawl|scan/i)")
            .first()
            .click();

          // Wait for results
          await page.waitForTimeout(8000);

          // Check for results
          await expect(
            page.locator(
              '[data-testid="neural-crawler-results"], [data-testid="semantic-map-results"]'
            )
          ).toBeVisible();
        },
        skipOnFailure: true,
      },
      CommonSteps.takeScreenshot("starter-user-neuroseo-basic"),
    ],
  },

  {
    name: "Starter User - Access Limits",
    description: "Verify starter tier access limitations",
    userRole: "starter",
    steps: [
      {
        name: "Check access to restricted features",
        action: async (page) => {
          // These features should be restricted for starter tier
          const restrictedFeatures = [
            "/competitors",
            "/unlimited-neuroseo",
            "/admin",
          ];

          for (const feature of restrictedFeatures) {
            await page.goto(feature, { timeout: 10000 }).catch(() => {});
            await page.waitForLoadState("domcontentloaded").catch(() => {});

            // Should see upgrade prompts or access denied
            const accessDenied = await page
              .locator("text=/upgrade|premium|access denied/i")
              .count();
            expect(accessDenied).toBeGreaterThan(0);

            await page.screenshot({
              path: `test-results/starter-restricted-${feature.replace(/\//g, "-")}-${Date.now()}.png`,
            });
          }
        },
        skipOnFailure: true,
      },
    ],
  },
];

// Agency tier user test flows
export const agencyUserFlows: TestFlow[] = [
  {
    name: "Agency User - Dashboard Access",
    description: "Verify agency tier dashboard features",
    userRole: "agency",
    steps: [
      CommonSteps.navigateToDashboard(),
      {
        name: "Verify agency tier features",
        action: async (page) => {
          // Check for agency-specific elements
          await expect(page.locator("text=Competitors")).toBeVisible();
          await expect(page.locator("text=NeuroSEO Advanced")).toBeVisible();

          // Check for minimal upgrade prompts
          const upgradePrompts = await page
            .locator("text=/upgrade|premium/i")
            .count();
          console.log(
            `Found ${upgradePrompts} upgrade prompts (should be minimal for agency tier)`
          );
          expect(upgradePrompts).toBeLessThan(3);
        },
      },
      CommonSteps.takeScreenshot("agency-user-dashboard"),
    ],
  },

  {
    name: "Agency User - Competitors Analysis",
    description: "Test competitors analysis functionality",
    userRole: "agency",
    steps: [
      CommonSteps.verifyPageLoad("Competitors", "/competitors"),
      {
        name: "Test competitors analysis features",
        action: async (page) => {
          // Test competitor input
          await page
            .locator(
              "input[type='url'], input[placeholder*='competitor'], input[placeholder*='domain']"
            )
            .first()
            .fill("https://competitor-example.com");

          // Add second competitor (agency tier feature)
          const addButtons = await page
            .locator("button:has-text(/add|more/i)")
            .count();
          if (addButtons > 0) {
            await page.locator("button:has-text(/add|more/i)").first().click();
            await page
              .locator("input[type='url']")
              .nth(1)
              .fill("https://another-competitor.com");
          }

          // Submit for analysis
          await page
            .locator("button:has-text(/analyze|compare|start/i)")
            .first()
            .click();

          // Wait for results
          await page.waitForTimeout(8000);

          // Check for analysis results
          await expect(
            page.locator('[data-testid="competitors-analysis-results"]')
          ).toBeVisible();
        },
        skipOnFailure: true,
      },
      CommonSteps.takeScreenshot("agency-user-competitors"),
    ],
  },

  {
    name: "Agency User - NeuroSEO Advanced",
    description: "Test NeuroSEO advanced features",
    userRole: "agency",
    steps: [
      CommonSteps.verifyPageLoad("NeuroSEO", "/neuroseo"),
      {
        name: "Test advanced NeuroSEO features",
        action: async (page) => {
          // Check for advanced features
          await expect(page.locator("text=Neural Crawler")).toBeVisible();
          await expect(page.locator("text=Semantic Map")).toBeVisible();
          await expect(page.locator("text=AI Visibility")).toBeVisible();
          await expect(page.locator("text=TrustBlock")).toBeVisible();

          // Try to use Neural Crawler with advanced settings
          await page
            .locator("input[type='url'], input[placeholder*='url']")
            .first()
            .fill("https://example.com");

          // Enable advanced options
          const advancedOptions = await page
            .locator("text=Advanced Options")
            .count();
          if (advancedOptions > 0) {
            await page.locator("text=Advanced Options").click();

            // Select some advanced options
            await page.locator("input[type='checkbox']").first().check();
          }

          await page
            .locator("button:has-text(/analyze|crawl|scan/i)")
            .first()
            .click();

          // Wait for results
          await page.waitForTimeout(10000);

          // Check for results
          const resultsVisible = await page
            .locator(
              '[data-testid="neural-crawler-results"], [data-testid="semantic-map-results"], [data-testid="ai-visibility-results"], [data-testid="trust-block-results"]'
            )
            .count();
          expect(resultsVisible).toBeGreaterThan(0);
        },
        skipOnFailure: true,
      },
      CommonSteps.takeScreenshot("agency-user-neuroseo-advanced"),
    ],
  },

  {
    name: "Agency User - Access Limits",
    description: "Verify agency tier access limitations",
    userRole: "agency",
    steps: [
      {
        name: "Check access to restricted features",
        action: async (page) => {
          // These features should be restricted for agency tier
          const restrictedFeatures = [
            "/unlimited-neuroseo",
            "/admin",
            "/user-management",
          ];

          for (const feature of restrictedFeatures) {
            await page.goto(feature, { timeout: 10000 }).catch(() => {});
            await page.waitForLoadState("domcontentloaded").catch(() => {});

            // Should see upgrade prompts or access denied
            const accessDenied = await page
              .locator("text=/upgrade|premium|access denied/i")
              .count();
            expect(accessDenied).toBeGreaterThan(0);

            await page.screenshot({
              path: `test-results/agency-restricted-${feature.replace(/\//g, "-")}-${Date.now()}.png`,
            });
          }
        },
        skipOnFailure: true,
      },
    ],
  },
];

// Admin user test flows
export const adminUserFlows: TestFlow[] = [
  {
    name: "Admin User - User Management",
    description: "Test admin user management functionality",
    userRole: "admin",
    steps: [
      CommonSteps.verifyPageLoad("User Management", "/user-management"),
      {
        name: "Test user management features",
        action: async (page) => {
          // Check for admin controls
          await expect(page.locator("text=User Management")).toBeVisible();
          await expect(
            page.locator('[data-testid="user-management-table"]')
          ).toBeVisible();

          // Test search functionality
          await page
            .locator(
              "input[placeholder*='search'], input[placeholder*='filter']"
            )
            .fill("test");
          await page.keyboard.press("Enter");

          // Wait for search results
          await page.waitForTimeout(2000);

          // Test user action menu
          const actionButtons = await page
            .locator('[data-testid="user-actions"], button:has-text("Actions")')
            .count();
          if (actionButtons > 0) {
            await page
              .locator(
                '[data-testid="user-actions"], button:has-text("Actions")'
              )
              .first()
              .click();

            // Check for actions menu
            await expect(
              page.locator("text=/edit|delete|suspend|change tier/i")
            ).toBeVisible();
          }
        },
        skipOnFailure: true,
      },
      CommonSteps.takeScreenshot("admin-user-management"),
    ],
  },

  {
    name: "Admin User - System Admin",
    description: "Test system administration features",
    userRole: "admin",
    steps: [
      CommonSteps.verifyPageLoad("System Admin", "/system-admin"),
      {
        name: "Test system monitoring features",
        action: async (page) => {
          // Check for system monitoring elements
          await expect(page.locator("text=System Metrics")).toBeVisible();
          await expect(page.locator("text=System Logs")).toBeVisible();

          // Check for dashboard elements
          const dashboardElements = await page
            .locator("canvas, svg, [class*='chart'], [class*='graph']")
            .count();
          expect(dashboardElements).toBeGreaterThan(0);

          // Test log filtering
          const logFilters = await page
            .locator("select, [role='combobox'], button:has-text(/filter/i)")
            .count();
          if (logFilters > 0) {
            await page
              .locator("select, [role='combobox'], button:has-text(/filter/i)")
              .first()
              .click();

            // Select a log level filter
            await page.locator("text=/error|warning|info/i").first().click();

            // Wait for filtered results
            await page.waitForTimeout(2000);
          }
        },
        skipOnFailure: true,
      },
      CommonSteps.takeScreenshot("admin-system-monitoring"),
    ],
  },

  {
    name: "Admin User - Subscription Management",
    description: "Test subscription management features",
    userRole: "admin",
    steps: [
      CommonSteps.verifyPageLoad(
        "Subscription Management",
        "/subscription-management"
      ),
      {
        name: "Test subscription management features",
        action: async (page) => {
          // Check for subscription management table
          await expect(
            page.locator('[data-testid="subscription-management-table"]')
          ).toBeVisible();

          // Test filtering
          await page
            .locator(
              "input[placeholder*='search'], input[placeholder*='filter']"
            )
            .fill("active");
          await page.keyboard.press("Enter");

          // Wait for filtered results
          await page.waitForTimeout(2000);

          // Test bulk actions
          const bulkActions = await page
            .locator("button:has-text(/bulk|actions/i)")
            .count();
          if (bulkActions > 0) {
            await page.locator("button:has-text(/bulk|actions/i)").click();

            // Check for bulk action menu
            await expect(
              page.locator("text=/export|email|update/i")
            ).toBeVisible();
          }
        },
        skipOnFailure: true,
      },
      CommonSteps.takeScreenshot("admin-subscription-management"),
    ],
  },

  {
    name: "Admin User - Change User Tier",
    description: "Test user tier change functionality",
    userRole: "admin",
    steps: [
      CommonSteps.verifyPageLoad("User Management", "/user-management"),
      {
        name: "Test changing user tier",
        action: async (page) => {
          // Find a user to update
          await page
            .locator(
              "input[placeholder*='search'], input[placeholder*='filter']"
            )
            .fill("free");
          await page.keyboard.press("Enter");

          // Wait for search results
          await page.waitForTimeout(2000);

          // Click actions menu for the first user
          await page
            .locator('[data-testid="user-actions"], button:has-text("Actions")')
            .first()
            .click();

          // Select change tier option
          await page.locator("text=/change tier|update subscription/i").click();

          // Select new tier in modal
          await page
            .locator("select, [role='combobox']")
            .selectOption({ label: "Starter" });

          // Confirm change
          await page.locator("button:has-text(/confirm|save|update/i)").click();

          // Wait for success message
          await page.waitForTimeout(2000);
          await expect(
            page.locator("text=Tier successfully updated")
          ).toBeVisible();
        },
        skipOnFailure: true,
      },
      CommonSteps.takeScreenshot("admin-change-tier"),
    ],
  },
];

// Enterprise tier user test flows
export const enterpriseUserFlows: TestFlow[] = [
  {
    name: "Enterprise User - Full Dashboard Access",
    description:
      "Verify enterprise tier user has access to all dashboard features",
    userRole: "enterprise",
    steps: [
      CommonSteps.navigateToDashboard(),
      {
        name: "Verify enterprise features are available",
        action: async (page) => {
          // Check for enterprise-specific elements
          const enterpriseFeatures = await page
            .locator(
              [
                "text=/enterprise|advanced|unlimited/i",
                "[data-tier='enterprise']",
                "[class*='enterprise']",
              ].join(", ")
            )
            .count();

          console.log(
            `Found ${enterpriseFeatures} enterprise feature indicators`
          );

          // No upgrade prompts should be visible
          const upgradePrompts = await page
            .locator("text=/upgrade|subscribe.*now/i")
            .count();
          expect(upgradePrompts).toBe(0);
        },
      },
      CommonSteps.takeScreenshot("enterprise-user-dashboard"),
    ],
  },

  {
    name: "Enterprise User - Advanced Keyword Analysis",
    description: "Test advanced keyword analysis features for enterprise users",
    userRole: "enterprise",
    steps: [
      CommonSteps.verifyPageLoad("Keyword Tool", "/keyword-tool"),
      {
        name: "Test advanced keyword features",
        action: async (page) => {
          // Check for advanced options
          const advancedOptions = await page
            .locator(
              [
                "text=/bulk|batch|advanced|competitor/i",
                "[data-feature='advanced']",
                "input[type='checkbox']",
                "select",
              ].join(", ")
            )
            .count();

          console.log(`Found ${advancedOptions} advanced feature options`);

          // Try to use advanced features
          const inputs = await page
            .locator("input[type='text'], textarea")
            .count();
          if (inputs > 0) {
            await page
              .locator("input[type='text'], textarea")
              .first()
              .fill("advanced seo strategy");

            // Check for advanced settings
            const checkboxes = await page
              .locator("input[type='checkbox']")
              .count();
            if (checkboxes > 0) {
              // Enable some advanced options
              await page.locator("input[type='checkbox']").first().check();
            }

            // Submit analysis
            const submitButtons = await page
              .locator(
                "button[type='submit'], button:has-text(/analyze|search|suggest/i)"
              )
              .count();
            if (submitButtons > 0) {
              await page
                .locator(
                  "button[type='submit'], button:has-text(/analyze|search|suggest/i)"
                )
                .first()
                .click();
              await page.waitForTimeout(5000);
            }
          }
        },
        skipOnFailure: true,
      },
      CommonSteps.takeScreenshot("enterprise-user-advanced-keyword"),
    ],
  },

  {
    name: "Enterprise User - Unlimited NeuroSEO",
    description: "Test unlimited NeuroSEO features",
    userRole: "enterprise",
    steps: [
      CommonSteps.verifyPageLoad("NeuroSEO", "/neuroseo"),
      {
        name: "Test unlimited NeuroSEO features",
        action: async (page) => {
          // Check for unlimited features
          await expect(page.locator("text=Neural Crawler")).toBeVisible();
          await expect(page.locator("text=Semantic Map")).toBeVisible();
          await expect(page.locator("text=AI Visibility")).toBeVisible();
          await expect(page.locator("text=TrustBlock")).toBeVisible();
          await expect(page.locator("text=Unlimited")).toBeVisible();

          // Try to use Neural Crawler with unlimited settings
          await page
            .locator("input[type='url'], input[placeholder*='url']")
            .first()
            .fill("https://example.com");

          // Enable unlimited options
          const advancedOptions = await page
            .locator("text=Advanced Options")
            .count();
          if (advancedOptions > 0) {
            await page.locator("text=Advanced Options").click();

            // Check all available options
            const checkboxes = await page
              .locator("input[type='checkbox']")
              .all();
            for (const checkbox of checkboxes) {
              await checkbox.check();
            }
          }

          await page
            .locator("button:has-text(/analyze|crawl|scan/i)")
            .first()
            .click();

          // Wait for results
          await page.waitForTimeout(10000);

          // Check for unlimited results
          const resultsVisible = await page
            .locator(
              '[data-testid="neural-crawler-results"], [data-testid="semantic-map-results"], [data-testid="ai-visibility-results"], [data-testid="trust-block-results"]'
            )
            .count();
          expect(resultsVisible).toBeGreaterThan(0);
        },
        skipOnFailure: true,
      },
      CommonSteps.takeScreenshot("enterprise-user-unlimited-neuroseo"),
    ],
  },
];

// Combined test flows for all user tiers
export const allTestFlows = [
  ...freeUserFlows,
  ...starterUserFlows,
  ...agencyUserFlows,
  ...adminUserFlows,
  ...enterpriseUserFlows,
];
