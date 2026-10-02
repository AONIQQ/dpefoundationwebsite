import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { updateRow, deleteRows, writesPaused } from '@/lib/data-store'
import { ADMIN_COOKIE, verifyAdminToken } from '@/lib/admin-auth'

// Contact submissions are mutated only by the admin. The public site uses the
// anon key (insert-only), so delete / mark-read run server-side with the
// service-role key and are gated behind the same admin_session cookie the rest
// of the dashboard uses. The middleware lets all /api/ routes through without
// auth, so the signed-cookie check below is the actual guard for these endpoints.

async function isAdmin(): Promise<boolean> {
  return verifyAdminToken(cookies().get(ADMIN_COOKIE)?.value)
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
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (writesPaused()) return NextResponse.json({ error: 'Maintenance in progress' }, { status: 503 })

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

  try { await updateRow('contact_form_submissions', id, { read }) }
  catch (error) { console.error(error); return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 }) }

  return NextResponse.json({ success: true })
}

// Permanently delete a contact submission.
export async function DELETE(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (writesPaused()) return NextResponse.json({ error: 'Maintenance in progress' }, { status: 503 })

  const id = await parseId(request)
  if (id === null) {
    return NextResponse.json({ error: 'id (number) is required' }, { status: 400 })
  }

  try { await deleteRows('contact_form_submissions', [id]) }
  catch (error) { console.error(error); return NextResponse.json({ error: 'Failed to delete submission' }, { status: 500 }) }

  return NextResponse.json({ success: true })
}
