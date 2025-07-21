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
    console.log("🌐 Warming up the development server...");

    // Wait for the server to be ready and warm up key pages
    const maxRetries = 10;
    let retries = 0;

    while (retries < maxRetries) {
      try {
        console.log(
          `📡 Attempting to connect (${retries + 1}/${maxRetries})...`
        );

        // Try to load the homepage to warm up Next.js
        const response = await page.goto("http://localhost:3000", {
          waitUntil: "networkidle",
          timeout: 30000,
        });

        if (response?.ok()) {
          console.log("✅ Development server is ready!");

          // Pre-compile critical pages to speed up tests
          const pagesToWarm = ["/", "/login", "/dashboard"];

          console.log("🔥 Pre-compiling critical pages...");
          for (const path of pagesToWarm) {
            try {
              console.log(`   - Warming ${path}...`);
              await page.goto(`http://localhost:3000${path}`, {
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
      throw new Error("Development server failed to start properly");
    }
  } finally {
    await context.close();
    await browser.close();
  }
}

export default globalSetup;
