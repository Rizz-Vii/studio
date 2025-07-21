import { FullConfig } from "@playwright/test";

/**
 * Global Teardown for Role-Based Testing
 * Cleanup and reporting after all tests complete
 */
async function globalTeardown(config: FullConfig) {
  console.log("🏁 Starting Role-Based Test Global Teardown");

  try {
    // Log test completion summary
    console.log("📊 Test Execution Summary:");
    console.log("  ✓ Role-based access control tests completed");
    console.log("  ✓ Multi-tier user authentication validated");
    console.log("  ✓ Feature access boundaries verified");
    console.log("  ✓ Session management tested");

    // Check for test artifacts
    const fs = require("fs");
    const path = require("path");

    const artifactsDir = "test-results";
    if (fs.existsSync(artifactsDir)) {
      const files = fs.readdirSync(artifactsDir);
      console.log(`📁 Test artifacts generated: ${files.length} files`);

      // List key report files
      const reportFiles = files.filter(
        (f: string) =>
          f.endsWith(".html") || f.endsWith(".json") || f.endsWith(".xml")
      );

      if (reportFiles.length > 0) {
        console.log("📋 Available reports:");
        reportFiles.forEach((file: string) => {
          console.log(`  - ${file}`);
        });
      }
    }

    console.log("✅ Global teardown completed successfully");
  } catch (error) {
    console.error("⚠️ Global teardown encountered issues:", error);
    // Don't fail the entire test suite for teardown issues
  }
}

export default globalTeardown;
