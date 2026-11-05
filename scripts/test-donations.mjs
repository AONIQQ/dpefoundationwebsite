// Unit tests for the monthly donation report (no network except a local stub of the Donorbox API).
// Run: node scripts/test-donations.mjs   (Node 23.6+ strips the TypeScript types)
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { test } from 'node:test'
import { fetchDonations } from '../lib/donations/donorbox.ts'
import { localDay, previousMonth, queryRange, renderReport, reportSubject, summarize } from '../lib/donations/report.ts'

const gift = (id, over = {}) => ({
  id, amount: '100.0', status: 'paid', recurring: false, donation_date: '2026-10-15T16:00:00Z',
  donor: { id, name: `Donor ${id}`, email: `d${id}@example.com` }, campaign: { id: 1, name: 'Annual Appeal' }, processing_fee: 3.2, ...over,
})

test('month boundaries follow Eastern time, not UTC', () => {
  assert.equal(localDay('2026-11-01T03:30:00Z'), '2026-10-31')
  assert.equal(localDay('2026-10-01T02:00:00Z'), '2026-09-30')
  const s = summarize('2026-10', [
    gift(1, { donation_date: '2026-11-01T03:30:00Z' }), // 11:30pm Oct 31 in New York: October
    gift(2, { donation_date: '2026-10-01T02:00:00Z' }), // 10pm Sep 30 in New York: not October
    gift(3, { donation_date: '2026-11-01T05:30:00Z' }), // 1:30am Nov 1 in New York: not October
  ])
  assert.deepEqual(s.rows.map((r) => r.name), ['Donor 1'])
})

test('previousMonth and queryRange', () => {
  assert.equal(previousMonth(new Date('2026-11-02T14:00:00Z')), '2026-10')
  assert.equal(previousMonth(new Date('2027-01-02T14:00:00Z')), '2026-12')
  assert.equal(previousMonth(new Date('2026-03-01T02:00:00Z')), '2026-01') // still Feb 28 evening in New York, so Feb is the current month
  assert.equal(previousMonth(new Date('2026-03-01T06:00:00Z')), '2026-02')
  assert.deepEqual(queryRange('2026-10'), { from: '2026-09-30', to: '2026-11-01' })
  assert.deepEqual(queryRange('2026-12'), { from: '2026-11-30', to: '2027-01-01' })
})

test('totals, splits, refunds, fees and uncounted gifts', () => {
  const s = summarize('2026-10', [
    gift(1, { amount: '250.00' }),
    gift(2, { amount: '10.10', recurring: true }),
    gift(3, { amount: '25', recurring: true, donor: { id: 2, name: 'Donor 2' } }), // same donor as gift 2
    gift(4, { amount: '500', amount_refunded: '100', campaign: { id: 2, name: 'Scholarships' }, designation: 'Bleakley' }),
    gift(5, { amount: '75', status: 'pending' }),
    gift(6, { amount: '40', status: 'refunded', amount_refunded: '40' }),
    gift(7, { amount: '33.335', anonymous_donation: true }),
  ])
  assert.equal(s.gifts, 5)
  assert.equal(s.gross, 25000 + 1010 + 2500 + 50000 + 3334)
  assert.equal(s.refunded, 10000)
  assert.equal(s.net, s.gross - 10000)
  assert.equal(s.fees, 5 * 320)
  assert.deepEqual([s.oneTime.count, s.recurring.count], [3, 2])
  assert.equal(s.recurring.total, 3510)
  assert.equal(s.largest.amount, 50000)
  assert.equal(s.notCounted.length, 2)
  assert.deepEqual(s.byCampaign.map((b) => b.name), ['Scholarships', 'Annual Appeal'])
  assert.deepEqual(s.byDesignation.map((b) => [b.name, b.total]), [['Bleakley', 50000]])
  assert.match(s.rows.at(-1).name, /anonymous/)
  assert.equal(s.donors, 4) // gifts 2 and 3 share donor id 2
})

test('report text is escaped and an empty month still renders', () => {
  const evil = summarize('2026-10', [gift(1, { donor: { id: 9, name: '<img src=x onerror=alert(1)>', email: 'a@b.co' }, comment: '<script>x</script>' })])
  const { html, text } = renderReport(evil)
  assert.doesNotMatch(html, /<img|<script/)
  assert.match(html, /&lt;img/)
  assert.match(reportSubject(evil), /October 2026: \$100\.00 from 1 gift$/)
  assert.ok(text.includes('Total raised: $100.00'))
  const empty = summarize('2026-10', [])
  assert.match(reportSubject(empty), /no donations/)
  assert.match(renderReport(empty).html, /No donations were recorded/)
})

function stub(handler) {
  const seen = []
  const server = createServer((req, res) => { seen.push({ url: req.url, auth: req.headers.authorization }); handler(req, res, seen) })
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({ server, seen, base: `http://127.0.0.1:${server.address().port}` })))
}

test('fetchDonations pages until an empty page, even when the server caps per_page', async () => {
  const all = Array.from({ length: 7 }, (_, i) => gift(i + 1))
  const { server, seen, base } = await stub((req, res) => {
    const page = Number(new URL(req.url, 'http://x').searchParams.get('page'))
    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify(all.slice((page - 1) * 3, page * 3))) // server caps at 3 whatever per_page says
  })
  process.env.DONORBOX_API_BASE = base; process.env.DONORBOX_EMAIL = 'me@example.org'; process.env.DONORBOX_API_KEY = 'k'
  const rows = await fetchDonations('2026-09-30', '2026-11-01')
  server.close()
  assert.equal(rows.length, 7)
  assert.equal(seen.length, 4)
  assert.match(seen[0].url, /date_from=2026-09-30&date_to=2026-11-01&page=1/)
  assert.equal(seen[0].auth, `Basic ${Buffer.from('me@example.org:k').toString('base64')}`)
})

test('fetchDonations stops when the server ignores paging, and explains bad credentials', async () => {
  let calls = 0
  const same = await stub((req, res) => { calls++; res.end(JSON.stringify([gift(1), gift(2)])) })
  process.env.DONORBOX_API_BASE = same.base
  assert.equal((await fetchDonations('a', 'b')).length, 2)
  same.server.close()
  assert.equal(calls, 2)
  const denied = await stub((req, res) => { res.statusCode = 401; res.end('{}') })
  process.env.DONORBOX_API_BASE = denied.base
  await assert.rejects(fetchDonations('a', 'b'), /rejected the API credentials/)
  denied.server.close()
  delete process.env.DONORBOX_EMAIL
  await assert.rejects(fetchDonations('a', 'b'), /credentials are not set/)
})
