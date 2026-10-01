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

// Body is either { id: number } to remove one comment, or { all: true } to
// clear the box once the committee is finished with the feedback.
export async function DELETE(request: Request) {
  if (!(await isCommittee())) return unauthorized()

  const supabase = getCommentsClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500, headers: NO_STORE })
  }

  let body: { id?: unknown; all?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400, headers: NO_STORE })
  }

  const query = supabase.from('scholarship_comments').delete()
  const hasId = typeof body?.id === 'number' && Number.isInteger(body.id)

  if (!hasId && body?.all !== true) {
    return NextResponse.json({ error: 'id (number) or all (true) is required' }, { status: 400, headers: NO_STORE })
  }

  const { data, error } = await (hasId ? query.eq('id', body.id as number) : query.gte('id', 0)).select('id')

  if (error) {
    console.error('Error deleting scholarship comments:', error)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500, headers: NO_STORE })
  }

  return NextResponse.json({ success: true, deleted: data?.length ?? 0 }, { headers: NO_STORE })
}
