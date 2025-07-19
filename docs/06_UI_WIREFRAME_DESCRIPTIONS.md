# RankPilot UI Wireframe Descriptions

**Document Purpose:**
Provides a textual blueprint for the application's key UI screens, guiding frontend development and design consistency.

**Product Name:** RankPilot  
**Author:** Product & Design Team  
**Last Updated:** July 9, 2025  
**Version:** 1.0

---

## Table of Contents
1. [Screen 1: Dashboard (`/dashboard`)](#screen-1-dashboard-dashboard)
2. [Screen 2: Content Audit Input (`/audit`)](#screen-2-content-audit-input-audit)
3. [Screen 3: Audit Result Report (`/audit/[id]`)](#screen-3-audit-result-report-auditid)
4. [Screen 4: Pricing Page (`/pricing`)](#screen-4-pricing-page-pricing)
5. [Revision History](#revision-history)
6. [Related Documents](#related-documents)

---

### Screen 1: Dashboard (`/dashboard`)

- **Purpose:** Provide a logged-in user with an at-a-glance overview of their account, recent activity, and quick access to tools.
- **Layout:** Two-column layout with a persistent left sidebar for navigation and a main content area.
- **Key Components:**
  - **Left Sidebar (Navigation):**
    - Logo: RankPilot
    - Nav Links: Dashboard, Content Audit, Account, Billing.
    - User Profile: Avatar, Name, Logout button.
  - **Main Content Area:**
    - **Header:** "Welcome back, [User Name]!"
    - **Usage Card:** A prominent card displaying `Audits Used: 5 / 20 this month`. Includes an "Upgrade Plan" button.
    - **Recent Audits Table:** A list of the 5 most recent audits. Columns: `URL`, `Score`, `Date`, `View Report` (link).
    - **Call-to-Action Card:** A large button/card prompting "Run a New Content Audit".

---

### Screen 2: Content Audit Input (`/audit`)

- **Purpose:** Allow a user to initiate a new content analysis.
- **Layout:** Standard layout with sidebar and a focused central form.
- **Key Components:**
  - **Page Title:** "Run a Content Audit"
  - **Input Form:**
    - A single, large text input field with a label: "Enter a URL to analyze".
    - Submit Button: "Analyze Page", styled as the primary action.
    - Usage Note (small text below button): "This will use 1 audit from your monthly quota."
  - **State Handling:**
    - **Loading:** After submission, the button should show a spinner and be disabled. A message "Analyzing page, this may take a moment..." should appear.

---

### Screen 3: Audit Result Report (`/audit/[id]`)

- **Purpose:** Display the comprehensive findings of a single audit in an organized and actionable way.
- **Layout:** Standard layout with a tabbed interface for the main content area to manage complexity.
- **Key Components:**
  - **Report Header:**
    - Title: "Audit Report: `https://example.com/blog/post`"
    - Overall Score: A large circular progress bar or gauge showing the "AI Compatibility Score" (e.g., 78/100).
    - Export Button: "Export (PDF)" in the top right.
  - **Tab Navigation:** A set of tabs to switch between report sections.
    - `Summary`: High-level overview and top 3 recommendations.
    - `Semantic Analysis`: Displays the `SemanticMap™` visualization and a list of identified content gaps.
    - `Trust Signals (E-E-A-T)`: Shows the `TrustBlock™` checklist of found/missing signals (author bio, schema, etc.).
    - `On-Page SEO`: Lists technical details like heading structure (H1-H6), meta title, and description.
  - **Actionable Content:** Within each tab, specific findings should be linked to actions. For example, a missing topic in the Semantic Analysis tab could have a "Generate Ideas with RewriteGen™" button next to it.

---

### Screen 4: Pricing Page (`/pricing`)

- **Purpose:** Clearly present the subscription tiers and their features to drive conversions.
- **Layout:** A centered, multi-column layout for easy comparison.
- **Key Components:**
  - **Page Title:** "Find the Plan That's Right For You"
  - **Billing Toggle:** A switch for "Monthly / Annually (Save 20%)".
  - **Pricing Cards (one per tier: Free, Starter, Pro, Agency):**
    - Tier Name (e.g., "Pro")
    - Price (`$99 / month`)
    - Target Audience ("For professionals and small teams")
    - Feature List: A checklist of key features (e.g., `✓ 50 Audits / month`, `✓ SemanticMap™`, `✓ RewriteGen™`).
    - Call-to-Action Button: "Get Started" (for Free) or "Choose Plan" (for paid tiers), leading to checkout.
  - **Enterprise Tier:** A separate section or card for "Enterprise" with a "Contact Sales" button.
  - **FAQ Section:** An accordion list answering common questions about billing, cancellations, and feature limits.

---

## Revision History
| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0     | 2025-07-09 | Product & Design Team | Initial draft |

---

## Related Documents
- [01_EXECUTIVE_SUMMARY.md](./01_EXECUTIVE_SUMMARY.md)
- [02_PRODUCT_REQUIREMENTS_DOCUMENT.md](./02_PRODUCT_REQUIREMENTS_DOCUMENT.md)
- [03_EXECUTION_PLAN.md](./03_EXECUTION_PLAN.md)
- [COMPREHENSIVE_INSTRUCTIONS.md](./COMPREHENSIVE_INSTRUCTIONS.md)

---

*© 2025 RankPilot, Inc. All rights reserved.*