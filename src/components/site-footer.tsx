import Link from "next/link";
import {
  FaLinkedin,
  FaTwitter,
  FaYoutube,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";

export default function SiteFooter() {
  return (
    <footer
      className="w-full bg-white/90 backdrop-blur-sm border-t border-gray-200"
      style={{
        boxShadow: "0 -8px 32px -8px rgba(0,0,0,0.10)", // top shadow only
        zIndex: 10,
      }}
    >
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-5 gap-8 text-[15px] text-muted-foreground">
        {/* Services */}
        <div>
          <h4 className="font-bold mb-3 text-foreground tracking-tight">
            Services
          </h4>
          <ul className="space-y-1">
            <li>
              <Link href="/seo-audit" className="hover:underline">
                SEO Audit
              </Link>
            </li>
            <li>
              <Link href="/keyword-tool" className="hover:underline">
                Keyword Intelligence
              </Link>
            </li>
            <li>
              <Link href="/content-analyzer" className="hover:underline">
                Content Analyzer
              </Link>
            </li>
            <li>
              <Link href="/competitors" className="hover:underline">
                Competitor Tracking
              </Link>
            </li>
            <li>
              <Link href="/link-view" className="hover:underline">
                Link Analysis
              </Link>
            </li>
            <li>
              <Link href="/serp-view" className="hover:underline">
                SERP View
              </Link>
            </li>
            <li>
              <Link href="/content-brief" className="hover:underline">
                Content Brief
              </Link>
            </li>
          </ul>
        </div>
        {/* Latest Posts */}
        <div>
          <h4 className="font-bold mb-3 text-foreground tracking-tight">
            Latest Posts
          </h4>
          <ul className="space-y-1">
            <li>
              <Link href="/blog/agency-seo-audit" className="hover:underline">
                How to Do an Agency SEO Audit the Right Way
              </Link>
            </li>
            <li>
              <Link href="/blog/ai-seo-tools" className="hover:underline">
                AI SEO Tools: What’s New in 2025
              </Link>
            </li>
            <li>
              <Link href="/blog/seo-metrics" className="hover:underline">
                Understanding SEO Metrics
              </Link>
            </li>
            <li>
              <Link
                href="/blog/competitor-analysis"
                className="hover:underline"
              >
                Competitor Analysis Best Practices
              </Link>
            </li>
          </ul>
        </div>
        {/* Latest Guides */}
        <div>
          <h4 className="font-bold mb-3 text-foreground tracking-tight">
            Latest Guides
          </h4>
          <ul className="space-y-1">
            <li>
              <Link href="/guides/broken-links" className="hover:underline">
                How To Find Broken Links
              </Link>
            </li>
            <li>
              <Link href="/guides/xml-sitemap" className="hover:underline">
                XML Sitemap Generator
              </Link>
            </li>
            <li>
              <Link href="/guides/web-scraping" className="hover:underline">
                Web Scraping for SEO
              </Link>
            </li>
            <li>
              <Link href="/guides/learn-seo" className="hover:underline">
                Learn SEO
              </Link>
            </li>
          </ul>
        </div>
        {/* Contact Us */}
        <div>
          <h4 className="font-bold mb-3 text-foreground tracking-tight">
            Contact Us
          </h4>
          <div className="flex items-center mb-1">
            <FaMapMarkerAlt className="mr-2 text-blue-600" />
            <span>3/107 Albert Street Mordialloc, Victoria 3195</span>
          </div>
          <div className="flex items-center mb-1">
            <FaPhone className="mr-2 text-blue-600" />
            <span>0483 210 312</span>
          </div>
          <div className="flex items-center mb-1">
            <FaEnvelope className="mr-2 text-blue-600" />
            <a href="mailto:support@rankpilot.ai" className="hover:underline">
              support@rankpilot.ai
            </a>
          </div>
          <div className="flex gap-3 mt-3">
            <a
              href="https://linkedin.com"
              aria-label="LinkedIn"
              className="hover:text-blue-700"
            >
              <FaLinkedin size={20} />
            </a>
            <a
              href="https://twitter.com"
              aria-label="Twitter"
              className="hover:text-blue-500"
            >
              <FaTwitter size={20} />
            </a>
            <a
              href="https://youtube.com"
              aria-label="YouTube"
              className="hover:text-red-600"
            >
              <FaYoutube size={20} />
            </a>
          </div>
        </div>
        {/* About Us */}
        <div>
          <h4 className="font-bold mb-3 text-foreground tracking-tight">
            About Us
          </h4>
          <p className="mb-2">
            RankPilot is an AI-first SEO platform for agencies and teams.
          </p>
          <p className="mb-2">
            <Link href="/privacy" className="hover:underline">
              Disclaimer & Privacy Policy
            </Link>
          </p>
          <p className="text-xs text-foreground mt-4">
            &copy; {new Date().getFullYear()} RankPilot
          </p>
        </div>
      </div>
    </footer>
  );
}
