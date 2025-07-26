# Development Hyperloop System

> **🚀 INSTANT CONTINUOUS DEPLOYMENT FOR RAPID FEEDBACK**

## Overview

The Development Hyperloop is a specialized fast-track deployment system designed for the RankPilot project to enable rapid development feedback cycles. It bypasses traditional CI/CD bottlenecks to provide near-instant deployments of work-in-progress features.

## Key Benefits

- **⚡ Instant Deployment**: Deploy in seconds, not minutes
- **🌐 Live Preview URLs**: Share with teammates for immediate feedback  
- **📱 Cross-Device Testing**: Test on real devices with QR code scanning
- **🧪 Automated Validation**: Critical tests run automatically on each deployment
- **🛠️ Reduced Overhead**: Skip type checking and non-critical linting
- **💻 Works Everywhere**: PowerShell and Bash script support

## System Components

| Component | Description |
|-----------|-------------|
| `pilotScripts/workflow/hyperloop-dev.ps1` | PowerShell script for Windows users |
| `pilotScripts/workflow/hyperloop-dev.sh` | Bash script for macOS/Linux users |
| `scripts/build-lean-instant.ps1` | Fast build script skipping type checks |
| `playwright.config.lean.ts` | Focused test config for preview channels |
| `.github/workflows/instant-lean-deploy.yml` | GitHub Actions workflow for deployment |
| `.github/workflows/lean-channel-tests.yml` | GitHub Actions workflow for automated tests |

## Quick Start

For a guided introduction to the Development Hyperloop system:

```bash
# From the project root
./try-hyperloop.sh
```

This interactive script will:
1. Verify your environment is properly configured
2. Create a temporary feature branch if needed
3. Give you options to run the Hyperloop, read docs, or run tests
4. Guide you through the process with detailed explanations

## Usage

### From VS Code

1. Press `Ctrl+Shift+B` (Windows/Linux) or `Cmd+Shift+B` (macOS) to open the task runner
2. Select `🚀 Development Hyperloop` from the task list
3. View the deployment details in the terminal output
4. The preview URL will automatically open in your default browser

### From Command Line

#### Windows

```powershell
# From the project root
.\pilotScripts\workflow\hyperloop-dev.ps1
# Or use the npm script
npm run hyperloop:dev
```

#### macOS/Linux

```bash
# From the project root
./pilotScripts/workflow/hyperloop-linux.sh  # Optimized for Linux environments
# Or use the npm script
npm run hyperloop:linux  # Recommended for Linux
npm run hyperloop:dev:bash  # Standard bash script (may require adjustments)
```

### GitHub Integration

You can also trigger the Hyperloop automatically on push to feature branches. The workflow `instant-lean-deploy.yml` handles this process when you push to:
- `feature/*`
- `bugfix/*`
- `hotfix/*`

## How It Works

1. **Lean Build**: Executes a streamlined build process that:
   - Uses an emergency ESLint configuration (minimal checks)
   - Skips TypeScript type checking during build
   - Optimizes the build for speed, not correctness

2. **Channel Deployment**:
   - Creates a unique Firebase Hosting preview channel
   - Deploys the lean build to the channel
   - Sets a 24-hour expiration

3. **Test Automation**:
   - Triggers GitHub Actions workflow for automated tests
   - Runs critical path tests against the deployed preview
   - Reports test results through GitHub Actions

4. **Developer Feedback**:
   - Opens the preview URL in the default browser
   - Generates QR code for mobile testing
   - Provides complete deployment summary

## Technical Details

### Lean Build Process

The lean build significantly reduces build time by:

1. Using `eslint.config.emergency.mjs` which minimizes linting overhead
2. Applying `--skip-type-check` to bypass TypeScript type checking
3. Focusing only on critical resources needed for deployment

### Firebase Channel Strategy

- Using a stable channel `lean-branch-testing` for consistent URLs
- Fixed URL: `https://rankpilot-h3jpc--lean-branch-testing-o2qips67.web.app`
- Channels are configured to expire after 14 days but are reused with each deployment
- This provides a consistent URL that can be bookmarked and shared

### Critical Path Tests

The lean test configuration (`playwright.config.lean.ts`) focuses on:

- Tests marked with `@lean` tag
- Basic page loading and critical functionality
- Both desktop and mobile viewports
- Avoiding time-consuming tests marked with `@slow`

#### Writing Lean Tests

Create test files with the `.lean.spec.ts` extension or use the `@lean` tag in your test descriptions:

```typescript
// Example lean test file: testing/example.lean.spec.ts
test.describe('Feature tests @lean', () => {
  test('Critical functionality works @critical', async ({ page }) => {
    // Quick, focused test that validates core functionality
    await page.goto('/feature');
    await expect(page.locator('[data-testid="important-element"]')).toBeVisible();
  });
  
  test('Expensive operation @slow', async ({ page }) => {
    // This will be skipped in lean testing due to @slow tag
    test.skip(true, 'Skipped in lean testing mode');
  });
});
```

#### Running Lean Tests Locally

```bash
# Run all lean tests
npm run test:lean

# Run lean tests against a specific channel URL
TEST_URL=https://your-channel-url npm run test:lean

# Run only specific lean tests
npm run test:lean -- --grep "specific test name"
```

The lean tests are also automatically triggered by the GitHub Actions workflow after each Development Hyperloop deployment.

## Best Practices

1. **Use for Work-in-Progress Features**: Perfect for getting quick feedback
2. **Not for Final QA**: Complete the full CI/CD process before merging to main
3. **Share Preview URLs**: Generate links for stakeholder review and feedback
4. **Clean Up**: Channels auto-expire after 24 hours, but you can delete them sooner
5. **Test on Real Devices**: Use the QR code for real mobile device testing

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **Firebase login errors** | Run `firebase login` to authenticate |
| **Build failures** | Check for syntax errors in your recent changes |
| **Deployment timeouts** | Check Firebase quota usage and connection |
| **Test failures** | Review GitHub Actions logs for details |
| **QR code not showing** | Use the provided URL to generate one manually |

## Future Enhancements

- Integration with Slack for deployment notifications
- Additional test scenarios specifically for preview channels
- Performance benchmarking against production
- A/B testing capabilities with multiple parallel channels

---

**Documentation by RankPilot Development Team**  
Last Updated: July 2025
