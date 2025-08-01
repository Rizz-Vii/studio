import { defineConfig, devices } from '@playwright/test';
import { getCurrentTestEnvironment } from './testing/config/safe-testing';

// Get environment-specific configuration
const testEnv = getCurrentTestEnvironment();

export default defineConfig({
  testDir: './testing',
  fullyParallel: false, // Respect concurrent limits
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: testEnv.maxConcurrentRequests, // Environment-aware workers
  reporter: 'html',
  
  use: {
    baseURL: testEnv.baseUrl,
    trace: 'on-first-retry',
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  projects: [
    {
      name: 'safe-production-monitoring',
      testMatch: '**/safe-production-monitoring.spec.ts',
      use: { 
        ...devices['Desktop Chrome'],
        // Respectful request timing
        launchOptions: {
          slowMo: testEnv.name === 'Production' ? 2000 : 0, // 2s delay in production
        }
      },
    },
    
    // Load testing only for non-production
    ...(testEnv.loadTestingEnabled ? [{
      name: 'load-testing',
      testMatch: '**/load.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    }] : []),
    
    // Critical tests (always safe)
    {
      name: 'critical-tests',
      testMatch: '**/critical-*.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    }
  ],

  // Environment-specific web server
  webServer: testEnv.name === 'Development' ? {
    command: 'npm run dev',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
  } : undefined,
});
