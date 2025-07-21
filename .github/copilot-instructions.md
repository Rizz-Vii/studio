# Copilot Instructions for RankPilot (Studio)

## Project Overview

- **Product:** RankPilot (internal: Studio) is a production-ready AI-first SEO SaaS platform
- **Status:** Phase 4 - Production Readiness (all core features implemented)
- **Frontend:** Next.js (App Router), React, Tailwind CSS, shadcn/ui
- **Backend:** Firebase Cloud Functions (Node.js), Firestore (NoSQL)
- **AI/Processing:** NeuroSEO™ Suite (6 engines), OpenAI API (GPT-4o), Genkit AI flows
- **Authentication:** Firebase Auth with 5-tier access (Free/Starter/Agency/Enterprise/Admin)
- **CI/CD:** GitHub Actions, Firebase Hosting, comprehensive Playwright testing (153 tests)

## Architecture & Data Flow

### App Structure

- `/src/app/(app)/` - Protected feature pages with enhanced navigation
- `/src/app/(auth)/` - Authentication pages with tier-based routing
- `/src/app/(public)/` - Public marketing pages
- `/src/components/` - Reusable UI components using shadcn/ui patterns
- `/src/lib/neuroseo/` - **NeuroSEO™ Suite** (6 AI engines) - FULLY IMPLEMENTED
- `/src/ai/flows/` - Genkit AI flows for additional features
- `/functions/` - Firebase Cloud Functions for backend logic
- `/docs/` - Comprehensive project documentation (69+ files)

### Critical Data Flow Pattern

1. User submits form → Enhanced navigation routes to appropriate tier-restricted features
2. Handler validates with Zod → Calls NeuroSEO™ engines or AI flows
3. **NeuroSEO™ Orchestrator** coordinates 6 engines with quota management
4. Results logged to Firestore with subscription tier tracking
5. Results displayed with animated charts/tables using Recharts + framer-motion

### NeuroSEO™ Suite Architecture (PRODUCTION-READY)

- **NeuralCrawler™**: Intelligent web content extraction with Playwright
- **SemanticMap™**: Advanced NLP analysis and topic visualization
- **AI Visibility Engine**: LLM citation tracking and optimization
- **TrustBlock™**: E-A-T optimization and content authenticity
- **RewriteGen™**: AI-powered content rewriting
- **Orchestrator**: Unified analysis pipeline with competitive positioning

## Key Patterns & Conventions

### Enhanced Navigation System (COMPLETED)

- **NeuroSEO™ Suite Prominence**: Primary navigation group with AI badges
- **Tier-Based Visibility**: Granular control (Free/Starter/Agency/Enterprise/Admin)
- **Collapsible Groups**: Logical feature organization with progressive disclosure
- **Mobile-Optimized**: Touch-friendly navigation with 48px minimum targets

### Subscription Tier Architecture (IMPLEMENTED)

```tsx
// Tier hierarchy with feature inheritance
const tierHierarchy = {
  free: ["dashboard", "keyword-tool"],
  starter: [...free, "content-analyzer", "neuroseo-basic"],
  agency: [...starter, "competitors", "neuroseo-advanced"],
  enterprise: [...agency, "adminonly", "unlimited-neuroseo"],
  admin: [...enterprise, "user-management", "system-admin"],
};

// Usage in components
<FeatureGate requiredTier="agency">
  <NeuroSEOAdvancedFeatures />
</FeatureGate>;
```

### Hydration & Client State (CRITICAL)

- **Never conditionally render form fields based on hydration state**
- Use `useHydration()` hook to control disabled state: `const hydrated = useHydration();`
- Pattern: Always render forms, use `disabled={!hydrated || isLoading}` for inputs
- Example: Components wrapped in `<HydrationProvider>` for hydration-safe rendering

### NeuroSEO™ Integration Pattern (PRODUCTION)

```tsx
// Import the full suite
import { NeuroSEOSuite } from "@/lib/neuroseo";

// Usage in components
const neuroSEO = new NeuroSEOSuite();
const report = await neuroSEO.runAnalysis({
  urls: ["https://example.com"],
  targetKeywords: ["seo", "optimization"],
  analysisType: "comprehensive",
  userPlan: user.subscriptionTier,
  userId: user.uid,
});
```

