# RankPilot Testing Guide (2025)

## Unified Testing Strategy

ire

### 1. Test Infrastructure

- **Playwright**: Role-based, e2e, mobile, accessibility, and regression tests
- **CI/CD**: Automated test runs on push/PR, with status checks
- **Test Data**: Use simulated Firestore data for all roles and modules

### 2. Test Coverage

- **Onboarding & Auth**: All user tiers, OAuth, custom claims, error cases
- **Project & Analysis**: Project creation, NeuroSEO analysis, logging, error handling
- **Social Automation**: n8n campaign builder, scheduling, analytics
- **Finance**: Stripe billing, quota, dunning, finance dashboards
- **Admin/Monitoring**: Usage stats, logs, admin dashboards

### 3. Test Patterns

- **Role-Based**: Each test suite covers all access tiers
- **Data-Driven**: Parameterized tests for all workflows
- **Mobile/Accessibility**: Playwright device emulation, a11y checks
- **Error/Edge Cases**: Simulate failures, quota limits, invalid data

### 4. Best Practices

- **Isolation**: Use test users/data, reset state between tests
- **Speed**: Parallelize tests, use CI caching
- **Reporting**: Playwright HTML reports, CI status badges
- **Maintenance**: Refactor common flows, update with new features

### 5. Execution Sequence

1. Write Playwright tests for onboarding/auth
2. Add project/analysis tests (dummy data)
3. Add social automation and finance tests
4. Add admin/monitoring tests
5. Expand for mobile/a11y
6. Integrate with CI/CD
7. Update as features evolve

### 6. Reference Docs

- Playwright: https://playwright.dev/docs/test-intro
- CI/CD: https://docs.github.com/en/actions
- Firebase Testing: https://firebase.google.com/docs/emulator-suite
- n8n Testing: https://docs.n8n.io/integrations/builtin/test/
- Stripe Testing: https://stripe.com/docs/testing
