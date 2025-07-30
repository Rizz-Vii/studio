# RankPilot Studio - Instructions & Prompts Reference

**Generated**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")  
**Status**: Complete Reference Documentation  
**Purpose**: Comprehensive instruction and prompt library for RankPilot Studio development

---

## 🎯 MCP Instruction Map

### Model Context Protocol Integration

The RankPilot Studio workspace utilizes advanced MCP (Model Context Protocol) integration for enhanced AI-powered development assistance. This comprehensive instruction map provides context for intelligent code analysis, error resolution, and feature development.

#### Core MCP Commands

```powershell
# TypeScript Error Resolution
npm run typecheck                 # Comprehensive error detection
npm run build                     # Production build verification
npm run lint                      # Code quality standards enforcement

# Development Workflow
npm run dev                       # Development server with hot reload
npm run dev-no-turbopack         # Alternative development mode
npm run test                      # Comprehensive test suite execution

# Quality Assurance
npm run format                    # Code formatting standardization
npm run analyze                   # Bundle analysis and optimization
npm run security-audit           # Security vulnerability scanning
```

#### Intelligent Context Patterns

**Error Resolution Protocol:**

1. **Detection Phase**: Systematic error identification using TypeScript compiler
2. **Classification Phase**: Pattern-based error categorization for targeted resolution
3. **Resolution Phase**: Contextual fixes with comprehensive validation
4. **Verification Phase**: Multi-layer testing to ensure stability

**Code Intelligence Features:**

- **Semantic Understanding**: Context-aware code analysis for intelligent suggestions
- **Pattern Recognition**: Automatic identification of common development patterns
- **Dependency Analysis**: Smart dependency resolution and optimization recommendations
- **Performance Insights**: Real-time performance impact analysis for code changes

---

## 🤖 Copilot Instruction Framework

### GitHub Copilot Enhanced Instructions

RankPilot Studio is configured with specialized instructions for GitHub Copilot to provide context-aware assistance for AI-First SEO SaaS development.

#### Core Development Context

```typescript
// Context: AI-First SEO SaaS Platform
// Framework: Next.js 15.4.1 + TypeScript 5.7.2
// Architecture: Firebase + Stripe + 6 NeuroSEO™ AI Engines
// Testing: Playwright E2E + Jest Unit Testing
// Styling: TailwindCSS + Shadcn/ui Components
```

#### Specialized Prompt Templates

**Component Development:**

```
Generate a TypeScript React component for RankPilot Studio that:
- Follows Next.js 15.4.1 app router conventions
- Implements proper TypeScript 5.7.2 type safety
- Uses TailwindCSS with Shadcn/ui design system
- Includes proper error handling and loading states
- Implements accessibility best practices (WCAG 2.1)
- Integrates with Firebase authentication context
```

**API Route Development:**

```
Create a Next.js API route for RankPilot Studio that:
- Implements proper TypeScript interfaces for request/response
- Includes comprehensive error handling with proper HTTP status codes
- Integrates with Firebase Firestore for data persistence
- Implements proper authentication and authorization checks
- Includes rate limiting and input validation
- Follows RESTful API design principles
```

**Test Development:**

```
Generate Playwright E2E tests for RankPilot Studio that:
- Tests critical user workflows for SEO tools
- Implements proper page object model patterns
- Includes comprehensive assertions for UI and functionality
- Handles asynchronous operations with proper waiting strategies
- Includes accessibility testing with axe-core integration
- Follows modern Playwright API patterns (no deprecated methods)
```

---

## 🧠 AI Engine Prompt Library

### NeuroSEO™ AI Engine Integration

RankPilot Studio features 6 specialized AI engines for comprehensive SEO analysis and optimization. Each engine has specific prompt templates for optimal performance.

#### Content Analysis Engine Prompts

**SEO Content Analysis:**

```
Analyze the provided content for SEO optimization opportunities:

Content: [CONTENT_INPUT]
Target Keywords: [KEYWORD_LIST]
Competitor Analysis: [COMPETITOR_DATA]

Please provide:
1. Keyword density analysis with recommendations
2. Content structure optimization suggestions
3. Readability score and improvement recommendations
4. Meta description and title tag suggestions
5. Internal linking opportunities
6. Content gap analysis compared to competitors

Output format: Structured JSON with confidence scores
```

