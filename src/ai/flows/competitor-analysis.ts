// src/ai/flows/competitor-analysis.ts
'use server';
/**
 * @fileOverview Competitor analysis flow that compares keyword rankings and identifies content gaps.
 *
 * - analyzeCompetitors - A function that handles the competitor analysis process.
 * - CompetitorAnalysisInput - The input type for the analyzeCompetitors function.
 * - CompetitorAnalysisOutput - The return type for the analyzeCompetitors function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const CompetitorAnalysisInputSchema = z.object({
  yourUrl: z.string().url().describe('The URL of your website.'),
  competitorUrls: z
    .array(z.string().url())
    .describe("An array of your competitors' URLs."),
  keywords: z.array(z.string()).describe('An array of keywords to compare.'),
});
export type CompetitorAnalysisInput = z.infer<
  typeof CompetitorAnalysisInputSchema
>;

const RankingDataItemSchema = z.object({
    keyword: z.string(),
    yourRank: z.union([z.number(), z.string()]).optional(),
  }).catchall(z.union([z.number(), z.string()]).optional());

export const CompetitorAnalysisOutputSchema = z.object({
  rankings: z
    .array(RankingDataItemSchema)
    .describe(
      'An array of keyword ranking data for your site and competitors.'
    ),
  contentGaps: z
    .array(z.string())
    .describe(
      'An array of keywords or topics that competitors rank for but you do not.'
    ),
});
export type CompetitorAnalysisOutput = z.infer<
  typeof CompetitorAnalysisOutputSchema
>;

export async function analyzeCompetitors(
  input: CompetitorAnalysisInput
): Promise<CompetitorAnalysisOutput> {
  return competitorAnalysisFlow(input);
}

const analysisPrompt = ai.definePrompt({
  name: 'competitorAnalysisPrompt',
  input: {schema: CompetitorAnalysisInputSchema},
  output: {schema: CompetitorAnalysisOutputSchema},
  prompt: `You are an expert SEO analyst. Your task is to perform a competitor analysis based on the provided URLs and keywords.

  Your Website URL: {{{yourUrl}}}
  Competitor URLs:
  {{#each competitorUrls}}
  - {{{this}}}
  {{/each}}

  Keywords to analyze:
  {{#each keywords}}
  - {{{this}}}
  {{/each}}

  Instructions:
  1. For each keyword, provide a simulated ranking position (an integer from 1 to 100) for my URL and each competitor URL. If a site likely doesn't rank in the top 100, use "N/A".
  2. The output for rankings should be an array of objects. Each object must have a "keyword" property, a "yourRank" property for my URL, and properties for each competitor URL (use the full competitor URL as the key).
  3. Analyze the provided keywords and competitor URLs to identify potential "content gaps." These are topics or keywords that the competitors rank for, which my site is missing. Provide these as an array of strings.
  4. Return the full response as a valid JSON object adhering to the specified output schema.
  `,
});

const competitorAnalysisFlow = ai.defineFlow(
  {
    name: 'competitorAnalysisFlow',
    inputSchema: CompetitorAnalysisInputSchema,
    outputSchema: CompetitorAnalysisOutputSchema,
  },
  async input => {
    // In a real-world scenario, you would first scrape the SERPs for each keyword
    // to get actual ranking data. Then, you might pass that data to the AI for
    // gap analysis. For this prototype, we will rely on the AI to simulate the data.
    const {output} = await analysisPrompt(input);
    return output!;
  }
);
