import { NextResponse } from 'next/server'
import {
  COMMITTEE_COOKIE,
  COMMITTEE_COOKIE_PATH,
  SESSION_SECONDS,
  checkPassword,
  committeeConfigured,
  issueToken,
} from '@/lib/committee-auth'
import { clientIp, tooManyRequests } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

// Scholarship Committee sign-in / sign-out.

export async function POST(request: Request) {
  if (!committeeConfigured()) {
    console.error('Committee access is not configured (SCHOLARSHIP_COMMITTEE_PASSWORD / SUPABASE_SERVICE_ROLE_KEY)')
    return NextResponse.json({ error: 'Committee access is not set up yet.' }, { status: 500 })
  }

  if (tooManyRequests(`committee-login:${clientIp(request)}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many attempts. Please wait a few minutes.' }, { status: 429 })
  }

  let password: unknown
  try {
    password = (await request.json())?.password
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  if (!checkPassword(password)) {
    return NextResponse.json({ error: 'That password is not correct.' }, { status: 401 })
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set(COMMITTEE_COOKIE, issueToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_SECONDS,
    path: COMMITTEE_COOKIE_PATH,
  })
  return response
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.set(COMMITTEE_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: COMMITTEE_COOKIE_PATH,
  })
  return response
}
