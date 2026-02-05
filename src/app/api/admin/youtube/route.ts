// Admin API for YouTube channel settings

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getChannelInfo } from '@/lib/youtube/client'
import { subscribe, unsubscribe, generateWebhookSecret } from '@/lib/youtube/subscription'
import type { YouTubeChannelSettings, YouTubeChannelSettingsInsert } from '@/types/database'

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

// GET: Get channel settings and processed videos
export async function GET() {
  const supabase = await createClient()
  const auth = await verifyAdmin(supabase)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminClient = createAdminClient() as any

  // Get channel settings
  const { data: settings, error: settingsError } = await adminClient
    .from('youtube_channel_settings')
    .select('*')
    .order('created_at', { ascending: false }) as { data: YouTubeChannelSettings[] | null; error: unknown }

  if (settingsError) {
    console.error('Error fetching settings:', settingsError)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }

  // Get processed videos (last 50)
  const { data: processedVideos, error: videosError } = await adminClient
    .from('youtube_processed_videos')
    .select(`
      *,
      blog_post:blog_posts(id, title, slug, is_published)
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  if (videosError) {
    console.error('Error fetching processed videos:', videosError)
  }

  return NextResponse.json({
    settings: settings || [],
    processedVideos: processedVideos || [],
  })
}

// POST: Add or update channel settings
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const auth = await verifyAdmin(supabase)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const body = await request.json()
  const { channelId, action } = body

  if (!channelId) {
    return NextResponse.json({ error: 'Channel ID is required' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminClient = createAdminClient() as any

  // Handle different actions
  if (action === 'subscribe') {
    // Subscribe to channel updates
    const { data: settings } = await adminClient
      .from('youtube_channel_settings')
      .select('*')
      .eq('channel_id', channelId)
      .single() as { data: YouTubeChannelSettings | null }

    if (!settings) {
      return NextResponse.json({ error: 'Channel not configured' }, { status: 404 })
    }

    const result = await subscribe(channelId, settings.webhook_secret)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ message: 'Subscription initiated' })
  }

  if (action === 'unsubscribe') {
    const { data: settings } = await adminClient
      .from('youtube_channel_settings')
      .select('*')
      .eq('channel_id', channelId)
      .single() as { data: YouTubeChannelSettings | null }

    if (!settings) {
      return NextResponse.json({ error: 'Channel not configured' }, { status: 404 })
    }

    const result = await unsubscribe(channelId, settings.webhook_secret)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    // Update settings
    await adminClient
      .from('youtube_channel_settings')
      .update({
        subscription_expires_at: null,
        is_active: false,
      })
      .eq('channel_id', channelId)

    return NextResponse.json({ message: 'Unsubscribed successfully' })
  }

  // Default action: Add or update channel
  // Fetch channel info from YouTube
  const channelInfo = await getChannelInfo(channelId)
  if (!channelInfo) {
    return NextResponse.json({ error: 'Channel not found on YouTube' }, { status: 404 })
  }

  // Check if channel already exists
  const { data: existing } = await adminClient
    .from('youtube_channel_settings')
    .select('id')
    .eq('channel_id', channelId)
    .single()

  if (existing) {
    // Update existing
    const { error: updateError } = await adminClient
      .from('youtube_channel_settings')
      .update({
        channel_name: channelInfo.title,
        channel_url: `https://www.youtube.com/${channelInfo.customUrl || `channel/${channelId}`}`,
        is_active: true,
      })
      .eq('channel_id', channelId)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update channel' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Channel updated' })
  }

  // Create new channel settings
  const webhookSecret = generateWebhookSecret()

  const newSettings: YouTubeChannelSettingsInsert = {
    channel_id: channelId,
    channel_name: channelInfo.title,
    channel_url: `https://www.youtube.com/${channelInfo.customUrl || `channel/${channelId}`}`,
    webhook_secret: webhookSecret,
    is_active: true,
  }

  const { error: insertError } = await adminClient
    .from('youtube_channel_settings')
    .insert(newSettings)

  if (insertError) {
    console.error('Error inserting channel settings:', insertError)
    return NextResponse.json({ error: 'Failed to add channel' }, { status: 500 })
  }

  // Automatically subscribe to the channel
  const subscribeResult = await subscribe(channelId, webhookSecret)
  if (!subscribeResult.success) {
    console.warn('Auto-subscription failed:', subscribeResult.error)
  }

  return NextResponse.json({
    message: 'Channel added and subscription initiated',
    subscribed: subscribeResult.success,
  }, { status: 201 })
}

// DELETE: Remove channel settings
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const auth = await verifyAdmin(supabase)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { searchParams } = new URL(request.url)
  const channelId = searchParams.get('channelId')

  if (!channelId) {
    return NextResponse.json({ error: 'Channel ID is required' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminClient = createAdminClient() as any

  // Get settings to unsubscribe first
  const { data: settings } = await adminClient
    .from('youtube_channel_settings')
    .select('*')
    .eq('channel_id', channelId)
    .single() as { data: YouTubeChannelSettings | null }

  if (settings) {
    // Try to unsubscribe (don't fail if this doesn't work)
    await unsubscribe(channelId, settings.webhook_secret).catch(console.error)
  }

  // Delete the settings
  const { error } = await adminClient
    .from('youtube_channel_settings')
    .delete()
    .eq('channel_id', channelId)

  if (error) {
    console.error('Error deleting channel:', error)
    return NextResponse.json({ error: 'Failed to delete channel' }, { status: 500 })
  }

  return NextResponse.json({ message: 'Channel removed' })
}
