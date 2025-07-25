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
      email: process.env.TEST_USER_EMAIL || "abbas_ali_rizvi@hotmail.com",
      password: process.env.TEST_USER_PASSWORD || "123456",
    },
    admin: {
      email: process.env.TEST_ADMIN_EMAIL || "admin@rankpilot.com",
      password: process.env.TEST_ADMIN_PASSWORD || "admin123",
    },
  },
  baseUrl: process.env.TEST_BASE_URL || "http://localhost:3000",
  timeouts: {
    defaultNavigationTimeout: 30000,
    defaultActionTimeout: 10000,
  },
};
