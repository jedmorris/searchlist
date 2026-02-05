// YouTube captions/transcript fetcher
// Uses the YouTube transcript API (unofficial) since the official API requires OAuth

import { parseStringPromise } from 'xml2js'

interface TranscriptSegment {
  text: string
  start: number
  duration: number
}

interface TranscriptResult {
  transcript: string
  segments: TranscriptSegment[]
}

// Fetch transcript using the YouTube timedtext endpoint
export async function fetchTranscript(videoId: string): Promise<TranscriptResult> {
  // First, get the video page to extract caption tracks
  const videoPageUrl = `https://www.youtube.com/watch?v=${videoId}`
  const response = await fetch(videoPageUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch video page: ${response.status}`)
  }

  const html = await response.text()

  // Extract the captions player response
  const captionMatch = html.match(/"captions":\s*({.*?"playerCaptionsTracklistRenderer".*?})/)
  if (!captionMatch) {
    throw new Error('No captions found for this video')
  }

  // Try to parse and find caption URL
  let captionsData
  try {
    // Find the start of the captions JSON object and extract it properly
    const captionsStart = html.indexOf('"captions":')
    if (captionsStart === -1) {
      throw new Error('No captions data found')
    }

    // Find captionTracks array
    const tracksMatch = html.match(/"captionTracks":\s*(\[.*?\])/)
    if (!tracksMatch) {
      throw new Error('No caption tracks found')
    }

    captionsData = JSON.parse(tracksMatch[1])
  } catch {
    // Fallback: try to find baseUrl directly
    const urlMatch = html.match(/"baseUrl":\s*"(https:\/\/www\.youtube\.com\/api\/timedtext[^"]+)"/)
    if (!urlMatch) {
      throw new Error('Could not extract caption URL')
    }

    const captionUrl = urlMatch[1].replace(/\\u0026/g, '&')
    return await fetchAndParseTranscript(captionUrl)
  }

  // Find English caption track (prefer manual over auto-generated)
  let captionTrack = captionsData.find(
    (track: { languageCode: string; kind?: string }) =>
      track.languageCode === 'en' && track.kind !== 'asr'
  )

  // Fallback to auto-generated English
  if (!captionTrack) {
    captionTrack = captionsData.find(
      (track: { languageCode: string }) => track.languageCode === 'en'
    )
  }

  // Fallback to any English variant
  if (!captionTrack) {
    captionTrack = captionsData.find((track: { languageCode: string }) =>
      track.languageCode.startsWith('en')
    )
  }

  // Fallback to first available track
  if (!captionTrack && captionsData.length > 0) {
    captionTrack = captionsData[0]
  }

  if (!captionTrack || !captionTrack.baseUrl) {
    throw new Error('No suitable caption track found')
  }

  const captionUrl = captionTrack.baseUrl.replace(/\\u0026/g, '&')
  return await fetchAndParseTranscript(captionUrl)
}

async function fetchAndParseTranscript(captionUrl: string): Promise<TranscriptResult> {
  const response = await fetch(captionUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch captions: ${response.status}`)
  }

  const xml = await response.text()
  return parseTimedText(xml)
}

// Parse YouTube's timed text XML format
export async function parseTimedText(xml: string): Promise<TranscriptResult> {
  const result = await parseStringPromise(xml, { explicitArray: false })

  if (!result.transcript || !result.transcript.text) {
    return { transcript: '', segments: [] }
  }

  // Handle both single text and array of texts
  const texts = Array.isArray(result.transcript.text)
    ? result.transcript.text
    : [result.transcript.text]

  const segments: TranscriptSegment[] = texts.map(
    (item: { _?: string; $?: { start?: string; dur?: string } } | string) => {
      // Handle both object format and plain string
      if (typeof item === 'string') {
        return {
          text: cleanText(item),
          start: 0,
          duration: 0,
        }
      }

      return {
        text: cleanText(item._ || ''),
        start: parseFloat(item.$?.start || '0'),
        duration: parseFloat(item.$?.dur || '0'),
      }
    }
  )

  const transcript = segments.map((s) => s.text).join(' ')

  return { transcript, segments }
}

// Clean transcript text
export function cleanText(text: string): string {
  return text
    // Decode HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    // Remove speaker tags like [Music] or [Applause]
    .replace(/\[.*?\]/g, '')
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    .trim()
}

// Clean and format transcript for blog post
export function cleanTranscript(text: string): string {
  return text
    // Basic cleanup
    .replace(/\s+/g, ' ')
    .trim()
}

// Format transcript with timestamps (for reference)
export function formatTranscriptWithTimestamps(
  segments: TranscriptSegment[]
): string {
  return segments
    .map((segment) => {
      const minutes = Math.floor(segment.start / 60)
      const seconds = Math.floor(segment.start % 60)
      const timestamp = `[${minutes}:${seconds.toString().padStart(2, '0')}]`
      return `${timestamp} ${segment.text}`
    })
    .join('\n')
}
