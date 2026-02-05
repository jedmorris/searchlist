import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const {
      provider_id,
      rating,
      title,
      content,
      author_name,
      author_email,
    } = body

    // Validate required fields
    if (!provider_id || !rating || !content || !author_name || !author_email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Check if provider exists
    const { data: provider } = await supabase
      .from('providers')
      .select('id')
      .eq('id', provider_id)
      .single()

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      )
    }

    // Get current user if authenticated
    const { data: { user } } = await supabase.auth.getUser()

    // Create review (starts as not approved)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: review, error } = await (supabase.from('reviews') as any)
      .insert({
        provider_id,
        user_id: user?.id || null,
        rating,
        title: title || null,
        content,
        author_name,
        author_email,
        is_approved: false,
        is_featured: false,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ review })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}
