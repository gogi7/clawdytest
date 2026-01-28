export interface NewsItem {
  id: string;
  title: string;
  source: string;
  date: string;
  snippet: string;
  link: string;
  category: string;
  image?: string;
}

export const categories = [
  "All",
  "Tutorials",
  "Announcements",
  "Community",
  "Integrations",
  "AI News",
] as const;

export type Category = (typeof categories)[number];

export const newsData: NewsItem[] = [
  {
    id: "1",
    title: "Clawdbot 2.0 Released: Revolutionary AI Assistant Features",
    source: "TechCrunch",
    date: "2024-01-15",
    snippet:
      "The latest version of Clawdbot introduces groundbreaking capabilities including multi-modal understanding, enhanced reasoning, and seamless workflow automation.",
    link: "https://example.com/clawdbot-2-release",
    category: "Announcements",
  },
  {
    id: "2",
    title: "How to Build Custom Automations with Clawdbot API",
    source: "Dev.to",
    date: "2024-01-14",
    snippet:
      "Step-by-step guide on leveraging the Clawdbot API to create powerful custom automations for your business workflows.",
    link: "https://example.com/clawdbot-api-tutorial",
    category: "Tutorials",
  },
  {
    id: "3",
    title: "Community Spotlight: 10 Creative Clawdbot Use Cases",
    source: "Clawdbot Blog",
    date: "2024-01-13",
    snippet:
      "Discover how the community is using Clawdbot in innovative ways - from content creation to data analysis and beyond.",
    link: "https://example.com/community-spotlight",
    category: "Community",
  },
  {
    id: "4",
    title: "Clawdbot Now Integrates with Slack, Discord, and Microsoft Teams",
    source: "VentureBeat",
    date: "2024-01-12",
    snippet:
      "New integration options allow teams to bring Clawdbot's powerful AI capabilities directly into their favorite communication platforms.",
    link: "https://example.com/clawdbot-integrations",
    category: "Integrations",
  },
  {
    id: "5",
    title: "The Future of AI Assistants: Where Clawdbot Leads the Way",
    source: "Wired",
    date: "2024-01-11",
    snippet:
      "An in-depth analysis of how Clawdbot is shaping the future of AI-powered assistance and what it means for productivity.",
    link: "https://example.com/ai-future",
    category: "AI News",
  },
  {
    id: "6",
    title: "Getting Started with Clawdbot: A Beginner's Guide",
    source: "Medium",
    date: "2024-01-10",
    snippet:
      "Everything you need to know to start using Clawdbot effectively, from basic commands to advanced features.",
    link: "https://example.com/beginners-guide",
    category: "Tutorials",
  },
  {
    id: "7",
    title: "Clawdbot Achieves SOC 2 Type II Certification",
    source: "PR Newswire",
    date: "2024-01-09",
    snippet:
      "Enterprise customers can now deploy Clawdbot with confidence as the platform meets rigorous security and compliance standards.",
    link: "https://example.com/soc2-certification",
    category: "Announcements",
  },
  {
    id: "8",
    title: "Connecting Clawdbot to Your CI/CD Pipeline",
    source: "GitHub Blog",
    date: "2024-01-08",
    snippet:
      "Learn how to integrate Clawdbot into your development workflow for automated code reviews, testing, and deployment assistance.",
    link: "https://example.com/cicd-integration",
    category: "Integrations",
  },
  {
    id: "9",
    title: "Community AMA: Clawdbot Team Answers Your Questions",
    source: "Reddit",
    date: "2024-01-07",
    snippet:
      "Highlights from the recent Ask Me Anything session where the Clawdbot team discussed roadmap, features, and community feedback.",
    link: "https://example.com/ama-highlights",
    category: "Community",
  },
  {
    id: "10",
    title: "AI Industry Report: Clawdbot Among Top 5 AI Assistants of 2024",
    source: "Gartner",
    date: "2024-01-06",
    snippet:
      "Industry analysts rank Clawdbot as one of the leading AI assistant platforms based on capability, reliability, and user satisfaction.",
    link: "https://example.com/gartner-report",
    category: "AI News",
  },
  {
    id: "11",
    title: "Building a Knowledge Base with Clawdbot RAG Features",
    source: "Towards Data Science",
    date: "2024-01-05",
    snippet:
      "Deep dive into using Clawdbot's retrieval-augmented generation capabilities to create intelligent knowledge bases.",
    link: "https://example.com/rag-tutorial",
    category: "Tutorials",
  },
  {
    id: "12",
    title: "Clawdbot + Notion: The Perfect Productivity Stack",
    source: "Notion Blog",
    date: "2024-01-04",
    snippet:
      "How to supercharge your Notion workspace with Clawdbot integration for automated documentation and smart queries.",
    link: "https://example.com/notion-integration",
    category: "Integrations",
  },
];
