import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/roles'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const supabase = await createClient()
    const { id } = await context.params

    const { data: review, error } = await supabase
      .from('reviews')
      .select('*, providers(id, name, slug)')
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    return NextResponse.json({ review })
  } catch (error) {
    console.error('Error fetching review:', error)
    return NextResponse.json(
      { error: 'Failed to fetch review' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const { id } = await context.params
    const body = await request.json()

    // Only allow admins to update these fields
    const allowedFields = [
      'is_approved',
      'is_featured',
      'admin_notes',
    ]

    const updateData: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field]
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: review, error } = await (supabase.from('reviews') as any)
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ review })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unauthorized' },
      { status: 401 }
    )
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const { id } = await context.params

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unauthorized' },
      { status: 401 }
    )
  }
}
