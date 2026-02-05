import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, Clock, Calendar, ArrowLeft, Share2, Tag } from 'lucide-react'
import { VideoEmbed } from '@/components/blog/VideoEmbed'
import { ArticleContent } from '@/components/blog/ArticleContent'
import { BlogPostCard } from '@/components/blog/BlogPostCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd'
import { createClient } from '@/lib/supabase/server'
import { SITE_CONFIG } from '@/lib/constants'
import type { BlogPost } from '@/types/database'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('blog_posts') as any)
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (error) return null
  return data as BlogPost
}

async function getRelatedPosts(
  currentPostId: string,
  category: string | null
): Promise<BlogPost[]> {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from('blog_posts') as any)
    .select('*')
    .eq('is_published', true)
    .neq('id', currentPostId)
    .order('published_at', { ascending: false })
    .limit(3)

  if (category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query

  if (error) return []
  return (data || []) as BlogPost[]
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPost(slug)

  if (!post) {
    return { title: 'Post Not Found' }
  }

  const title = post.meta_title || post.title
  const description = post.meta_description || post.excerpt || `Watch ${post.title} from Still Searching with Jed Morris`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: post.published_at || undefined,
      authors: [post.author_name],
      images: post.featured_image_url
        ? [post.featured_image_url]
        : [`https://img.youtube.com/vi/${post.youtube_video_id}/maxresdefault.jpg`],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getBlogPost(slug)

  if (!post) {
    notFound()
  }

  const relatedPosts = await getRelatedPosts(post.id, post.category)

  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    { name: 'Blog', href: '/blog' },
    { name: post.title, href: `/blog/${post.slug}` },
  ]

  return (
    <div>
      <BreadcrumbJsonLd items={breadcrumbItems} />

      {/* Article Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: post.title,
            description: post.excerpt,
            image: `https://img.youtube.com/vi/${post.youtube_video_id}/maxresdefault.jpg`,
            author: {
              '@type': 'Person',
              name: post.author_name,
            },
            publisher: {
              '@type': 'Organization',
              name: SITE_CONFIG.name,
              url: SITE_CONFIG.url,
            },
            datePublished: post.published_at,
            dateModified: post.updated_at,
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `${SITE_CONFIG.url}/blog/${post.slug}`,
            },
            video: {
              '@type': 'VideoObject',
              name: post.title,
              description: post.excerpt,
              thumbnailUrl: `https://img.youtube.com/vi/${post.youtube_video_id}/maxresdefault.jpg`,
              embedUrl: `https://www.youtube.com/embed/${post.youtube_video_id}`,
              duration: post.video_duration,
            },
          }),
        }}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/blog" className="hover:text-primary">
            Blog
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground truncate max-w-[200px]">{post.title}</span>
        </nav>

        {/* Back button */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all episodes
        </Link>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            {post.category && (
              <Badge variant="secondary" className="mb-4">
                {post.category}
              </Badge>
            )}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
              {/* Author */}
              <div className="flex items-center gap-3">
                {post.author_image_url ? (
                  <Image
                    src={post.author_image_url}
                    alt={post.author_name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold">
                      {post.author_name.charAt(0)}
                    </span>
                  </div>
                )}
                <span className="font-medium text-foreground">{post.author_name}</span>
              </div>

              {formattedDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {formattedDate}
                </span>
              )}

              {post.reading_time_minutes && (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {post.reading_time_minutes} min read
                </span>
              )}

              {post.video_duration && (
                <span className="flex items-center gap-1.5">
                  <span className="text-xs">▶</span>
                  {post.video_duration} video
                </span>
              )}
            </div>
          </header>

          {/* Video Embed */}
          <div className="mb-12">
            <VideoEmbed
              videoId={post.youtube_video_id}
              title={post.title}
              thumbnailUrl={post.featured_image_url || undefined}
            />
          </div>

          {/* Excerpt / Summary */}
          {post.excerpt && (
            <div className="mb-10 p-6 bg-muted/50 rounded-xl border-l-4 border-primary">
              <p className="text-lg text-muted-foreground italic">{post.excerpt}</p>
            </div>
          )}

          {/* Article Content */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Episode Transcript</h2>
            <ArticleContent content={post.content} />
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mb-12 pt-8 border-t">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Topics</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Share */}
          <div className="mb-12 p-6 bg-muted/30 rounded-xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold mb-1">Found this helpful?</h3>
                <p className="text-sm text-muted-foreground">
                  Share this episode with fellow searchers
                </p>
              </div>
              <Button variant="outline" className="gap-2">
                <Share2 className="h-4 w-4" />
                Share Episode
              </Button>
            </div>
          </div>

          {/* CTA */}
          <div className="mb-16 p-8 bg-primary/5 rounded-2xl text-center">
            <h3 className="text-2xl font-bold mb-3">Need Help With Your Search?</h3>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Find vetted professionals who can help with due diligence, financing, legal, and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/quiz"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                Take the Matching Quiz
              </Link>
              <Link
                href="/#categories"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-border font-medium hover:bg-secondary transition-colors"
              >
                Browse Providers
              </Link>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">More Episodes</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <BlogPostCard key={relatedPost.id} post={relatedPost} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
