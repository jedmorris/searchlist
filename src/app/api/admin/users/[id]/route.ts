import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Update a user (change password or email)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()

  // Verify the requester is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const { password, email } = body

  const updateData: Record<string, string> = {}
  if (password) updateData.password = password
  if (email) updateData.email = email

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${id}`, {
    method: 'PUT',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  })

  const data = await response.json()

  if (!response.ok) {
    return NextResponse.json({ error: data.msg || 'Failed to update user' }, { status: response.status })
  }

  return NextResponse.json(data)
}

// Delete a user
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()

  // Verify the requester is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  // Prevent self-deletion
  if (user.id === id) {
    return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
  }

  const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${id}`, {
    method: 'DELETE',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
  })

  if (!response.ok) {
    const data = await response.json()
    return NextResponse.json({ error: data.msg || 'Failed to delete user' }, { status: response.status })
  }

  return NextResponse.json({ success: true })
}
