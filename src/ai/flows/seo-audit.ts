/****
 * @fileOverview SEO Audit flow that analyzes a URL for technical and content SEO factors.
 *
 * - auditUrl - A function that handles the SEO audit process.
 * - AuditUrlInput - The input type for the auditUrl function.
 * - AuditUrlOutput - The return type for the auditUrl function.
 */

import {defineFlow, run } from '@genkit-ai/core';
import { ai } from '@/ai/genkit';
import { z  } from 'genkit';
import '@genkit-ai/googleai'; // Import necessary for Google AI models
import { TextLoader } from "langchain/document_loaders/fs/text"; // Correct import path for web TextLoader

// Define the input schema for the SEO audit flow
const AuditUrlInputSchema = z.object({
  url: z.string().url().describe('The URL to audit.'),
});
export type AuditUrlInput = z.infer<typeof AuditUrlInputSchema>;

// Define the output schema for the SEO audit flow
const AuditUrlOutputSchema = z.object({
  overallScore: z.number().describe('The overall SEO score for the URL (0-100).'),
  items: z.array(z.object({
    id: z.string().describe('A unique identifier for the audit item.'),
    name: z.string().describe('The name of the audit item (e.g., "Title Tags", "Mobile-Friendliness").'),
    score: z.number().describe('The score for this specific audit item (0-100).'),
    details: z.string().describe('Detailed findings or suggestions for this item.'),
    status: z.enum(['good', 'warning', 'error']).describe('The status of the audit item.'),
  })).describe('A list of detailed audit items.'),
  summary: z.string().describe('A brief overall summary of the audit findings.'),
});
export type AuditUrlOutput = z.infer<typeof AuditUrlOutputSchema>;

// Define the prompt to the AI model
const auditUrlPrompt = ai.definePrompt({
  name: 'seoAuditPrompt',
  input: { schema: AuditUrlInputSchema.extend({ content: z.string().optional() }) }, // Add content to prompt input schema
  output: { schema: AuditUrlOutputSchema },
  prompt: `You are an expert technical SEO auditor. Your task is to analyze the provided URL and provide a detailed technical and content SEO audit report.

  Focus on the following key areas and provide a score (0-100), status (good, warning, error), and detailed suggestions for each:

  1.  **Title Tags:** Analyze the title tag length, relevance to content, and presence of target keywords.
  2.  **Meta Descriptions:** Evaluate meta description length, compellingness, and keyword inclusion.
  3.  **Image Alt Texts:** Check for the presence and relevance of alt attributes on images.
  4.  **Broken Links:** Identify internal and external broken links (simulate this if you cannot crawl deeply).
  5.  **Site Speed:** Provide an assessment of page load performance (simulate if you cannot directly measure).
  6.  **Mobile-Friendliness:** Assess the responsiveness and usability on mobile devices (simulate if you cannot directly analyze).

  Based on the analysis of these items, provide an overall SEO score for the URL (0-100).

  Provide the output in a JSON format that strictly adheres to the AuditUrlOutputSchema. Ensure the 'details' field provides actionable insights.

  URL to audit: {{{url}}}
  Page content (if accessible - **Note: Genkit's integration allows Langchain's TextLoader to fetch basic text content from URLs**):
  {{#if content}}
  <PAGE_CONTENT>
  {{{content}}}
  </PAGE_CONTENT>
  {{/if}}

  JSON Output:
  `,
});

// Define the Genkit flow
const auditUrlFlow = ai.defineFlow(
  {
    name: 'seoAuditFlow',
    inputSchema: AuditUrlInputSchema,
    outputSchema: AuditUrlOutputSchema,
  },
  async (input: AuditUrlInput): Promise<AuditUrlOutput> => {
    const { url } = input;

    let pageContent = '';
    try {
      const loader = new TextLoader(url);
      const documents = await loader.load();
      if (documents && documents.length > 0 && documents[0].pageContent) {
        pageContent = documents[0].pageContent;
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error loading page content:", error.message);
      } else {
        console.error("Unknown error loading page content:", error);
      }
    }

    const promptInput = {
      url,
      content: pageContent,
    };

    const result = await auditUrlPrompt(promptInput);

      if (!result.output) {
        throw new Error("AI did not return a valid audit result.");
      }
      return result.output as AuditUrlOutput;
    }
  );

/**
 * Runs the SEO audit flow for a given input.
 */
export async function auditUrl(input: AuditUrlInput): Promise<AuditUrlOutput> {
  return auditUrlFlow(input);
}