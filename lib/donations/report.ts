import type { DonorboxDonation } from '@/lib/donations/donorbox'

// Turns a month of Donorbox donations into the figures and the email body for
// the monthly report. Pure functions, no I/O, so they are easy to test.

const TIME_ZONE = 'America/New_York'

const dayFormat = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' })
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export const formatMoney = (cents: number) => money.format(cents / 100)

const escapeHtml = (v: string) =>
  v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

const toCents = (v: unknown): number => {
  const n = Number(v)
  return Number.isFinite(n) ? Math.round(n * 100) : 0
}

/** The calendar day (YYYY-MM-DD) a timestamp falls on in the Foundation's time zone. */
export function localDay(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : dayFormat.format(d)
}

/** The month before `now`, as YYYY-MM, in the Foundation's time zone. */
export function previousMonth(now: Date = new Date()): string {
  const [y, m] = dayFormat.format(now).split('-').map(Number)
  return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`
}

export function monthLabel(month: string): string {
  const [y, m] = month.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, 15)).toLocaleString('en-US', { timeZone: 'UTC', month: 'long', year: 'numeric' })
}

/** First and last day of a YYYY-MM month, padded by a day each side so time zones cannot cut gifts off. */
export function queryRange(month: string): { from: string; to: string } {
  const [y, m] = month.split('-').map(Number)
  const day = (d: Date) => d.toISOString().slice(0, 10)
  return { from: day(new Date(Date.UTC(y, m - 1, 0))), to: day(new Date(Date.UTC(y, m, 1))) }
}

export interface ReportRow {
  date: string
  name: string
  email: string
  amount: number
  refunded: number
  campaign: string
  designation: string
  kind: string
  method: string
  status: string
  note: string
}

export interface Bucket { name: string; count: number; total: number }

export interface Summary {
  month: string
  label: string
  gifts: number
  donors: number
  gross: number
  refunded: number
  net: number
  fees: number
  average: number
  largest: { amount: number; name: string } | null
  oneTime: { count: number; total: number }
  recurring: { count: number; total: number }
  byCampaign: Bucket[]
  byDesignation: Bucket[]
  rows: ReportRow[]
  notCounted: ReportRow[]
  /** True when built from notification emails: no refund, fee or net figures exist. */
  limited: boolean
  /** Donorbox emails that look like gifts but could not be read with confidence. */
  unreadable: { subject: string; date: string; reason: string }[]
}

export interface SummaryOptions {
  limited?: boolean
  unreadable?: Summary['unreadable']
}

function donorName(d: DonorboxDonation): string {
  const donor = d.donor
  const full = donor?.name?.trim() || [donor?.first_name, donor?.last_name].filter(Boolean).join(' ').trim()
  return full || donor?.email || 'Unknown'
}

function bucket(map: Map<string, Bucket>, name: string, amount: number) {
  const b = map.get(name) ?? { name, count: 0, total: 0 }
  b.count++
  b.total += amount
  map.set(name, b)
}

const sorted = (map: Map<string, Bucket>) => Array.from(map.values()).sort((a, b) => b.total - a.total || a.name.localeCompare(b.name))

/**
 * Only gifts with status "paid" are counted. Anything else dated in the month
 * (pending, failed, refunded outright) is listed separately so nothing is
 * silently dropped. Amounts are treated as US dollars.
 */
export function summarize(month: string, donations: DonorboxDonation[], options: SummaryOptions = {}): Summary {
  const inMonth = donations.filter((d) => localDay(d.donation_date).startsWith(month))
  const toRow = (d: DonorboxDonation): ReportRow => ({
    date: localDay(d.donation_date),
    name: d.anonymous_donation ? `${donorName(d)} (anonymous)` : donorName(d),
    email: d.donor?.email ?? '',
    amount: toCents(d.converted_amount ?? d.amount),
    refunded: toCents(d.amount_refunded),
    campaign: d.campaign?.name ?? '',
    designation: d.designation?.trim() ?? '',
    kind: d.recurring ? 'Monthly' : 'One-time',
    method: d.donation_type ?? '',
    status: d.status ?? '',
    note: [d.donating_company, d.comment].filter(Boolean).join(' | '),
  })

  const counted = inMonth.filter((d) => (d.status ?? 'paid') === 'paid').sort((a, b) => a.donation_date.localeCompare(b.donation_date))
  const rows = counted.map(toRow)
  const notCounted = inMonth.filter((d) => (d.status ?? 'paid') !== 'paid').map(toRow)

  const campaigns = new Map<string, Bucket>()
  const designations = new Map<string, Bucket>()
  const donors = new Set<string>()
  let gross = 0, refunded = 0, fees = 0
  const oneTime = { count: 0, total: 0 }
  const recurring = { count: 0, total: 0 }
  let largest: Summary['largest'] = null

  counted.forEach((d, i) => {
    const row = rows[i]
    gross += row.amount
    refunded += row.refunded
    fees += toCents(d.processing_fee)
    donors.add(String(d.donor?.id ?? d.donor?.email ?? `gift-${d.id}`))
    const side = d.recurring ? recurring : oneTime
    side.count++
    side.total += row.amount
    bucket(campaigns, row.campaign || 'No campaign', row.amount)
    if (row.designation) bucket(designations, row.designation, row.amount)
    if (!largest || row.amount > largest.amount) largest = { amount: row.amount, name: row.name }
  })

  return {
    month,
    label: monthLabel(month),
    gifts: rows.length,
    donors: donors.size,
    gross,
    refunded,
    net: gross - refunded,
    fees,
    average: rows.length ? Math.round(gross / rows.length) : 0,
    largest,
    oneTime,
    recurring,
    byCampaign: sorted(campaigns),
    byDesignation: sorted(designations),
    rows,
    notCounted,
    limited: options.limited ?? false,
    unreadable: options.unreadable ?? [],
  }
}

export function reportSubject(s: Summary): string {
  const base = s.gifts ? `Donation report for ${s.label}: ${formatMoney(s.gross)} from ${s.gifts} ${s.gifts === 1 ? 'gift' : 'gifts'}` : `Donation report for ${s.label}: no donations`
  return s.unreadable.length ? `${base} (needs a look)` : base
}

const TD = 'padding:6px 8px;border-bottom:1px solid #e5e0d0;font-size:13px;vertical-align:top'
const TH = 'padding:6px 8px;border-bottom:2px solid #d4af36;font-size:12px;text-align:left;color:#555'

function table(headers: string[], body: string[][], rightCols: number[] = []): string {
  const cell = (tag: 'th' | 'td', v: string, i: number) => `<${tag} style="${tag === 'th' ? TH : TD}${rightCols.includes(i) ? ';text-align:right' : ''}">${escapeHtml(v)}</${tag}>`
  return `<table style="border-collapse:collapse;width:100%;margin:8px 0 22px"><tr>${headers.map((h, i) => cell('th', h, i)).join('')}</tr>${body.map((r) => `<tr>${r.map((v, i) => cell('td', v, i)).join('')}</tr>`).join('')}</table>`
}

function buckets(list: Bucket[]): string[][] {
  return list.map((b) => [b.name, String(b.count), formatMoney(b.total)])
}

function giftRows(rows: ReportRow[]): string[][] {
  return rows.map((r) => [r.date, r.name, r.email, formatMoney(r.amount) + (r.refunded ? ` (${formatMoney(r.refunded)} refunded)` : ''), r.kind, [r.campaign, r.designation].filter(Boolean).join(' / '), r.note])
}

export function renderReport(s: Summary): { html: string; text: string } {
  const stats: [string, string][] = [
    ['Total raised', formatMoney(s.gross)],
    ['Gifts', String(s.gifts)],
    ['Donors', String(s.donors)],
    ['Average gift', s.gifts ? formatMoney(s.average) : '-'],
    ['Largest gift', s.largest ? `${formatMoney(s.largest.amount)} (${s.largest.name})` : '-'],
    ['One-time', `${formatMoney(s.oneTime.total)} from ${s.oneTime.count}`],
    ['Monthly (recurring)', `${formatMoney(s.recurring.total)} from ${s.recurring.count}`],
    ...(s.limited ? [] : ([['Refunded', formatMoney(s.refunded)], ['Net of refunds', formatMoney(s.net)], ['Processing fees', formatMoney(s.fees)]] as [string, string][])),
  ]
  const GIFT_HEAD = ['Date', 'Donor', 'Email', 'Amount', 'Type', 'Campaign / designation', 'Note']
  const foot = s.limited
    ? 'Built from the Donorbox gift notification emails in this inbox. Gross amounts only: refunds, failed payments and processing fees are not in those emails, and checks, stock and other gifts received by mail are not included. Dates are Eastern time.'
    : 'Online gifts through Donorbox only. Checks, stock and other gifts received by mail are not included. Dates are Eastern time.'
  const unreadableRows = s.unreadable.map((u) => [u.date, u.subject, u.reason])

  const html =
    `<div style="font-family:Georgia,serif;color:#222;max-width:760px">` +
    `<h2 style="margin:0 0 4px">Donation report: ${escapeHtml(s.label)}</h2>` +
    `<p style="margin:0 0 16px;color:#777;font-size:13px">Delta Phi Epsilon Foundation, online giving</p>` +
    table(['Summary', ''], stats.map(([k, v]) => [k, v]), [1]) +
    (s.byCampaign.length ? `<h3 style="margin:0">By campaign</h3>${table(['Campaign', 'Gifts', 'Total'], buckets(s.byCampaign), [1, 2])}` : '') +
    (s.byDesignation.length ? `<h3 style="margin:0">By designation</h3>${table(['Designation', 'Gifts', 'Total'], buckets(s.byDesignation), [1, 2])}` : '') +
    (s.rows.length ? `<h3 style="margin:0">All gifts</h3>${table(GIFT_HEAD, giftRows(s.rows), [3])}` : '<p>No donations were recorded this month.</p>') +
    (s.notCounted.length ? `<h3 style="margin:0">Not counted (status other than paid)</h3>${table([...GIFT_HEAD, 'Status'], giftRows(s.notCounted).map((r, i) => [...r, s.notCounted[i].status]), [3])}` : '') +
    (s.unreadable.length ? `<h3 style="margin:0;color:#a33">Needs a look: ${s.unreadable.length} Donorbox ${s.unreadable.length === 1 ? 'email' : 'emails'} could not be counted</h3>${table(['Date', 'Subject', 'Why'], unreadableRows)}` : '') +
    `<p style="color:#777;font-size:12px">${escapeHtml(foot)}</p></div>`

  const lines = [
    `Donation report: ${s.label}`, '',
    ...stats.map(([k, v]) => `${k}: ${v}`), '',
    ...(s.byCampaign.length ? ['By campaign', ...s.byCampaign.map((b) => `  ${b.name}: ${formatMoney(b.total)} (${b.count})`), ''] : []),
    ...(s.byDesignation.length ? ['By designation', ...s.byDesignation.map((b) => `  ${b.name}: ${formatMoney(b.total)} (${b.count})`), ''] : []),
    ...(s.rows.length ? ['All gifts', ...s.rows.map((r) => `  ${r.date}  ${r.name} <${r.email}>  ${formatMoney(r.amount)}  ${r.kind}${r.campaign ? `  ${r.campaign}` : ''}${r.designation ? ` / ${r.designation}` : ''}`), ''] : ['No donations were recorded this month.', '']),
    ...(s.notCounted.length ? ['Not counted', ...s.notCounted.map((r) => `  ${r.date}  ${r.name}  ${formatMoney(r.amount)}  ${r.status}`), ''] : []),
    ...(s.unreadable.length ? [`NEEDS A LOOK: ${s.unreadable.length} Donorbox email(s) could not be counted`, ...s.unreadable.map((u) => `  ${u.date}  ${u.subject}  (${u.reason})`), ''] : []),
    foot,
  ]
  return { html, text: lines.join('\n') }
}
