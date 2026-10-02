import { NextResponse } from 'next/server'
import { insertRow, writesPaused } from '@/lib/data-store'
import { clientIp, tooManyRequests } from '@/lib/rate-limit'
export async function POST(request: Request) {
  if (writesPaused()) return NextResponse.json({ error: 'Submissions are temporarily paused. Please try again shortly.' }, { status: 503 })
  if (tooManyRequests(`application:${clientIp(request)}`, 5, 600000)) return NextResponse.json({ error: 'Please try again in a few minutes.' }, { status: 429 })
  try {
    const raw = await request.text()
    if (raw.length > 10000) return NextResponse.json({ error: 'Request too large' }, { status: 413 })
    const { type, full_name, application_file_path, attendance_file_path, test_completion_file_path, additional_requirements_file_path } = JSON.parse(raw)
    if (!['bleakley', 'butts'].includes(type) || typeof full_name !== 'string' || !full_name.trim() || full_name.length > 200) return NextResponse.json({ error: 'Invalid application' }, { status: 400 })
    const additional = type === 'bleakley' ? test_completion_file_path : additional_requirements_file_path
    const validPath = (p: unknown) => typeof p === 'string' && /^[a-zA-Z0-9_-]+\.[a-zA-Z0-9]+$/.test(p) && p.length < 255
    if (![application_file_path, attendance_file_path, additional].every(validPath)) return NextResponse.json({ error: 'All application files are required' }, { status: 400 })
    const values = { full_name: full_name.trim(), application_file_path, attendance_file_path, [type === 'bleakley' ? 'test_completion_file_path' : 'additional_requirements_file_path']: additional }
    await insertRow(type === 'bleakley' ? 'bleakley_scholarship_submissions' : 'butts_scholarship_submissions', values)
    return NextResponse.json({ success: true })
  } catch (error) { console.error('Application submission:', error); return NextResponse.json({ error: 'Unable to save your application' }, { status: 500 }) }
}
