import { chromium, FullConfig } from "@playwright/test";

async function globalSetup(config: FullConfig) {
    console.log("🔧 Development Environment Setup");

    // Check if dev server is running
    console.log("⏳ Checking development server...");

    const browser = await chromium.launch();
    const page = await browser.newPage();

    try {
        // Check localhost dev server
        await page.goto("http://localhost:3000", {
            waitUntil: "networkidle",
            timeout: 10000
        });
        console.log("✅ Development server is running");

        // Optional: Check if functions emulator is running
        try {
            await page.goto("http://localhost:5001", {
                waitUntil: "networkidle",
                timeout: 5000
            });
            console.log("✅ Functions emulator detected");
        } catch {
            console.log("ℹ️ Functions emulator not running (using production)");
        }

        console.log("🎯 Development environment ready");

    } catch (error) {
        console.error("❌ Development server not running!");
        console.error("Please start with: npm run dev-no-turbopack");
        throw new Error("Development server required for testing");
    } finally {
        await browser.close();
    }
}

export default globalSetup;
