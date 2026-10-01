import { NextResponse } from 'next/server'
import { isCommittee } from '@/lib/committee-auth'
import { getCommentsClient } from '@/lib/scholarship-comments-db'

export const dynamic = 'force-dynamic'

// The Scholarship Committee's view of the brotherhood's comments: list them
// and delete them. Every handler checks the signed committee cookie first.
// (The site middleware lets /api/ routes through, so this check is the guard.)

const NO_STORE = { 'Cache-Control': 'no-store' }

// The page shows (and "Delete all" removes) at most this many comments at a
// time, newest first. Keeping the displayed set small means a bulk delete is one
// short, atomic database statement: it either removes every comment shown or
// none of them. Anything beyond the cap appears once these are cleared.
const MAX_LIST = 500

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: NO_STORE })
}

export async function GET() {
  if (!(await isCommittee())) return unauthorized()

  const supabase = getCommentsClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500, headers: NO_STORE })
  }

  const { data, error, count } = await supabase
    .from('scholarship_comments')
    .select('id, created_at, name, email, comments', { count: 'exact' })
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(MAX_LIST)

  if (error) {
    console.error('Error loading scholarship comments:', error)
    return NextResponse.json({ error: 'Failed to load comments' }, { status: 500, headers: NO_STORE })
  }

  return NextResponse.json({ comments: data ?? [], total: count ?? data?.length ?? 0 }, { headers: NO_STORE })
}

// Body is either { id: number } to remove one comment, or { ids: number[] } to
// clear exactly the comments the committee was shown. Deleting by the explicit
// list of ids the page displayed (not "everything", and not "up to some id":
// identity values can commit out of order) means a comment that arrived while
// the page was open is never deleted unseen. At most MAX_LIST ids per request.
export async function DELETE(request: Request) {
  if (!(await isCommittee())) return unauthorized()

  const supabase = getCommentsClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500, headers: NO_STORE })
  }

  let body: { id?: unknown; ids?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400, headers: NO_STORE })
  }

  const isId = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v >= 0

  let ids: number[]
  if (isId(body?.id)) {
    ids = [body.id]
  } else if (Array.isArray(body?.ids) && body.ids.length > 0 && body.ids.length <= MAX_LIST && body.ids.every(isId)) {
    ids = Array.from(new Set(body.ids as number[]))
  } else {
    return NextResponse.json(
      { error: `id (integer) or ids (1-${MAX_LIST} integers) is required` },
      { status: 400, headers: NO_STORE }
    )
  }

  // One statement, so it is all-or-nothing.
  const { data, error } = await supabase
    .from('scholarship_comments')
    .delete()
    .in('id', ids)
    .select('id')

  if (error) {
    console.error('Error deleting scholarship comments:', error)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500, headers: NO_STORE })
  }

  return NextResponse.json({ success: true, deleted: data?.length ?? 0 }, { headers: NO_STORE })
}
