// Unit tests for the pure parts of fundraising email (no database, no Gmail).
// Run: node scripts/test-email.mjs   (Node 23.6+ strips the TypeScript types)
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { extractLinks, htmlToText, renderForRecipient, stripComments } from '../lib/email/render.ts'
import { buildMime } from '../lib/email/mime.ts'
import { guessColumns, parseCsv, rowsToContacts } from '../lib/email/csv.ts'
import { parseBounce } from '../lib/email/bounce.ts'

const TOKEN = 'a'.repeat(64)

test('appeal templates render with tracking, unsubscribe and no leftover merge tags', () => {
  for (const file of ['members-appeal', 'trustees-appeal', 'community-appeal']) {
    const html = readFileSync(new URL(`../emails/${file}.html`, import.meta.url), 'utf8')
    const links = extractLinks(html)
    assert.ok(links.includes('https://dpefoundation.org/donate'), `${file}: donate link tracked`)
    assert.ok(links.includes('https://dpefoundation.org/donate/designation-form'), `${file}: form link tracked`)
    const out = renderForRecipient(html, { email: 'x@example.com', first_name: 'Sam' }, TOKEN, links)
    assert.doesNotMatch(out.html, /\{\{/, `${file}: all merge tags filled`)
    assert.doesNotMatch(out.html, /BEFORE SENDING/, `${file}: editing notes stripped`)
    assert.match(out.html, new RegExp(`/e/c/${TOKEN}/\\d+`), `${file}: links rewritten`)
    assert.match(out.html, new RegExp(`/e/o/${TOKEN}`), `${file}: open pixel`)
    assert.match(out.html, new RegExp(`/e/u/${TOKEN}`), `${file}: unsubscribe link`)
    assert.doesNotMatch(out.html, /href="https:\/\/dpefoundation\.org\/donate"/, `${file}: no untracked donate link`)
    assert.match(out.text, /Unsubscribe/, `${file}: text part has unsubscribe`)
    assert.ok(out.text.length > 500, `${file}: text part has content`)
    assert.doesNotMatch(out.text, /<[a-z]/i, `${file}: text part has no tags`)
  }
})

test('Outlook conditional comments survive comment stripping', () => {
  const html = '<!-- note --><!--[if mso]><v:roundrect href="x"></v:roundrect><![endif]--><p>hi</p>'
  assert.equal(stripComments(html), '<!--[if mso]><v:roundrect href="x"></v:roundrect><![endif]--><p>hi</p>')
})

test('merge fields escape HTML and honor fallbacks', () => {
  const html = '<p>Dear {{FirstName|Brother}},</p><p>{{ lastname }}</p>'
  assert.match(renderForRecipient(html, { email: 'a@b.co', first_name: '' }, TOKEN, [], { track: false }).html, /Dear Brother,/)
  const evil = renderForRecipient(html, { email: 'a@b.co', first_name: '<script>', last_name: 'O"Neil' }, TOKEN, [], { track: false }).html
  assert.match(evil, /Dear &lt;script&gt;,/)
  assert.match(evil, /O&quot;Neil/)
})

test('an email without an unsubscribe link gets a footer with one', () => {
  const out = renderForRecipient('<html><body><p>Hello</p></body></html>', { email: 'a@b.co' }, TOKEN, [], { track: false })
  assert.match(out.html, /\/e\/u\/a{64}.*<\/body>/s)
  assert.match(out.html, /3222 N Street NW/)
})

test('only links frozen with the campaign are rewritten', () => {
  const html = '<a href="https://a.example/x?y=1&amp;z=2">A</a><a href="https://b.example">B</a>'
  const out = renderForRecipient(html, { email: 'a@b.co' }, TOKEN, ['https://a.example/x?y=1&z=2'])
  assert.match(out.html, /\/e\/c\/a{64}\/0/)
  assert.match(out.html, /href="https:\/\/b\.example"/)
})

test('htmlToText keeps link targets and decodes entities', () => {
  assert.equal(htmlToText('<p>Give &amp; <a href="https://x.org/d">donate &rarr;</a></p>'), 'Give & donate → (https://x.org/d)')
})

test('MIME has one-click unsubscribe headers and both parts', () => {
  const mime = buildMime({
    fromName: 'Délta Foundation', fromEmail: 'info@dpefoundation.org', to: 'x@example.com', replyTo: null,
    subject: 'Sixty years on — help', html: '<p>Hi</p>', text: 'Hi', unsubscribeUrl: 'https://dpefoundation.org/e/u/t', feedbackId: 'c1:fundraising:dpefoundation',
  })
  assert.match(mime, /^From: =\?UTF-8\?B\?.+\?= <info@dpefoundation\.org>\r$/m)
  assert.match(mime, /^Subject: =\?UTF-8\?B\?/m)
  assert.match(mime, /^List-Unsubscribe: <https:\/\/dpefoundation\.org\/e\/u\/t>, <mailto:info@dpefoundation\.org\?subject=unsubscribe>\r$/m)
  assert.match(mime, /^List-Unsubscribe-Post: List-Unsubscribe=One-Click\r$/m)
  assert.match(mime, /Content-Type: text\/plain; charset=UTF-8/)
  assert.match(mime, /Content-Type: text\/html; charset=UTF-8/)
  assert.doesNotMatch(mime, /^Reply-To/m)
})

test('MIME rejects header injection through addresses', () => {
  const base = { fromName: 'F', fromEmail: 'info@dpefoundation.org', subject: 's', html: 'h', text: 't' }
  assert.throws(() => buildMime({ ...base, to: 'x@example.com\r\nBcc: y@example.com' }))
  assert.match(buildMime({ ...base, to: 'x@example.com', subject: 'a\r\nBcc: y@z.com' }), /^Subject: a Bcc: y@z\.com\r$/m)
})

test('CSV import handles quotes, BOM, header detection and full names', () => {
  const rows = parseCsv('﻿Name,E-mail Address,Notes\r\n"Grasso, Al",AL@Example.com,"said ""yes"""\nSanjay Mullick,sanjay@example.com,\n\n')
  assert.equal(rows.length, 3)
  assert.equal(rows[1][2], 'said "yes"')
  const { map, hasHeader } = guessColumns(rows)
  assert.equal(hasHeader, true)
  assert.equal(map.email, 1)
  assert.equal(map.full, 0)
  const contacts = rowsToContacts(rows, map, hasHeader)
  assert.deepEqual(contacts[1], { email: 'sanjay@example.com', first_name: 'Sanjay', last_name: 'Mullick' })
  const bare = parseCsv('a@b.co\nc@d.co')
  assert.equal(guessColumns(bare).hasHeader, false)
  assert.equal(rowsToContacts(bare, guessColumns(bare).map, false).length, 2)
})

test('bounce parsing: hard failures count, delays and soft failures do not', () => {
  const hard = parseBounce(
    { subject: 'Delivery Status Notification (Failure)', 'x-failed-recipients': 'Gone@Example.com' },
    'Final-Recipient: rfc822; gone@example.com\nAction: failed\nStatus: 5.1.1\nDiagnostic-Code: smtp; 550 5.1.1 user unknown')
  assert.deepEqual(hard, { emails: ['gone@example.com'], detail: 'smtp; 550 5.1.1 user unknown' })
  assert.equal(parseBounce({ subject: 'Delivery Status Notification (Delay)' }, 'Status: 4.4.1'), null)
  assert.equal(parseBounce({ subject: 'Undeliverable' }, 'Final-Recipient: rfc822; a@b.co\nStatus: 4.2.2'), null)
  assert.equal(parseBounce({ subject: 'Hello' }, 'just a message'), null)
})
