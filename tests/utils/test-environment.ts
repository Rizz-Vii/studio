import { BrowserContext, Page } from "@playwright/test";

export class TestEnvironment {
  private static instance: TestEnvironment;
  private readonly env: string;

  private constructor() {
    this.env = process.env.TEST_ENV || "local";
  }

  static getInstance(): TestEnvironment {
    if (!TestEnvironment.instance) {
      TestEnvironment.instance = new TestEnvironment();
    }
    return TestEnvironment.instance;
  }

  async setupContext(context: BrowserContext): Promise<void> {
    // Set environment-specific behaviors
    if (this.env === "local") {
      await context.route("**/*.{png,jpg,jpeg}", (route) =>
        route.fulfill({
          status: 200,
          path: "./tests/fixtures/mock-image.png",
        })
      );
    }

    // Add request logging in development
    if (this.env === "development") {
      context.on("request", (request) => {
        console.log(`>> ${request.method()} ${request.url()}`);
      });
    }
  }

  async setupPage(page: Page): Promise<void> {
    // Add performance monitoring in development/staging
    if (["development", "staging"].includes(this.env)) {
      page.on("console", (msg) => {
        if (msg.type() === "error" || msg.type() === "warning") {
          console.log(`[${msg.type()}] ${msg.text()}`);
        }
      });

      page.on("pageerror", (error) => {
        console.error("Page error:", error);
      });
    }
  }

  getTimeouts(): { action: number; navigation: number; test: number } {
    // Environment-specific timeouts
    switch (this.env) {
      case "ci":
        return {
          action: 10000,
          navigation: 30000,
          test: 60000,
        };
      case "development":
        return {
          action: 5000,
          navigation: 15000,
          test: 30000,
        };
      default:
        return {
          action: Number(process.env.ACTION_TIMEOUT) || 5000,
          navigation: Number(process.env.NAVIGATION_TIMEOUT) || 15000,
          test: Number(process.env.DEFAULT_TIMEOUT) || 30000,
        };
    }
  }

  shouldRecordVideo(): boolean {
    return ["ci", "development"].includes(this.env);
  }

  shouldTakeScreenshots(): boolean {
    return this.env !== "production";
  }

  getRetryConfig(): { count: number; backoff: number } {
    switch (this.env) {
      case "ci":
        return { count: 2, backoff: 1.5 };
      case "development":
        return { count: 1, backoff: 1 };
      default:
        return { count: 0, backoff: 1 };
    }
  }
}
