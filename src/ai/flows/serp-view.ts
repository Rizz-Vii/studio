
'use server';
/**
 * @fileOverview SERP analysis flow that simulates search engine results for a given keyword.
 *
 * - getSerpData - A function that handles the SERP analysis process.
 * - SerpViewInput - The input type for the getSerpData function.
 * - SerpViewOutput - The return type for the getSerpData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SerpViewInputSchema = z.object({
  keyword: z.string().describe('The keyword to search for.'),
});
export type SerpViewInput = z.infer<typeof SerpViewInputSchema>;

const OrganicResultSchema = z.object({
  position: z.number().describe('The ranking position.'),
  title: z.string().describe('The title of the search result.'),
  url: z.string().describe('The URL of the search result.'),
  snippet: z.string().describe('A short descriptive snippet from the page.'),
});

const PeopleAlsoAskSchema = z.object({
    question: z.string().describe("A question that people also ask."),
});

const SerpViewOutputSchema = z.object({
  organicResults: z.array(OrganicResultSchema).describe('The top 10 organic search results.'),
  peopleAlsoAsk: z.array(PeopleAlsoAskSchema).describe('A list of related questions people also ask.'),
});
export type SerpViewOutput = z.infer<typeof SerpViewOutputSchema>;


export async function getSerpData(input: SerpViewInput): Promise<SerpViewOutput> {
  return serpViewFlow(input);
}

const serpPrompt = ai.definePrompt({
  name: 'serpViewPrompt',
  input: {schema: SerpViewInputSchema},
  output: {schema: SerpViewOutputSchema},
  prompt: `You are a search engine simulator. Your task is to generate a realistic Search Engine Results Page (SERP) for the given keyword.

**Keyword:** {{{keyword}}}

**Instructions:**
1.  **Generate Organic Results:** Create a list of exactly 10 organic search results. Each result must include a realistic position, title, URL, and a descriptive snippet.
2.  **Generate "People Also Ask":** Create a list of 4 relevant questions that users might also ask related to the keyword.
3.  **Realism:** The titles, URLs, and snippets should be plausible and relevant to the keyword.
4.  **Strictly Adhere to Output Format:** Your entire output MUST be a single, valid JSON object that conforms to the provided output schema.
`,
});

const serpViewFlow = ai.defineFlow(
  {
    name: 'serpViewFlow',
    inputSchema: SerpViewInputSchema,
    outputSchema: SerpViewOutputSchema,
  },
  async (input) => {
    const {output} = await serpPrompt(input);
    if (!output) {
      throw new Error('AI did not return valid SERP data.');
    }
    return output;
  }
);
