// Preloaded into `next start` for the end-to-end test: answers Google's OAuth
// and Gmail API calls from local files instead of the network.
const fs = require('node:fs')
const path = require('node:path')
const dir = process.env.MOCK_DIR
const sentFile = path.join(dir, 'sent.jsonl')
const mailboxFile = path.join(dir, 'mailbox.json')
const realFetch = globalThis.fetch
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
let n = 0
globalThis.fetch = async (input, init) => {
  const url = typeof input === 'string' ? input : input.url
  if (url === 'https://oauth2.googleapis.com/token') {
    const params = new URLSearchParams(String(init.body))
    const [, claims] = params.get('assertion').split('.')
    const c = JSON.parse(Buffer.from(claims, 'base64url').toString())
    fs.appendFileSync(path.join(dir, 'token.jsonl'), JSON.stringify(c) + '\n')
    return json({ access_token: 'mock-token', expires_in: 3600 })
  }
  if (url.startsWith('https://gmail.googleapis.com/')) {
    const u = new URL(url)
    if (init?.headers?.Authorization !== 'Bearer mock-token') return json({ error: { message: 'bad auth' } }, 401)
    if (u.pathname.endsWith('/messages/send')) {
      if (fs.existsSync(path.join(dir, 'fail-next'))) { fs.unlinkSync(path.join(dir, 'fail-next')); return json({ error: { message: 'Rate limit exceeded' } }, 429) }
      const raw = Buffer.from(JSON.parse(init.body).raw, 'base64url').toString()
      n++
      const id = `msg${Date.now()}${n}`
      fs.appendFileSync(sentFile, JSON.stringify({ id, threadId: `thr-${id}`, raw }) + '\n')
      return json({ id, threadId: `thr-${id}` })
    }
    const mailbox = fs.existsSync(mailboxFile) ? JSON.parse(fs.readFileSync(mailboxFile, 'utf8')) : []
    if (u.pathname.endsWith('/messages')) {
      const q = u.searchParams.get('q') || ''
      const hits = mailbox.filter((m) => (q.startsWith('from:(mailer-daemon') ? m.kind === 'dsn' : m.kind === 'reply'))
      return json({ messages: hits.map((m) => ({ id: m.id, threadId: m.threadId })) })
    }
    const m = mailbox.find((x) => u.pathname.endsWith(`/messages/${x.id}`))
    if (!m) return json({ error: { message: 'not found' } }, 404)
    return json({ id: m.id, threadId: m.threadId, snippet: m.snippet, payload: {
      headers: Object.entries(m.headers || {}).map(([name, value]) => ({ name, value })),
      parts: [{ mimeType: 'message/delivery-status', body: { data: Buffer.from(m.text || '').toString('base64url') } }],
    } })
  }
  return realFetch(input, init)
}
