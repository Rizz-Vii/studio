# RankPilot (Studio) – Comprehensive Project Knowledge Base

## I. Project Vision & Strategy

### 1.1 Core Identity
- **Product Name:** RankPilot (internal codename: Studio)
- **Mission:** Serve as the "Semantic Intelligence Layer" for the internet, enabling businesses to gain visibility and authority in the era of AI-driven search (Google SGE, ChatGPT, etc.).
- **Target Personas:**
  - **SEO Consultants (Alex):** Needs deep, actionable insights for client sites.
  - **Marketing Managers (Maria):** Seeks clear, prioritized recommendations and reporting.
  - **Content Writers (David):** Requires guidance for semantic optimization and authority.
  - **Technical SEOs (Chloe):** Demands technical audits, E-E-A-T signals, and trust metrics.
- **Value Proposition:** AI-powered, actionable SEO insights, semantic analysis, and trust scoring, tailored to modern search paradigms.

### 1.2 Business Goals
- **Monetization:** Subscription tiers (Free, Starter, Pro, Agency, Enterprise).
- **Acquisition & Retention:** Feature-rich onboarding, actionable insights, clear upgrade paths, and agency/client management tools.

---

## II. Product & Features (NeuroSEO™ Suite & UI/UX)

### 2.1 NeuroSEO™ Feature Suite

- **NeuralCrawler™**
  - Extracts content, technical data, and authorship signals from target URLs.
- **SemanticMap™**
  - Performs NLP analysis, identifies topic gaps, and visualizes content clusters.
- **AI Visibility Engine**
  - Simulates search queries, reports on content citations, and provides "why" explanations for rankings.
- **TrustBlock™**
  - Audits E-E-A-T signals, quantifies trust, and provides actionable trust scores.
- **RewriteGen™**
  - AI-powered co-writing for titles, headings, and paragraphs, optimizing for semantic density and authority.
- **Out-of-Scope (v1.0):**
  - No traditional keyword rankings or off-site backlink analysis.

### 2.2 Core Features (from Blueprint)

- **AI Keyword Tool:** AI-driven keyword suggestions, long-tail and high-potential identification.
- **Content Analyzer:** Readability, keyword density, semantic relevance, and actionable advice.
- **SEO Competitors:** Keyword ranking comparison, content gap analysis, and outranking opportunities.
- **SERP Visualization:** Visualizes SERP features, ranking patterns, and user intent.
- **Technical SEO Audit:** Checks title tags, image alts, meta descriptions, broken links, site speed, and mobile-friendliness.
- **Link View (Link Analysis):** Analyzes inbound domains, backlink opportunities, and link quality/relevance.
- **Dashboard Overview:** Displays key SEO metrics, traffic, keyword rankings, and overall SEO score.
- **Actionable Insights:** Prioritized recommendations and a task list with estimated impact.

### 2.3 UI/UX Design & Workflows

#### User Workflows

- **Workflow 1:** New User Onboarding & First Audit (guided, with backend actions and system feedback).
- **Workflow 2:** Upgrading to Paid Plan (Stripe integration, Firebase Custom Claims, subscription status update).
- **Workflow 3:** Agency Consultant Managing Client Project (client audit, quota check, RewriteGen™ usage, PDF export).

#### UI Wireframe Descriptions

- **Dashboard (/dashboard):**
  - Left Sidebar: Navigation, user profile.
  - Main Content: Header, Usage Card, Recent Audits Table, CTA.
- **Content Audit Input (/audit):**
  - URL input, Run Audit button, Advanced Options.
- **Audit Report View (/report/[auditId]):**
  - Overall Score, AI Semantic Analysis, Trust Signals, On-Page SEO, actionable content linking.
- **Pricing Page (/pricing):**
  - Billing toggle, tier cards (Free, Starter, Pro, Agency), Enterprise section.

#### Style Guidelines

