'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Youtube,
  Plus,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  ExternalLink,
  Play,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import type { YouTubeChannelSettings, YouTubeProcessedVideo, BlogPost } from '@/types/database'

interface ProcessedVideoWithPost extends YouTubeProcessedVideo {
  blog_post?: Pick<BlogPost, 'id' | 'title' | 'slug' | 'is_published'> | null
}

export default function YouTubeSettingsPage() {
  const [settings, setSettings] = useState<YouTubeChannelSettings[]>([])
  const [processedVideos, setProcessedVideos] = useState<ProcessedVideoWithPost[]>([])
  const [loading, setLoading] = useState(true)
  const [channelId, setChannelId] = useState('')
  const [videoId, setVideoId] = useState('')
  const [adding, setAdding] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [deleteChannel, setDeleteChannel] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/youtube')
      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings || [])
        setProcessedVideos(data.processedVideos || [])
      }
    } catch (error) {
      console.error('Failed to fetch YouTube settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to load YouTube settings',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function handleAddChannel(e: React.FormEvent) {
    e.preventDefault()
    if (!channelId.trim()) return

    setAdding(true)
    try {
      // Extract channel ID if URL is provided
      let parsedId = channelId.trim()
      const urlMatch = channelId.match(/channel\/([a-zA-Z0-9_-]+)/)
      if (urlMatch) {
        parsedId = urlMatch[1]
      }

      const response = await fetch('/api/admin/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId: parsedId }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({ title: 'Channel added successfully' })
        setChannelId('')
        fetchData()
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to add channel',
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to add channel',
        variant: 'destructive',
      })
    } finally {
      setAdding(false)
    }
  }

  async function handleSubscribe(channel: YouTubeChannelSettings) {
    try {
      const response = await fetch('/api/admin/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId: channel.channel_id, action: 'subscribe' }),
      })

      if (response.ok) {
        toast({ title: 'Subscription initiated' })
        fetchData()
      } else {
        const data = await response.json()
        toast({
          title: 'Error',
          description: data.error || 'Subscription failed',
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Subscription failed',
        variant: 'destructive',
      })
    }
  }

  async function handleDeleteChannel() {
    if (!deleteChannel) return

    try {
      const response = await fetch(`/api/admin/youtube?channelId=${deleteChannel}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({ title: 'Channel removed' })
        setSettings((prev) => prev.filter((s) => s.channel_id !== deleteChannel))
      } else {
        toast({
          title: 'Error',
          description: 'Failed to remove channel',
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to remove channel',
        variant: 'destructive',
      })
    } finally {
      setDeleteChannel(null)
    }
  }

  async function handleProcessVideo(e: React.FormEvent) {
    e.preventDefault()
    if (!videoId.trim()) return

    setProcessing(true)
    try {
      const response = await fetch('/api/admin/youtube/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: videoId.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Video processed',
          description: data.blogPostId ? 'Blog post created' : data.message,
        })
        setVideoId('')
        fetchData()
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Processing failed',
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Processing failed',
        variant: 'destructive',
      })
    } finally {
      setProcessing(false)
    }
  }

  async function handleFetchLatest(channel: YouTubeChannelSettings) {
    setProcessing(true)
    try {
      const response = await fetch('/api/admin/youtube/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId: channel.channel_id,
          action: 'fetch-latest',
          maxResults: 5,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Videos processed',
          description: `${data.processed} processed, ${data.failed} failed`,
        })
        fetchData()
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to fetch videos',
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to fetch videos',
        variant: 'destructive',
      })
    } finally {
      setProcessing(false)
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        )
      case 'processing':
        return (
          <Badge className="bg-blue-500">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Processing
          </Badge>
        )
      case 'failed':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
    }
  }

  function getSubscriptionStatus(channel: YouTubeChannelSettings) {
    if (!channel.subscription_expires_at) {
      return <Badge variant="secondary">Not subscribed</Badge>
    }

    const expiresAt = new Date(channel.subscription_expires_at)
    const now = new Date()

    if (expiresAt < now) {
      return <Badge variant="destructive">Expired</Badge>
    }

    const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return (
      <Badge className="bg-green-500">
        Active ({daysLeft} days left)
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">YouTube Integration</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">YouTube Integration</h1>
        <p className="text-muted-foreground">
          Automatically create blog posts from new YouTube videos
        </p>
      </div>

      {/* Add Channel Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Youtube className="h-5 w-5 text-red-500" />
            Add YouTube Channel
          </CardTitle>
          <CardDescription>
            Enter a YouTube channel ID or URL to start monitoring for new videos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddChannel} className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="channelId" className="sr-only">
                Channel ID
              </Label>
              <Input
                id="channelId"
                placeholder="Channel ID (e.g., UCxxxxx) or channel URL"
                value={channelId}
                onChange={(e) => setChannelId(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={adding || !channelId.trim()}>
              {adding ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Add Channel
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Configured Channels */}
      <Card>
        <CardHeader>
          <CardTitle>Configured Channels</CardTitle>
          <CardDescription>
            Channels being monitored for new video uploads
          </CardDescription>
        </CardHeader>
        <CardContent>
          {settings.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No channels configured yet. Add a channel above to get started.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Channel</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settings.map((channel) => (
                  <TableRow key={channel.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {channel.channel_name || channel.channel_id}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {channel.channel_id}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {channel.is_active ? (
                        <Badge className="bg-green-500">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>{getSubscriptionStatus(channel)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleFetchLatest(channel)}
                          disabled={processing}
                          title="Fetch latest videos"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSubscribe(channel)}
                          title="Refresh subscription"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        {channel.channel_url && (
                          <Button variant="ghost" size="icon" asChild>
                            <a
                              href={channel.channel_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteChannel(channel.channel_id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Manual Video Processing */}
      <Card>
        <CardHeader>
          <CardTitle>Process Video Manually</CardTitle>
          <CardDescription>
            Enter a video ID or URL to manually create a blog post
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProcessVideo} className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="videoId" className="sr-only">
                Video ID
              </Label>
              <Input
                id="videoId"
                placeholder="Video ID or YouTube URL"
                value={videoId}
                onChange={(e) => setVideoId(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={processing || !videoId.trim()}>
              {processing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Process Video
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Processed Videos */}
      <Card>
        <CardHeader>
          <CardTitle>Processed Videos</CardTitle>
          <CardDescription>
            Recent videos that have been processed into blog posts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {processedVideos.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No videos processed yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Video</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Blog Post</TableHead>
                  <TableHead>Processed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedVideos.map((video) => (
                  <TableRow key={video.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={`https://img.youtube.com/vi/${video.video_id}/default.jpg`}
                          alt=""
                          className="w-16 h-10 object-cover rounded"
                        />
                        <div>
                          <div className="font-medium line-clamp-1">
                            {video.video_title || video.video_id}
                          </div>
                          <a
                            href={`https://youtube.com/watch?v=${video.video_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-muted-foreground hover:underline"
                          >
                            {video.video_id}
                          </a>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {getStatusBadge(video.status)}
                        {video.error_message && (
                          <div className="text-xs text-destructive">
                            {video.error_message}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {video.blog_post ? (
                        <Link
                          href={`/admin/blog/${video.blog_post.id}`}
                          className="hover:underline"
                        >
                          <div className="line-clamp-1">{video.blog_post.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {video.blog_post.is_published ? 'Published' : 'Draft'}
                          </div>
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {video.processed_at
                        ? new Date(video.processed_at).toLocaleDateString()
                        : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteChannel} onOpenChange={() => setDeleteChannel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove channel?</AlertDialogTitle>
            <AlertDialogDescription>
              This will stop monitoring this channel for new videos. Existing blog posts
              will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteChannel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
