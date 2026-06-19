import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

// Contact submissions are mutated only by the admin. The public site uses the
// anon key (insert-only), so delete / mark-read run server-side with the
// service-role key and are gated behind the same admin_session cookie the rest
// of the dashboard uses. The middleware lets all /api/ routes through without
// auth, so the cookie check below is the actual guard for these endpoints.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function isAdmin(): boolean {
  return cookies().get('admin_session')?.value === 'authenticated'
}

function getAdminClient() {
  if (!supabaseUrl || !serviceRoleKey) return null
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

async function parseId(request: Request): Promise<number | null> {
  try {
    const body = await request.json()
    const id = body?.id
    return typeof id === 'number' && Number.isFinite(id) ? id : null
  } catch {
    return null
  }
}

// Mark a contact submission read / unread.
export async function PATCH(request: Request) {
  if (!isAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getAdminClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  let body: { id?: unknown; read?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const id = body?.id
  const read = body?.read
  if (typeof id !== 'number' || !Number.isFinite(id) || typeof read !== 'boolean') {
    return NextResponse.json(
      { error: 'id (number) and read (boolean) are required' },
      { status: 400 }
    )
  }

  const { error } = await supabase
    .from('contact_form_submissions')
    .update({ read })
    .eq('id', id)

  if (error) {
    console.error('Error updating contact submission read state:', error)
    return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

// Permanently delete a contact submission.
export async function DELETE(request: Request) {
  if (!isAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getAdminClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  const id = await parseId(request)
  if (id === null) {
    return NextResponse.json({ error: 'id (number) is required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('contact_form_submissions')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting contact submission:', error)
    return NextResponse.json({ error: 'Failed to delete submission' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
