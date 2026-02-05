import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { BlogPostInsert } from '@/types/database'

// GET all blog posts (admin view - includes drafts)
export async function GET() {
  const supabase = await createClient()

  // Verify admin
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Fetch all posts including drafts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (createAdminClient().from('blog_posts') as any)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching blog posts:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }

  return NextResponse.json({ posts: data })
}

// POST create new blog post
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Verify admin
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()

    // Generate slug from title if not provided
    const slug =
      body.slug ||
      body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

    // Calculate reading time (rough estimate: 200 words per minute)
    const wordCount = body.content?.split(/\s+/).length || 0
    const readingTime = Math.max(1, Math.ceil(wordCount / 200))

    const postData: BlogPostInsert = {
      title: body.title,
      slug,
      excerpt: body.excerpt || null,
      youtube_video_id: body.youtube_video_id,
      video_duration: body.video_duration || null,
      content: body.content,
      author_name: body.author_name || 'Jed Morris',
      author_image_url: body.author_image_url || null,
      published_at: body.is_published ? body.published_at || new Date().toISOString() : null,
      reading_time_minutes: readingTime,
      category: body.category || null,
      tags: body.tags || null,
      meta_title: body.meta_title || null,
      meta_description: body.meta_description || null,
      featured_image_url: body.featured_image_url || null,
      is_published: body.is_published || false,
      is_featured: body.is_featured || false,
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (createAdminClient().from('blog_posts') as any)
      .insert(postData)
      .select()
      .single()

    if (error) {
      console.error('Error creating blog post:', error)
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A post with this slug already exists' },
          { status: 400 }
        )
      }
      return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
    }

    return NextResponse.json({ post: data }, { status: 201 })
  } catch (error) {
    console.error('Error creating blog post:', error)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
