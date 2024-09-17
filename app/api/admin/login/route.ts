import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const { username, password } = await request.json()

  const correctUsername = process.env.ADMIN_USERNAME
  const correctPassword = process.env.ADMIN_PASSWORD

  if (!correctUsername || !correctPassword) {
    console.error('Admin credentials are not set in environment variables')
    return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 })
  }

  if (username === correctUsername && password === correctPassword) {
    cookies().set('admin_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600, // 1 hour
      path: '/',
    })

    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
}