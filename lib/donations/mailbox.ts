import { getMessage, searchMessages } from '@/lib/email/gmail'
import { type DonorboxDonation } from '@/lib/donations/donorbox'
import { parseNotice } from '@/lib/donations/notices'

// Collects a month of gifts from the Donorbox notification emails in the
// Foundation inbox. Read-only: it only searches and reads messages.

export interface UnreadableNotice { subject: string; date: string; reason: string }

export interface MailboxDonations {
  donations: DonorboxDonation[]
  unreadable: UnreadableNotice[]
}

export class MailboxError extends Error {}

const MAX_MESSAGES = 2000

/** Donorbox emails dated from `fromDay` to `toDay` inclusive (YYYY-MM-DD). */
export async function fetchMailboxDonations(fromDay: string, toDay: string): Promise<MailboxDonations> {
  // Padded by two days: the message date can differ from the gift date near the edges, and the report filters exactly.
  const after = Math.floor(Date.parse(`${fromDay}T00:00:00Z`) / 1000) - 2 * 86400
  const before = Math.floor(Date.parse(`${toDay}T00:00:00Z`) / 1000) + 3 * 86400
  const found = await searchMessages(`from:donorbox after:${after} before:${before}`, MAX_MESSAGES)
  // Reporting a partial month would look right and be wrong, so refuse instead.
  if (!found.complete) throw new MailboxError(`More than ${MAX_MESSAGES} Donorbox emails matched; the report would be incomplete.`)

  const byReceipt = new Map<number, DonorboxDonation>()
  const unreadable: UnreadableNotice[] = []
  for (const { id } of found.messages) {
    const m = await getMessage(id)
    const result = parseNotice({ subject: m.headers['subject'] ?? '', from: m.headers['from'] ?? '', date: m.headers['date'] ?? '', text: m.text })
    if (result.kind === 'donation') byReceipt.set(result.donation.id, result.donation)
    else if (result.kind === 'unreadable') unreadable.push({ subject: result.subject, date: result.date, reason: result.reason })
  }
  return { donations: Array.from(byReceipt.values()), unreadable }
}
