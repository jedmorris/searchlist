import Link from 'next/link'
import { ChevronRight, Video } from 'lucide-react'
import { BlogPostCard } from '@/components/blog/BlogPostCard'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import type { BlogPost } from '@/types/database'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog - Still Searching with Jed Morris',
  description:
    'Watch and read episodes from Still Searching with Jed Morris - insights on Entrepreneurship Through Acquisition, business buying, and the search fund journey.',
}

async function getBlogPosts(): Promise<{
  featured: BlogPost | null
  posts: BlogPost[]
  categories: string[]
}> {
  const supabase = await createClient()

  // Fetch all published posts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('blog_posts') as any)
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  if (error) {
    console.error('Error fetching blog posts:', error)
    return { featured: null, posts: [], categories: [] }
  }

  const posts = (data || []) as BlogPost[]

  // Find featured post (first one that's marked featured, or most recent)
  const featured = posts.find((p) => p.is_featured) || posts[0] || null

  // Get unique categories
  const categorySet = new Set(posts.map((p) => p.category).filter(Boolean))
  const categories = Array.from(categorySet) as string[]

  // Remove featured from regular posts list
  const regularPosts = featured ? posts.filter((p) => p.id !== featured.id) : posts

  return { featured, posts: regularPosts, categories }
}

export default async function BlogPage() {
  const { featured, posts, categories } = await getBlogPosts()

  const hasContent = featured || posts.length > 0

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Blog</span>
      </nav>

      {/* Header */}
      <div className="max-w-3xl mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Video className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-4xl font-bold">Still Searching with Jed Morris</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Insights, interviews, and advice for entrepreneurs navigating the world of business
          acquisition. Watch the episodes and read the transcripts below.
        </p>
      </div>

      {/* Category filters */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
            All Episodes
          </Badge>
          {categories.map((category) => (
            <Badge
              key={category}
              variant="outline"
              className="cursor-pointer hover:bg-secondary"
            >
              {category}
            </Badge>
          ))}
        </div>
      )}

      {!hasContent ? (
        <div className="text-center py-16">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
            <Video className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No episodes yet</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            New episodes of Still Searching with Jed Morris are coming soon. Check back later!
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Featured Post */}
          {featured && (
            <section>
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                Latest Episode
              </h2>
              <BlogPostCard post={featured} featured />
            </section>
          )}

          {/* All Posts Grid */}
          {posts.length > 0 && (
            <section>
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                All Episodes
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <BlogPostCard key={post.id} post={post} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* CTA Section */}
      <div className="mt-16 text-center py-12 bg-muted/30 rounded-2xl">
        <h2 className="text-2xl font-bold mb-3">Ready to Start Your Search?</h2>
        <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
          Find vetted professionals who can help you with every step of your acquisition journey.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
  )
}
