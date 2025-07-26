# Copilot Instruction: RankPilot (Studio) Knowledge Base

This file serves as a persistent instruction set for GitHub Copilot and any autonomous AI agent working on the RankPilot (Studio) project. It is derived from the comprehensive project knowledge base and must be referenced for all development, deployment, maintenance, and scaling activities.

---

## I. Project Vision & Strategy

- Product: RankPilot (Studio) is the "Semantic Intelligence Layer" for AI-driven search.
- Target Personas: SEO Consultants, Marketing Managers, Content Writers, Technical SEOs.
- Value Proposition: AI-powered, actionable SEO insights, semantic analysis, and trust scoring.
- Monetization: Subscription tiers; focus on onboarding, actionable insights, and upgrade paths.

## II. Product & Features

- NeuroSEO™ Suite: NeuralCrawler™, SemanticMap™, AI Visibility Engine, TrustBlock™, RewriteGen™.
- Core Features: AI Keyword Tool, Content Analyzer, SEO Competitors, SERP Visualization, Technical SEO Audit, Link View, Dashboard Overview, Actionable Insights.
- UI/UX: Clean, accessible, animated, and workflow-driven. See wireframe and style guidelines.

## III. Technical Architecture & Implementation

- Frontend: Next.js (App Router), React, Tailwind CSS, shadcn/ui.
- Backend: Firebase Cloud Functions (Node.js).
- Database: Firestore (NoSQL).
- Auth: Firebase Auth (Email/Password, Google OAuth).
- AI: OpenAI API (GPT-4o), Playwright/Puppeteer.
- CI/CD: GitHub Actions, Firebase Hosting.
- Code Standards: Hydration-safe forms, accessibility, modular AI flows, no committed secrets.
- Testing: Playwright for E2E, local and CI test commands.

## IV. Project Management & Workflow

- Phases: Foundation, Core MVP, Stabilization, Enhancement, Scaling.
- Protocol: Documentation-first, feature branches, PR reviews, CI/CD pipeline.
- Priorities: Security hardening, monitoring, performance optimization.

## V. Scaling Strategy

- Serverless-first: GCP, Firebase, Cloud Functions, Task Queues.
- Monitoring: Google Cloud Monitoring, alerts.
- Security: Google Secret Manager, regular audits, GDPR/CCPA compliance.
- Documentation: All major changes must be reflected in `/docs/`.

## VI. Tooling & Ecosystem

- Firebase, Google Cloud Platform, OpenAI API, Playwright, Next.js, Stripe.

## VII. Actionable Protocols & Conventions

- Always render form fields; use `isMounted` for disabled state.
- Use `react-hook-form` with Zod, normalize URLs, ensure accessibility.
- Animate results with `framer-motion`, scroll with `useRef`/`useEffect`.
- Import AI flows from `/ai/flows/`, log actions/results to Firestore.
- Check and update `/docs/SECURITY_ROTATION.md`, `/docs/PROJECT_STATUS_AND_NEXT_STEPS.md`, `/docs/AGILE_PRIORITY_PLAN.md`, `/docs/COMPREHENSIVE_INSTRUCTIONS.md` after major changes.
- Never commit secrets; follow rotation and audit protocols.
- Adhere to `/docs/MCP_INSTRUCTION_MAP.md` for tool selection.

---

**This instruction file must be referenced for all RankPilot (Studio) project work. It supersedes generic Copilot behavior and ensures project-specific compliance and excellence.**
