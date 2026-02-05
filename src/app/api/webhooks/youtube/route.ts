// YouTube WebSub (PubSubHubbub) webhook handler
// GET: Verification challenge
// POST: New video notification

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { YouTubeChannelSettings } from '@/types/database'
import { verifyWebhookSignature } from '@/lib/youtube/subscription'
import { processNewVideo } from '@/lib/youtube/processor'
import { parseStringPromise } from 'xml2js'

// GET: Handle WebSub verification challenge
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const hubMode = searchParams.get('hub.mode')
  const hubChallenge = searchParams.get('hub.challenge')
  const hubTopic = searchParams.get('hub.topic')
  const hubLeaseSeconds = searchParams.get('hub.lease_seconds')

  console.log('[YouTube Webhook] Verification request:', {
    mode: hubMode,
    topic: hubTopic,
    leaseSeconds: hubLeaseSeconds,
  })

  // Must return the challenge to confirm subscription
  if (hubMode === 'subscribe' || hubMode === 'unsubscribe') {
    if (!hubChallenge) {
      return new NextResponse('Missing hub.challenge', { status: 400 })
    }

    // Extract channel ID from topic URL
    const channelMatch = hubTopic?.match(/channel_id=([^&]+)/)
    const channelId = channelMatch?.[1]

    if (channelId && hubMode === 'subscribe' && hubLeaseSeconds) {
      // Update subscription expiry in database
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supabase = createAdminClient() as any
      const expiresAt = new Date(Date.now() + parseInt(hubLeaseSeconds) * 1000)

      await supabase
        .from('youtube_channel_settings')
        .update({
          subscription_expires_at: expiresAt.toISOString(),
        })
        .eq('channel_id', channelId)

      console.log(`[YouTube Webhook] Subscription confirmed for ${channelId}, expires: ${expiresAt}`)
    }

    // Return challenge as plain text
    return new NextResponse(hubChallenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    })
  }

  return new NextResponse('Invalid mode', { status: 400 })
}

// POST: Handle new video notification
export async function POST(request: NextRequest) {
  const contentType = request.headers.get('content-type') || ''

  // YouTube sends Atom XML
  if (!contentType.includes('application/atom+xml') && !contentType.includes('text/xml')) {
    console.warn('[YouTube Webhook] Unexpected content type:', contentType)
  }

  const body = await request.text()
  const signature = request.headers.get('x-hub-signature')

  console.log('[YouTube Webhook] Received notification')

  // Parse the Atom XML feed
  let feedData
  try {
    feedData = await parseStringPromise(body, { explicitArray: false })
  } catch (parseError) {
    console.error('[YouTube Webhook] Failed to parse XML:', parseError)
    return new NextResponse('Invalid XML', { status: 400 })
  }

  // Extract video information from the feed
  const entry = feedData?.feed?.entry
  if (!entry) {
    console.log('[YouTube Webhook] No entry in feed (possibly a deleted video)')
    return new NextResponse('OK', { status: 200 })
  }

  // Handle both single entry and array of entries
  const entries = Array.isArray(entry) ? entry : [entry]

  for (const videoEntry of entries) {
    const videoId = videoEntry['yt:videoId']
    const channelId = videoEntry['yt:channelId']
    const title = videoEntry.title

    if (!videoId || !channelId) {
      console.warn('[YouTube Webhook] Missing video or channel ID')
      continue
    }

    console.log(`[YouTube Webhook] New video: ${title} (${videoId}) from channel ${channelId}`)

    // Verify the channel is configured
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createAdminClient() as any
    const { data: channelSettings } = await supabase
      .from('youtube_channel_settings')
      .select('*')
      .eq('channel_id', channelId)
      .eq('is_active', true)
      .single() as { data: YouTubeChannelSettings | null }

    if (!channelSettings) {
      console.warn(`[YouTube Webhook] Channel ${channelId} not configured or inactive`)
      continue
    }

    // Verify webhook signature if secret is set
    if (signature && channelSettings.webhook_secret) {
      const isValid = verifyWebhookSignature(body, signature, channelSettings.webhook_secret)
      if (!isValid) {
        console.error('[YouTube Webhook] Invalid signature')
        return new NextResponse('Invalid signature', { status: 401 })
      }
    }

    // Check if this video was already processed
    const { data: existingVideo } = await supabase
      .from('youtube_processed_videos')
      .select('id, status')
      .eq('video_id', videoId)
      .single()

    if (existingVideo && existingVideo.status === 'completed') {
      console.log(`[YouTube Webhook] Video ${videoId} already processed, skipping`)
      continue
    }

    // Queue video for processing (process asynchronously)
    // In production, you might want to use a job queue like Bull, BullMQ, or similar
    processNewVideo(videoId, channelId)
      .then((result) => {
        if (result.success) {
          console.log(`[YouTube Webhook] Successfully processed video ${videoId}`)
        } else {
          console.error(`[YouTube Webhook] Failed to process video ${videoId}:`, result.error)
        }
      })
      .catch((error) => {
        console.error(`[YouTube Webhook] Error processing video ${videoId}:`, error)
      })
  }

  // Return 200 immediately (processing happens async)
  return new NextResponse('OK', { status: 200 })
}
