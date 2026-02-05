'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ChevronRight, Star, CheckCircle, XCircle, Trash2, ExternalLink, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StarRating } from '@/components/reviews/StarRating'
import { useToast } from '@/hooks/use-toast'
import type { Review } from '@/types/database'

type ReviewWithProvider = Review & {
  providers: { id: string; name: string; slug: string } | null
}

export default function AdminReviewsPage() {
  const { toast } = useToast()
  const [reviews, setReviews] = useState<ReviewWithProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending')
  const [selectedReview, setSelectedReview] = useState<ReviewWithProvider | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [processing, setProcessing] = useState(false)

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    try {
      // Use the admin client to bypass RLS
      const res = await fetch(`/api/admin/reviews?filter=${filter}`)
      const data = await res.json()
      setReviews(data.reviews || [])
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  async function updateReview(id: string, updates: { is_approved?: boolean; is_featured?: boolean; admin_notes?: string }) {
    setProcessing(true)
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!res.ok) {
        throw new Error('Failed to update review')
      }

      toast({
        title: 'Review updated',
      })
      fetchReviews()
      setSelectedReview(null)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update review',
        variant: 'destructive',
      })
    } finally {
      setProcessing(false)
    }
  }

  async function deleteReview(id: string) {
    if (!confirm('Are you sure you want to delete this review? This cannot be undone.')) {
      return
    }

    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Failed to delete review')
      }

      toast({
        title: 'Review deleted',
      })
      fetchReviews()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete review',
        variant: 'destructive',
      })
    }
  }

  const pendingCount = reviews.filter(r => !r.is_approved).length

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/admin" className="hover:text-primary">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Reviews</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Review Moderation</h1>
          <p className="text-muted-foreground">
            Approve, feature, or remove reviews
          </p>
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending ({pendingCount})</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="all">All Reviews</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : reviews.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {filter === 'pending' ? 'No reviews pending moderation' : 'No reviews found'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              {filter === 'pending' ? 'Pending Reviews' : filter === 'approved' ? 'Approved Reviews' : 'All Reviews'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rating</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>
                      <StarRating rating={review.rating} size="sm" />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{review.author_name}</p>
                        <p className="text-xs text-muted-foreground">{review.author_email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {review.providers ? (
                        <Link
                          href={`/provider/${review.providers.slug}`}
                          className="text-primary hover:underline flex items-center gap-1"
                          target="_blank"
                        >
                          {review.providers.name}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">Unknown</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="truncate">{review.title || review.content}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {review.is_approved ? (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Approved
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            Pending
                          </Badge>
                        )}
                        {review.is_featured && (
                          <Badge className="gap-1 bg-yellow-500 hover:bg-yellow-600">
                            <Star className="h-3 w-3 fill-current" />
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(review.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedReview(review)
                            setAdminNotes(review.admin_notes || '')
                          }}
                        >
                          Review
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteReview(review.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Review Detail Dialog */}
      <Dialog open={!!selectedReview} onOpenChange={(open) => !open && setSelectedReview(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
            <DialogDescription>
              Review for {selectedReview?.providers?.name || 'Unknown Provider'}
            </DialogDescription>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <StarRating rating={selectedReview.rating} size="lg" />
                <span className="text-lg font-semibold">{selectedReview.rating}/5</span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Author:</span>
                  <p className="font-medium">{selectedReview.author_name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <p className="font-medium">{selectedReview.author_email}</p>
                </div>
              </div>

              {selectedReview.title && (
                <div>
                  <span className="text-sm text-muted-foreground">Title:</span>
                  <p className="font-semibold">{selectedReview.title}</p>
                </div>
              )}

              <div>
                <span className="text-sm text-muted-foreground">Review:</span>
                <p className="mt-1 p-3 bg-muted rounded-lg whitespace-pre-wrap">
                  {selectedReview.content}
                </p>
              </div>

              <div>
                <span className="text-sm text-muted-foreground">Admin Notes (internal only):</span>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this review..."
                  className="mt-1"
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <div className="flex gap-2">
              {selectedReview?.is_approved ? (
                <Button
                  variant="outline"
                  onClick={() => updateReview(selectedReview.id, { is_approved: false, admin_notes: adminNotes })}
                  disabled={processing}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Unapprove
                </Button>
              ) : (
                <Button
                  onClick={() => selectedReview && updateReview(selectedReview.id, { is_approved: true, admin_notes: adminNotes })}
                  disabled={processing}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              )}
              <Button
                variant={selectedReview?.is_featured ? 'secondary' : 'outline'}
                onClick={() => selectedReview && updateReview(selectedReview.id, {
                  is_featured: !selectedReview.is_featured,
                  admin_notes: adminNotes
                })}
                disabled={processing}
              >
                <Star className={`h-4 w-4 mr-2 ${selectedReview?.is_featured ? 'fill-current' : ''}`} />
                {selectedReview?.is_featured ? 'Unfeature' : 'Feature'}
              </Button>
            </div>
            <Button
              variant="outline"
              onClick={() => setSelectedReview(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
