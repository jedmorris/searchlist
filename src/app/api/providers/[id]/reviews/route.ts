import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const supabase = await createClient()
    const { id: providerId } = await context.params
    const { searchParams } = new URL(request.url)

    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const sortBy = searchParams.get('sort') || 'recent' // 'recent', 'helpful', 'rating_high', 'rating_low'

    // Build query
    let query = supabase
      .from('reviews')
      .select('*', { count: 'exact' })
      .eq('provider_id', providerId)
      .eq('is_approved', true)

    // Apply sorting
    switch (sortBy) {
      case 'helpful':
        query = query.order('helpful_count', { ascending: false })
        break
      case 'rating_high':
        query = query.order('rating', { ascending: false })
        break
      case 'rating_low':
        query = query.order('rating', { ascending: true })
        break
      case 'recent':
      default:
        query = query.order('created_at', { ascending: false })
        break
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: reviews, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get rating distribution
    const { data: allReviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('provider_id', providerId)
      .eq('is_approved', true)

    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    if (allReviews) {
      allReviews.forEach((review: { rating: number }) => {
        ratingDistribution[review.rating] = (ratingDistribution[review.rating] || 0) + 1
      })
    }

    return NextResponse.json({
      reviews,
      total: count || 0,
      ratingDistribution,
      hasMore: (count || 0) > offset + limit,
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}
