import { FullConfig } from "@playwright/test";

async function globalTeardown(config: FullConfig) {
  console.log("🧹 Starting Global Test Teardown");
  
  // Clean up test environment variables
  delete process.env.PLAYWRIGHT_TEST_BASE_URL;
  delete process.env.PLAYWRIGHT_RUNNING;
  
  // Generate test summary report
  const fs = require("fs");
  const path = require("path");
  
  try {
    const testResultsDir = path.join(process.cwd(), "test-results");
    
    // Check if test results exist
    if (fs.existsSync(testResultsDir)) {
      // Generate summary of role-based test results
      console.log("📊 Generating test summary...");
      
      const roleBasedDir = path.join(testResultsDir, "role-based");
      if (fs.existsSync(roleBasedDir)) {
        const files = fs.readdirSync(roleBasedDir);
        console.log(`📋 Found ${files.length} role-based test result files`);
      }
      
      // Create simple test summary
      const summary = {
        timestamp: new Date().toISOString(),
        testProjects: config.projects.map(p => ({
          name: p.name,
          userRole: p.metadata?.userRole || "unknown",
          description: p.metadata?.description || "No description"
        })),
        baseURL: config.projects[0].use.baseURL,
        totalProjects: config.projects.length
      };
      
      const summaryPath = path.join(testResultsDir, "test-summary.json");
      fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
      console.log(`📝 Test summary written to ${summaryPath}`);
    }
    
  } catch (error) {
    console.warn("⚠️ Could not generate test summary:", error);
  }
  
  console.log("✅ Global Test Teardown Complete");
}

export default globalTeardown;
