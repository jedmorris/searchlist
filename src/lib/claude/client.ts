// Claude API client wrapper

import Anthropic from '@anthropic-ai/sdk'

let client: Anthropic | null = null

export function getClaudeClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set')
    }
    client = new Anthropic({ apiKey })
  }
  return client
}

export interface BlogFormatResult {
  title: string
  excerpt: string
  content: string
  category: string
  tags: string[]
}

export async function formatTranscriptToBlog(
  transcript: string,
  videoTitle: string,
  videoDescription: string
): Promise<BlogFormatResult> {
  const claude = getClaudeClient()

  const prompt = buildBlogPrompt(transcript, videoTitle, videoDescription)

  const response = await claude.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  // Extract text content from response
  const textContent = response.content.find((block) => block.type === 'text')
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from Claude')
  }

  const responseText = textContent.text

  // Parse the JSON response
  try {
    // Find JSON in the response (it might be wrapped in markdown code blocks)
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) ||
      responseText.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }

    const jsonStr = jsonMatch[1] || jsonMatch[0]
    const result = JSON.parse(jsonStr)

    return {
      title: result.title || videoTitle,
      excerpt: result.excerpt || '',
      content: result.content || '',
      category: result.category || 'General',
      tags: result.tags || [],
    }
  } catch (parseError) {
    console.error('Failed to parse Claude response:', parseError)
    // Fallback: return the response as content
    return {
      title: videoTitle,
      excerpt: videoDescription.slice(0, 200),
      content: responseText,
      category: 'General',
      tags: [],
    }
  }
}

function buildBlogPrompt(
  transcript: string,
  videoTitle: string,
  videoDescription: string
): string {
  return `You are a content editor for "Still Searching with Jed Morris," a podcast/blog about Entrepreneurship Through Acquisition (ETA) - buying and operating small businesses.

I have a transcript from a video episode that needs to be formatted into a blog post. Please transform this transcript into a well-structured, readable blog article.

**Video Title:** ${videoTitle}

**Video Description:** ${videoDescription}

**Transcript:**
${transcript}

Please format this into a blog post and return a JSON object with the following structure:

\`\`\`json
{
  "title": "A compelling blog post title (can be different from video title)",
  "excerpt": "A 1-2 sentence summary for previews and SEO (max 200 characters)",
  "content": "The full blog post content in Markdown format",
  "category": "One of: Getting Started, Due Diligence, Financing, Operations, Deal Sourcing, Valuation, Legal, Post-Acquisition",
  "tags": ["array", "of", "relevant", "tags"]
}
\`\`\`

**Guidelines for the content:**
1. Transform spoken content into written prose - remove filler words, clean up grammar, but preserve the author's voice and personality
2. Break content into logical sections with ## headers
3. Use bullet points or numbered lists where appropriate
4. Add emphasis (**bold** or *italic*) for key points
5. Keep the conversational, accessible tone while making it readable
6. If there are specific examples, case studies, or actionable advice, make sure to highlight them
7. The content should be educational and valuable for aspiring acquisition entrepreneurs
8. Include key takeaways or action items where appropriate

Return ONLY the JSON object, no additional text.`
}
