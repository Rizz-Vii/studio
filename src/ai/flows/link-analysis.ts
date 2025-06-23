'use server';
/**
 * @fileOverview Link analysis flow that simulates finding backlinks for a target URL.
 *
 * - analyzeLinks - A function that handles the link analysis process.
 * - LinkAnalysisInput - The input type for the analyzeLinks function.
 * - LinkAnalysisOutput - The return type for the analyzeLinks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LinkAnalysisInputSchema = z.object({
  url: z.string().url().describe('The URL to analyze for backlinks.'),
});
export type LinkAnalysisInput = z.infer<typeof LinkAnalysisInputSchema>;

const BacklinkSchema = z.object({
    referringDomain: z.string().describe("The domain of the page containing the backlink."),
    backlinkUrl: z.string().url().describe("The full URL of the page containing the backlink."),
    anchorText: z.string().describe("The anchor text of the backlink."),
    domainAuthority: z.number().min(0).max(100).describe("A simulated Domain Authority score (0-100) for the referring domain."),
});

const LinkAnalysisOutputSchema = z.object({
  backlinks: z.array(BacklinkSchema).describe('An array of discovered backlinks.'),
  summary: z.object({
    totalBacklinks: z.number().describe('The total number of backlinks found.'),
    referringDomains: z.number().describe('The number of unique referring domains.'),
  }).describe('A summary of the backlink profile.'),
});
export type LinkAnalysisOutput = z.infer<typeof LinkAnalysisOutputSchema>;

export async function analyzeLinks(input: LinkAnalysisInput): Promise<LinkAnalysisOutput> {
  return linkAnalysisFlow(input);
}

const analysisPrompt = ai.definePrompt({
  name: 'linkAnalysisPrompt',
  input: {schema: LinkAnalysisInputSchema},
  output: {schema: LinkAnalysisOutputSchema},
  prompt: `You are an advanced SEO analysis tool that simulates a backlink crawler. Your task is to generate a realistic list of backlinks for a given URL.

**URL to Analyze:** {{{url}}}

**Instructions:**

1.  **Generate Backlinks:**
    *   Create a list of 5 to 15 plausible, diverse backlinks pointing to the given URL.
    *   For each backlink, provide a realistic \`referringDomain\`, \`backlinkUrl\`, \`anchorText\`, and a \`domainAuthority\` score between 0 and 100.
    *   The backlinks should come from a variety of domain types (e.g., blogs, news sites, forums, directories).
    *   The anchor text should be varied (e.g., brand name, exact match keyword, generic text like "click here").

2.  **Generate Summary:**
    *   Calculate the \`totalBacklinks\` (which is the number of backlinks you generated).
    *   Calculate the number of unique \`referringDomains\` from the list you created.

3.  **Strictly Adhere to Output Format:**
    *   Your entire output MUST be a single, valid JSON object that conforms to the provided output schema.
  `,
});

const linkAnalysisFlow = ai.defineFlow(
  {
    name: 'linkAnalysisFlow',
    inputSchema: LinkAnalysisInputSchema,
    outputSchema: LinkAnalysisOutputSchema,
  },
  async (input: LinkAnalysisInput) => {
    // In a real-world scenario, this would involve using a third-party API
    // like Ahrefs, Moz, or Majestic. For this prototype, we simulate it with AI.
    const {output} = await analysisPrompt(input);
    
    if (!output) {
        throw new Error("AI did not return valid link analysis data.");
    }

    // Ensure summary is consistent with the generated backlinks array
    const uniqueDomains = new Set(output.backlinks.map(b => b.referringDomain));
    output.summary.totalBacklinks = output.backlinks.length;
    output.summary.referringDomains = uniqueDomains.size;
    
    return output;
  }
);
