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

// Body is either { id: number } to remove one comment, or { ids: number[] } to
// clear exactly the comments the committee was shown. Deleting by the explicit
// list of ids the page displayed (not "everything", and not "up to some id":
// identity values can commit out of order) means a comment that arrived while
// the page was open is never deleted unseen.
const MAX_IDS = 5000
const CHUNK = 200 // keeps each request's id filter well inside URL length limits

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
  } else if (Array.isArray(body?.ids) && body.ids.length > 0 && body.ids.length <= MAX_IDS && body.ids.every(isId)) {
    ids = Array.from(new Set(body.ids as number[]))
  } else {
    return NextResponse.json(
      { error: `id (integer) or ids (1-${MAX_IDS} integers) is required` },
      { status: 400, headers: NO_STORE }
    )
  }

  let deleted = 0
  let error = null
  for (let i = 0; i < ids.length && !error; i += CHUNK) {
    const result = await supabase
      .from('scholarship_comments')
      .delete()
      .in('id', ids.slice(i, i + CHUNK))
      .select('id')
    error = result.error
    deleted += result.data?.length ?? 0
  }

  if (error) {
    console.error('Error deleting scholarship comments:', error)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500, headers: NO_STORE })
  }

  return NextResponse.json({ success: true, deleted }, { headers: NO_STORE })
}