**Technical SEO Audit:**

```
Perform comprehensive technical SEO analysis:

URL: [TARGET_URL]
Crawl Data: [CRAWL_RESULTS]
Performance Metrics: [LIGHTHOUSE_DATA]

Analyze:
1. Page speed and Core Web Vitals optimization
2. Mobile responsiveness and usability
3. Schema markup implementation and accuracy
4. URL structure and internal linking architecture
5. XML sitemap and robots.txt configuration
6. Security headers and HTTPS implementation

Provide actionable recommendations with priority levels
```

#### Keyword Research Engine Prompts

**Keyword Discovery:**

```
Generate comprehensive keyword research for:

Industry: [INDUSTRY_SECTOR]
Target Audience: [AUDIENCE_DEMOGRAPHICS]
Geographic Location: [TARGET_LOCATION]
Business Goals: [PRIMARY_OBJECTIVES]

Research Requirements:
1. Primary keyword opportunities (high volume, medium competition)
2. Long-tail keyword variations with search intent analysis
3. Seasonal keyword trends and opportunities
4. Competitor keyword gap analysis
5. Local SEO keyword opportunities (if applicable)
6. Voice search optimization keywords

Format: CSV export with search volume, competition, and difficulty scores
```

#### Competitor Analysis Engine Prompts

**Competitive Intelligence:**

```
Conduct comprehensive competitor analysis:

Primary Competitors: [COMPETITOR_LIST]
Analysis Scope: [TIMEFRAME]
Industry Vertical: [SECTOR]

Analysis Framework:
1. Organic keyword ranking comparison
2. Content strategy and topic cluster analysis
3. Backlink profile and domain authority assessment
4. Technical SEO implementation comparison
5. Social media presence and engagement analysis
6. Paid advertising strategy insights

Output: Executive summary with actionable competitive advantages
```

---

## 🔧 Development Workflow Instructions

### Project Setup and Configuration

#### Initial Development Environment

```bash
# Clone and setup RankPilot Studio
git clone [REPOSITORY_URL]
cd studio
npm install

# Environment configuration
cp .env.example .env.local
# Configure Firebase, Stripe, and AI API keys

# Development server startup
npm run dev
```

#### Code Quality Standards

**TypeScript Configuration:**

- Strict mode enabled for maximum type safety
- Custom ESLint rules for AI-First development patterns
- Prettier integration for consistent code formatting
- Path mapping for clean import statements

**Component Development Standards:**

```typescript
// Standard component template
interface ComponentProps {
  // Proper TypeScript interface definition
  children?: React.ReactNode;
  className?: string;
  // Specific prop types with JSDoc comments
}

export const Component: React.FC<ComponentProps> = ({
  children,
  className,
  ...props
}) => {
  // Component implementation with proper error boundaries
  // Accessibility attributes
  // Performance optimizations
};
```

#### Testing Standards

**Playwright E2E Testing:**

```typescript
// Modern Playwright test pattern
import { test, expect } from '@playwright/test';

test.describe('SEO Tool Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Setup authenticated state
    await page.goto('/dashboard');
  });

  test('should perform keyword analysis', async ({ page }) => {
    // Test implementation with proper assertions
    // Accessibility testing integration
    // Performance monitoring
  });
});
```

---

## 📋 ChatMode Instructions

### AI Assistant Integration

RankPilot Studio includes specialized chat modes for different development contexts and user assistance scenarios.

#### Developer Chat Mode

**Context**: Technical development assistance for RankPilot Studio codebase

**Capabilities:**

- Code review and optimization suggestions
- Architecture decision guidance
- Performance optimization recommendations
- Security best practice enforcement
- TypeScript error resolution assistance

**Example Interaction:**

```
User: "How should I implement the new enterprise tier feature?"

Response: "For enterprise tier implementation in RankPilot Studio:

1. Update subscription.ts with enterprise tier definition
2. Modify usage-quota.ts for enterprise limits
3. Add enterprise-specific features in component props
4. Update Stripe configuration for enterprise pricing
5. Implement enterprise dashboard with advanced analytics

Code examples provided with TypeScript interfaces..."
```

#### User Support Chat Mode

