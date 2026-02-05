'use client'

import { useEffect, useState, use } from 'react'
import { notFound } from 'next/navigation'
import { BlogPostForm } from '@/components/blog/BlogPostForm'
import type { BlogPost } from '@/types/database'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EditBlogPostPage({ params }: PageProps) {
  const { id } = use(params)
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetchPost() {
      try {
        const response = await fetch(`/api/admin/blog/${id}`)
        if (!response.ok) {
          setError(true)
          return
        }
        const data = await response.json()
        setPost(data.post)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchPost()
  }, [id])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    )
  }

  if (error || !post) {
    notFound()
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Episode</h1>
        <p className="text-muted-foreground">
          Update the episode details and content
        </p>
      </div>
      <BlogPostForm post={post} />
    </div>
  )
}
