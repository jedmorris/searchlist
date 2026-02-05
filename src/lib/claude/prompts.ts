// Claude prompt templates for blog formatting

export const BLOG_CATEGORIES = [
  'Getting Started',
  'Due Diligence',
  'Financing',
  'Operations',
  'Deal Sourcing',
  'Valuation',
  'Legal',
  'Post-Acquisition',
] as const

export type BlogCategory = (typeof BLOG_CATEGORIES)[number]

export function getBlogSystemPrompt(): string {
  return `You are a content editor for "Still Searching with Jed Morris," a podcast and blog focused on Entrepreneurship Through Acquisition (ETA). Your role is to transform video transcripts into polished, educational blog posts that help aspiring acquisition entrepreneurs navigate the world of buying and operating small businesses.

Your writing style should be:
- Conversational but professional
- Educational and actionable
- Clear and well-structured
- Authentic to the speaker's voice

You understand the ETA space well, including:
- Search funds and self-funded searches
- SBA loans and acquisition financing
- Quality of Earnings (QoE) reports
- Deal sourcing and broker relationships
- Due diligence processes
- Business operations and management
- Exit strategies and value creation`
}

export function getTranscriptCleanupPrompt(transcript: string): string {
  return `Clean up this video transcript for readability. Remove filler words (um, uh, like, you know), fix grammar, and improve sentence structure while preserving the original meaning and voice.

Transcript:
${transcript}

Return the cleaned transcript as plain text.`
}

export function getSummaryPrompt(content: string): string {
  return `Summarize this blog post in 1-2 sentences (max 200 characters) for use as an excerpt/preview:

${content}

Return only the summary text.`
}

export function getCategoryPrompt(title: string, content: string): string {
  return `Based on this blog post title and content, which category best fits?

Title: ${title}

Content excerpt: ${content.slice(0, 1000)}

Categories:
- Getting Started: Introduction to ETA, basics for beginners
- Due Diligence: QoE, financial analysis, evaluating businesses
- Financing: SBA loans, seller financing, raising capital
- Operations: Running the business post-acquisition
- Deal Sourcing: Finding businesses, working with brokers
- Valuation: Pricing businesses, multiples, negotiations
- Legal: Contracts, legal structures, attorneys
- Post-Acquisition: First 100 days, integration, growth

Return only the category name.`
}

export function getTagsPrompt(title: string, content: string): string {
  return `Generate 3-5 relevant tags for this blog post. Tags should be specific and useful for filtering/searching.

Title: ${title}

Content excerpt: ${content.slice(0, 1000)}

Return tags as a comma-separated list. Examples: SBA Loans, Due Diligence, Search Funds, Quality of Earnings, Business Valuation`
}
