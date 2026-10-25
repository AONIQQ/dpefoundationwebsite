import { NextResponse } from 'next/server'
import { safeEqual } from '@/lib/signed-token'
import { pollMailbox, runQueue } from '@/lib/email/runner'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Vercel Cron (vercel.json) calls this with "Authorization: Bearer <CRON_SECRET>".
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  const auth = request.headers.get('authorization') ?? ''
  if (!secret || !(await safeEqual(auth, `Bearer ${secret}`))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const run = await runQueue(50_000)
    const poll = await pollMailbox()
    return NextResponse.json({ run, poll })
  } catch (error) {
    console.error('Email cron:', error)
    return NextResponse.json({ error: 'Email run failed' }, { status: 500 })
  }
}
