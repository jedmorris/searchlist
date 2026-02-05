import { cn } from '@/lib/utils'

interface ArticleContentProps {
  content: string
  className?: string
}

// Simple markdown-to-HTML converter for basic formatting
function parseMarkdown(markdown: string): string {
  let html = markdown

  // Escape HTML entities first (except for our converted ones)
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-8 mb-4">$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-10 mb-4">$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-10 mb-4">$1</h1>')

  // Bold and italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')

  // Lists - unordered
  html = html.replace(/^\s*- (.*$)/gim, '<li class="ml-4">$1</li>')

  // Lists - ordered
  html = html.replace(/^\s*\d+\. (.*$)/gim, '<li class="ml-4 list-decimal">$1</li>')

  // Wrap consecutive list items
  html = html.replace(/(<li.*<\/li>\n?)+/g, (match) => {
    if (match.includes('list-decimal')) {
      return `<ol class="list-decimal list-inside space-y-2 my-4">${match.replace(/list-decimal/g, '')}</ol>`
    }
    return `<ul class="list-disc list-inside space-y-2 my-4">${match}</ul>`
  })

  // Blockquotes
  html = html.replace(
    /^&gt; (.*$)/gim,
    '<blockquote class="border-l-4 border-primary pl-4 py-2 my-4 italic text-muted-foreground">$1</blockquote>'
  )

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')

  // Links
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>'
  )

  // Horizontal rules
  html = html.replace(/^---$/gim, '<hr class="my-8 border-border" />')

  // Paragraphs - wrap text that's not already wrapped
  const lines = html.split('\n')
  const wrappedLines = lines.map((line) => {
    const trimmed = line.trim()
    // Skip if already an HTML element or empty
    if (
      !trimmed ||
      trimmed.startsWith('<h') ||
      trimmed.startsWith('<ul') ||
      trimmed.startsWith('<ol') ||
      trimmed.startsWith('<li') ||
      trimmed.startsWith('<blockquote') ||
      trimmed.startsWith('<hr') ||
      trimmed.startsWith('</') ||
      trimmed.endsWith('</ul>') ||
      trimmed.endsWith('</ol>')
    ) {
      return line
    }
    return `<p class="my-4 leading-relaxed">${trimmed}</p>`
  })

  return wrappedLines.join('\n')
}

export function ArticleContent({ content, className }: ArticleContentProps) {
  const htmlContent = parseMarkdown(content)

  return (
    <article
      className={cn('prose prose-lg max-w-none', className)}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  )
}
