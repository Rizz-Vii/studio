import { onCall, HttpsOptions } from "firebase-functions/v2/https";
import { getAI } from "../ai/genkit"; // Import AI generation module

// Set options for the content analyzer function
const httpsOptions: HttpsOptions = {
  timeoutSeconds: 120, // Content analysis can take time
  memory: "512MiB", // Standard memory allocation
  minInstances: 0,
};

interface ContentAnalysisRequest {
  content: string;
  targetKeywords?: string[];
  analysisType?: "basic" | "comprehensive";
}

interface ContentAnalysisResponse {
  readability: {
    score: number;
    level: string;
    suggestions: string[];
  };
  seo: {
    score: number;
    keywordDensity: Record<string, number>;
    suggestions: string[];
  };
  sentiment: {
    score: number;
    type: "positive" | "neutral" | "negative";
  };
  wordCount: number;
  topPhrases: string[];
}

/**
 * Analyzes content for readability, SEO optimization, and sentiment
 * @param {Object} request - The Cloud Function request object
 * @return {Promise<ContentAnalysisResponse>} Content analysis results
 */
export const analyzeContent = onCall(httpsOptions, async (request) => {
  const {
    content,
    targetKeywords = [],
    analysisType = "basic",
  } = request.data as ContentAnalysisRequest;

  try {
    // Demo/mock response for emulator testing
    if (process.env.FUNCTIONS_EMULATOR === "true") {
      return mockContentAnalysis(content, targetKeywords);
    }

    // In production, this would use AI to analyze the content
    const prompt = `Analyze the following content for readability, SEO, and sentiment.
                  ${
  targetKeywords.length > 0
    ? `Target keywords: ${targetKeywords.join(", ")}`
    : ""
}
                  Analysis type: ${analysisType}
                  
                  Content:
                  ${content.substring(0, 1000)}...`;

    // AI call - result will be used in production implementation
    const ai = getAI();
    await ai.generate(prompt);

    // Process AI response (simplified for demo)
    // In a real implementation, you would parse the AI response thoroughly
    return {
      readability: {
        score: 75,
        level: "Intermediate",
        suggestions: [
          "Use shorter sentences in paragraph 3",
          "Break up long paragraphs",
        ],
      },
      seo: {
        score: 68,
        keywordDensity: {
          [targetKeywords[0] || "default"]: 1.2,
          [targetKeywords[1] || "keyword"]: 0.8,
        },
        suggestions: [
          "Add more instances of target keywords",
          "Include keywords in headings",
        ],
      },
      sentiment: {
        score: 0.6,
        type: "positive",
      },
      wordCount: content.split(/\\s+/).length,
      topPhrases: ["key phrase one", "another important phrase"],
    };
  } catch (error) {
    console.error("Error analyzing content:", error);
    throw new Error("Failed to analyze content. Please try again later.");
  }
});

/**
 * Helper function to generate mock data for emulator testing
 * @param {string} content - The content to analyze
 * @param {string[]} targetKeywords - Target keywords to look for in content
 * @return {ContentAnalysisResponse} Mock content analysis data
 */
function mockContentAnalysis(
  content: string,
  targetKeywords: string[] = []
): ContentAnalysisResponse {
  // Calculate basic word count
  const wordCount = content.split(/\\s+/).length;

  // Generate mock keyword density data
  const keywordDensity: Record<string, number> = {};
  targetKeywords.forEach((keyword) => {
    // Count rough occurrences
    const regex = new RegExp(keyword, "gi");
    const occurrences = (content.match(regex) || []).length;
    const density = (occurrences / wordCount) * 100;
    keywordDensity[keyword] = parseFloat(density.toFixed(2));
  });

  // If no keywords provided, add some mock data
  if (targetKeywords.length === 0) {
    keywordDensity["content"] = 1.2;
    keywordDensity["analysis"] = 0.8;
  }

  // Calculate a readability score based on rough metrics
  // Shorter words and sentences = higher readability
  const avgWordLength = content.length / wordCount;
  const sentences = content.split(/[.!?]+/).length;
  const avgSentenceLength = wordCount / sentences;

  const readabilityScore = Math.max(
    0,
    Math.min(100, 100 - avgWordLength * 4 - avgSentenceLength * 0.5)
  );

  let readabilityLevel = "Advanced";
  if (readabilityScore > 80) readabilityLevel = "Elementary";
  else if (readabilityScore > 70) readabilityLevel = "Easy";
  else if (readabilityScore > 60) readabilityLevel = "Intermediate";

  return {
    readability: {
      score: Math.round(readabilityScore),
      level: readabilityLevel,
      suggestions: [
        "Use shorter sentences for better readability",
        "Break up long paragraphs into smaller chunks",
        "Use simpler vocabulary where appropriate",
      ],
    },
    seo: {
      score: 65 + Math.floor(Math.random() * 25),
      keywordDensity,
      suggestions: [
        "Add more instances of your target keywords",
        "Include keywords in H2 and H3 headings",
        "Add more relevant internal links",
        "Improve meta description",
      ],
    },
    sentiment: {
      score: parseFloat((Math.random() * 2 - 1).toFixed(2)), // -1 to 1
      type:
        Math.random() > 0.6
          ? "positive"
          : Math.random() > 0.3
            ? "neutral"
            : "negative",
    },
    wordCount,
    topPhrases: [
      "first key phrase",
      "second important phrase",
      "another notable phrase",
      "relevant industry term",
      "significant concept",
    ],
  };
}
