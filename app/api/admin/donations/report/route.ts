import { adminHandler, fail, ok, readJson } from '@/lib/email/admin-route'
import { buildSummary, isMonth, sendMonthlyReport } from '@/lib/donations/monthly'
import { previousMonth } from '@/lib/donations/report'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Admin-only: preview or re-send the donation report for any past month.
// { month?: "YYYY-MM" (default: last month), dryRun?: true returns the figures without emailing }
export const POST = adminHandler(async (request: Request) => {
  const body = (await readJson(request)) ?? {}
  const month = body.month === undefined ? previousMonth() : body.month
  if (!isMonth(month)) return fail('month must look like 2026-10')
  if (month > new Date().toISOString().slice(0, 7)) return fail('That month has not happened yet')
  if (body.dryRun === true) {
    const s = await buildSummary(month)
    return ok({ sent: false, month, gifts: s.gifts, donors: s.donors, gross: s.gross, refunded: s.refunded, net: s.net })
  }
  const s = await sendMonthlyReport(month)
  return ok({ sent: true, month, gifts: s.gifts, gross: s.gross })
})
