import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { SITE_CONFIG } from '@/lib/constants'

interface CategorySlug {
  slug: string
  updated_at: string | null
}

interface ProviderSlug {
  slug: string
  updated_at: string | null
}

interface BlogPostSlug {
  slug: string
  updated_at: string | null
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const baseUrl = SITE_CONFIG.url

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/quiz`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/saved`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  // Fetch all categories
  const { data: categoriesData } = await supabase
    .from('categories')
    .select('slug, updated_at')
    .order('display_order')

  const categories = (categoriesData || []) as CategorySlug[]
  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/${category.slug}`,
    lastModified: new Date(category.updated_at || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Fetch all active providers
  const { data: providersData } = await supabase
    .from('providers')
    .select('slug, updated_at')
    .eq('is_active', true)
    .order('updated_at', { ascending: false })

  const providers = (providersData || []) as ProviderSlug[]
  const providerPages: MetadataRoute.Sitemap = providers.map((provider) => ({
    url: `${baseUrl}/provider/${provider.slug}`,
    lastModified: new Date(provider.updated_at || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Fetch all published blog posts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: blogPostsData } = await (supabase as any)
    .from('blog_posts')
    .select('slug, updated_at')
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  const blogPosts = (blogPostsData || []) as BlogPostSlug[]
  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at || new Date()),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...categoryPages, ...providerPages, ...blogPages]
}