### Mobile Performance Optimization (COMPLETED)

- **Responsive Utilities**: `src/lib/mobile-responsive-utils.ts` with 8 hooks
- **Touch Targets**: 48px minimum (WCAG compliant)
- **Network-Aware Fetching**: Adaptive loading based on connection
- **Core Web Vitals**: Optimized for LCP < 2.5s, CLS < 0.1

## Developer Workflows

### Test Orchestration System

```typescript
// TestOrchestrator handles user flows and authentication
import { TestOrchestrator } from "../utils/test-orchestrator";

// Setup pattern
test.beforeEach(async ({ page }) => {
  orchestrator = new TestOrchestrator(page);
  page.setDefaultNavigationTimeout(30000);
  page.setDefaultTimeout(20000);
});

// Usage pattern
const flow = userFlows.find((flow) => flow.name.includes("FeatureName"));
await orchestrator.executeFlow(flow);

// Authentication pattern
await orchestrator.userManager.loginAs("tierName"); // "free", "starter", "agency", "enterprise", "admin"
```

### Production Readiness Commands (PowerShell)

```powershell
# Development server (optimized for production testing)
npm run dev-no-turbopack           # Primary dev server (stable)
npm run dev:turbo                  # Turbopack for faster development

# NeuroSEO™ Suite Development
npm run genkit:dev                 # Genkit AI development server
npm run genkit:watch               # Genkit with file watching

# Comprehensive Testing (153 Tests Organized)
npm run test:role-based            # Full role-based tests (5 tiers)
npm run test:critical              # Fast critical path tests
npm run test:performance           # Core Web Vitals validation
npm run test:mobile                # Mobile viewport testing
npm run test:accessibility         # WCAG compliance testing
.\scripts\run-role-based-tests.ps1 # Windows-optimized test runner

# Performance & Optimization (Windows-Specific)
npm run optimize-windows           # Windows filesystem optimization
npm run emfile:check              # File handle monitoring
npm run emfile:monitor             # Continuous monitoring
```

### Production Deployment

```powershell
# Backend functions (australia-southeast2)
firebase deploy --only functions  # Deploy to production region
firebase emulators:start          # Local testing environment

# Frontend (Auto-deployment via GitHub Actions)
git push origin master            # Triggers production deployment
```

### Testing Architecture (Production-Ready)

- **Playwright Suite**: 153 tests across 8 categories (unit, integration, e2e, mobile, visual, performance, accessibility)
- **Role-Based Testing**: Real Firebase users across 5 tiers
- **Test Users**:
  - `free.user1@test.com` (Free)
  - `starter.user1@test.com` (Starter)
  - `agency.user1@test.com` (Agency)
  - `enterprise.user1@test.com` (Enterprise)
  - `admin.enterprise@test.com` (Admin)
- **Mobile Testing**: Dedicated viewport testing with Core Web Vitals
- **Performance Testing**: Automated Core Web Vitals validation
- **Test Structure Pattern**:

  ```typescript
  // Standard role-based test structure
  test("User Tier - Feature Access", async ({ page }) => {
    // Find specific flow from predefined flows
    const featureFlow = tierUserFlows.find((flow) =>
      flow.name.includes("FeatureName")
    );

    // Execute flow via orchestrator
    await orchestrator.executeFlow(featureFlow);

    // Verify tier-specific elements
    await expect(page.locator('[data-testid="feature-results"]')).toBeVisible();
  });

  // Access restriction pattern
  test("User Tier - Access Restrictions", async ({ page }) => {
    await orchestrator.userManager.loginAs("tierName");
    await page.goto("/restricted-feature");
    await expect(
      page.locator("text=/upgrade|premium|subscribe/i")
    ).toBeVisible();
  });
  ```

## Integration Points

### NeuroSEO™ Suite (PRODUCTION SYSTEM)

- **6 AI Engines**: Fully implemented and operational
- **Usage Quotas**: Tier-based limits with real-time tracking
- **API Endpoints**: `/api/neuroseo` with authentication
- **Dashboard**: Professional UI with comprehensive analytics
- **Competitive Analysis**: SWOT analysis and positioning

