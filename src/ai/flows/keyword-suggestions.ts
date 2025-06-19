// src/ai/flows/keyword-suggestions.ts
'use server';
/**
 * @fileOverview A keyword suggestion AI agent.
 *
 * - suggestKeywords - A function that handles the keyword suggestion process.
 * - SuggestKeywordsInput - The input type for the suggestKeywords function.
 * - SuggestKeywordsOutput - The return type for the suggestKeywords function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestKeywordsInputSchema = z.object({
  topic: z.string().describe('The topic for which to generate keywords.'),
  includeLongTailKeywords: z
    .boolean()
    .default(false)
    .describe('Whether to include long-tail keywords in the suggestions.'),
});
export type SuggestKeywordsInput = z.infer<typeof SuggestKeywordsInputSchema>;

const SuggestKeywordsOutputSchema = z.object({
  keywords: z
    .array(z.string())
    .describe('An array of relevant keywords for the given topic.'),
});
export type SuggestKeywordsOutput = z.infer<typeof SuggestKeywordsOutputSchema>;

export async function suggestKeywords(input: SuggestKeywordsInput): Promise<SuggestKeywordsOutput> {
  return suggestKeywordsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestKeywordsPrompt',
  input: {schema: SuggestKeywordsInputSchema},
  output: {schema: SuggestKeywordsOutputSchema},
  prompt: `You are an expert SEO specialist. Your goal is to suggest relevant keywords for a given topic.

Topic: {{{topic}}}

{{#if includeLongTailKeywords}}
Include long-tail keywords in your suggestions.
{{/if}}

Return a JSON array of keywords that are relevant to the topic.`,
});

const suggestKeywordsFlow = ai.defineFlow(
  {
    name: 'suggestKeywordsFlow',
    inputSchema: SuggestKeywordsInputSchema,
    outputSchema: SuggestKeywordsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
