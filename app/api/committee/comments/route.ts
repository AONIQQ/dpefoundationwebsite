import { NextResponse } from 'next/server'
import { isCommittee } from '@/lib/committee-auth'
import { listRows, deleteRows, writesPaused } from '@/lib/data-store'

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

  try {
    const { rows, total } = await listRows('scholarship_comments', 'created_at', MAX_LIST)
    return NextResponse.json({ comments: rows, total }, { headers: NO_STORE })
  } catch (error) {
    console.error('Error loading scholarship comments:', error)
    return NextResponse.json({ error: 'Failed to load comments' }, { status: 500, headers: NO_STORE })
  }
}

// Body is either { id: number } to remove one comment, or { ids: number[] } to
// clear exactly the comments the committee was shown. Deleting by the explicit
// list of ids the page displayed (not "everything", and not "up to some id":
// identity values can commit out of order) means a comment that arrived while
// the page was open is never deleted unseen. At most MAX_LIST ids per request.
export async function DELETE(request: Request) {
  if (!(await isCommittee())) return unauthorized()

  if (writesPaused()) return NextResponse.json({ error: 'Maintenance in progress' }, { status: 503, headers: NO_STORE })

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

  try {
    const deleted = await deleteRows('scholarship_comments', ids)
    return NextResponse.json({ success: true, deleted }, { headers: NO_STORE })
  } catch (error) {
    console.error('Error deleting scholarship comments:', error)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500, headers: NO_STORE })
  }
}
