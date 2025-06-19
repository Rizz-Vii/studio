'use server';

/**
 * @fileOverview Content optimization flow that analyzes content and provides suggestions for optimization.
 *
 * - analyzeContent - A function that handles the content analysis and optimization process.
 * - AnalyzeContentInput - The input type for the analyzeContent function.
 * - AnalyzeContentOutput - The return type for the analyzeContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeContentInputSchema = z.object({
  content: z
    .string()
    .describe('The content to be analyzed and optimized.'),
  targetKeywords: z.string().describe('The target keywords for the content.'),
});
export type AnalyzeContentInput = z.infer<typeof AnalyzeContentInputSchema>;

const AnalyzeContentOutputSchema = z.object({
  readabilitySuggestions: z
    .string()
    .describe('Suggestions to improve the readability of the content.'),
  keywordDensitySuggestions: z
    .string()
    .describe(
      'Suggestions to optimize keyword density in the content, including recommendations for primary, secondary and long-tail keywords.'
    ),
  semanticRelevanceSuggestions: z
    .string()
    .describe(
      'Suggestions to improve the semantic relevance of the content, including related terms and concepts.'
    ),
  overallScore: z.number().describe('The overall score of the content.'),
});
export type AnalyzeContentOutput = z.infer<typeof AnalyzeContentOutputSchema>;

export async function analyzeContent(input: AnalyzeContentInput): Promise<AnalyzeContentOutput> {
  return analyzeContentFlow(input);
}

const analyzeContentPrompt = ai.definePrompt({
  name: 'analyzeContentPrompt',
  input: {schema: AnalyzeContentInputSchema},
  output: {schema: AnalyzeContentOutputSchema},
  prompt: `You are an SEO expert who specializes in content optimization. Your task is to analyze the given content and provide actionable suggestions to improve its ranking and user engagement.

  Analyze the following content for readability, keyword density, and semantic relevance, and provide specific suggestions for improvement.

  Content: {{{content}}}
  Target Keywords: {{{targetKeywords}}}

  Readability Suggestions:
  Keyword Density Suggestions:
  Semantic Relevance Suggestions:
  Overall Score:`, // Consider setting overall score 0-100
});

const analyzeContentFlow = ai.defineFlow(
  {
    name: 'analyzeContentFlow',
    inputSchema: AnalyzeContentInputSchema,
    outputSchema: AnalyzeContentOutputSchema,
  },
  async input => {
    const {output} = await analyzeContentPrompt(input);
    return output!;
  }
);
