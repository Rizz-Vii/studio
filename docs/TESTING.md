# 📦 Testing & Scraping Framework

## Overview
This project uses Playwright for end-to-end testing, visual regression testing, and data extraction. The testing framework includes anti-bot measures and LLM-assisted validation.

## Setup

1. Install dependencies:
```bash
npm install
npx playwright install
```

2. Configure environment variables:
Create a `.env` file with:
```env
TEST_BASE_URL=https://rankpilot-h3jpc.web.app
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=your_test_password
PROXY_SERVER=http://proxy.example.com:8080
PROXY_USERNAME=proxy_user
PROXY_PASSWORD=proxy_pass
OPENAI_API_KEY=your_openai_key
```

## Running Tests

Run all tests:
```bash
npx playwright test
```

Run specific test file:
```bash
npx playwright test tests/auth/auth.spec.ts
```

Run tests in headed mode:
```bash
npx playwright test --headed
```

## Test Reports

View HTML report:
```bash
npx playwright show-report
```

Reports include:
- Screenshots of failed tests
- Trace viewer for debugging
- Visual comparison results

## Visual Regression Testing

Baseline screenshots are stored in `tests/snapshots/`.
To update baselines:
```bash
npx playwright test --update-snapshots
```

## Maintenance

1. Update visual baselines when making UI changes
2. Keep test data isolated and cleaned up
3. Regularly rotate test credentials
4. Monitor proxy health and rotation
5. Update user agents periodically

## Common Issues

1. Flaky Tests
   - Increase timeout in config
   - Add explicit waits
   - Check network conditions

2. Visual Differences
   - Verify environment consistency
   - Check dynamic content
   - Adjust comparison threshold

3. Rate Limiting
   - Implement proxy rotation
   - Add delays between actions
   - Use multiple test accounts
