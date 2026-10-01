import { NextResponse } from 'next/server'
import { getCommentsClient } from '@/lib/scholarship-comments-db'
import { clientIp, tooManyRequests } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

// Brothers submit a free-text comment on the new scholarship program. Nothing
// here can read comments back: the table is closed to the public key, and
// only the committee routes under /api/committee can list or delete.

const MAX_BODY_BYTES = 40_000
const MIN_COMMENT = 10
const MAX_COMMENT = 10_000
const MAX_NAME = 200
const MAX_EMAIL = 320
const MIN_FILL_MS = 3000

// Deliberately plain: no spaces, quotes, commas, semicolons, angle brackets or
// "?", so a stored address can never smuggle extra mailto: parameters into the
// committee's reply link.
const EMAIL_PATTERN = /^[^\s@<>"',;?]+@[^\s@<>"',;?]+\.[^\s@<>"',;?]+$/

function fail(error: string, status: number) {
  return NextResponse.json({ error }, { status })
}

export async function POST(request: Request) {
  if (tooManyRequests(`comment:${clientIp(request)}`, 5, 10 * 60 * 1000)) {
    return fail('Too many submissions. Please try again in a few minutes.', 429)
  }

  const raw = await request.text()
  if (raw.length > MAX_BODY_BYTES) return fail('Your comment is too long.', 413)

  let body: Record<string, unknown>
  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error()
    body = parsed
  } catch {
    return fail('Invalid request.', 400)
  }

  const str = (v: unknown) => (typeof v === 'string' ? v : '')
  const name = str(body.name).trim()
  const email = str(body.email).trim()
  const comments = str(body.comments).trim()

  if (comments.length < MIN_COMMENT) return fail('Please write a little more before sending.', 400)
  if (comments.length > MAX_COMMENT) {
    return fail(`Please keep your comments under ${MAX_COMMENT.toLocaleString('en-US')} characters.`, 400)
  }
  if (name.length > MAX_NAME) return fail('That name is too long.', 400)
  if (email && (email.length > MAX_EMAIL || !EMAIL_PATTERN.test(email))) {
    return fail('That email address does not look right. You can also leave it blank.', 400)
  }

  // Bots: a hidden field a person never fills in, and a form submitted faster
  // than anyone could write a comment. Answer as if it worked so they do not
  // learn what tripped the check; store nothing.
  const elapsedMs = typeof body.elapsedMs === 'number' ? body.elapsedMs : Infinity
  if (str(body.website).length > 0 || elapsedMs < MIN_FILL_MS) {
    return NextResponse.json({ success: true })
  }

  const supabase = getCommentsClient()
  if (!supabase) {
    console.error('Scholarship comments: Supabase environment variables are not set')
    return fail('The comment box is not available right now.', 500)
  }

  const { error } = await supabase
    .from('scholarship_comments')
    .insert({ name: name || null, email: email || null, comments })

  if (error) {
    console.error('Error saving scholarship comment:', error)
    return fail('We could not save your comment. Please try again.', 500)
  }

  return NextResponse.json({ success: true })
}
