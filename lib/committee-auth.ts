import { createHash, createHmac, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'

// Access control for the Scholarship Committee's comments.
//
// The committee shares one password (SCHOLARSHIP_COMMITTEE_PASSWORD). A correct
// password earns a signed, expiring cookie. The cookie is an HMAC over its own
// expiry time, so it cannot be forged or extended by editing it, unlike the
// plain "authenticated" cookie the general admin dashboard uses.
//
// The signing key is derived from the service-role key and the password, so
// changing the password immediately signs everyone out. No extra secret to
// configure.

export const COMMITTEE_COOKIE = 'scholarship_committee'
export const COMMITTEE_COOKIE_PATH = '/api/committee'
export const SESSION_SECONDS = 4 * 60 * 60

function signingKey(): Buffer | null {
  const password = process.env.SCHOLARSHIP_COMMITTEE_PASSWORD
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!password || !serviceKey) return null
  return createHmac('sha256', serviceKey).update(`scholarship-committee-v1:${password}`).digest()
}

function sign(key: Buffer, expiresAt: string): string {
  return createHmac('sha256', key).update(expiresAt).digest('hex')
}

/** True when the server has what it needs to run the committee area at all. */
export function committeeConfigured(): boolean {
  return signingKey() !== null
}

/** Constant-time password check. */
export function checkPassword(supplied: unknown): boolean {
  const expected = process.env.SCHOLARSHIP_COMMITTEE_PASSWORD
  if (!expected || typeof supplied !== 'string') return false
  const a = createHash('sha256').update(supplied).digest()
  const b = createHash('sha256').update(expected).digest()
  return timingSafeEqual(a, b)
}

export function issueToken(now: number = Date.now()): string {
  const key = signingKey()
  if (!key) throw new Error('Committee access is not configured')
  const expiresAt = String(now + SESSION_SECONDS * 1000)
  return `${expiresAt}.${sign(key, expiresAt)}`
}

export function verifyToken(token: string | undefined, now: number = Date.now()): boolean {
  const key = signingKey()
  if (!key || !token) return false
  const [expiresAt, signature, ...rest] = token.split('.')
  if (!expiresAt || !signature || rest.length > 0 || !/^\d+$/.test(expiresAt)) return false

  const expected = Buffer.from(sign(key, expiresAt), 'hex')
  const given = Buffer.from(signature, 'hex')
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return false

  return Number(expiresAt) > now
}

/** Route-handler guard: is this request carrying a valid committee session? */
export function isCommittee(): boolean {
  return verifyToken(cookies().get(COMMITTEE_COOKIE)?.value)
}
