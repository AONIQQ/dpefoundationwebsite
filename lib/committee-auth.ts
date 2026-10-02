import { cookies } from 'next/headers'
import { issueToken as issue, safeEqual, verifyToken as verify } from '@/lib/signed-token'

// Access control for the Scholarship Committee's comments.
//
// The committee shares one password (SCHOLARSHIP_COMMITTEE_PASSWORD). A correct
// password earns a signed, expiring cookie (see signed-token.ts). The signing
// key mixes in the password and the session signing secret, so changing the password
// immediately signs everyone out. Configure SESSION_SIGNING_SECRET independently.

export const COMMITTEE_COOKIE = 'scholarship_committee'
export const COMMITTEE_COOKIE_PATH = '/api/committee'
export const SESSION_SECONDS = 4 * 60 * 60

const PURPOSE = 'scholarship-committee-v1'

function secrets(): string[] | null {
  const password = process.env.SCHOLARSHIP_COMMITTEE_PASSWORD
  const signingSecret = process.env.SESSION_SIGNING_SECRET
  return password && signingSecret ? [signingSecret, password] : null
}

/** True when the server has what it needs to run the committee area at all. */
export function committeeConfigured(): boolean {
  return secrets() !== null
}

export async function checkPassword(supplied: unknown): Promise<boolean> {
  const expected = process.env.SCHOLARSHIP_COMMITTEE_PASSWORD
  if (!expected || typeof supplied !== 'string') return false
  return safeEqual(supplied, expected)
}

export async function issueToken(now: number = Date.now()): Promise<string> {
  const s = secrets()
  if (!s) throw new Error('Committee access is not configured')
  return issue(PURPOSE, s, SESSION_SECONDS, now)
}

export async function verifyToken(token: string | undefined, now: number = Date.now()): Promise<boolean> {
  const s = secrets()
  return s ? verify(token, PURPOSE, s, now) : false
}

/** Route-handler guard: is this request carrying a valid committee session? */
export async function isCommittee(): Promise<boolean> {
  return verifyToken(cookies().get(COMMITTEE_COOKIE)?.value)
}
