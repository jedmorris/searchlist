// Admin API for manually processing YouTube videos

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { processNewVideo, processMultipleVideos } from '@/lib/youtube/processor'
import { getLatestVideos } from '@/lib/youtube/client'

// Verify admin access
async function verifyAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized', status: 401 }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Forbidden', status: 403 }
  }

  return { user }
}

// POST: Manually process a video or fetch latest videos
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const auth = await verifyAdmin(supabase)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const body = await request.json()
  const { videoId, channelId, action } = body

  // Action: Fetch and process latest videos from channel
  if (action === 'fetch-latest') {
    if (!channelId) {
      return NextResponse.json({ error: 'Channel ID is required' }, { status: 400 })
    }

    try {
      const maxResults = body.maxResults || 5
      const videoIds = await getLatestVideos(channelId, maxResults)

      if (videoIds.length === 0) {
        return NextResponse.json({
          message: 'No videos found',
          processed: 0,
          failed: 0,
        })
      }

      const result = await processMultipleVideos(videoIds, channelId)

      return NextResponse.json({
        message: `Processed ${result.processed} videos, ${result.failed} failed`,
        processed: result.processed,
        failed: result.failed,
        results: result.results,
      })
    } catch (error) {
      console.error('Error fetching latest videos:', error)
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to fetch videos' },
        { status: 500 }
      )
    }
  }

  // Action: Process a single video
  if (!videoId) {
    return NextResponse.json({ error: 'Video ID is required' }, { status: 400 })
  }

  // Extract video ID from URL if full URL provided
  let parsedVideoId = videoId
  const urlMatch = videoId.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )
  if (urlMatch) {
    parsedVideoId = urlMatch[1]
  }

  try {
    const result = await processNewVideo(parsedVideoId, channelId)

    if (result.success) {
      return NextResponse.json({
        message: 'Video processed successfully',
        blogPostId: result.blogPostId,
      })
    } else {
      return NextResponse.json(
        { error: result.error || 'Processing failed' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error processing video:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Processing failed' },
      { status: 500 }
    )
  }
}
