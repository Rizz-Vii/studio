'use server';
/**
 * @fileOverview AI-powered content brief generation.
 *
 * - generateContentBrief - Creates a detailed SEO content brief for a given keyword.
 * - ContentBriefInput - The input type for the generateContentBrief function.
 * - ContentBriefOutput - The return type for the generateContentBrief function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ContentBriefInputSchema = z.object({
  keyword: z.string().describe('The primary target keyword for the content brief.'),
});
export type ContentBriefInput = z.infer<typeof ContentBriefInputSchema>;

const LSIKeywordSchema = z.object({
  keyword: z.string().describe('The LSI keyword.'),
  type: z.enum(['topic', 'entity', 'question']).describe('The type of the keyword.'),
});

const ContentBriefOutputSchema = z.object({
  suggestedTitle: z.string().describe('A compelling, SEO-optimized title for the article.'),
  metaDescription: z.string().describe('A concise and engaging meta description (155-160 characters).'),
  targetAudience: z.string().describe('A description of the target audience for this content.'),
  suggestedHeadings: z.array(z.string()).describe('An ordered list of suggested H2 and H3 headings to structure the content.'),
  lsiKeywords: z.array(LSIKeywordSchema).describe('A list of semantically related keywords (LSI keywords) to include.'),
  questionsToAnswer: z.array(z.string()).describe('A list of common user questions related to the topic (like "People Also Ask").'),
  internalLinkingSuggestions: z.array(z.object({
      anchorText: z.string(),
      linkTo: z.string().describe("A suggested internal page slug (e.g., '/blog/related-post')."),
    })).describe('Suggestions for internal links to other relevant pages.'),
  wordCount: z.object({
    min: z.number(),
    max: z.number(),
  }).describe('The recommended word count range for the content.'),
});
export type ContentBriefOutput = z.infer<typeof ContentBriefOutputSchema>;

export async function generateContentBrief(input: ContentBriefInput): Promise<ContentBriefOutput> {
  return contentBriefFlow(input);
}

const briefPrompt = ai.definePrompt({
  name: 'contentBriefPrompt',
  input: {schema: ContentBriefInputSchema},
  output: {schema: ContentBriefOutputSchema},
  prompt: `You are an expert Content Strategist and SEO specialist. Your task is to generate a comprehensive content brief for a given target keyword. The brief should provide a clear roadmap for a writer to create a high-quality, SEO-optimized piece of content that can rank well on search engines.

**Target Keyword:** {{{keyword}}}

**Instructions:**

1.  **Suggested Title:** Create a compelling, SEO-friendly title that includes the target keyword. It should be engaging and likely to get clicks.
2.  **Meta Description:** Write a meta description between 155-160 characters. It should summarize the content and include the target keyword.
3.  **Target Audience:** Briefly describe the ideal reader for this content. (e.g., "Beginners in digital marketing", "Experienced developers looking for advanced techniques").
4.  **Suggested Headings:** Provide a logical structure for the article using H2 and H3 headings. This outline should cover the topic comprehensively.
5.  **LSI Keywords:** List at least 10-15 semantically related keywords, entities, and concepts that should be naturally integrated into the content. Categorize each as 'topic', 'entity', or 'question'.
6.  **Questions to Answer:** Identify 3-5 key questions that users are asking about this topic. These are often found in "People Also Ask" sections.
7.  **Internal Linking:** Suggest 2-3 relevant internal linking opportunities with appropriate anchor text. Use placeholder slugs like '/blog/relevant-topic'.
8.  **Word Count:** Recommend a word count range (min, max) based on the depth required to cover the topic thoroughly, informed by typical content for this keyword.

Your entire output MUST be a single, valid JSON object that conforms to the provided output schema.
`,
});

const contentBriefFlow = ai.defineFlow(
  {
    name: 'contentBriefFlow',
    inputSchema: ContentBriefInputSchema,
    outputSchema: ContentBriefOutputSchema,
  },
  async input => {
    const {output} = await briefPrompt(input);
    return output!;
  }
);
