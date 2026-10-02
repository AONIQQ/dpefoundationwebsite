import { NextResponse } from 'next/server'
import { insertRow, writesPaused } from '@/lib/data-store'
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

// Deliberately plain: no spaces, quotes, commas, semicolons, angle brackets or
// "?", so a stored address can never smuggle extra mailto: parameters into the
// committee's reply link.
const EMAIL_PATTERN = /^[^\s@<>"',;?]+@[^\s@<>"',;?]+\.[^\s@<>"',;?]+$/

// Postgres counts characters (code points) in char_length(), JavaScript's
// .length counts UTF-16 units, so an emoji is 1 vs 2. Count the way the
// database does so the app's limits and the schema's CHECKs agree.
const chars = (v: string) => Array.from(v).length

// Postgres text cannot store NUL, and rejects unpaired UTF-16 surrogates that
// JSON.parse happily accepts: either would surface as a confusing 500. Drop NULs
// and replace broken surrogates with U+FFFD before validating or storing.
const LONE_SURROGATE = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g
const clean = (v: unknown) => (typeof v === 'string' ? v : '').replace(/\u0000/g, '').replace(LONE_SURROGATE, '\uFFFD')

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

  const name = clean(body.name).trim()
  const email = clean(body.email).trim()
  const comments = clean(body.comments).trim()

  if (chars(comments) < MIN_COMMENT) return fail('Please write a little more before sending.', 400)
  if (chars(comments) > MAX_COMMENT) {
    return fail(`Please keep your comments under ${MAX_COMMENT.toLocaleString('en-US')} characters.`, 400)
  }
  if (chars(name) > MAX_NAME) return fail('That name is too long.', 400)
  if (email && (chars(email) > MAX_EMAIL || !EMAIL_PATTERN.test(email))) {
    return fail('That email address does not look right. You can also leave it blank.', 400)
  }

  // Bots: a hidden field a person never fills in. Answer as if it worked so they
  // do not learn what tripped the check; store nothing. (There is deliberately
  // no "submitted too fast" check: a brother pasting prepared feedback is
  // indistinguishable from a bot by timing, and silently dropping a real
  // comment is worse than letting a spam one through, which the committee can
  // delete.)
  if (clean(body.website).length > 0) {
    return NextResponse.json({ success: true })
  }

  if (writesPaused()) return fail('Submissions are temporarily paused for maintenance. Please try again shortly.', 503)
  try {
    await insertRow('scholarship_comments', { name: name || null, email: email || null, comments })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving scholarship comment:', error)
    return fail('We could not save your comment. Please try again.', 500)
  }
}