**Context**: End-user assistance for SEO tool functionality

**Capabilities:**

- SEO strategy guidance
- Tool usage instructions
- Feature explanation and best practices
- Troubleshooting common issues
- Performance interpretation assistance

**Example Interaction:**

```
User: "How do I interpret my keyword analysis results?"

Response: "Your keyword analysis results show several key metrics:

📊 Search Volume: Monthly search frequency
🎯 Competition Level: Difficulty to rank
📈 Trend Data: Search pattern over time
🔍 Intent Analysis: User search purpose

For best results:
1. Focus on high-volume, low-competition keywords
2. Consider seasonal trends for content planning
3. Match content to search intent
4. Monitor competitor rankings for opportunities..."
```

---

## 🎨 UI/UX Design Instructions

### Design System Guidelines

#### Component Design Principles

**Accessibility First:**

- WCAG 2.1 AA compliance for all interactive elements
- Proper ARIA labels and semantic HTML structure
- Keyboard navigation support with focus indicators
- Color contrast ratios meeting accessibility standards

**Performance Optimization:**

- Lazy loading for non-critical components
- Optimized image delivery with Next.js Image component
- Code splitting for improved bundle efficiency
- Progressive enhancement for core functionality

**Responsive Design:**

```css
/* Mobile-first responsive breakpoints */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

#### Brand Guidelines

**Color Palette:**

- Primary: Blue tones for trust and professionalism
- Secondary: Green accents for success and growth
- Accent: Orange highlights for calls-to-action
- Neutral: Gray scale for content hierarchy

**Typography:**

- Headings: Inter font family for clarity
- Body text: System fonts for optimal readability
- Code: JetBrains Mono for technical content

---

## 🚀 Deployment Instructions

### Production Deployment

#### Pre-Deployment Checklist

```bash
# Comprehensive pre-deployment validation
npm run typecheck              # Zero TypeScript errors
npm run build                  # Successful production build
npm run test                   # All tests passing
npm run lint                   # Code quality standards met
npm run security-audit         # No security vulnerabilities
```

#### Environment Configuration

**Production Environment Variables:**

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# AI Engine APIs
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_AI_API_KEY=

# Security Configuration
NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

#### Deployment Strategy

**Blue-Green Deployment:**

1. Deploy to staging environment for final validation
2. Switch traffic to new production deployment
3. Monitor performance and error rates
4. Rollback capability for immediate recovery

---

## 📊 Monitoring and Analytics

### Performance Monitoring

#### Key Metrics Tracking

**Core Web Vitals:**

- Largest Contentful Paint (LCP) < 2.5s
- First Input Delay (FID) < 100ms
- Cumulative Layout Shift (CLS) < 0.1

**Business Metrics:**

- User engagement and session duration
- Feature adoption rates across subscription tiers
- API response times and error rates
- Conversion funnel performance

#### Error Tracking and Logging

**Comprehensive Error Monitoring:**

```typescript
// Error boundary implementation
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to monitoring service
    console.error('Application Error:', error, errorInfo);
    
    // Send to error tracking service
    errorTracker.captureException(error, {
      context: errorInfo,
      user: getCurrentUser(),
      tags: { component: 'SEOTools' }
    });
  }
}
```

---

## 🔐 Security Guidelines

### Security Implementation

#### Authentication and Authorization

**Multi-Factor Authentication:**

- Firebase Auth integration with MFA support
- Role-based access control (RBAC) implementation
- Session management with secure token handling
- Password policy enforcement and monitoring

**API Security:**

```typescript
// API route security middleware
export async function middleware(request: Request) {
  // Rate limiting implementation
  await rateLimiter.check(request);
  
  // Authentication verification
  const user = await verifyAuth(request);
  
  // Authorization checks
  if (!hasPermission(user, request.url)) {
    return new Response('Unauthorized', { status: 403 });
  }
  
  return NextResponse.next();
}
```

#### Data Protection

**GDPR Compliance:**

- User consent management for data collection
- Data minimization and purpose limitation
- Right to deletion and data portability
- Privacy policy and terms of service integration

---

*Generated by PilotBuddy v5.0 Enhanced Automation System*  
*RankPilot Studio - AI-First SEO SaaS Platform*
