/**
 * Production Testing Configuration - SAFE APPROACH
 * Priority: CRITICAL - Avoid DDoS on Production
 * Generated: July 31, 2025
 */

export interface TestEnvironment {
  name: string;
  baseUrl: string;
  loadTestingEnabled: boolean;
  maxConcurrentRequests: number;
  testTypes: ('smoke' | 'load' | 'security' | 'mobile')[];
}

export const TEST_ENVIRONMENTS: Record<string, TestEnvironment> = {
  // 🏠 Local Development - Full Testing
  development: {
    name: 'Development',
    baseUrl: 'http://localhost:3000',
    loadTestingEnabled: true,
    maxConcurrentRequests: 20,
    testTypes: ['smoke', 'load', 'security', 'mobile']
  },

  // 🎭 Firebase Preview Channels - Safe Load Testing
  preview: {
    name: 'Preview Channel',
    baseUrl: process.env.PREVIEW_URL || 'https://rankpilot-h3jpc--pr-123-abc.web.app',
    loadTestingEnabled: true,
    maxConcurrentRequests: 10,
    testTypes: ['smoke', 'load', 'security', 'mobile']
  },

  // 🔒 Production - MINIMAL SAFE TESTING ONLY
  production: {
    name: 'Production',
    baseUrl: 'https://rankpilot-h3jpc.web.app',
    loadTestingEnabled: false, // 🚨 NO LOAD TESTING ON PRODUCTION
    maxConcurrentRequests: 1, // Only single requests
    testTypes: ['smoke'] // Only basic health checks
  }
};

/**
 * Safe Production Monitoring (NOT Load Testing)
 */
export class ProductionMonitor {
  private baseUrl: string;
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Single request health check - SAFE for production
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'down';
    responseTime: number;
    timestamp: string;
  }> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${this.baseUrl}/api/health`, {
        method: 'GET',
        headers: {
          'User-Agent': 'RankPilot-HealthMonitor/1.0'
        }
      });
      
      const responseTime = Date.now() - startTime;
      
      return {
        status: response.ok ? 'healthy' : 'degraded',
        responseTime,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'down',
        responseTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Basic functionality check - SAFE single requests
   */
  async smokeTest(): Promise<{
    homepage: boolean;
    api: boolean;
    auth: boolean;
  }> {
    const results = {
      homepage: false,
      api: false,
      auth: false
    };

    try {
      // Test homepage (single request)
      const homepageResponse = await fetch(this.baseUrl);
      results.homepage = homepageResponse.ok;
      
      // Wait between requests to be respectful
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Test API health (single request)
      const apiResponse = await fetch(`${this.baseUrl}/api/health`);
      results.api = apiResponse.ok;
      
      // Wait between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Test auth endpoint (single request)
      const authResponse = await fetch(`${this.baseUrl}/api/auth/session`);
      results.auth = authResponse.status !== 404; // 401 is OK, 404 is not
      
    } catch (error) {
      console.error('Smoke test error:', error);
    }

    return results;
  }
}

/**
 * Get current test environment
 */
export function getCurrentTestEnvironment(): TestEnvironment {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isPreview = process.env.PREVIEW_URL || process.env.GITHUB_HEAD_REF;
  
  if (isPreview) {
    return TEST_ENVIRONMENTS.preview;
  }
  
  if (nodeEnv === 'production') {
    return TEST_ENVIRONMENTS.production;
  }
  
  return TEST_ENVIRONMENTS.development;
}

/**
 * Safe test runner that respects environment constraints
 */
export async function runSafeTests(testType: 'smoke' | 'load' | 'security' | 'mobile') {
  const env = getCurrentTestEnvironment();
  
  console.log(`🎯 Running ${testType} tests in ${env.name} environment`);
  
  // Check if test type is allowed in this environment
  if (!env.testTypes.includes(testType)) {
    console.log(`⚠️ ${testType} tests disabled in ${env.name} environment`);
    return { skipped: true, reason: 'Test type not allowed in this environment' };
  }
  
  // Additional safety checks for load testing
  if (testType === 'load' && !env.loadTestingEnabled) {
    console.log(`🚨 Load testing disabled in ${env.name} environment`);
    return { skipped: true, reason: 'Load testing disabled to protect production' };
  }
  
  console.log(`✅ Proceeding with ${testType} tests (max ${env.maxConcurrentRequests} concurrent requests)`);
  return { skipped: false, maxConcurrent: env.maxConcurrentRequests };
}
