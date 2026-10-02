import { issueToken as issue, safeEqual, verifyToken as verify } from '@/lib/signed-token'

// Access control for the admin dashboard (/admin and /api/admin/*).
//
// The admin_session cookie used to hold the literal text "authenticated", which
// anyone could set by hand in their browser. It now holds a signed, expiring
// token that only this server can produce. Safe to import from middleware.

export const ADMIN_COOKIE = 'admin_session'
export const ADMIN_SESSION_SECONDS = 60 * 60

const PURPOSE = 'admin-dashboard-v1'

function secrets(): string[] | null {
  const username = process.env.ADMIN_USERNAME
  const password = process.env.ADMIN_PASSWORD
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  return username && password && serviceKey ? [serviceKey, username, password] : null
}

export function adminConfigured(): boolean {
  return secrets() !== null
}

export async function checkAdminCredentials(username: unknown, password: unknown): Promise<boolean> {
  const expectedUser = process.env.ADMIN_USERNAME
  const expectedPass = process.env.ADMIN_PASSWORD
  if (!expectedUser || !expectedPass || typeof username !== 'string' || typeof password !== 'string') return false
  // Evaluate both so a wrong username takes as long as a wrong password.
  const [userOk, passOk] = await Promise.all([safeEqual(username, expectedUser), safeEqual(password, expectedPass)])
  return userOk && passOk
}

export async function issueAdminToken(now: number = Date.now()): Promise<string> {
  const s = secrets()
  if (!s) throw new Error('Admin access is not configured')
  return issue(PURPOSE, s, ADMIN_SESSION_SECONDS, now)
}

export async function verifyAdminToken(token: string | undefined, now: number = Date.now()): Promise<boolean> {
  const s = secrets()
  return s ? verify(token, PURPOSE, s, now) : false
}
