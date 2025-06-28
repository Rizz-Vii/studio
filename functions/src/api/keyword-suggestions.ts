import { onCall, HttpsOptions } from "firebase-functions/v2/https";
import { ai } from "@/ai/genkit";

// Set options for the keyword suggestions function
const httpsOptions: HttpsOptions = {
  timeoutSeconds: 120, // AI operations may take longer
  memory: "512MiB", // Increased memory for AI processing
  minInstances: 0,
};

interface KeywordSuggestionsRequest {
  query: string;
  language?: string;
  count?: number;
}

interface KeywordSuggestion {
  keyword: string;
  searchVolume?: number;
  competition?: "low" | "medium" | "high";
  difficulty?: number;
}

interface KeywordSuggestionsResponse {
  suggestions: KeywordSuggestion[];
  relatedQueries?: string[];
}

/**
 * Generates keyword suggestions related to a query for SEO purposes
 * @param {Object} request - The Cloud Function request object
 * @return {Promise<KeywordSuggestionsResponse>} Keyword suggestions response
 */
export const getKeywordSuggestions = onCall(httpsOptions, async (request) => {
  const { query, count = 10 } = request.data as KeywordSuggestionsRequest;
  // Not using language parameter for now - reserved for future localization

  try {
    // Demo/mock response for emulator testing
    if (process.env.FUNCTIONS_EMULATOR === "true") {
      return mockKeywordResponse(query, count);
    }

    // In production, this would use the AI to generate suggestions
    const prompt = `Generate ${count} keyword suggestions related to "${query}" 
                  for SEO purposes. Include a mix of head terms and long-tail keywords.`;

    try {
      await ai.generate(prompt);
    } catch (error) {
      console.error("Error calling AI generate function:", error);
      throw new Error("AI generation failed.");
    }

    // Process AI response (simplified for this example)
    // In a real implementation, you would parse the AI response more thoroughly
    return {
      suggestions: [
        {
          keyword: query + " best practices",
          searchVolume: 1200,
          competition: "medium",
          difficulty: 65,
        },
        {
          keyword: "how to " + query,
          searchVolume: 880,
          competition: "low",
          difficulty: 42,
        },
        // More suggestions would be parsed from the AI response
      ],
      relatedQueries: ["similar to " + query, query + " alternatives"],
    };
  } catch (error) {
    console.error("Error generating keyword suggestions:", error);
    throw new Error(
      "Failed to generate keyword suggestions. Please try again later."
    );
  }
});

/**
 * Helper function to generate mock data for emulator testing
 * @param {string} query - The search query to generate keywords for
 * @param {number} count - The number of keyword suggestions to generate
 * @return {KeywordSuggestionsResponse} Mock keyword suggestions
 */
function mockKeywordResponse(
  query: string,
  count: number
): KeywordSuggestionsResponse {
  const suggestions: KeywordSuggestion[] = [];

  // Generate mock suggestions based on the query
  const baseKeywords = [
    "best",
    "top",
    "how to",
    "guide",
    "tutorial",
    "vs",
    "for beginners",
    "advanced",
    "examples",
    "alternatives",
    "tips",
    "strategies",
    "tools",
    "software",
    "platform",
    "benefits",
    "advantages",
    "services",
    "trends",
    "course",
  ];

  // Generate prefixes for more variety
  const prefixes = ["best", "top", "affordable", "free", "professional"];

  // Shuffle arrays to get different suggestions each time
  const shuffledKeywords = [...baseKeywords].sort(() => Math.random() - 0.5);
  const shuffledPrefixes = [...prefixes].sort(() => Math.random() - 0.5);

  // Create a mix of formats: "query + keyword" and "prefix + query"
  for (
    let i = 0;
    i < Math.min(count, shuffledKeywords.length + shuffledPrefixes.length);
    i++
  ) {
    let keyword;

    if (i < shuffledKeywords.length) {
      // Format: "query keyword"
      keyword = `${query} ${shuffledKeywords[i]}`;
    } else {
      // Format: "prefix query"
      const prefixIndex = i - shuffledKeywords.length;
      if (prefixIndex < shuffledPrefixes.length) {
        keyword = `${shuffledPrefixes[prefixIndex]} ${query}`;
      } else {
        // If we run out of both arrays but still need keywords
        keyword = `${query} ${Math.random() > 0.5 ? "review" : "analysis"} ${new Date().getFullYear()}`;
      }
    }

    // Generate semi-realistic values
    // Higher search volume for shorter keywords
    const wordCount = keyword.split(" ").length;
    const searchVolume = Math.floor(
      (10000 / wordCount) * (Math.random() * 0.7 + 0.3)
    );

    // More competition for higher volume keywords
    const competitionValue = Math.min(1, searchVolume / 3000);
    const competition =
      competitionValue > 0.66
        ? "high"
        : competitionValue > 0.33
          ? "medium"
          : "low";

    // Difficulty is a combination of volume and competition
    const difficultyBase =
      competition === "high" ? 70 : competition === "medium" ? 50 : 30;
    const difficulty = difficultyBase + Math.floor(Math.random() * 20);

    suggestions.push({
      keyword,
      searchVolume,
      competition: competition as "low" | "medium" | "high",
      difficulty,
    });
  }

  // Generate related queries that are more contextually relevant
  const relatedQueries = [
    `${query} trends ${new Date().getFullYear()}`,
    `${query} vs ${shuffledKeywords[0]}`,
    `why ${query} is important`,
    `best ${query} ${shuffledKeywords[1]}`,
    `${query} industry insights`,
  ].slice(0, 3 + Math.floor(Math.random() * 2)); // Return 3-4 related queries

  return {
    suggestions: suggestions.slice(0, count), // Ensure we only return the requested count
    relatedQueries,
  };
}
