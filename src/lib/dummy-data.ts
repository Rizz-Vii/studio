// src/lib/dummy-data.ts

export interface ContentBrief {
  id: string;
  title: string;
  primaryKeyword: string;
  searchIntent: string;
  seoScore: string;
  llmGeneratedOutline: string[];
  recommendedMeta: {
    title: string;
    description: string;
  };
  competitorInsights: string[];
  briefSummary: string;
}

export const dummyContentBriefs: ContentBrief[] = [
  {
    id: "brief-1",
    title: "How to Rank #1 for “Best CRM Software for Small Business”",
    primaryKeyword: "best crm software for small business",
    searchIntent: "Commercial / Transactional",
    seoScore: "82/100",
    llmGeneratedOutline: [
      "Introduction: Importance of CRM",
      "What Makes a CRM Good for Small Businesses?",
      "Top 5 CRM Tools Reviewed",
      "Pricing Comparison Table",
      "Case Study: A Small Business Success Story",
      "Final Recommendation"
    ],
    recommendedMeta: {
      title: "Top CRM Tools for Small Businesses in 2025",
      description: "Compare the best CRM software for small businesses. In-depth reviews, pricing, and success stories to help you choose the right one."
    },
    competitorInsights: [
      "HubSpot and Zoho dominate the top 3 positions.",
      "Most use pricing tables and customer testimonials."
    ],
    briefSummary: "Use comparison tables, pricing details, and real-world examples. Include long-tail variations like 'affordable CRM for startups'."
  },
  {
    id: "brief-2",
    title: "Complete On-Page SEO Checklist for 2025",
    primaryKeyword: "on-page seo checklist 2025",
    searchIntent: "Informational",
    seoScore: "76/100",
    llmGeneratedOutline: [
      "What is On-Page SEO?",
      "Essential Elements (Title Tags, H1s, Meta)",
      "Internal Linking Strategy",
      "Advanced Techniques (Schema, NLP Optimization)",
      "Free On-Page SEO Tools"
    ],
    recommendedMeta: {
      title: "The Ultimate 2025 On-Page SEO Checklist",
      description: "Boost your search rankings with this complete on-page SEO guide. Optimized for Google’s latest updates."
    },
    competitorInsights: [
      "Ahrefs and Backlinko use graphics and step-by-step lists.",
      "Common structure: Intro > Checklist > Bonus Tips"
    ],
    briefSummary: "Target new SEOs. Use bullet points, visuals, and downloadable templates. Include NLP and AI-enhanced tips."
  },
  {
    id: "brief-3",
    title: "AI Tools for Keyword Clustering in 2025",
    primaryKeyword: "keyword clustering ai",
    searchIntent: "Commercial / Informational",
    seoScore: "88/100",
    llmGeneratedOutline: [
      "What is Keyword Clustering?",
      "Why Manual Clustering Fails in 2025",
      "Top AI Tools for Clustering",
      "How to Use AI Clustering with Your Content Strategy",
      "Real Results from LLM-Driven Clustering"
    ],
    recommendedMeta: {
      title: "Best AI Tools for Keyword Clustering in 2025",
      description: "Automate your SEO workflow with these LLM-powered keyword clustering tools. Save time, boost traffic."
    },
    competitorInsights: [
      "Clearscope and SurferSEO use AI clustering.",
      "Most competitors don't explain clustering logic in detail."
    ],
    briefSummary: "Highlight the benefits of automation, show screenshots of cluster outputs, and explain the tech in simple terms."
  },
  {
    id: "brief-4",
    title: "LLM SEO Audit Template for E-commerce Websites",
    primaryKeyword: "e-commerce seo audit ai",
    searchIntent: "Transactional",
    seoScore: "91/100",
    llmGeneratedOutline: [
      "Why SEO Audits Are Critical for E-Commerce",
      "Automated SEO Audit Workflow (via LLM)",
      "Fixing Technical SEO Issues",
      "On-Page Enhancements for Product Pages",
      "AI-Generated Audit Summary and Reporting"
    ],
    recommendedMeta: {
      title: "AI SEO Audit Template for E-commerce Sites",
      description: "Automate your e-commerce SEO audits with our LLM-powered checklist. Identify, fix, and optimize in minutes."
    },
    competitorInsights: [
      "Shopify stores rarely use structured audit flows.",
      "Most fail to address product schema properly."
    ],
    briefSummary: "Offer an interactive PDF or exportable checklist. Focus on automation, schema fixes, and dynamic page improvements."
  },
  {
    id: "brief-5",
    title: "ChatGPT Prompts for SEO Metadata Generation",
    primaryKeyword: "chatgpt seo prompts",
    searchIntent: "Informational",
    seoScore: "74/100",
    llmGeneratedOutline: [
      "What Are SEO Prompts?",
      "Generating Titles and Meta Descriptions",
      "Improving CTR with Prompt Engineering",
      "Prompt Templates for Local, Product, Blog SEO",
      "Best Practices & Common Mistakes"
    ],
    recommendedMeta: {
      title: "Best ChatGPT Prompts for SEO Titles & Meta Descriptions",
      description: "Use these prompt templates to generate high-CTR titles and meta descriptions with AI."
    },
    competitorInsights: [
      "Few competitors offer prompt templates.",
      "Most don’t optimize for CTR or SERP features."
    ],
    briefSummary: "Educate marketers on prompt engineering. Provide examples, results, and do/don’t practices."
  }
];
