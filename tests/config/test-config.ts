// Types for test configuration
export interface TestUser {
  email: string;
  password: string;
}

export interface TestUsers {
  standard: TestUser;
  admin: TestUser;
}

export interface TestConfig {
  testUsers: TestUsers;
  baseUrl?: string;
  timeouts?: {
    defaultNavigationTimeout?: number;
    defaultActionTimeout?: number;
  };
}

// Default configuration
export const defaultConfig: TestConfig = {
  testUsers: {
    standard: {
      email: process.env.TEST_USER_EMAIL || "test@example.com",
      password: process.env.TEST_USER_PASSWORD || "testpass123",
    },
    admin: {
      email: process.env.TEST_ADMIN_EMAIL || "admin@example.com",
      password: process.env.TEST_ADMIN_PASSWORD || "adminpass123",
    },
  },
  baseUrl: process.env.TEST_BASE_URL || "http://localhost:3000",
  timeouts: {
    defaultNavigationTimeout: 30000,
    defaultActionTimeout: 10000,
  },
};
