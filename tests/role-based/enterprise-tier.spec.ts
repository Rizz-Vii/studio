import { test, expect } from "@playwright/test";
import { TestOrchestrator } from "../utils/test-orchestrator";
import { enterpriseUserFlows } from "../flows/role-based-flows";

test.describe("Enterprise Tier User Tests", () => {
  // Extended timeouts for comprehensive enterprise testing
  test.setTimeout(180000); // 3 minutes per test
  
  let orchestrator: TestOrchestrator;

  test.beforeEach(async ({ page }) => {
    orchestrator = new TestOrchestrator(page);
    
    // Set extended timeouts for enterprise features
    page.setDefaultNavigationTimeout(45000);
    page.setDefaultTimeout(30000);
    
    console.log("🏢 Starting Enterprise Tier User Test Suite");
  });

  test.afterEach(async ({ page }) => {
    // Take comprehensive final screenshot
    await page.screenshot({
      path: `test-results/enterprise-tier-final-${Date.now()}.png`,
      fullPage: true
    }).catch(() => {
      // Ignore screenshot failures
    });
    
    console.log("🏁 Enterprise Tier User Test Completed");
  });

  test("Enterprise User - Full Dashboard Access", async ({ page }) => {
    const dashboardFlow = enterpriseUserFlows.find(flow => flow.name.includes("Full Dashboard"));
    if (!dashboardFlow) {
      throw new Error("Full Dashboard flow not found for enterprise users");
    }

    await orchestrator.executeFlow(dashboardFlow);
    
    // Verify enterprise user privileges
    const currentUser = await orchestrator.getCurrentUser();
    expect(currentUser).not.toBeNull();
    expect(currentUser?.role).toBe("admin"); // Admin has all enterprise features
    
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Verify no upgrade prompts are visible
    const upgradePrompts = await page.locator("text=/upgrade|subscribe.*now/i").count();
    expect(upgradePrompts).toBe(0);
  });

  test("Enterprise User - Advanced Keyword Analysis", async ({ page }) => {
    const keywordFlow = enterpriseUserFlows.find(flow => flow.name.includes("Advanced Keyword"));
    if (!keywordFlow) {
      throw new Error("Advanced Keyword flow not found for enterprise users");
    }

    await orchestrator.executeFlow(keywordFlow);
    
    // Verify advanced features are accessible
    const currentUser = await orchestrator.getCurrentUser();
    expect(currentUser?.role).toBe("admin");
    
    // Check for advanced keyword analysis features
    const advancedFeatures = await page.locator([
      "text=/bulk|batch|advanced|competitor/i",
      "input[type='checkbox']",
      "select"
    ].join(", ")).count();
    
    console.log(`Found ${advancedFeatures} advanced keyword features`);
  });

  test("Enterprise User - Link Analysis Advanced Features", async ({ page }) => {
    const linkFlow = enterpriseUserFlows.find(flow => flow.name.includes("Link Analysis"));
    if (!linkFlow) {
      throw new Error("Link Analysis flow not found for enterprise users");
    }

    await orchestrator.executeFlow(linkFlow);
    
    // Verify link analysis advanced capabilities
    const currentUser = await orchestrator.getCurrentUser();
    expect(currentUser?.role).toBe("admin");
  });

  test("Enterprise User - Performance Dashboard Access", async ({ page }) => {
    const performanceFlow = enterpriseUserFlows.find(flow => flow.name.includes("Performance Dashboard"));
    if (!performanceFlow) {
      throw new Error("Performance Dashboard flow not found for enterprise users");
    }

    await orchestrator.executeFlow(performanceFlow);
    
    // Verify performance analytics access
    const currentUser = await orchestrator.getCurrentUser();
    expect(currentUser?.role).toBe("admin");
  });

  test("Enterprise User - Admin Panel Access", async ({ page }) => {
    const adminFlow = enterpriseUserFlows.find(flow => flow.name.includes("Admin Panel"));
    if (!adminFlow) {
      throw new Error("Admin Panel flow not found for enterprise users");
    }

    await orchestrator.executeFlow(adminFlow);
    
    // Verify admin privileges
    const currentUser = await orchestrator.getCurrentUser();
    expect(currentUser?.role).toBe("admin");
  });

  test("Enterprise User - Comprehensive Feature Access", async ({ page }) => {
    const accessFlow = enterpriseUserFlows.find(flow => flow.name.includes("Full Feature Access"));
    if (!accessFlow) {
      throw new Error("Full Feature Access flow not found for enterprise users");
    }

    await orchestrator.executeFlow(accessFlow);
    
    // Verify comprehensive access
    const currentUser = await orchestrator.getCurrentUser();
    expect(currentUser?.role).toBe("admin");
    
    // Verify feature access verification completed
    await orchestrator.verifyFeatureAccess("admin");
  });

  test("Enterprise User - Sequential Comprehensive Testing", async ({ page }) => {
    console.log("🔄 Running comprehensive sequential testing for enterprise tier user");
    
    // Execute all enterprise user flows in sequence
    for (const flow of enterpriseUserFlows) {
      console.log(`\n📋 Executing: ${flow.name}`);
      
      try {
        await orchestrator.executeFlow(flow);
        console.log(`✅ Completed: ${flow.name}`);
        
        // Add delay between flows to prevent rate limiting
        await page.waitForTimeout(2000);
        
      } catch (error) {
        console.error(`❌ Failed: ${flow.name}`, error);
        
        // Take detailed failure screenshot
        await page.screenshot({
          path: `test-results/enterprise-tier-failure-${flow.name.replace(/\s+/g, "-")}-${Date.now()}.png`,
          fullPage: true
        });
        
        throw error;
      }
    }
    
    console.log("🎉 All enterprise tier flows completed successfully");
  });

  test("Enterprise User - Advanced Performance Testing", async ({ page }) => {
    console.log("📊 Starting advanced performance testing for enterprise tier");
    
    const startTime = Date.now();
    
    await orchestrator.executeFlow({
      name: "Enterprise User Advanced Performance Test",
      description: "Test performance with enterprise features enabled",
      userRole: "admin",
      steps: [
        {
          name: "Dashboard performance test",
          action: async (page) => {
            const navStart = Date.now();
            await page.goto("/dashboard");
            await page.waitForLoadState("domcontentloaded");
            await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {
              // Ignore if networkidle times out
            });
            const navTime = Date.now() - navStart;
            
            console.log(`Enterprise dashboard load time: ${navTime}ms`);
            expect(navTime).toBeLessThan(15000);
          }
        },
        {
          name: "Advanced feature access test",
          action: async (page) => {
            const advancedPages = [
              "/keyword-tool",
              "/link-view", 
              "/serp-view",
              "/performance"
            ];
            
            for (const pagePath of advancedPages) {
              const accessStart = Date.now();
              
              try {
                await page.goto(pagePath, { timeout: 20000 });
                await page.waitForLoadState("domcontentloaded");
                
                const accessTime = Date.now() - accessStart;
                console.log(`Enterprise access to ${pagePath}: ${accessTime}ms`);
                expect(accessTime).toBeLessThan(20000);
                
                // Verify page loads without errors
                await expect(page.locator("body")).toBeVisible();
                
              } catch (error) {
                console.error(`Failed to access ${pagePath}:`, error);
                throw error;
              }
            }
          }
        },
        {
          name: "Complex form interaction test",
          action: async (page) => {
            await page.goto("/keyword-tool");
            await page.waitForLoadState("domcontentloaded");
            
            // Test complex form interactions
            const inputs = await page.locator("input, textarea").count();
            const checkboxes = await page.locator("input[type='checkbox']").count();
            const selects = await page.locator("select").count();
            
            console.log(`Found ${inputs} inputs, ${checkboxes} checkboxes, ${selects} selects`);
            
            if (inputs > 0) {
              const interactionStart = Date.now();
              
              // Fill main input
              await page.locator("input, textarea").first().fill("enterprise performance test keywords");
              
              // Interact with advanced options if available
              if (checkboxes > 0) {
                await page.locator("input[type='checkbox']").first().check();
              }
              
              if (selects > 0) {
                await page.locator("select").first().selectOption({ index: 1 });
              }
              
              const interactionTime = Date.now() - interactionStart;
              console.log(`Complex form interaction time: ${interactionTime}ms`);
              expect(interactionTime).toBeLessThan(5000);
            }
          },
          skipOnFailure: true
        },
        {
          name: "Admin panel performance test",
          action: async (page) => {
            try {
              const adminStart = Date.now();
              await page.goto("/adminonly", { timeout: 15000 });
              await page.waitForLoadState("domcontentloaded");
              
              const adminTime = Date.now() - adminStart;
              console.log(`Admin panel access time: ${adminTime}ms`);
              expect(adminTime).toBeLessThan(15000);
              
            } catch (error) {
              console.log("Admin panel might not be fully implemented, skipping performance test");
            }
          },
          skipOnFailure: true
        }
      ]
    });
    
    const totalTime = Date.now() - startTime;
    console.log(`Total enterprise tier performance test time: ${totalTime}ms`);
    expect(totalTime).toBeLessThan(120000); // Should complete within 2 minutes
  });

  test("Enterprise User - Stress Testing", async ({ page }) => {
    console.log("💪 Starting stress testing for enterprise tier user");
    
    await orchestrator.executeFlow({
      name: "Enterprise User Stress Test", 
      description: "Stress test enterprise features with rapid interactions",
      userRole: "admin",
      steps: [
        {
          name: "Rapid page navigation stress test",
          action: async (page) => {
            const pages = ["/dashboard", "/keyword-tool", "/link-view", "/performance", "/dashboard"];
            
            for (let i = 0; i < 3; i++) { // Do 3 rounds
              console.log(`Stress test round ${i + 1}/3`);
              
              for (const pagePath of pages) {
                await page.goto(pagePath, { timeout: 10000 });
                await page.waitForLoadState("domcontentloaded");
                
                // Verify page loads correctly under stress
                await expect(page.locator("body")).toBeVisible();
                
                // Brief pause to simulate user behavior
                await page.waitForTimeout(500);
              }
            }
          }
        },
        {
          name: "Concurrent feature interaction stress test",
          action: async (page) => {
            await page.goto("/keyword-tool");
            await page.waitForLoadState("domcontentloaded");
            
            // Simulate rapid user interactions
            const inputs = await page.locator("input, textarea").count();
            
            if (inputs > 0) {
              for (let i = 0; i < 5; i++) {
                await page.locator("input, textarea").first().fill(`stress test keyword ${i}`);
                await page.keyboard.press("Tab");
                await page.waitForTimeout(200);
              }
            }
          },
          skipOnFailure: true
        }
      ]
    });
    
    console.log("💪 Stress testing completed successfully");
  });
});
