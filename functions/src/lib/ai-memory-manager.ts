/**
 * AI Memory Manager for Firebase Functions
 * Optimizes AI instance creation and memory usage
 */

import { genkit } from "genkit";
import { gemini15Flash, googleAI } from "@genkit-ai/googleai";
import { logger } from "firebase-functions";

export class AIMemoryManager {
  private static instance: AIMemoryManager;
  private aiInstances = new Map<string, any>();
  private lastCleanup = Date.now();
  private readonly CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_INSTANCES = 5;

  static getInstance(): AIMemoryManager {
    if (!AIMemoryManager.instance) {
      AIMemoryManager.instance = new AIMemoryManager();
    }
    return AIMemoryManager.instance;
  }

  /**
     * Gets or creates an AI instance
     * @param key - Instance key for caching
     * @returns AI instance
     */
  getAI(key: string = "default") {
    this.performPeriodicCleanup();

    if (!this.aiInstances.has(key)) {
      if (this.aiInstances.size >= this.MAX_INSTANCES) {
        this.cleanup();
      }

      logger.info(`Creating new AI instance: ${key}`);
      const aiInstance = this.createAIInstance();
      this.aiInstances.set(key, aiInstance);
    }

    return this.aiInstances.get(key);
  }

  /**
     * Creates a new AI instance with optimized configuration
     */
  private createAIInstance() {
    const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("Google AI API key not found in environment variables");
    }

    return genkit({
      plugins: [
        googleAI({
          apiKey,
        }),
      ],
      model: gemini15Flash,
    });
  }

  /**
     * Performs periodic cleanup of AI instances
     */
  private performPeriodicCleanup() {
    const now = Date.now();
    if (now - this.lastCleanup > this.CLEANUP_INTERVAL) {
      this.cleanup();
      this.lastCleanup = now;
    }
  }

  /**
     * Cleans up all AI instances to free memory
     */
  cleanup() {
    logger.info(`Cleaning up ${this.aiInstances.size} AI instances`);
    this.aiInstances.clear();

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
  }

  /**
     * Gets current memory usage statistics
     */
  getMemoryStats() {
    const memUsage = process.memoryUsage();
    return {
      instanceCount: this.aiInstances.size,
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + " MB",
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + " MB",
      external: Math.round(memUsage.external / 1024 / 1024) + " MB",
      rss: Math.round(memUsage.rss / 1024 / 1024) + " MB"
    };
  }
}

/**
 * Convenience function to get AI instance
 */
export function getAI(key?: string) {
  return AIMemoryManager.getInstance().getAI(key);
}

/**
 * Global cleanup function for function shutdown
 */
export function cleanupAIMemory() {
  AIMemoryManager.getInstance().cleanup();
}

// Backward compatibility export
export const ai = {
  generate: (prompt: string) => getAI().generate(prompt),
};

export default { getAI, ai, AIMemoryManager };