- **Colors:** Primary (#6699CC), Background (#E0E5E8), Accent (#C2AED3)
- **Fonts:** Body ('PT Sans'), Headings ('Space Grotesk')
- **Icons:** Minimalist, clarity-focused
- **Layout:** Clean, structured, ample spacing
- **Animations:** Subtle transitions, loading indicators

---

## III. Technical Architecture & Implementation

### 3.1 Core Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS, shadcn/ui
- **Backend:** Firebase Cloud Functions (Node.js)
- **Database:** Firestore (NoSQL)
- **Authentication:** Firebase Auth (Email/Password, Google OAuth)
- **AI & Processing:** OpenAI API (GPT-4o), Playwright/Puppeteer, Embeddings APIs
- **CI/CD:** GitHub Actions (auto-deploy to Firebase on push to master)
- **Live Deployment:** https://rankpilot-h3jpc.web.app/

### 3.2 Code Management & Standards

- **GitIgnore Strategy:** Structured by main, functions, tests, and AI directories; personal ignores and new patterns are managed per documented workflow.
- **Contributing Guidelines:**
  - Fork, clone, and use feature/ or fix/ branch naming.
  - PRs require tests, linting, documentation updates, and clear commit messages.
  - Code review is mandatory.
- **Technical Standards:**
  - **Frontend:** Next.js conventions, hydration-safe forms, accessibility.
  - **Backend:** Cloud Functions targeting Node.js, modular AI flows.
  - **Database:** Firestore data models, security rules, and RBAC.
  - **Security:** No committed secrets, use .env.local and Google Secret Manager.

### 3.3 Development Testing Strategy

- **Problem Analysis:** Test execution order, slow local compilation, and unimplemented features are acknowledged.
- **Immediate Solutions:** Development-ready tests (`npm run test:local:basic`, `npm run test:local`), server warmup, feature detection logic.
- **Test Commands:** `test:local`, `test:local:basic`, `test:local:debug`, `test:prod`, `test:headed:local`, `test:ui`.
- **Future Phases:** Accessibility, cross-browser visual regression, performance monitoring, integration scenarios.
- **Benefits:** Faster feedback, reliable local testing, and robust CI/CD integration.

---

## IV. Project Management & Workflow

### 4.1 Current Progress

- **Phase 0:** Foundation & Setup (100% Complete)
- **Phase 1:** Core MVP (60% Complete)

### 4.2 Immediate Priorities (Sprint 1: Stabilization)

- **Security Hardening:** Firestore rules, RBAC, API rate limiting.
- **Monitoring Enhancement:** Error tracking, performance monitoring, user action logging.
- **Performance Optimization:** Caching, bottleneck analysis.

### 4.3 Future Sprints Focus

- UX improvements, feature enhancements (batch processing, export), and scaling.

### 4.4 Development Protocol (Five Phases)

1. **Concept & Prioritization**
2. **Planning & Design**
3. **Development & Testing:** Code, unit/integration tests, local testing, code reviews.
4. **Review & Release:** QA, UAT, documentation, deployment.
5. **Monitoring & Iteration:** Bug fixes, performance, feedback loops.

- **Key Principles:** Documentation-first, reliability, performance, security, UX.
- **Workflow:** Feature branches, PR reviews, CI/CD pipeline.

---

## V. Scaling Strategy

### 5.1 Architectural Philosophy

- **Serverless & Managed Services:** GCP, Firebase, "scale-by-design."

### 5.2 Technical Scaling Pillars

- **Compute:** Cloud Functions, Task Queues (Cloud Tasks/Pub/Sub) for async jobs.
- **Database:** Firestore optimization, continuous monitoring.
- **Monitoring & Observability:** Unified Google Cloud Monitoring, critical alerts.
- **CI/CD & DevOps:** Enhanced GitHub Actions, staged deployments, one-click rollback.

### 5.3 Security & Compliance

- **Secrets:** Google Cloud Secret Manager.
- **Audits:** Quarterly vulnerability, annual penetration tests.
- **Compliance:** GDPR/CCPA readiness.

### 5.4 Organizational Scaling

- **Documentation:** Treated as a force multiplier.
- **Feedback Loops:** In-app tools, analytics.

---

## VI. Tooling & Ecosystem

### 6.1 Firebase

- **Auth, Firestore, Cloud Functions, Hosting**

### 6.2 Google Cloud Platform

- **Secret Manager, Monitoring, Cloud Tasks, Pub/Sub**

### 6.3 AI Services

- **OpenAI API (GPT-4o), Playwright/Puppeteer**

### 6.4 Development Tools

- **Next.js, React, Tailwind CSS, shadcn/ui, Node.js, GitHub Actions**

### 6.5 Other Integrations

- **Stripe:** Webhook handler for billing and subscription management.

---

## VII. Actionable Protocols & Conventions

- **Hydration & Client State:** Always render form fields; use `isMounted` for disabled state, not conditional rendering.
- **Form Handling:** Use `react-hook-form` with Zod, normalize URLs, ensure accessibility.
- **Results Display:** Use `useRef` and `useEffect` for scrolling, animate with `framer-motion`.
- **AI/Backend Integration:** Import AI flows from `/ai/flows/`, log user actions/results to Firestore.
- **Security & Status:** Always check and update `/docs/SECURITY_ROTATION.md`, `/docs/PROJECT_STATUS_AND_NEXT_STEPS.md`, `/docs/AGILE_PRIORITY_PLAN.md`, and `/docs/COMPREHENSIVE_INSTRUCTIONS.md` after major changes.
- **Testing:** Playwright for E2E, see `/tests/`.
- **Build/Dev/Deploy:** `npm run build`, `npm run dev`, GitHub Actions for deploy, `firebase deploy --only functions` for backend.

---


## VIII. Documentation & Continuous Improvement

- **Documentation:** All major changes must be reflected in `/docs/`.
- **Post-Deployment Documentation Review:** After every successful deployment to live hosting (production), conduct a thorough review of all documentation in `/docs/`:
  - Update all relevant files to accurately reflect the current state of the application, infrastructure, features, and workflows.
  - Ensure that deployment steps, environment variables, security protocols, and user-facing changes are documented.
  - Confirm that `/docs/SECURITY_ROTATION.md`, `/docs/PROJECT_STATUS_AND_NEXT_STEPS.md`, `/docs/AGILE_PRIORITY_PLAN.md`, `/docs/COMPREHENSIVE_INSTRUCTIONS.md`, and any other process-critical files are up to date.
  - Log the documentation review in the appropriate changelog or status file.
- **Security:** Never commit secrets; follow rotation and audit protocols.
- **Prioritization:** Check `/docs/AGILE_PRIORITY_PLAN.md` before new features.
- **Tool Selection:** Adhere to `/docs/MCP_INSTRUCTION_MAP.md`.

---

**This knowledge base enables autonomous, standards-compliant development, deployment, and scaling of RankPilot (Studio) as per all provided documentation.**
