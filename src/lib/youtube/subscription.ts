// YouTube WebSub (PubSubHubbub) subscription management

import crypto from 'crypto'

const YOUTUBE_HUB_URL = 'https://pubsubhubbub.appspot.com/subscribe'

interface SubscriptionResult {
  success: boolean
  error?: string
}

function getCallbackUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.WEBSUB_CALLBACK_URL
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_SITE_URL or WEBSUB_CALLBACK_URL must be set')
  }
  return `${baseUrl}/api/webhooks/youtube`
}

function getTopicUrl(channelId: string): string {
  return `https://www.youtube.com/xml/feeds/videos.xml?channel_id=${channelId}`
}

export async function subscribe(channelId: string, secret: string): Promise<SubscriptionResult> {
  const callbackUrl = getCallbackUrl()
  const topicUrl = getTopicUrl(channelId)

  const formData = new URLSearchParams({
    'hub.callback': callbackUrl,
    'hub.topic': topicUrl,
    'hub.verify': 'async',
    'hub.mode': 'subscribe',
    'hub.secret': secret,
    // Request 10-day lease (YouTube typically grants up to 10 days)
    'hub.lease_seconds': '864000',
  })

  try {
    const response = await fetch(YOUTUBE_HUB_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    })

    if (response.status === 202 || response.status === 204) {
      // 202 Accepted - subscription is being processed
      // 204 No Content - subscription accepted
      return { success: true }
    }

    const errorText = await response.text()
    console.error('WebSub subscription failed:', response.status, errorText)
    return {
      success: false,
      error: `Subscription failed: ${response.status} - ${errorText}`,
    }
  } catch (error) {
    console.error('WebSub subscription error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function unsubscribe(channelId: string, secret: string): Promise<SubscriptionResult> {
  const callbackUrl = getCallbackUrl()
  const topicUrl = getTopicUrl(channelId)

  const formData = new URLSearchParams({
    'hub.callback': callbackUrl,
    'hub.topic': topicUrl,
    'hub.verify': 'async',
    'hub.mode': 'unsubscribe',
    'hub.secret': secret,
  })

  try {
    const response = await fetch(YOUTUBE_HUB_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    })

    if (response.status === 202 || response.status === 204) {
      return { success: true }
    }

    const errorText = await response.text()
    console.error('WebSub unsubscribe failed:', response.status, errorText)
    return {
      success: false,
      error: `Unsubscribe failed: ${response.status} - ${errorText}`,
    }
  } catch (error) {
    console.error('WebSub unsubscribe error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function renewSubscription(channelId: string, secret: string): Promise<SubscriptionResult> {
  // Renewal is the same as subscribing - it extends the lease
  return subscribe(channelId, secret)
}

// Verify HMAC signature from YouTube webhook
export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha1', secret)
    .update(body)
    .digest('hex')

  return `sha1=${expectedSignature}` === signature
}

// Generate a random webhook secret
export function generateWebhookSecret(): string {
  return crypto.randomBytes(32).toString('hex')
}
