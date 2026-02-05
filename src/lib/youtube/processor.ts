// YouTube video processor - orchestrates the full pipeline
// 1. Fetch video details
// 2. Fetch captions/transcript
// 3. Format with Claude
// 4. Create draft blog post

import { createAdminClient } from '@/lib/supabase/admin'
import { getVideoDetails, parseDuration } from './client'
import { fetchTranscript } from './captions'
import { formatTranscriptToBlog } from '@/lib/claude/client'
import type { BlogPostInsert, YouTubeProcessedVideoInsert, YouTubeProcessedVideo } from '@/types/database'

interface ProcessingResult {
  success: boolean
  blogPostId?: string
  error?: string
}

export async function processNewVideo(
  videoId: string,
  channelId?: string
): Promise<ProcessingResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any

  // Check if video was already processed
  const { data: existingVideo } = await supabase
    .from('youtube_processed_videos')
    .select('id, status, blog_post_id')
    .eq('video_id', videoId)
    .single() as { data: Pick<YouTubeProcessedVideo, 'id' | 'status' | 'blog_post_id'> | null }

  if (existingVideo && existingVideo.status === 'completed') {
    return {
      success: true,
      blogPostId: existingVideo.blog_post_id || undefined,
      error: 'Video already processed',
    }
  }

  // Create or update processing record
  const processingRecord: YouTubeProcessedVideoInsert = {
    video_id: videoId,
    status: 'processing',
  }

  if (existingVideo) {
    await supabase
      .from('youtube_processed_videos')
      .update({ status: 'processing', error_message: null })
      .eq('id', existingVideo.id)
  } else {
    await supabase.from('youtube_processed_videos').insert(processingRecord)
  }

  try {
    // Step 1: Fetch video details
    console.log(`[YouTube Processor] Fetching video details for ${videoId}`)
    const videoDetails = await getVideoDetails(videoId)

    if (!videoDetails) {
      throw new Error('Video not found')
    }

    // Update record with video title
    await supabase
      .from('youtube_processed_videos')
      .update({ video_title: videoDetails.title })
      .eq('video_id', videoId)

    // Step 2: Fetch transcript
    console.log(`[YouTube Processor] Fetching transcript for ${videoId}`)
    let transcript: string

    try {
      const transcriptResult = await fetchTranscript(videoId)
      transcript = transcriptResult.transcript
    } catch (transcriptError) {
      console.warn(
        `[YouTube Processor] Failed to fetch transcript, using description:`,
        transcriptError
      )
      // Fallback to using video description if no transcript available
      transcript = videoDetails.description
    }

    if (!transcript || transcript.length < 100) {
      throw new Error('Insufficient transcript content to generate blog post')
    }

    // Step 3: Format with Claude
    console.log(`[YouTube Processor] Formatting with Claude for ${videoId}`)
    const blogContent = await formatTranscriptToBlog(
      transcript,
      videoDetails.title,
      videoDetails.description
    )

    // Step 4: Create draft blog post
    console.log(`[YouTube Processor] Creating blog post for ${videoId}`)

    // Generate unique slug
    const baseSlug = blogContent.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Check for existing slug and append number if needed
    let slug = baseSlug
    let slugAttempt = 0
    while (true) {
      const { data: existingPost } = await supabase
        .from('blog_posts')
        .select('id')
        .eq('slug', slug)
        .single()

      if (!existingPost) break

      slugAttempt++
      slug = `${baseSlug}-${slugAttempt}`
    }

    // Calculate reading time
    const wordCount = blogContent.content.split(/\s+/).length
    const readingTime = Math.max(1, Math.ceil(wordCount / 200))

    const blogPost: BlogPostInsert = {
      title: blogContent.title,
      slug,
      excerpt: blogContent.excerpt,
      youtube_video_id: videoId,
      video_duration: parseDuration(videoDetails.duration),
      content: blogContent.content,
      author_name: 'Jed Morris',
      reading_time_minutes: readingTime,
      category: blogContent.category,
      tags: blogContent.tags,
      meta_title: blogContent.title,
      meta_description: blogContent.excerpt,
      featured_image_url: videoDetails.thumbnails.maxres || videoDetails.thumbnails.high,
      is_published: false, // Draft by default
      is_featured: false,
      source: 'youtube',
      youtube_channel_id: channelId || videoDetails.channelId,
    }

    const { data: createdPost, error: createError } = await supabase
      .from('blog_posts')
      .insert(blogPost)
      .select('id')
      .single()

    if (createError) {
      throw new Error(`Failed to create blog post: ${createError.message}`)
    }

    // Update processing record as completed
    await supabase
      .from('youtube_processed_videos')
      .update({
        status: 'completed',
        blog_post_id: createdPost.id,
        processed_at: new Date().toISOString(),
        error_message: null,
      })
      .eq('video_id', videoId)

    console.log(`[YouTube Processor] Successfully created blog post ${createdPost.id} for ${videoId}`)

    return {
      success: true,
      blogPostId: createdPost.id,
    }
  } catch (error) {
    console.error(`[YouTube Processor] Error processing ${videoId}:`, error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    // Update processing record as failed
    await supabase
      .from('youtube_processed_videos')
      .update({
        status: 'failed',
        error_message: errorMessage,
        processed_at: new Date().toISOString(),
      })
      .eq('video_id', videoId)

    return {
      success: false,
      error: errorMessage,
    }
  }
}

// Process multiple videos (useful for backfill)
export async function processMultipleVideos(
  videoIds: string[],
  channelId?: string
): Promise<{ processed: number; failed: number; results: ProcessingResult[] }> {
  const results: ProcessingResult[] = []
  let processed = 0
  let failed = 0

  for (const videoId of videoIds) {
    const result = await processNewVideo(videoId, channelId)
    results.push(result)

    if (result.success) {
      processed++
    } else {
      failed++
    }

    // Add a small delay between processing to avoid rate limits
    await new Promise((resolve) => setTimeout(resolve, 2000))
  }

  return { processed, failed, results }
}
