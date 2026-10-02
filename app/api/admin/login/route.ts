import { NextResponse } from 'next/server'
import {
  ADMIN_COOKIE,
  ADMIN_SESSION_SECONDS,
  adminConfigured,
  checkAdminCredentials,
  issueAdminToken,
} from '@/lib/admin-auth'
import { clientIp, tooManyRequests } from '@/lib/rate-limit'

export async function POST(request: Request) {
  if (!adminConfigured()) {
    console.error('Admin credentials (ADMIN_USERNAME / ADMIN_PASSWORD / SESSION_SIGNING_SECRET) are not set in environment variables')
    return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 })
  }

  if (tooManyRequests(`admin-login:${clientIp(request)}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json({ success: false, error: 'Too many attempts. Please wait a few minutes.' }, { status: 429 })
  }

  let username: unknown
  let password: unknown
  try {
    ;({ username, password } = await request.json())
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 })
  }

  if (!(await checkAdminCredentials(username, password))) {
    return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set(ADMIN_COOKIE, await issueAdminToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: ADMIN_SESSION_SECONDS,
    path: '/',
  })
  return response
}
