import { NextResponse } from 'next/server'
import { safeEqual } from '@/lib/signed-token'
import { previousMonth } from '@/lib/donations/report'
import { sendFailureNotice, sendMonthlyReport } from '@/lib/donations/monthly'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Runs monthly from vercel.json and reports on the month that just ended.
// Vercel sends "Authorization: Bearer $CRON_SECRET". The middleware lets /api/
// through, so this check is the only thing stopping anyone from triggering it.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) return NextResponse.json({ error: 'CRON_SECRET is not set' }, { status: 503 })
  if (!(await safeEqual(request.headers.get('authorization') ?? '', `Bearer ${secret}`))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const month = previousMonth()
  try {
    const summary = await sendMonthlyReport(month)
    return NextResponse.json({ sent: true, month, gifts: summary.gifts, gross: summary.gross })
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    console.error('Donation report:', error)
    await sendFailureNotice(month, reason).catch((e) => console.error('Donation report failure notice:', e))
    return NextResponse.json({ sent: false, month, error: reason }, { status: 500 })
  }
}
