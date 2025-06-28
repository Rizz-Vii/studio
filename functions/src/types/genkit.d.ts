/**
 * Type definitions for @genkit-ai/googleai and genkit
 * These help TypeScript understand the structure of the genkit library.
 */

declare module "@genkit-ai/googleai" {
  export type GoogleAIPlugin = unknown;
  export type GeminiModel = unknown;

  export const googleAI: () => GoogleAIPlugin;
  export const gemini15Flash: GeminiModel;
}

declare module "genkit" {
  export type GenkitOptions = {
    plugins: unknown[];
    model: unknown;
  };

  export type GenkitResult = {
    text: string;
    [key: string]: unknown;
  };

  export interface GenkitClient {
    generate: (
      prompt: string,
      options?: Record<string, unknown>
    ) => Promise<GenkitResult>;
  }

  export function genkit(options: GenkitOptions): GenkitClient;
}
