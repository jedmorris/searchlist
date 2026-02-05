import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { BlogPostUpdate } from '@/types/database'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET single blog post
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (createAdminClient().from('blog_posts') as any)
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  return NextResponse.json({ post: data })
}

// PATCH update blog post (partial update)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
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

    const updateData: BlogPostUpdate = {}

    // Only include fields that are present in the request
    if (body.is_published !== undefined) {
      updateData.is_published = body.is_published
      // Set published_at when publishing for the first time
      if (body.is_published && !body.published_at) {
        updateData.published_at = new Date().toISOString()
      }
    }
    if (body.is_featured !== undefined) updateData.is_featured = body.is_featured
    if (body.title !== undefined) updateData.title = body.title
    if (body.slug !== undefined) updateData.slug = body.slug
    if (body.excerpt !== undefined) updateData.excerpt = body.excerpt
    if (body.youtube_video_id !== undefined) updateData.youtube_video_id = body.youtube_video_id
    if (body.video_duration !== undefined) updateData.video_duration = body.video_duration
    if (body.content !== undefined) {
      updateData.content = body.content
      // Recalculate reading time
      const wordCount = body.content.split(/\s+/).length
      updateData.reading_time_minutes = Math.max(1, Math.ceil(wordCount / 200))
    }
    if (body.author_name !== undefined) updateData.author_name = body.author_name
    if (body.author_image_url !== undefined) updateData.author_image_url = body.author_image_url
    if (body.category !== undefined) updateData.category = body.category
    if (body.tags !== undefined) updateData.tags = body.tags
    if (body.meta_title !== undefined) updateData.meta_title = body.meta_title
    if (body.meta_description !== undefined) updateData.meta_description = body.meta_description
    if (body.featured_image_url !== undefined) updateData.featured_image_url = body.featured_image_url
    if (body.published_at !== undefined) updateData.published_at = body.published_at

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (createAdminClient().from('blog_posts') as any)
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating blog post:', error)
      return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
    }

    return NextResponse.json({ post: data })
  } catch (error) {
    console.error('Error updating blog post:', error)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

// PUT full update blog post
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
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

    // Calculate reading time
    const wordCount = body.content?.split(/\s+/).length || 0
    const readingTime = Math.max(1, Math.ceil(wordCount / 200))

    const updateData: BlogPostUpdate = {
      title: body.title,
      slug: body.slug,
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
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating blog post:', error)
      return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
    }

    return NextResponse.json({ post: data })
  } catch (error) {
    console.error('Error updating blog post:', error)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

// DELETE blog post
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (createAdminClient().from('blog_posts') as any)
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting blog post:', error)
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
