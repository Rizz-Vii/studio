# 🤝 Contributing to RankPilot

Welcome to RankPilot! We're excited that you're interested in contributing to our AI-first SEO SaaS platform. This guide will help you get started with contributing to our codebase.

---

## 🎯 Table of Contents

- [Code of Conduct](#-code-of-conduct)
- [Getting Started](#-getting-started)
- [Development Environment](#-development-environment)
- [Project Structure](#-project-structure)
- [Contribution Workflow](#-contribution-workflow)
- [Coding Standards](#-coding-standards)
- [Testing Guidelines](#-testing-guidelines)
- [Documentation Standards](#-documentation-standards)
- [Commit Guidelines](#-commit-guidelines)
- [Review Process](#-review-process)
- [Security Guidelines](#-security-guidelines)

---

## 📜 Code of Conduct

### **Our Pledge**
We are committed to providing a welcoming and inclusive environment for all contributors, regardless of experience level, gender, gender identity, sexual orientation, disability, personal appearance, body size, race, ethnicity, age, religion, or nationality.

### **Expected Behavior**
- ✅ Be respectful and inclusive in communications
- ✅ Provide constructive feedback and accept criticism gracefully
- ✅ Focus on what's best for the community and project
- ✅ Show empathy towards other community members

### **Unacceptable Behavior**
- ❌ Harassment, discrimination, or offensive comments
- ❌ Personal attacks or insulting/derogatory comments
- ❌ Publishing private information without permission
- ❌ Inappropriate sexual language or imagery

---

## 🚀 Getting Started

### **Prerequisites**
- **Node.js**: v20.x or higher
- **npm**: v10.x or higher
- **Git**: Latest version
- **VS Code**: Recommended IDE with extensions
- **Firebase CLI**: For backend development

### **Required VS Code Extensions**
```json
{
  "recommendations": [
    "ms-typescript.typescript",
    "bradlc.vscode-tailwindcss",
    "ms-playwright.playwright",
    "firebase.firebase-vscode",
    "ms-vscode.vscode-eslint",
    "esbenp.prettier-vscode"
  ]
}
```

### **Initial Setup**
```bash
# 1. Fork the repository on GitHub
# 2. Clone your fork
git clone https://github.com/YOUR-USERNAME/studio.git
cd studio

# 3. Add upstream remote
git remote add upstream https://github.com/Rizz-Vii/studio.git

# 4. Install dependencies
npm install

# 5. Copy environment template
cp .env.example .env.local

# 6. Configure environment variables
# Edit .env.local with your Firebase configuration

# 7. Start development server
npm run dev-no-turbopack
```

---

## 🏗️ Development Environment

### **Environment Configuration**
```bash
# Development Commands
npm run dev-no-turbopack     # Primary dev server (stable)
npm run dev:turbo            # Turbopack for faster development
npm run genkit:dev           # Genkit AI development server

# Testing Commands
npm run test:role-based      # Full role-based tests (5 tiers)
npm run test:critical        # Fast critical path tests
npm run test:mobile          # Mobile viewport testing
npm run test:performance     # Core Web Vitals validation

# Build Commands
npm run build                # Production build
npm run start                # Start production server
npm run type-check           # TypeScript checking
```

### **Firebase Setup**
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Select project
firebase use rankpilot-h3jpc

# Start emulators for local development
firebase emulators:start
```

---

## 📂 Project Structure

### **Directory Organization**
```
/src/
├── app/                    # Next.js App Router
│   ├── (app)/             # Protected application pages
│   ├── (auth)/            # Authentication pages
│   ├── (public)/          # Public marketing pages
│   └── api/               # API routes
├── components/            # Reusable UI components
│   ├── ui/                # shadcn/ui components
│   ├── forms/             # Form components
│   └── layout/            # Layout components
├── lib/                   # Utility libraries
│   ├── neuroseo/          # NeuroSEO™ Suite (6 AI engines)
│   ├── auth/              # Authentication utilities
│   ├── db/                # Database utilities
│   └── utils/             # General utilities
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
└── styles/                # Global styles and themes

/functions/                # Firebase Cloud Functions
/testing/                  # Testing utilities and fixtures
/docs/                     # Project documentation
/pilotScripts/             # Automation scripts
```

### **Key Technologies**
- **Frontend**: Next.js 15.4.1, React 19, TypeScript 5.7
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Firebase Cloud Functions (Node.js v20)
- **Database**: Firestore with RBAC security rules
- **AI**: NeuroSEO™ Suite, OpenAI GPT-4o, Genkit AI flows
- **Testing**: Playwright with role-based authentication
- **Deployment**: Firebase Hosting, GitHub Actions CI/CD

---

## 🔄 Contribution Workflow

### **1. Creating Issues**
Before starting work, create or find an existing issue:

- **Bug Reports**: Use the bug report template
- **Feature Requests**: Use the feature request template
- **Security Issues**: Follow security reporting guidelines
- **Performance Issues**: Use performance issue template

### **2. Branching Strategy**
```bash
# Create feature branch from master
git checkout master
git pull upstream master
git checkout -b feature/your-feature-name

# Create hotfix branch for urgent fixes
git checkout -b hotfix/issue-description

# Create docs branch for documentation
git checkout -b docs/documentation-update
```

### **3. Development Process**
1. **Design First**: Discuss architecture changes in issues
2. **Write Tests**: Add tests before implementing features
3. **Implement Feature**: Follow coding standards and guidelines
4. **Update Documentation**: Keep docs current with changes
5. **Manual Testing**: Test across different user tiers and devices

### **4. Submission Process**
```bash
# Ensure your branch is up to date
git fetch upstream
git rebase upstream/master

# Run quality checks
npm run type-check
npm run test:critical
npm run build

# Push your branch
git push origin feature/your-feature-name

# Create Pull Request on GitHub
# Fill out the PR template completely
```

---

## 💻 Coding Standards

### **TypeScript Guidelines**
```typescript
// ✅ Good: Explicit types and interfaces
interface UserProfile {
  id: string;
  email: string;
  subscriptionTier: 'free' | 'starter' | 'agency' | 'enterprise' | 'admin';
  createdAt: Date;
}

// ✅ Good: Use const assertions for immutable data
const SUBSCRIPTION_TIERS = ['free', 'starter', 'agency', 'enterprise', 'admin'] as const;

// ✅ Good: Proper error handling
try {
  const result = await apiCall();
  return { success: true, data: result };
} catch (error) {
  console.error('API call failed:', error);
  return { success: false, error: error.message };
}
```

### **React Component Guidelines**
```typescript
// ✅ Good: Functional components with proper typing
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  onClick, 
  disabled = false 
}: ButtonProps) {
  return (
    <button
      className={cn(
        'rounded-md font-medium transition-colors',
        variants[variant],
        sizes[size],
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
```

### **Next.js Best Practices**
```typescript
// ✅ Good: Server Components for data fetching
export default async function DashboardPage() {
  const user = await getCurrentUser();
  const projects = await getProjects(user.id);
  
  return (
    <div>
      <DashboardHeader user={user} />
      <ProjectList projects={projects} />
    </div>
  );
}

// ✅ Good: Client Components for interactivity
'use client';

export function InteractiveChart({ data }: { data: ChartData[] }) {
  const [selectedRange, setSelectedRange] = useState('30d');
  
  return (
    <div>
      <RangeSelector value={selectedRange} onChange={setSelectedRange} />
      <Chart data={data} range={selectedRange} />
    </div>
  );
}
```

### **CSS/Styling Guidelines**
```typescript
// ✅ Good: Use Tailwind classes with proper organization
<div className={cn(
  // Layout
  'flex flex-col space-y-4',
  // Sizing
  'w-full max-w-md',
  // Styling
  'bg-white rounded-lg shadow-md',
  // Interactive
  'hover:shadow-lg transition-shadow',
  // Responsive
  'sm:max-w-lg md:max-w-xl'
)}>

// ✅ Good: Use CSS variables for theme consistency
:root {
  --color-primary: 0 0% 9%;
  --color-primary-foreground: 0 0% 98%;
  --border-radius: 0.5rem;
}
```

---

## 🧪 Testing Guidelines

### **Testing Strategy**
We maintain a comprehensive testing suite with 153+ tests across 8 categories:

1. **Unit Tests**: Component and utility function testing
2. **Integration Tests**: API and service interaction testing
3. **E2E Tests**: Full user flow validation
4. **Mobile Tests**: Responsive design and touch interaction
5. **Performance Tests**: Core Web Vitals and load testing
6. **Accessibility Tests**: WCAG 2.1 AA compliance
7. **Visual Tests**: UI consistency and design system
8. **Security Tests**: Authentication and authorization

### **Writing Tests**
```typescript
// ✅ Good: Unit test example
import { render, screen } from '@testing-library/react';
import { Button } from './button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

```typescript
// ✅ Good: E2E test example
import { test, expect } from '@playwright/test';

test('user can create project', async ({ page }) => {
  await page.goto('/dashboard');
  await page.click('[data-testid="create-project-button"]');
  await page.fill('[data-testid="project-name"]', 'Test Project');
  await page.click('[data-testid="submit-button"]');
  
  await expect(page.locator('[data-testid="project-list"]')).toContainText('Test Project');
});
```

### **Test Commands**
```bash
# Run specific test suites
npm run test:unit              # Unit tests only
npm run test:integration       # Integration tests
npm run test:e2e              # End-to-end tests
npm run test:mobile           # Mobile-specific tests
npm run test:accessibility    # Accessibility tests

# Run tests for specific user tiers
npm run test:free             # Free tier user tests
npm run test:enterprise       # Enterprise tier tests
npm run test:role-based       # All tier-based tests

# Performance and quality tests
npm run test:performance      # Core Web Vitals tests
npm run test:lighthouse       # Lighthouse audits
npm run test:security         # Security tests
```

---

## 📚 Documentation Standards

### **Code Documentation**
```typescript
/**
 * Analyzes a URL using the NeuroSEO™ Suite
 * 
 * @param url - The URL to analyze
 * @param options - Analysis configuration options
 * @param options.targetKeywords - Keywords to optimize for
 * @param options.analysisType - Type of analysis to perform
 * @param options.userPlan - User's subscription tier for quota management
 * @returns Promise resolving to comprehensive SEO analysis results
 * 
 * @example
 * ```typescript
 * const analysis = await analyzeUrl('https://example.com', {
 *   targetKeywords: ['seo', 'optimization'],
 *   analysisType: 'comprehensive',
 *   userPlan: 'agency'
 * });
 * ```
 * 
 * @throws {QuotaExceededError} When user has exceeded their analysis quota
 * @throws {InvalidUrlError} When the provided URL is not accessible
 */
export async function analyzeUrl(
  url: string,
  options: AnalysisOptions
): Promise<AnalysisResult> {
  // Implementation
}
```

### **README Updates**
When adding new features, update relevant documentation:

- **API Documentation**: Document new endpoints and parameters
- **Component Documentation**: Storybook stories for UI components
- **User Guides**: Update user-facing documentation
- **Developer Guides**: Update setup and development instructions

---

## 📝 Commit Guidelines

### **Commit Message Format**
We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### **Commit Types**
- **feat**: New feature for the user
- **fix**: Bug fix for the user
- **docs**: Documentation changes
- **style**: Code style changes (formatting, missing semicolons, etc.)
- **refactor**: Code refactoring without changing functionality
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **build**: Changes to build system or dependencies
- **ci**: CI/CD configuration changes
- **chore**: Other changes that don't modify src or test files
- **security**: Security-related changes

### **Examples**
```bash
# ✅ Good commit messages
git commit -m "feat(auth): add multi-factor authentication for admin users"
git commit -m "fix(mobile): resolve touch target sizing for accessibility compliance"
git commit -m "perf(neuroseo): optimize AI model loading for faster analysis"
git commit -m "docs(api): update NeuroSEO™ API documentation with new endpoints"
git commit -m "security(auth): implement rate limiting for login attempts"

# ❌ Bad commit messages
git commit -m "fix stuff"
git commit -m "update code"
git commit -m "changes"
```

---

## 👀 Review Process

### **Pull Request Requirements**
Before submitting a PR, ensure:

- [ ] **Tests Pass**: All automated tests are passing
- [ ] **Code Quality**: ESLint and TypeScript checks pass
- [ ] **Documentation**: Updated for any new features or changes
- [ ] **Performance**: No significant performance regressions
- [ ] **Security**: Security review completed for sensitive changes
- [ ] **Mobile**: Tested on mobile devices and responsive design
- [ ] **Accessibility**: WCAG 2.1 AA compliance verified

### **Review Process**
1. **Automated Checks**: GitHub Actions run tests and quality checks
2. **Code Review**: Team members review code quality and architecture
3. **Security Review**: Security team reviews for sensitive changes
4. **Product Review**: Product team reviews for user-facing changes
5. **Final Approval**: Technical lead gives final approval

### **Reviewer Guidelines**
- **Be Constructive**: Provide helpful feedback and suggestions
- **Be Timely**: Review PRs within 24-48 hours
- **Be Thorough**: Check code quality, tests, and documentation
- **Be Respectful**: Maintain a positive and professional tone

---

## 🔒 Security Guidelines

### **Sensitive Data Handling**
- **Never commit secrets**: Use environment variables
- **Sanitize inputs**: Validate and sanitize all user inputs
- **Implement authentication**: Verify user permissions for protected routes
- **Use HTTPS**: Ensure all communications are encrypted
- **Log security events**: Track authentication and authorization events

### **Code Security Checklist**
- [ ] No hardcoded secrets or API keys
- [ ] Input validation implemented
- [ ] Authentication/authorization checks added
- [ ] Error messages don't expose sensitive information
- [ ] Dependencies are up to date and scanned
- [ ] Security headers configured

### **Reporting Security Issues**
**DO NOT** create public issues for security vulnerabilities. Instead:
1. Email security@rankpilot.com
2. Include detailed vulnerability information
3. Allow reasonable time for investigation and fix
4. Follow responsible disclosure practices

---

## 🎯 Specific Contribution Areas

### **Frontend Development**
- **UI Components**: Build reusable components with shadcn/ui
- **Mobile Optimization**: Ensure responsive design and touch-friendly interfaces
- **Performance**: Optimize Core Web Vitals and loading performance
- **Accessibility**: Implement WCAG 2.1 AA compliance

### **Backend Development**
- **API Endpoints**: Create secure and performant API routes
- **Database**: Design efficient Firestore queries and security rules
- **AI Integration**: Enhance NeuroSEO™ Suite with new engines
- **Authentication**: Improve multi-tier authentication system

### **Testing & Quality**
- **Test Coverage**: Improve test coverage across all components
- **Performance Testing**: Enhance Core Web Vitals validation
- **Security Testing**: Add security-focused test scenarios
- **Mobile Testing**: Expand mobile device and viewport testing

### **Documentation**
- **API Documentation**: Improve and expand API documentation
- **User Guides**: Create comprehensive user documentation
- **Developer Guides**: Enhance development setup and workflows
- **Code Examples**: Provide clear usage examples

---

## 🆘 Getting Help

### **Community Support**
- **GitHub Discussions**: Ask questions and share ideas
- **Discord Server**: Join our developer community (invite link in README)
- **Stack Overflow**: Tag questions with `rankpilot`

### **Direct Support**
- **Technical Questions**: dev-team@rankpilot.com
- **Security Concerns**: security@rankpilot.com
- **General Inquiries**: support@rankpilot.com

### **Office Hours**
- **When**: Wednesdays 2:00-3:00 PM UTC
- **Where**: Discord voice channel
- **Topics**: Technical discussions, architecture reviews, Q&A

---

## 🎉 Recognition

We appreciate all contributions! Contributors will be:

- **Listed in CONTRIBUTORS.md**: Recognition for all contributors
- **Featured in Release Notes**: Major contributions highlighted
- **Invited to Beta Programs**: Early access to new features
- **Community Swag**: RankPilot merchandise for significant contributions

---

## 📄 License

By contributing to RankPilot, you agree that your contributions will be licensed under the same license as the project.

---

## 🔄 Updates

This contributing guide is updated regularly. Please check back for the latest guidelines and best practices.

Last updated: July 26, 2025

---

**Thank you for contributing to RankPilot! Together, we're building the future of AI-powered SEO optimization.** 🚀
