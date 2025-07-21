import { test, expect } from "@playwright/test";

test.describe("SEO Meta and Configuration Tests", () => {
  const pagesToTest = [
    { path: "/", name: "Home Page" },
    { path: "/login", name: "Login Page" },
    { path: "/signup", name: "Signup Page" },
    { path: "/pricing", name: "Pricing Page" },
    { path: "/features", name: "Features Page" },
  ];

  for (const pageInfo of pagesToTest) {
    test(`should have correct SEO meta tags on ${pageInfo.name}`, async ({
      page,
    }) => {
      await page.goto(pageInfo.path, { waitUntil: "networkidle" });

      const title = await page.title();
      expect(title).not.toBe("");
      expect(title.length).toBeLessThan(70);

      const metaDescription = await page.getAttribute(
        'meta[name="description"]',
        "content"
      );
      expect(metaDescription).not.toBe("");
      expect(metaDescription!.length).toBeLessThan(160);

      const canonical = await page.getAttribute(
        'link[rel="canonical"]',
        "href"
      );
      expect(canonical).not.toBe("");
      expect(canonical).toContain(pageInfo.path);

      const h1Count = await page.locator("h1").count();
      expect(h1Count).toBe(1);
    });
  }

  test("should have a valid and accessible sitemap.xml", async ({
    request,
  }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.ok()).toBeTruthy();
    const body = await response.text();
    expect(body).toContain("<urlset");
    expect(body).toContain("<loc>");
  });

  test("should have a valid robots.txt", async ({ request }) => {
    const response = await request.get("/robots.txt");
    expect(response.ok()).toBeTruthy();
    const body = await response.text();
    expect(body).toContain("User-agent:");
    expect(body).toContain("Sitemap:");
  });

  test("should have valid structured data on the home page", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const structuredDataElements = await page
      .locator('script[type="application/ld+json"]')
      .all();
    expect(structuredDataElements.length).toBeGreaterThan(0);

    for (const element of structuredDataElements) {
      const content = await element.textContent();
      const data = JSON.parse(content!);
      expect(data["@context"]).toBe("https://schema.org");
      expect(data["@type"]).toBeTruthy();
    }
  });

  test("should have no broken internal links on the home page", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const links = await page.locator('a[href^="/"]').all();

    for (const link of links) {
      const href = await link.getAttribute("href");
      if (href) {
        const response = await page.request.get(href);
        expect(response.ok()).toBeTruthy();
      }
    }
  });
});
