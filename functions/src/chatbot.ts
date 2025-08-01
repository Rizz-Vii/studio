/**
 * RankPilot AI Chatbot Firebase Functions
 * Handles both customer and admin chatbot interactions
 * Integrates with OpenAI, Firebase, and RankPilot systems
 */

import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions/v2";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import OpenAI from "openai";
import {
  getAdminContext,
  getAuditContext,
  getChatContext,
  getNeuroSEOContext,
  getSiteContext
} from "./context";

// Initialize services
const db = getFirestore();

// Get API key from environment variables (Firebase Functions v2 pattern)
const openaiApiKey = process.env.OPENAI_API_KEY;

// Initialize OpenAI lazily to avoid build-time warnings
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI | null {
  if (!openai && openaiApiKey) {
    try {
      openai = new OpenAI({
        apiKey: openaiApiKey,
      });
      logger.info("OpenAI client initialized successfully");
    } catch (error) {
      logger.error("Failed to initialize OpenAI client", error);
      return null;
    }
  }
  return openai;
}// Types for request/response
interface ChatRequest {
  uid: string;
  message: string;
  url?: string;
  sessionId?: string;
  chatType: "customer" | "admin";
}

interface ChatResponse {
  response: string;
  sessionId: string;
  timestamp: string;
  tokensUsed: number;
  context: {
    type: string;
    dataUsed: string[];
  };
}

/**
 * Customer Chatbot Handler
 * Provides SEO guidance, audit explanations, and tier-based support
 */
export const customerChatHandler = onCall(
  {
    region: "australia-southeast2",
    memory: "1GiB",
    timeoutSeconds: 30,
    secrets: ["OPENAI_API_KEY"], // Firebase Functions v2 secrets
  },
  async (request) => {
    try {
      const { uid, message, url, sessionId } = request.data as ChatRequest;

      // Validate authentication
      if (!request.auth) {
        throw new HttpsError("unauthenticated", "User must be authenticated");
      }

      if (request.auth.uid !== uid) {
        throw new HttpsError("permission-denied", "Invalid user ID");
      }

      // Validate input
      if (!message?.trim()) {
        throw new HttpsError("invalid-argument", "Message is required");
      }

      logger.info("Customer chat request", { uid, messageLength: message.length, url });

      // Generate session ID if not provided
      const currentSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Fetch context data
      const chatContext = await getChatContext(uid, false);
      const auditContext = url ? await getAuditContext(uid, url) : null;
      const siteContext = await getSiteContext(uid);
      const neuroSEOContext = await getNeuroSEOContext(uid, url);

      // Build system prompt based on user tier and available data
      const systemPrompt = buildCustomerSystemPrompt(chatContext, auditContext, siteContext, neuroSEOContext);

      // Create conversation messages
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ];

      // Add conversation history for context
      if (chatContext.recentConversations.length > 0) {
        const recentHistory = chatContext.recentConversations
          .slice(0, 3) // Last 3 conversations
          .reverse();

        recentHistory.forEach(conv => {
          if (conv.question && conv.response) {
            messages.splice(-1, 0,
              { role: "user", content: conv.question },
              { role: "assistant", content: conv.response }
            );
          }
        });
      }

      // Validate OpenAI availability
      const openaiClient = getOpenAIClient();
      if (!openaiClient) {
        throw new HttpsError("failed-precondition", "AI service is currently unavailable");
      }

      // Call OpenAI
      const completion = await openaiClient.chat.completions.create({
        model: "gpt-4o",
        messages,
        max_tokens: 1000,
        temperature: 0.1,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      });

      const aiResponse = completion.choices[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.";
      const tokensUsed = completion.usage?.total_tokens || 0;

      // Save conversation to Firestore
      await saveConversation(uid, currentSessionId, message, aiResponse, "customer", {
        auditContext: !!auditContext,
        siteContext: !!siteContext,
        neuroSEOContext: !!neuroSEOContext,
        userTier: chatContext.userTier,
      });

      // Prepare response
      const response: ChatResponse = {
        response: aiResponse,
        sessionId: currentSessionId,
        timestamp: new Date().toISOString(),
        tokensUsed,
        context: {
          type: "customer",
          dataUsed: [
            auditContext ? "audit_data" : null,
            siteContext ? "site_content" : null,
            neuroSEOContext ? "neuroseo_insights" : null,
            "user_tier_data"
          ].filter((item): item is string => Boolean(item)),
        },
      }; logger.info("Customer chat response generated", {
        uid,
        tokensUsed,
        sessionId: currentSessionId
      });

      return response;

    } catch (error) {
      logger.error("Customer chat error", error);

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError("internal", "Failed to process chat request");
    }
  }
);