### Firebase Architecture (PRODUCTION-READY)

- **Project**: rankpilot-h3jpc (australia-southeast2)
- **Authentication**: 5-tier role-based access system
- **Database**: Firestore with RBAC security rules
- **Functions**: Node.js v20, optimized for NeuroSEO™ workloads
- **Monitoring**: Error reporting and performance tracking

### Subscription System (IMPLEMENTED)

- **5 Tiers**: Free → Starter → Agency → Enterprise → Admin
- **Payment**: PayPal integration with webhook handling
- **Quota Management**: Real-time usage tracking and enforcement
- **Access Control**: Page-level protection via `useProtectedRoute()` hook
- **Billing**: Automated subscription management

### Enhanced Navigation (COMPLETED)

- **Collapsible Groups**: NeuroSEO™ Suite, SEO Tools, Competitive Intelligence, Management
- **Tier Visibility**: Features show/hide based on subscription level
- **Mobile Navigation**: Touch-optimized with bottom sheet pattern
- **Analytics**: Built-in navigation behavior tracking

## Project-Specific Guidance

### Production Readiness Focus

- **All core features are implemented** - focus on optimization and launch preparation
- **NeuroSEO™ Suite is operational** - 6 AI engines with quota management
- **Enhanced navigation is live** - tier-based access with mobile optimization
- **Testing infrastructure is comprehensive** - 153 tests across 8 categories

### Critical Development Rules

- **Never use hydration checks to conditionally render form fields or results**
- **Always update documentation in `/docs/` after major changes**
- **Follow security protocols in `/docs/SECURITY_ROTATION.md` - never commit secrets**
- **Check `/docs/PROJECT_STATUS_AND_NEXT_STEPS.md` before major architectural changes**

### Memory Management (Windows-Specific)

- Use `cross-env NODE_OPTIONS='--max-old-space-size=3072'` for development
- Monitor EMFILE errors with `npm run emfile:check`
- Run `npm run optimize-windows` for filesystem optimization

### Documentation Protocol

- **Status:** Update `/docs/PROJECT_STATUS_AND_NEXT_STEPS.md` after releases
- **Features:** Document in `/docs/AGILE_PRIORITY_PLAN.md` for prioritization
- **Architecture:** Maintain `/docs/COMPREHENSIVE_INSTRUCTIONS.md` for deep knowledge

## Example Implementation: NeuroSEO™ Integration

### Component Integration (`/src/components/NeuroSEODashboard.tsx`)

```tsx
import { NeuroSEOSuite } from "@/lib/neuroseo";

const neuroSEO = new NeuroSEOSuite();
const report = await neuroSEO.runAnalysis({
  urls: ["https://example.com"],
  targetKeywords: ["seo", "optimization"],
  analysisType: "comprehensive",
  userPlan: user.subscriptionTier,
  userId: user.uid,
});
```

### API Integration (`/src/app/api/neuroseo/route.ts`)

```tsx
export async function POST(request: NextRequest) {
  const { urls, targetKeywords, analysisType, userPlan, userId } = body;

  const report = await neuroSEO.runAnalysis({
    urls: Array.isArray(urls) ? urls : [urls],
    targetKeywords,
    analysisType,
    userPlan,
    userId,
  });

  return NextResponse.json(report);
}
```

### Enhanced Navigation (`/src/constants/enhanced-nav.ts`)

```tsx
export const neuroSEOItems: NavItem[] = [
  {
    title: "NeuroSEO™ Dashboard",
    href: "/neuroseo",
    icon: Brain,
    badge: "AI",
    requiredTier: "free",
  },
  {
    title: "AI Visibility Engine",
    href: "/neuroseo/ai-visibility",
    icon: Eye,
    requiredTier: "agency",
  },
];
```

---

**Key References:**

- `/docs/COMPREHENSIVE_INSTRUCTIONS.md` - Deep architectural knowledge
- `/docs/PROJECT_STATUS_AND_NEXT_STEPS.md` - Current project state
- `/scripts/run-role-based-tests.ps1` - Windows-optimized testing
- `/docs/MOBILE_ENHANCEMENT_CHECKLIST.md` - Mobile optimization guide

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
