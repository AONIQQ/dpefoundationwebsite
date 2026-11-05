import { gmailConfigured, senderAddress, sendRaw } from '@/lib/email/gmail'
import { buildMime } from '@/lib/email/mime'
import { fetchDonations } from '@/lib/donations/donorbox'
import { type Summary, queryRange, renderReport, reportSubject, summarize } from '@/lib/donations/report'

// Builds the monthly donation report and emails it to the Foundation inbox.

export const reportRecipient = () => (process.env.DONATION_REPORT_EMAIL || 'info@dpefoundation.org').trim().toLowerCase()

export const isMonth = (v: unknown): v is string => typeof v === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(v)

export async function buildSummary(month: string): Promise<Summary> {
  const { from, to } = queryRange(month)
  return summarize(month, await fetchDonations(from, to))
}

async function deliver(subject: string, html: string, text: string) {
  if (!gmailConfigured()) throw new Error('Gmail sending is not set up.')
  await sendRaw(buildMime({ fromName: 'DPE Foundation Reports', fromEmail: senderAddress()!, to: reportRecipient(), subject, html, text }))
}

export async function sendMonthlyReport(month: string): Promise<Summary> {
  const summary = await buildSummary(month)
  const { html, text } = renderReport(summary)
  await deliver(reportSubject(summary), html, text)
  return summary
}

/** A scheduled run that fails must not fail silently: say so in the same inbox. */
export async function sendFailureNotice(month: string, reason: string) {
  const text = `The monthly donation report for ${month} could not be built.\n\nReason: ${reason}\n\nIt will not retry on its own. Once fixed, re-send it from Fundraising email, Setup & settings, Monthly donation report.`
  await deliver(`Donation report for ${month} failed`, `<p>${text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\n/g, '<br>')}</p>`, text)
}