/**
 * Admin Chatbot Handler
 * Provides system monitoring, analytics, and management assistance
 */
export const adminChatHandler = onCall(
  {
    region: "australia-southeast2",
    memory: "1GiB",
    timeoutSeconds: 45,
    secrets: ["OPENAI_API_KEY"], // Firebase Functions v2 secrets
  },
  async (request) => {
    try {
      const { uid, message, sessionId } = request.data as ChatRequest;

      // Validate authentication
      if (!request.auth) {
        throw new HttpsError("unauthenticated", "User must be authenticated");
      }

      if (request.auth.uid !== uid) {
        throw new HttpsError("permission-denied", "Invalid user ID");
      }

      // Verify admin access
      const userDoc = await db.collection("users").doc(uid).get();
      const userData = userDoc.data();

      if (!userData || !["admin", "enterprise"].includes(userData.subscriptionTier)) {
        throw new HttpsError("permission-denied", "Admin access required");
      }

      logger.info("Admin chat request", { uid, messageLength: message.length });

      // Generate session ID if not provided
      const currentSessionId = sessionId || `admin_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Fetch admin context data
      const chatContext = await getChatContext(uid, true);
      const adminContext = await getAdminContext(userData.subscriptionTier);

      // Build admin system prompt
      const systemPrompt = buildAdminSystemPrompt(chatContext, adminContext);

      // Create conversation messages
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ];

      // Add admin conversation history
      if (chatContext.recentConversations.length > 0) {
        const recentHistory = chatContext.recentConversations
          .slice(0, 2) // Last 2 conversations for admins
          .reverse();

        recentHistory.forEach(conv => {
          if (conv.question && conv.response) {
            messages.splice(-1, 0,
              { role: "user", content: conv.question },
              { role: "assistant", content: conv.response }
            );
          }
        });
      }

      // Validate OpenAI availability
      const openaiClient = getOpenAIClient();
      if (!openaiClient) {
        throw new HttpsError("failed-precondition", "AI service is currently unavailable");
      }

      // Call OpenAI with admin-specific configuration
      const completion = await openaiClient.chat.completions.create({
        model: "gpt-4o",
        messages,
        max_tokens: 1500,
        temperature: 0.05, // More focused responses for admin queries
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      });

      const aiResponse = completion.choices[0]?.message?.content || "I couldn't process your admin request. Please try again.";
      const tokensUsed = completion.usage?.total_tokens || 0;

      // Save admin conversation
      await saveConversation(uid, currentSessionId, message, aiResponse, "admin", {
        adminLevel: userData.subscriptionTier,
        systemMetrics: adminContext.systemMetrics,
      });

      const response: ChatResponse = {
        response: aiResponse,
        sessionId: currentSessionId,
        timestamp: new Date().toISOString(),
        tokensUsed,
        context: {
          type: "admin",
          dataUsed: ["system_metrics", "performance_data", "user_analytics"],
        },
      };

      logger.info("Admin chat response generated", {
        uid,
        tokensUsed,
        sessionId: currentSessionId
      });

      return response;

    } catch (error) {
      logger.error("Admin chat error", error);

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError("internal", "Failed to process admin chat request");
    }
  }
);

/**
 * Builds system prompt for customer chatbot
 */
function buildCustomerSystemPrompt(
  chatContext: any,
  auditContext: any,
  siteContext: any,
  neuroSEOContext: any
): string {
  const userTier = chatContext.userTier || "free";
  const availableFeatures = chatContext.availableFeatures || [];

  let prompt = `You are RankPilot AI, an expert SEO assistant helping users optimize their websites.

USER CONTEXT:
- Subscription Tier: ${userTier.toUpperCase()}
- Available Features: ${availableFeatures.join(", ")}
- Total Site Pages: ${siteContext.totalPages || 0}

PERSONALITY & TONE:
- Professional yet friendly and approachable
- Provide actionable, specific advice
- Explain technical concepts in simple terms
- Always encourage best practices
- Be supportive and motivating

CAPABILITIES BY TIER:
- Free: Basic SEO guidance, audit explanations
- Starter: + Content analysis, basic NeuroSEO™ insights
- Agency: + Advanced NeuroSEO™, competitor analysis
- Enterprise: + Full NeuroSEO™ Suite, custom solutions
- Admin: + All features and system management

`;

  // Add audit context if available
  if (auditContext) {
    prompt += `
CURRENT AUDIT DATA:
URL: ${auditContext.url}
Performance Score: ${auditContext.score.performance}/100
SEO Score: ${auditContext.score.seo}/100
Accessibility Score: ${auditContext.score.accessibility}/100
Best Practices Score: ${auditContext.score.bestPractices}/100

Key Issues Found:
${auditContext.issues.slice(0, 5).map((issue: string) => `- ${issue}`).join("\n")}

Recommended Actions:
${auditContext.suggestions.slice(0, 5).map((suggestion: string) => `- ${suggestion}`).join("\n")}

Last Analyzed: ${auditContext.lastAnalyzed}
`;
  }

  // Add site context
  if (siteContext.contentSummary) {
    prompt += `
SITE CONTENT OVERVIEW:
${siteContext.contentSummary.substring(0, 500)}...

Primary Keywords: ${siteContext.keywords.slice(0, 10).join(", ")}
`;
  }

  // Add NeuroSEO™ context
  if (neuroSEOContext.insights) {
    prompt += `
NEUROSEO™ INSIGHTS:
${neuroSEOContext.insights}
`;
  }

  prompt += `
RESPONSE GUIDELINES:
1. Use the audit data to provide specific, actionable advice
2. Reference the user's subscription tier when suggesting features
3. For paid tier features not available to free users, gently mention upgrade benefits
4. Always provide value regardless of tier
5. Use HTML formatting for better readability (lists, bold, links)
6. Keep responses concise but comprehensive
7. End with a question to continue the conversation

IMPORTANT: If the user asks about features beyond their tier, explain the limitation kindly and suggest how they can access those features.`;

  return prompt;
}

/**
 * Builds system prompt for admin chatbot
 */
function buildAdminSystemPrompt(chatContext: any, adminContext: any): string {
  return `You are RankPilot Admin AI, an advanced system management assistant for RankPilot administrators.

ADMIN CONTEXT:
- Admin Level: ${chatContext.userTier.toUpperCase()}
- System Status: Operational
- Monitoring: Active

CURRENT SYSTEM METRICS:
- Total Users: ${adminContext.systemMetrics.totalUsers}
- Active Subscriptions: ${adminContext.systemMetrics.activeSubscriptions}
- Total Analyses: ${adminContext.systemMetrics.totalAnalyses}
- Error Rate: ${adminContext.systemMetrics.errorRate}%

RECENT ACTIVITY:
${adminContext.recentActivity.slice(0, 3).map((activity: any) =>
    `- ${activity.type || "Activity"}: ${activity.description || "No description"}`
  ).join("\n")}

PERFORMANCE INSIGHTS:
${adminContext.performanceInsights.map((insight: string) => `- ${insight}`).join("\n")}

CAPABILITIES:
- System monitoring and health checks
- User management and analytics
- Performance optimization recommendations
- Error tracking and resolution
- Business intelligence and reporting
- Database insights and optimization
- Security monitoring and alerts

PERSONALITY:
- Technical and precise
- Data-driven recommendations
- Proactive problem identification
- Clear action items
- Executive-level insights

RESPONSE GUIDELINES:
1. Provide actionable insights with specific metrics
2. Include relevant system data in responses
3. Suggest proactive measures for optimization
4. Use technical language appropriate for administrators
5. Format data in tables or lists for clarity
6. Always include next steps or recommendations
7. Reference specific system components when relevant

IMPORTANT: Focus on providing actionable intelligence that helps optimize RankPilot's performance and user experience.`;
}

/**
 * Saves conversation to Firestore
 */
async function saveConversation(
  uid: string,
  sessionId: string,
  question: string,
  response: string,
  chatType: "customer" | "admin",
  metadata: any = {}
): Promise<void> {
  try {
    const collectionName = chatType === "admin" ? "adminChats" : "chatLogs";
    const conversationData = {
      question,
      response,
      timestamp: FieldValue.serverTimestamp(),
      tokensUsed: metadata.tokensUsed || 0,
      chatType,
      metadata,
    };

    await db
      .collection(collectionName)
      .doc(uid)
      .collection("sessions")
      .doc(sessionId)
      .collection("messages")
      .add(conversationData);

    // Update session metadata
    await db
      .collection(collectionName)
      .doc(uid)
      .collection("sessions")
      .doc(sessionId)
      .set({
        lastMessage: response.substring(0, 100),
        lastActivity: FieldValue.serverTimestamp(),
        messageCount: FieldValue.increment(1),
        chatType,
      }, { merge: true });

  } catch (error) {
    logger.error("Failed to save conversation", error);
    // Don't throw error to avoid breaking the chat flow
  }
}

