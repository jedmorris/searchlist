import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const supabase = await createClient()
    const { id: reviewId } = await context.params

    // Get voter IP
    const headersList = await headers()
    const forwardedFor = headersList.get('x-forwarded-for')
    const voterIp = forwardedFor?.split(',')[0]?.trim() ||
      headersList.get('x-real-ip') ||
      'unknown'

    // Check if review exists and is approved
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: review } = await (supabase.from('reviews') as any)
      .select('id, is_approved')
      .eq('id', reviewId)
      .single()

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    if (!review.is_approved) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    // Check if already voted
    const { data: existingVote } = await supabase
      .from('review_votes')
      .select('review_id')
      .eq('review_id', reviewId)
      .eq('voter_ip', voterIp)
      .single()

    if (existingVote) {
      return NextResponse.json({ error: 'Already voted' }, { status: 400 })
    }

    // Create vote
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('review_votes') as any)
      .insert({
        review_id: reviewId,
        voter_ip: voterIp,
      })

    if (error) {
      // Handle duplicate key error
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Already voted' }, { status: 400 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error voting:', error)
    return NextResponse.json(
      { error: 'Failed to vote' },
      { status: 500 }
    )
  }
}
