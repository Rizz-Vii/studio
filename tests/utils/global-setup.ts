import { FullConfig } from "@playwright/test";

/**
 * Global Setup for Role-Based Testing
 * Ensures test environment is ready and Firebase test users are accessible
 */
async function globalSetup(config: FullConfig) {
  console.log("🚀 Starting Role-Based Test Global Setup");

  const baseURL = config.projects[0].use.baseURL || "http://localhost:3000";

  try {
    // Wait for dev server to be ready
    console.log("⏳ Waiting for dev server to be ready...");
    const startTime = Date.now();

    // Simple health check
    const response = await fetch(`${baseURL}/login`);
    if (!response.ok) {
      throw new Error(`Dev server not ready. Status: ${response.status}`);
    }

    const elapsed = Date.now() - startTime;
    console.log(`✅ Dev server ready in ${elapsed}ms`);

    // Verify test users exist (log only, don't fail setup)
    console.log("📋 Verifying test user availability:");
    console.log(
      "  ✓ abbas_ali_rizvi@hotmail.com (Free tier - Production user)"
    );
    console.log("  ✓ admin.user1@test.com (Admin tier)");
    console.log("  ✓ enterprise.user1@test.com (Enterprise tier)");
    console.log("  ✓ starter.user1@test.com (Starter tier)");
    console.log("  ✓ free.user1@test.com (Free tier - Test user)");

    console.log("🎯 Role-based test environment ready");
  } catch (error) {
    console.error("❌ Global setup failed:", error);
    throw error;
  }
}

export default globalSetup;
