/**
 * @file Playwright configuration for lean channel testing
 * 
 * This configuration is optimized for testing Firebase preview channels
 * as part of the Development Hyperloop workflow.
 * 
 * Key features:
 * - Supports dynamic base URL from environment variables
 * - Focuses on critical path tests for rapid feedback
 * - Optimized timeouts for preview channels
 * - Retries for stability with preview deployments
 */

import { defineConfig } from '@playwright/test';
// @ts-ignore - Import from mjs file
import baseConfig from './playwright.config.base.mjs';

/**
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  ...baseConfig,

  // We want to explicitly control which tests run in lean mode
  testMatch: '**/?(*.)@lean.spec.ts',

  // Enable parallel tests for faster execution
  workers: 4,

  // Use env var for base URL if provided
  use: {
    ...baseConfig.use,
    baseURL: process.env.TEST_URL || 'http://localhost:3000',

    // Increase timeouts for preview channels which might be slower
    navigationTimeout: 60000,
    actionTimeout: 30000,

    // Enable trace for easier debugging when tests fail
    trace: 'retain-on-failure',
  },

  // Run headless by default but can be overridden with HEADLESS=0
  headless: process.env.HEADLESS !== '0',

  // Add retries for stability with preview deployments
  retries: 1,

  // Optimize reporters for CI
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ['json', { outputFile: 'test-results/lean-report.json' }],
  ],

  // Set custom output directory
  outputDir: 'test-results/lean',

  // Ensure we clean up after tests
  preserveOutput: 'failures-only',

  // Faster timeout for entire test run
  globalTimeout: 15 * 60 * 1000, // 15 minutes

  // Skip slow tests in lean mode
  grepInvert: /@slow/,
});
