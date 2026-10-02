import { NextResponse } from 'next/server'
import { insertRow, writesPaused } from '@/lib/data-store'
import { clientIp, tooManyRequests } from '@/lib/rate-limit'
export async function POST(request: Request) {
  if (writesPaused()) return NextResponse.json({ error: 'Submissions are temporarily paused. Please try again shortly.' }, { status: 503 })
  if (tooManyRequests(`contact:${clientIp(request)}`, 5, 600000)) return NextResponse.json({ error: 'Please try again in a few minutes.' }, { status: 429 })
  try {
    const raw = await request.text()
    if (raw.length > 20000) return NextResponse.json({ error: 'Message too long' }, { status: 413 })
    const { full_name, email, message } = JSON.parse(raw)
    if (typeof full_name !== 'string' || full_name.trim().length < 2 || full_name.length > 200 || typeof email !== 'string' || email.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || typeof message !== 'string' || message.trim().length < 10 || message.length > 10000) return NextResponse.json({ error: 'Invalid contact details' }, { status: 400 })
    await insertRow('contact_form_submissions', { full_name: full_name.trim(), email: email.trim(), message: message.trim() })
    return NextResponse.json({ success: true })
  } catch (error) { console.error('Contact submission:', error); return NextResponse.json({ error: 'Unable to save your message' }, { status: 500 }) }
}
