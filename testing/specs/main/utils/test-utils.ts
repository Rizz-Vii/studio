import { Page } from "@playwright/test";

export const randomDelay = async () => {
  const delay = Math.floor(Math.random() * 600) + 200; // 200-800ms
  await new Promise((resolve) => setTimeout(resolve, delay));
};

export const extractPageData = async (page: Page) => {
  await page.waitForLoadState("networkidle");

  return {
    title: await page.title(),
    url: page.url(),
    timestamp: new Date().toISOString(),
  };
};

export const getProxyConfig = () => {
  if (!process.env.PROXY_SERVER) return undefined;

  return {
    server: process.env.PROXY_SERVER,
    username: process.env.PROXY_USERNAME,
    password: process.env.PROXY_PASSWORD,
  };
};

export const rotateUserAgent = () => {
  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/115.0.1901.188",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5.2 Safari/605.1.15",
  ];
  return userAgents[Math.floor(Math.random() * userAgents.length)];
};

export const validateWithLLM = async (stats: any, screenshotBase64: string) => {
  // Mock LLM validation for testing purposes
  // In a real implementation, this would call an AI service to validate UI consistency
  return {
    isValid: true,
    mismatches: [],
    confidence: 0.95,
  };
};
