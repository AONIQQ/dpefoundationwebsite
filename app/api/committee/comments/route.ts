import { NextResponse } from 'next/server'
import { isCommittee } from '@/lib/committee-auth'
import { getCommentsClient } from '@/lib/scholarship-comments-db'

export const dynamic = 'force-dynamic'

// The Scholarship Committee's view of the brotherhood's comments: list them
// and delete them. Every handler checks the signed committee cookie first.
// (The site middleware lets /api/ routes through, so this check is the guard.)

const NO_STORE = { 'Cache-Control': 'no-store' }

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: NO_STORE })
}

export async function GET() {
  if (!(await isCommittee())) return unauthorized()

  const supabase = getCommentsClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500, headers: NO_STORE })
  }

  const { data, error } = await supabase
    .from('scholarship_comments')
    .select('id, created_at, name, email, comments')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error loading scholarship comments:', error)
    return NextResponse.json({ error: 'Failed to load comments' }, { status: 500, headers: NO_STORE })
  }

  return NextResponse.json({ comments: data ?? [] }, { headers: NO_STORE })
}

// Body is either { id: number } to remove one comment, or { upToId: number } to
// clear everything the committee has reviewed: it deletes comments with
// id <= upToId, i.e. the snapshot the page was showing. A comment that arrived
// after the page loaded has a higher id and is left alone, so nothing is ever
// deleted unseen. (There is deliberately no "delete everything" form.)
export async function DELETE(request: Request) {
  if (!(await isCommittee())) return unauthorized()

  const supabase = getCommentsClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500, headers: NO_STORE })
  }

  let body: { id?: unknown; upToId?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400, headers: NO_STORE })
  }

  const isId = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v >= 0
  const query = supabase.from('scholarship_comments').delete()

  let scoped
  if (isId(body?.id)) scoped = query.eq('id', body.id)
  else if (isId(body?.upToId)) scoped = query.lte('id', body.upToId)
  else {
    return NextResponse.json({ error: 'id or upToId (non-negative integer) is required' }, { status: 400, headers: NO_STORE })
  }

  const { data, error } = await scoped.select('id')

  if (error) {
    console.error('Error deleting scholarship comments:', error)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500, headers: NO_STORE })
  }

  return NextResponse.json({ success: true, deleted: data?.length ?? 0 }, { headers: NO_STORE })
}
