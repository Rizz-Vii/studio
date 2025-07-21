# GitIgnore Strategy Documentation

## Overview

This document outlines the comprehensive `.gitignore` strategy for RankPilot (Studio), designed to handle all aspects of the modern AI-first SEO SaaS platform development.

## Structure

### Main Project `.gitignore`

**Location:** `/.gitignore`
**Purpose:** Primary ignore file for the entire project
**Categories:**

- Node.js dependencies and package managers
- Next.js build artifacts
- TypeScript compilation outputs
- Testing and coverage reports
- Firebase and cloud services
- AI framework (Genkit) files
- Environment variables and secrets
- Development tools and IDEs
- OS-generated files
- Logs and debugging
- Cache and temporary files
- Performance monitoring data

### Firebase Functions `.gitignore`

**Location:** `/functions/.gitignore`
**Purpose:** Specific ignores for Firebase Cloud Functions
**Categories:**

- TypeScript compilation output
- Node.js dependencies
- Firebase-specific logs
- AI and caching for serverless functions
- Temporary files

### Tests `.gitignore`

**Location:** `/tests/.gitignore`
**Purpose:** Playwright test artifacts and reports
**Categories:**

- Test results and reports
- Screenshots and videos
- Test traces and debugging
- Authentication state files
- Coverage reports

### AI Directory `.gitignore`

**Location:** `/src/ai/.gitignore`
**Purpose:** AI-specific caching and temporary files
**Categories:**

- Model caches
- AI response data
- Training datasets
- Debug files
- Token usage logs

### Global Template `.gitignore_global`

**Location:** `/.gitignore_global`
**Purpose:** Personal development settings template
**Usage:** For team members to set up personal git ignore patterns

## Key Features

### 1. AI Development Support

- OpenAI API caching
- Model response caching
- Token usage tracking files
- AI debug artifacts

### 2. Testing Infrastructure

- Playwright test results
- Screenshot and video captures
- Test traces and debugging
- Performance test artifacts

### 3. Performance Monitoring

- Performance metrics files
- Trace data
- Monitoring artifacts

### 4. Security-First Approach

- All environment variable patterns
- Secret files and certificates
- Backup files that might contain sensitive data

### 5. Development Tools

- Multiple IDE support (VSCode, Cursor, IntelliJ)
- OS-specific files (macOS, Windows, Linux)
- Personal development files

## Best Practices

### Environment Variables

```bash
# Always use example files for documentation
.env.example        # ✅ Tracked
.env.test.example   # ✅ Tracked
.env                # ❌ Ignored
.env.local          # ❌ Ignored
.env.production     # ❌ Ignored
```

### Test Artifacts

```bash
# Test reports are generated artifacts
test-results/       # ❌ Ignored
playwright-report/  # ❌ Ignored
test-snapshots/     # ❌ Ignored

# Test configuration is tracked
playwright.config.ts    # ✅ Tracked
tests/**/*.spec.ts      # ✅ Tracked
```

### AI Caching

```bash
# AI responses and caches are regenerable
.ai-cache/          # ❌ Ignored
.openai-cache/      # ❌ Ignored
model-cache/        # ❌ Ignored

# AI configuration and flows are tracked
src/ai/flows/       # ✅ Tracked
src/ai/config/      # ✅ Tracked
```

## Team Workflow

### Setting Up Personal Ignores

```bash
# Set global gitignore for personal preferences
git config --global core.excludesfile ~/.gitignore_global

# Copy the template
cp .gitignore_global ~/.gitignore_global
```

### Adding New Patterns

1. Identify the appropriate `.gitignore` file
2. Add patterns in the relevant category
3. Test with `git check-ignore <file>` to verify
4. Document in this file if it's a new category

### CI/CD Considerations

- Test artifacts are ignored locally but collected in CI
- Environment variables are handled through GitHub secrets
- Build artifacts are regenerated in each deployment

## Maintenance

### Regular Review

- Monthly review of ignored vs. tracked files
- Clean up obsolete patterns
- Update for new tools and frameworks

### Monitoring

- Use `git status --ignored` to review ignored files
- Verify sensitive files are properly ignored
- Check for accidentally tracked build artifacts

## Related Files

- `.env.example` - Environment variable template
- `.env.test.example` - Test environment template
- `firebase.json` - Firebase configuration
- `playwright.config.ts` - Test configuration
- `tsconfig.json` - TypeScript configuration

---

This comprehensive gitignore strategy ensures clean repositories, secure development, and efficient CI/CD workflows for the RankPilot platform.
