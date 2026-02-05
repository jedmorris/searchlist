import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/roles'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const { id } = await context.params

    const { error } = await supabase
      .from('provider_invitations')
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

export async function GET(request: Request, context: RouteContext) {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const { id } = await context.params

    const { data, error } = await supabase
      .from('provider_invitations')
      .select('*, providers(id, name, slug)')
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ invitation: data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unauthorized' },
      { status: 401 }
    )
  }
}
