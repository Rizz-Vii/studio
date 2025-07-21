# Copilot Instructions for RankPilot (Studio)

## Project Overview

- **Product:** RankPilot (internal: Studio) is an AI-first SEO SaaS platform.
- **Frontend:** Next.js (App Router), React, Tailwind CSS, shadcn/ui
- **Backend:** Firebase Cloud Functions (Node.js), Firestore (NoSQL)
- **AI/Processing:** OpenAI API (GPT-4o), Playwright/Puppeteer, Genkit
- **Authentication:** Firebase Auth
- **CI/CD:** GitHub Actions, Firebase Hosting

## Architecture & Data Flow

- **App Structure:**
  - `/src/app/(app)/` contains feature pages (e.g., link-view, serp-view)
  - `/src/components/` holds all UI and form components
  - `/functions/` contains backend logic (Firebase Functions, AI flows)
  - `/docs/` contains all project, process, and workflow documentation
- **Data Flow:**
  - User interacts with React forms (e.g., LinkAnalysisForm)
  - Form submits to page handler, which calls AI or backend APIs
  - Results are displayed in the same page, often with charts/tables
  - User actions and results may be logged to Firestore

## Key Patterns & Conventions

- **Hydration & Client State:**
  - Always render form fields; use `isMounted` (set in `useEffect`) to control disabled state, not conditional rendering, to avoid hydration mismatches.
  - Example: `const isFormReady = isMounted && !isLoading;`
- **Form Handling:**
  - Use `react-hook-form` with Zod for validation.
  - Normalize URLs before submission.
  - Always associate `<FormLabel htmlFor>` with `<Input id>` for accessibility.
- **Results Display:**
  - Use `useRef` and `useEffect` to scroll to results after state update.
  - Animate results with `framer-motion`'s `AnimatePresence` and `motion.div`.
- **AI/Backend Integration:**
  - AI flows (e.g., `analyzeLinks`) are imported from `/ai/flows/` and called from page handlers.
  - Backend writes (e.g., user activity logs) use Firestore via Firebase SDK.
- **Security & Status:**
  - Always check `/docs/SECURITY_ROTATION.md` and `/docs/PROJECT_STATUS_AND_NEXT_STEPS.md` before major changes.
  - Update `/docs/AGILE_PRIORITY_PLAN.md` and `/docs/COMPREHENSIVE_INSTRUCTIONS.md` after significant work.

## Developer Workflows

- **Build:** `npm run build` (Next.js)
- **Dev:** `npm run dev` (Next.js, hot reload)
- **Test:** Playwright for E2E, see `/tests/`
- **Deploy:** GitHub Actions auto-deploys to Firebase on push to `master`
- **Backend:** Deploy functions with `firebase deploy --only functions`

## Platform-Specific Commands

- **Windows Environment:** Always provide PowerShell commands (not bash/cmd)
- **Command Format:** Use PowerShell syntax with proper semicolon separators
- **File Paths:** Use Windows-style backslashes for local paths
- **Examples:**
  - Start dev server: `npm run dev-no-turbopack`
  - Run tests: `npm run test:role-based`
  - Check status: `Get-Process | Where-Object {$_.ProcessName -eq "node"}`

## Integration Pointsg

- **OpenAI:** Used for AI-powered features (see `/ai/flows/`)
- **Genkit:** Used for advanced AI orchestration
- **Firestore:** Used for user data, logs, and results
- **Firebase Auth:** Used for user authentication and access control

## Project-Specific Guidance

- **Never use hydration checks to conditionally render form fields or results.**
- **Always update documentation in `/docs/` after major changes.**
- **Follow the tool selection and memory protocols in `/docs/MCP_INSTRUCTION_MAP.md`.**
- **For security, follow `/docs/SECURITY_ROTATION.md` and never commit secrets.**
- **For new features, check `/docs/AGILE_PRIORITY_PLAN.md` for priorities.**

## Example: Link Analysis Page

- Form: `/src/components/link-analysis-form.tsx` (uses `isMounted` for hydration-safe input)
- Page: `/src/app/(app)/link-view/page.tsx` (handles state, calls AI, logs to Firestore, displays results)
- Results: Animated with `framer-motion`, scrolled into view with `useRef`

---

For more, see `/docs/COMPREHENSIVE_INSTRUCTIONS.md` and `/docs/PROJECT_STATUS_AND_NEXT_STEPS.md`.

## PilotBuddy Development Assistant

### Response Style & Commands
- **Ultra-Concise**: Prioritize shortest actionable responses (3 bullets or less)
- **PowerShell-First**: Always provide PowerShell commands for Windows environment (never bash/cmd)
- **Context-Aware**: Remember project structure and reference correct files automatically
- **Code-First**: Default to providing code snippets rather than explanations
- **Pattern-Driven**: Recognize and apply established project patterns automatically

### Productivity Commands (PowerShell)
```powershell
# Development commands
npm run dev-no-turbopack           # Start dev server
npm run test:role-based            # Run complete role-based tests
.\scripts\run-role-based-tests.ps1 # Windows-specific test runner

# Project navigation
Get-ChildItem src\app\(app)\       # Feature pages
Get-ChildItem src\components\      # UI components  
Get-ChildItem functions\           # Backend logic
Get-ChildItem docs\                # Documentation

# Performance monitoring
Get-Process | Where-Object {$_.ProcessName -eq "node"}  # Check Node processes
npm run optimize-windows           # Windows filesystem optimization
npm run emfile:check              # Check for EMFILE issues
```

### Quick Actions
- `@pattern [type]`: Generate code (form|state|ai-flow|firebase)
- `@optimize`: Performance suggestions for current file/feature
- `@security`: Security review based on SECURITY_ROTATION.md
- `@neuro`: NeuroSEO™ implementation guidance
