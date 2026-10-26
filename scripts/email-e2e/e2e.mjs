// End-to-end test of fundraising email against a running server (see
// scripts/email-e2e/README.md). Uses a throwaway database and mock-google.cjs.
import assert from 'node:assert/strict'
import fs from 'node:fs'
const B = 'http://localhost:3100', S = process.env.S
let cookie = ''
const call = async (path, method = 'GET', json) => {
  const r = await fetch(B + path, { method, redirect: 'manual', headers: { cookie, ...(json ? { 'content-type': 'application/json' } : {}) }, body: json ? JSON.stringify(json) : undefined })
  const text = await r.text(); let body; try { body = JSON.parse(text) } catch { body = text }
  return { status: r.status, body, headers: r.headers }
}
const sent = () => fs.existsSync(`${S}/sent.jsonl`) ? fs.readFileSync(`${S}/sent.jsonl`, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse) : []
const step = (m) => console.log('✓', m)

// Auth
assert.equal((await call('/api/admin/email/overview')).status, 401); step('API rejects unauthenticated requests')
const login = await fetch(B + '/api/admin/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ username: 'admin', password: 'pw-test' }) })
cookie = login.headers.get('set-cookie').split(';')[0]
let ov = (await call('/api/admin/email/overview')).body
assert.equal(ov.lists.length, 3); assert.equal(ov.checks[0].ok, true); step(`overview loads; checks: ${ov.checks.map(c => `${c.name}=${c.ok}`).join(', ')}`)

// Contacts
const [trustees, brothers] = ov.lists
let r = await call('/api/admin/email/contacts', 'POST', { listIds: [trustees.id], source: 'test.csv', contacts: [
  { email: 'Al@Example.com', first_name: 'Al', last_name: 'Grasso' }, { email: 'sanjay@example.com', first_name: 'Sanjay' },
  { email: 'gone@example.com', first_name: 'Gone' }, { email: 'bad-address' }, { email: 'al@example.com' } ] })
assert.deepEqual([r.body.added, r.body.updated, r.body.invalid], [3, 0, ['bad-address']]); assert.equal((await call('/api/admin/email/contacts?q=al%40')).body.rows[0].first_name, 'Al'); step('import: 3 added, duplicate merged keeping names, invalid reported')
r = await call('/api/admin/email/contacts', 'POST', { listIds: [brothers.id], contacts: [{ email: 'sanjay@example.com', last_name: 'Mullick' }, { email: 'eddie@example.com', first_name: 'Eddie' }, { email: 'unsub@example.com' }] })
assert.deepEqual([r.body.added, r.body.updated], [2, 1])
let contacts = (await call('/api/admin/email/contacts?q=sanjay')).body
assert.equal(contacts.rows[0].first_name, 'Sanjay'); assert.equal(contacts.rows[0].last_name, 'Mullick'); assert.equal(contacts.rows[0].list_ids.length, 2); step('re-import keeps names, adds last name, joins second list')
const unsub = (await call('/api/admin/email/contacts?q=unsub')).body.rows[0]
await call('/api/admin/email/contacts', 'PATCH', { id: unsub.id, status: 'unsubscribed' })

// Campaign
const tpl = (await call('/api/admin/email/templates')).body.templates
assert.equal(tpl.length, 3); step(`templates: ${tpl.map(t => t.file).join(', ')}`)
const members = tpl.find(t => t.file === 'members-appeal.html')
const id = (await call('/api/admin/email/campaigns', 'POST', { name: 'Fall appeal', subject: members.subject, html: members.html.replace('Dear Brother,', 'Dear {{FirstName|Brother}},') })).body.id
const preview = await call(`/api/admin/email/campaigns/${id}/preview?name=Andrew`)
assert.match(preview.body, /Dear Andrew,/); assert.match(preview.headers.get('content-security-policy'), /sandbox/); step('preview renders merge fields with a sandbox CSP')
r = await call(`/api/admin/email/campaigns/${id}/test`, 'POST', { to: 'andrew@example.com', first_name: 'Andrew' })
assert.equal(r.status, 200); assert.match(sent().at(-1).raw, /Subject: \[Test\]/); step('test send goes out marked [Test]')
const tokenClaims = JSON.parse(fs.readFileSync(`${S}/token.jsonl`, 'utf8').trim().split('\n')[0])
assert.equal(tokenClaims.sub, 'info@dpefoundation.org'); assert.match(tokenClaims.scope, /gmail\.send/); step('service-account JWT impersonates info@dpefoundation.org')

r = await call(`/api/admin/email/campaigns/${id}/queue`, 'POST', { listIds: [trustees.id, brothers.id] })
assert.equal(r.body.queued, 4); step('queued 4: overlap de-duplicated, unsubscribed contact excluded')
assert.equal((await call(`/api/admin/email/campaigns/${id}`, 'PATCH', { subject: 'changed' })).status, 409); step('content locked once queued')
r = await call(`/api/admin/email/campaigns/${id}/queue`, 'POST', { listIds: [brothers.id] })
assert.equal(r.body.queued, 0); step('re-queueing a list sends no duplicates')

// Daily cap
await call('/api/admin/email/settings', 'PATCH', { daily_cap: 3 })
const before = sent().length
fs.writeFileSync(`${S}/fail-next`, '')
r = await call(`/api/admin/email/run?campaign=${id}`, 'POST')
assert.equal(r.body.run.stoppedBy, 'gmail-error'); assert.equal(sent().length, before); step('Gmail 429 stops the batch and requeues')
r = await call(`/api/admin/email/run?campaign=${id}`, 'POST')
// test send counts as nothing (not in email_sends); cap 3
assert.equal(r.body.run.sent, 3); assert.equal(r.body.run.stoppedBy, 'cap'); step('cap respected: 3 sent, then stopped')
await call('/api/admin/email/settings', 'PATCH', { daily_cap: 50 })
r = (await call(`/api/admin/email/run?campaign=${id}`, 'POST')).body
assert.equal(r.run.sent, 1); assert.equal(r.run.stoppedBy, 'empty'); step('raising the limit lets the page finish the queue')

const msgs = sent().slice(-4)
assert.equal(new Set(msgs.map(m => m.raw.match(/^To: (.*)$/m)[1].trim())).size, 4)
const sanjayMsg = msgs.find(m => m.raw.includes('To: sanjay@example.com'))
assert.match(sanjayMsg.raw, /^List-Unsubscribe-Post: List-Unsubscribe=One-Click/m)
const html = Buffer.from(sanjayMsg.raw.split('Content-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n')[1].split('\r\n--')[0].replace(/\r\n/g, ''), 'base64').toString()
assert.match(html, /Dear Sanjay,/)
const eddieMsg = msgs.find(m => m.raw.includes('To: eddie@example.com'))
const token = html.match(/\/e\/o\/([a-f0-9]{64})/)[1]
step('each recipient got their own personalized message with one-click unsubscribe')

// Tracking
let px = await fetch(`${B}/e/o/${token}`); assert.equal(px.headers.get('content-type'), 'image/gif')
const clickPath = html.match(/\/e\/c\/[a-f0-9]{64}\/\d+/)[0]
let click = await fetch(B + clickPath, { redirect: 'manual' })
assert.equal(click.status, 302); assert.equal(click.headers.get('location'), 'http://localhost:3100/donate')
click = await fetch(`${B}/e/c/${token}/999`, { redirect: 'manual' }); assert.equal(click.headers.get('location'), 'http://localhost:3100/')
step('open pixel and click redirect recorded; unknown link index falls back to the homepage')
let page = await fetch(`${B}/e/u/${token}`).then(x => x.text()); assert.match(page, /Stop fundraising emails/)
let c = (await call(`/api/admin/email/campaigns/${id}`)).body.campaign; assert.equal(c.unsubscribed, 0); step('unsubscribe GET only shows a confirmation')
await fetch(`${B}/e/u/${token}`, { method: 'POST', body: 'List-Unsubscribe=One-Click', headers: { 'content-type': 'application/x-www-form-urlencoded' } })
assert.equal((await call('/api/admin/email/contacts?q=sanjay')).body.rows[0].status, 'unsubscribed'); step('one-click POST unsubscribes the contact')

// Bounce + reply via mailbox poll
const gone = msgs.find(m => m.raw.includes('To: gone@example.com'))
const eddieThread = eddieMsg.threadId
fs.writeFileSync(`${S}/mailbox.json`, JSON.stringify([
  { kind: 'dsn', id: 'dsn1', threadId: 't-dsn', headers: { Subject: 'Delivery Status Notification (Failure)', 'X-Failed-Recipients': 'gone@example.com' }, text: 'Final-Recipient: rfc822; gone@example.com\nStatus: 5.1.1\nDiagnostic-Code: smtp; 550 5.1.1 The email account does not exist' },
  { kind: 'dsn', id: 'dsn2', threadId: 't-dsn2', headers: { Subject: 'Delivery Status Notification (Delay)' }, text: 'Final-Recipient: rfc822; al@example.com\nStatus: 4.4.1' },
  { kind: 'reply', id: 'rep1', threadId: eddieThread, snippet: 'Happy to help, count me in for $500' },
  { kind: 'reply', id: 'rep2', threadId: 'unrelated-thread', snippet: 'Unrelated' },
]))
r = await call('/api/admin/email/run?poll=force', 'POST')
assert.deepEqual([r.body.poll.bounces, r.body.poll.replies], [1, 1])
r = await call('/api/admin/email/run?poll=force', 'POST')
assert.deepEqual([r.body.poll.bounces, r.body.poll.replies], [0, 0]); step('poll: 1 hard bounce, 1 reply; delay & unrelated ignored; re-poll records nothing twice')
assert.equal((await call('/api/admin/email/contacts?q=gone')).body.rows[0].status, 'bounced')

c = (await call(`/api/admin/email/campaigns/${id}`)).body.campaign
console.log('  stats:', JSON.stringify({ status: c.status, total: c.total, sent: c.sent, opened: c.opened, clicked: c.clicked, replied: c.replied, bounced: c.bounced, unsubscribed: c.unsubscribed }))
assert.equal(c.status, 'done'); assert.deepEqual([c.total, c.sent, c.opened, c.clicked, c.replied, c.bounced, c.unsubscribed], [4, 4, 1, 1, 1, 1, 1])
ov = (await call('/api/admin/email/overview')).body
assert.equal(ov.replies[0].email, 'eddie@example.com'); step('campaign marked done; stats and replies correct')

// Second campaign skips suppressed contacts
const id2 = (await call('/api/admin/email/campaigns', 'POST', { name: 'Follow-up', subject: 'Thank you', html: '<html><body><p>Hi {{FirstName}}</p></body></html>' })).body.id
r = await call(`/api/admin/email/campaigns/${id2}/queue`, 'POST', { listIds: [trustees.id, brothers.id] })
assert.equal(r.body.queued, 2); step('next campaign excludes the unsubscribed and bounced contacts (2 of 4 queued)')
await call(`/api/admin/email/campaigns/${id2}`, 'PATCH', { action: 'pause' })
r = await call(`/api/admin/email/run?campaign=${id2}`, 'POST'); assert.equal(r.body.run.sent, 0); step('paused campaign does not send')
await call(`/api/admin/email/campaigns/${id2}`, 'PATCH', { action: 'resume' })
r = await call(`/api/admin/email/run?campaign=${id2}`, 'POST'); assert.equal(r.body.run.sent, 2)
const last = sent().at(-1).raw
const lhtml = Buffer.from(last.split('Content-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n')[1].split('\r\n--')[0].replace(/\r\n/g, ''), 'base64').toString()
assert.match(lhtml, /3222 N Street NW/); assert.match(lhtml, /\/e\/u\//); step('resumed; template without unsubscribe link got the footer added')
assert.equal((await call(`/api/admin/email/campaigns/${id}`, 'DELETE')).status, 409); step('a sent campaign is kept, so delivered unsubscribe links keep working')
const draft = (await call('/api/admin/email/campaigns', 'POST', { name: 'Draft', subject: 'x', html: '<html><body>x</body></html>' })).body.id
assert.equal((await call(`/api/admin/email/campaigns/${draft}`, 'DELETE')).status, 200); step('an unsent draft can still be deleted')

// Queued against a list whose members are all unsubscribed: no email_sends rows
// exist, so there are no delivered links to protect and it stays deletable.
const nobodyList = (await call('/api/admin/email/lists', 'POST', { name: 'Unsubscribed only' })).body.id
await call('/api/admin/email/contacts', 'PATCH', { ids: [unsub.id], addToList: nobodyList })
const empty = (await call('/api/admin/email/campaigns', 'POST', { name: 'Nobody', subject: 'x', html: '<html><body>x</body></html>' })).body.id
r = await call(`/api/admin/email/campaigns/${empty}/queue`, 'POST', { listIds: [nobodyList] })
assert.equal(r.body.queued, 0)
await call(`/api/admin/email/campaigns/${empty}`, 'PATCH', { action: 'pause' })
assert.equal((await call(`/api/admin/email/campaigns/${empty}`, 'DELETE')).status, 200); step('a campaign queued to nobody has no delivery records, so it can be deleted')

// Opening one campaign must not drain another left with recipients queued.
const id3 = (await call('/api/admin/email/campaigns', 'POST', { name: 'Third', subject: 'Third', html: '<html><body><p>Hi</p></body></html>' })).body.id
await call(`/api/admin/email/campaigns/${id3}/queue`, 'POST', { listIds: [trustees.id] })
const beforeScoped = sent().length
r = await call(`/api/admin/email/run?campaign=${id2}`, 'POST')
assert.equal(r.body.run.sent, 0); assert.equal(sent().length, beforeScoped); step('running one campaign does not send another campaign\'s queue')
console.log('ALL E2E CHECKS PASSED')
