import type { DonorboxDonation } from '@/lib/donations/donorbox'

// Reads the "Donation from ..." notification emails Donorbox sends to the
// Foundation inbox. Pure parsing, no I/O. Anything it cannot read with
// confidence comes back as a failure with a reason, never as a guess.

export interface NoticeInput {
  subject: string
  from: string
  date: string
  text: string
}

export type NoticeResult =
  | { kind: 'ignored' }
  | { kind: 'donation'; donation: DonorboxDonation }
  | { kind: 'unreadable'; subject: string; date: string; reason: string }

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }

/** Message text with markup removed and block tags turned into line breaks. */
export function plainText(raw: string): string {
  return raw
    .replace(/<(style|script)[\s\S]*?<\/\1>/gi, '')
    .replace(/<\s*(br|\/p|\/div|\/tr|\/li|\/h\d|\/table)[^>]*>/gi, '\n')
    .replace(/<\/t[dh]>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
      if (e[0] === '#') {
        const code = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)
        return Number.isFinite(code) && code > 0 && code < 0x110000 ? String.fromCodePoint(code) : m
      }
      return ENTITIES[e.toLowerCase()] ?? m
    })
    .replace(/[ \t ]+/g, ' ')
}

function fields(text: string): Map<string, string> {
  const out = new Map<string, string>()
  for (const line of text.split(/\r?\n/)) {
    const m = /^\s*([A-Za-z][A-Za-z #]{1,40}?):\s*(.*?)\s*$/.exec(line)
    if (m && !out.has(m[1].toLowerCase())) out.set(m[1].toLowerCase(), m[2])
  }
  return out
}

const OFFSETS: Record<string, number> = { EDT: -4, EST: -5, CDT: -5, CST: -6, MDT: -6, MST: -7, PDT: -7, PST: -8, UTC: 0, GMT: 0 }

/** "10/25/2026 10:12:48 EDT" to an ISO timestamp, or null if any part is unfamiliar. */
export function parseDonatedAt(value: string): string | null {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4}) (\d{1,2}):(\d{2})(?::(\d{2}))? ?([A-Z]{3})$/.exec(value.trim())
  if (!m) return null
  const offset = OFFSETS[m[7]]
  if (offset === undefined) return null
  const [mo, d, y, h, mi, s] = [+m[1], +m[2], +m[3], +m[4], +m[5], +(m[6] ?? 0)]
  if (mo < 1 || mo > 12 || d < 1 || d > 31 || h > 23 || mi > 59 || s > 59) return null
  const day = new Date(Date.UTC(y, mo - 1, d))
  if (day.getUTCMonth() !== mo - 1) return null // e.g. 2/30
  return new Date(Date.UTC(y, mo - 1, d, h - offset, mi, s)).toISOString()
}

function parseAmount(value: string): number | null {
  const m = /^\$\s*([\d,]+(?:\.\d{1,2})?)$/.exec(value.trim())
  if (!m) return null
  const n = Number(m[1].replace(/,/g, ''))
  return Number.isFinite(n) && n > 0 ? n : null
}

export const isDonorboxSender = (from: string) => /@([a-z0-9-]+\.)*donorbox\.org>?\s*$/i.test(from.trim())

export function parseNotice(input: NoticeInput): NoticeResult {
  if (!isDonorboxSender(input.from)) return { kind: 'ignored' }
  const text = plainText(input.text)
  const f = fields(text)
  // Marketing and account emails have none of these fields. A gift notice always has a receipt number.
  if (!f.has('receipt #') && !f.has('donor name')) return { kind: 'ignored' }

  const bad = (reason: string): NoticeResult => ({ kind: 'unreadable', subject: input.subject, date: input.date, reason })
  if (/refund|fail|declin|cancel|dispute|chargeback/i.test(input.subject)) return bad('Looks like a refund or failed payment notice')

  const receipt = /^\d{1,15}$/.exec((f.get('receipt #') ?? '').trim())
  const amount = parseAmount(f.get('amount') ?? '')
  const donatedAt = parseDonatedAt(f.get('donated at') ?? '')
  const name = (f.get('donor name') ?? '').trim()
  if (!receipt) return bad('No receipt number')
  if (amount === null) return bad(`Amount not understood: "${f.get('amount') ?? ''}"`)
  if (!donatedAt) return bad(`Date not understood: "${f.get('donated at') ?? ''}"`)
  if (!name) return bad('No donor name')

  const inSubject = /\bof \$([\d,]+(?:\.\d{1,2})?)/.exec(input.subject)
  if (inSubject && Number(inSubject[1].replace(/,/g, '')) !== amount) return bad('Amount in subject and body disagree')

  const interval = (f.get('donation interval') ?? '').trim()
  return {
    kind: 'donation',
    donation: {
      id: Number(receipt[0]),
      amount: amount.toFixed(2),
      status: 'paid',
      recurring: interval !== '' && !/one.?time/i.test(interval),
      donation_date: donatedAt,
      donor: { name, email: (f.get('donor email') ?? '').trim().toLowerCase() || null },
      campaign: f.get('campaign') ? { id: 0, name: f.get('campaign')! } : null,
      designation: f.get('designation') || null,
      comment: f.get('donor comment') || null,
      donation_type: f.get('payment method') || undefined,
    },
  }
}
