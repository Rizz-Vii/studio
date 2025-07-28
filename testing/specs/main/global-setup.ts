import { chromium, FullConfig } from "@playwright/test";

/**
 * Global setup to ensure the development server is fully ready
 * This helps prevent test failures due to slow compilation
 */
async function globalSetup(config: FullConfig) {
  console.log("🔄 Setting up test environment...");

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Use TEST_BASE_URL if available, otherwise fall back to localhost
    const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3000";
    console.log(`🌐 Warming up the server at ${baseUrl}...`);

    // Wait for the server to be ready and warm up key pages
    const maxRetries = 10;
    let retries = 0;

    while (retries < maxRetries) {
      try {
        console.log(
          `📡 Attempting to connect (${retries + 1}/${maxRetries})...`
        );

        // Try to load the homepage to warm up Next.js
        const response = await page.goto(baseUrl, {
          waitUntil: "networkidle",
          timeout: 30000,
        });

        if (response?.ok()) {
          console.log("✅ Server is ready!");

          // Pre-compile critical pages to speed up tests
          const pagesToWarm = ["/", "/login", "/dashboard"];

          console.log("🔥 Pre-compiling critical pages...");
          for (const path of pagesToWarm) {
            try {
              console.log(`   - Warming ${path}...`);
              await page.goto(`${baseUrl}${path}`, {
                waitUntil: "domcontentloaded",
                timeout: 15000,
              });
              // Small delay to let compilation finish
              await page.waitForTimeout(2000);
            } catch (error) {
              console.log(
                `   ⚠️  ${path} not available (this is OK if not implemented yet)`
              );
            }
          }

          console.log("🎯 Server warmup complete!");
          break;
        }
      } catch (error) {
        retries++;
        console.log(`❌ Connection failed, retrying in 3 seconds...`);
        await page.waitForTimeout(3000);
      }
    }

    if (retries >= maxRetries) {
      throw new Error("Server failed to start properly");
    }
  } finally {
    await context.close();
    await browser.close();
  }
}

export default globalSetup;
