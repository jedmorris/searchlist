import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET single inquiry
export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('inquiries')
    .select('*, providers(name, company_name, email)')
    .eq('id', id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// PUT - update inquiry (status, is_read)
export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createClient()

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { status, is_read } = body

    const updateData: Record<string, unknown> = {}

    if (status !== undefined) {
      const validStatuses = ['new', 'contacted', 'closed', 'converted']
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status' },
          { status: 400 }
        )
      }
      updateData.status = status
      // Auto-mark as read when status changes from 'new'
      if (status !== 'new') {
        updateData.is_read = true
      }
    }

    if (is_read !== undefined) {
      updateData.is_read = is_read
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (adminClient.from('inquiries') as any)
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { error: 'Failed to update inquiry' },
      { status: 500 }
    )
  }
}

// DELETE inquiry
export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createClient()

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const adminClient = createAdminClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (adminClient.from('inquiries') as any)
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete inquiry' },
      { status: 500 }
    )
  }
}
