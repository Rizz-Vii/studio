import { test, expect } from "@playwright/test";

// SEO tests to ensure proper configuration for search engines
test.describe("SEO Testing", () => {
  // Test basic SEO configurations
  test("Basic SEO configuration", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    // Check for essential SEO elements

    // 1. Title tag
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(5);
    expect(title.length).toBeLessThan(60); // Recommended length

    // 2. Meta description
    const metaDescription = await page.$eval(
      'meta[name="description"]',
      (element) => element.getAttribute("content")
    );
    expect(metaDescription).toBeTruthy();
    if (metaDescription) {
      expect(metaDescription.length).toBeGreaterThan(50);
      expect(metaDescription.length).toBeLessThan(160); // Recommended length
    }

    // 3. Canonical URL
    const canonical = await page.$eval('link[rel="canonical"]', (element) =>
      element.getAttribute("href")
    );
    expect(canonical).toBeTruthy();
    expect(canonical).toContain("https://"); // Should be absolute URL

    // 4. Favicon
    const favicon = await page.$('link[rel="icon"], link[rel="shortcut icon"]');
    expect(favicon).not.toBeNull();

    // 5. Language attribute
    const htmlLang = await page.$eval("html", (element) =>
      element.getAttribute("lang")
    );
    expect(htmlLang).toBeTruthy();

    // 6. Responsive viewport
    const viewport = await page.$eval('meta[name="viewport"]', (element) =>
      element.getAttribute("content")
    );
    expect(viewport).toContain("width=device-width");
  });

  // Test SEO for multiple pages
  const pagesToTest = [
    { path: "/", name: "Home Page" },
    { path: "/login", name: "Login Page" },
    { path: "/signup", name: "Signup Page" },
    { path: "/pricing", name: "Pricing Page" },
    { path: "/features", name: "Features Page" },
  ];

  for (const pageInfo of pagesToTest) {
    test(`SEO elements check - ${pageInfo.name}`, async ({ page }) => {
      await page.goto(pageInfo.path, { waitUntil: "networkidle" });

      // Check for unique title and description
      const title = await page.title();
      const metaDescription = await page
        .$eval('meta[name="description"]', (element) =>
          element.getAttribute("content")
        )
        .catch(() => "");

      console.log(`${pageInfo.name} - Title: ${title}`);
      console.log(`${pageInfo.name} - Meta Description: ${metaDescription}`);

      // Check heading structure
      const h1Count = await page.$$eval("h1", (elements) => elements.length);
      const h1Text = await page
        .$eval("h1", (element) => element.textContent)
        .catch(() => "");

      expect(h1Count).toBe(1); // Should have exactly one H1
      expect(h1Text).toBeTruthy();

      // Check for Open Graph tags for social sharing
      const ogTitle = await page
        .$eval('meta[property="og:title"]', (element) =>
          element.getAttribute("content")
        )
        .catch(() => "");
      const ogDescription = await page
        .$eval('meta[property="og:description"]', (element) =>
          element.getAttribute("content")
        )
        .catch(() => "");
      const ogImage = await page
        .$eval('meta[property="og:image"]', (element) =>
          element.getAttribute("content")
        )
        .catch(() => "");

      // Not all pages might need Open Graph, but important ones should have it
      if (
        ["Home Page", "Features Page", "Pricing Page"].includes(pageInfo.name)
      ) {
        expect(ogTitle).toBeTruthy();
        expect(ogDescription).toBeTruthy();
        expect(ogImage).toBeTruthy();
      }
    });
  }

  // Test XML sitemap
  test("XML sitemap", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);

    const body = await response.text();
    expect(body).toContain("<urlset");
    expect(body).toContain("<url>");
    expect(body).toContain("<loc>");

    // Check for important pages in sitemap
    expect(body).toContain("/features");
    expect(body).toContain("/pricing");
  });

  // Test robots.txt
  test("robots.txt", async ({ request }) => {
    const response = await request.get("/robots.txt");
    expect(response.status()).toBe(200);

    const body = await response.text();
    expect(body).toContain("User-agent:");
    expect(body).toContain("Sitemap:");
  });

  // Test structured data
  test("Structured data validation", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    // Check for JSON-LD structured data
    const structuredData = await page.$$eval(
      'script[type="application/ld+json"]',
      (elements) => elements.map((el) => el.textContent)
    );

    expect(structuredData.length).toBeGreaterThan(0);

    // Parse and validate the first JSON-LD block
    if (structuredData[0]) {
      try {
        const parsed = JSON.parse(structuredData[0]);
        expect(parsed["@context"]).toBe("https://schema.org");
        expect(parsed["@type"]).toBeTruthy();
      } catch (e) {
        // If parsing fails, mark the test as failed
        expect(true).toBe(false);
      }
    }
  });

  // Test mobile friendliness
  test("Mobile friendliness", async ({ browser }) => {
    const mobileViewport = { width: 390, height: 844 };
    const context = await browser.newContext({
      viewport: mobileViewport,
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
    });

    const page = await context.newPage();
    await page.goto("/", { waitUntil: "networkidle" });

    // Check if any content overflows the viewport
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.body.scrollWidth > window.innerWidth;
    });

    expect(hasHorizontalOverflow).toBe(false);

    // Check tap target sizes for mobile SEO
    const smallTapTargets = await page.evaluate(() => {
      const interactiveElements = Array.from(
        document.querySelectorAll('a, button, [role="button"]')
      );
      return interactiveElements.filter((el) => {
        const rect = el.getBoundingClientRect();
        return rect.width < 40 || rect.height < 40;
      }).length;
    });

    expect(smallTapTargets).toBe(0);

    // Take a screenshot for reference
    await page.screenshot({
      path: "test-results/mobile-friendly-test.png",
      fullPage: true,
    });

    await context.close();
  });

  // Test URL structure
  test("URL structure validation", async ({ page }) => {
    // Check several internal links to validate URL structure
    await page.goto("/", { waitUntil: "networkidle" });

    // Get all internal links
    const internalLinks = await page.$$eval(
      "a",
      (links: HTMLAnchorElement[]) => {
        return links
          .map((link) => {
            const href = link.getAttribute("href");
            if (
              href &&
              (href.startsWith("/") || href.includes(window.location.hostname))
            ) {
              return href;
            }
            return null;
          })
          .filter((href): href is string => href !== null);
      }
    );

    console.log("Internal links found:", internalLinks);

    // Validate URL structure for each link
    for (const link of internalLinks.slice(0, 5)) {
      // Limit to first 5 to avoid long test
      if (link && !link.includes("#")) {
        // Ignore anchor links
        // Check if the URL has a clean structure
        expect(link).not.toContain("?");

        // Visit the link and check for 200 status
        const response = link.startsWith("/")
          ? await page.goto(link)
          : await page.goto(link);

        if (response) {
          expect(response.status()).toBe(200);
        }

        // Go back to homepage
        await page.goto("/");
      }
    }
  });

  // Test page speed (another Core Web Vital aspect)
  test("Page speed test", async ({ page }) => {
    const startTime = Date.now();
    await page.goto("/", { waitUntil: "networkidle" });
    const loadTime = Date.now() - startTime;

    console.log(`Page load time: ${loadTime}ms`);

    // SEO favors fast-loading pages
    expect(loadTime).toBeLessThan(3000);

    // Check resource count
    const resourceCount = await page.evaluate(() => {
      return performance.getEntriesByType("resource").length;
    });

    console.log(`Resource count: ${resourceCount}`);

    // Lower resource count is generally better for SEO
    expect(resourceCount).toBeLessThan(50);
  });

  // Test hreflang tags for international SEO
  test("hreflang tags for international SEO", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    // Check for hreflang tags
    const hreflangTags = await page.$$eval(
      'link[rel="alternate"][hreflang]',
      (elements) =>
        elements.map((el) => ({
          hreflang: el.getAttribute("hreflang"),
          href: el.getAttribute("href"),
        }))
    );

    console.log("hreflang tags:", hreflangTags);

    // If the site has international versions, it should have hreflang tags
    // Not all sites need these, so we'll just log them

    // If specifically testing international SEO, uncomment this:
    // expect(hreflangTags.length).toBeGreaterThan(0);
  });

  // Test schema.org markup for rich results
  test("schema.org rich results markup", async ({ page }) => {
    // Test on a product or article page if available
    const pageToTest = "/features"; // Change to a suitable page
    await page.goto(pageToTest, { waitUntil: "networkidle" });

    // Check for schema.org markup
    const hasSchemaMarkup = await page.evaluate(() => {
      // Look for JSON-LD format
      const jsonLdElements = Array.from(
        document.querySelectorAll('script[type="application/ld+json"]')
      );
      if (jsonLdElements.length > 0) return true;

      // Look for microdata format
      return !!document.querySelector('[itemtype^="https://schema.org"]');
    });

    // Important pages should have schema markup for rich results
    expect(hasSchemaMarkup).toBe(true);
  });

  // Test for broken links
  test("Broken links check", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    // Get all links on the page
    const links = await page.$$eval("a", (anchors: HTMLAnchorElement[]) =>
      anchors
        .map((a) => a.href)
        .filter(
          (href) =>
            href !== "" &&
            !href.startsWith("javascript:") &&
            !href.startsWith("mailto:")
        )
    );

    console.log(`Found ${links.length} links to check`);

    // Check first 5 links to avoid long test
    const linksToCheck = links.slice(0, 5);
    for (const link of linksToCheck) {
      console.log(`Checking link: ${link}`);

      const response = await page
        .context()
        .request.get(link)
        .catch((e) => {
          console.log(`Error fetching ${link}: ${e.message}`);
          return { status: () => 0 };
        });

      const status = response.status();
      console.log(`Status for ${link}: ${status}`);

      // Valid status codes
      expect(status).toBeGreaterThanOrEqual(200);
      expect(status).toBeLessThan(400);
    }
  });

  // Test NeuroSEO tool functionality
  test("NeuroSEO tool functionality", async ({ page }) => {
    // Login first
    await page.goto("/login");
    await page.fill('[data-testid="email-input"]', "test-agency@example.com");
    await page.fill('[data-testid="password-input"]', "testPassword123");
    await page.click('[data-testid="login-button"]');

    // Navigate to NeuroSEO tool
    await page.goto("/neuroseo");
    await page.waitForLoadState("networkidle");

    // Check if tool loads
    const toolTitle = await page.textContent("h1");
    expect(toolTitle).toContain("NeuroSEO");

    // Test keyword analysis feature
    await page.fill('[data-testid="keyword-input"]', "content optimization");
    await page.click('[data-testid="analyze-button"]');

    // Wait for analysis to complete
    await page.waitForSelector('[data-testid="analysis-results"]');

    // Check if analysis contains expected sections
    const hasKeywordDifficulty = await page.isVisible(
      "text=Keyword Difficulty"
    );
    const hasRelatedKeywords = await page.isVisible("text=Related Keywords");
    const hasSEORecommendations = await page.isVisible(
      "text=SEO Recommendations"
    );

    expect(hasKeywordDifficulty).toBe(true);
    expect(hasRelatedKeywords).toBe(true);
    expect(hasSEORecommendations).toBe(true);

    // Check neural analysis feature
    if (await page.isVisible('[data-testid="neural-analysis-tab"]')) {
      await page.click('[data-testid="neural-analysis-tab"]');
      await page.waitForSelector('[data-testid="neural-analysis-results"]');

      const hasSemanticMap = await page.isVisible("text=Semantic Map");
      expect(hasSemanticMap).toBe(true);
    }
  });

  // Test content analyzer SEO functionality
  test("Content analyzer SEO functionality", async ({ page }) => {
    // Login first
    await page.goto("/login");
    await page.fill('[data-testid="email-input"]', "test-agency@example.com");
    await page.fill('[data-testid="password-input"]', "testPassword123");
    await page.click('[data-testid="login-button"]');

    // Navigate to content analyzer
    await page.goto("/content-analyzer");
    await page.waitForLoadState("networkidle");

    // Enter URL to analyze
    await page.fill('[data-testid="url-input"]', "https://example.com");
    await page.click('[data-testid="analyze-button"]');

    // Wait for analysis to complete
    await page.waitForSelector('[data-testid="analysis-results"]');

    // Check SEO metrics
    const hasTitleAnalysis = await page.isVisible("text=Title Tag");
    const hasMetaDescriptionAnalysis = await page.isVisible(
      "text=Meta Description"
    );
    const hasHeadingStructure = await page.isVisible("text=Heading Structure");
    const hasContentAnalysis = await page.isVisible("text=Content Analysis");

    expect(hasTitleAnalysis).toBe(true);
    expect(hasMetaDescriptionAnalysis).toBe(true);
    expect(hasHeadingStructure).toBe(true);
    expect(hasContentAnalysis).toBe(true);

    // Test content optimization suggestions
    if (await page.isVisible('[data-testid="optimization-tab"]')) {
      await page.click('[data-testid="optimization-tab"]');
      await page.waitForSelector('[data-testid="optimization-suggestions"]');

      const hasSuggestions = await page.isVisible(
        "text=Optimization Suggestions"
      );
      expect(hasSuggestions).toBe(true);
    }
  });
});
