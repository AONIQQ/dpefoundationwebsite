import { recordUnsubscribe, sendByToken } from '@/lib/email/store'
import { validToken } from '@/lib/email/tracking'

export const dynamic = 'force-dynamic'

// GET shows a confirmation button rather than unsubscribing outright, because
// mail scanners and link previewers fetch every link in a message. POST does
// the unsubscribe: either that button, or a mail client's one-click
// unsubscribe (RFC 8058), which posts "List-Unsubscribe=One-Click".

const escape = (v: string) => v.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)

function page(title: string, body: string, status = 200) {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>${title} | Delta Phi Epsilon Foundation</title>
<style>body{margin:0;background:#faf8f5;font-family:Georgia,'Times New Roman',serif;color:#2b2b2b}
main{max-width:520px;margin:12vh auto;padding:32px 24px;background:#fff;border:1px solid #eadfc4;border-radius:8px;text-align:center}
h1{font-size:24px;color:#1f2a44;margin:0 0 12px}p{line-height:1.6}
button{background:#b08d28;color:#fff;border:0;border-radius:999px;padding:12px 28px;font:bold 16px Georgia,serif;cursor:pointer}
a{color:#b08d28}</style></head><body><main>${body}</main></body></html>`
  return new Response(html, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } })
}

const notFound = () => page('Link not recognized', '<h1>Link not recognized</h1><p>This unsubscribe link is incomplete or has expired. To stop receiving Foundation emails, reply to any of them with "unsubscribe", or write to <a href="mailto:info@dpefoundation.org">info@dpefoundation.org</a>.</p>', 404)

export async function GET(_request: Request, { params }: { params: { token: string } }) {
  if (!validToken(params.token)) return notFound()
  const send = await sendByToken(params.token)
  if (!send) return notFound()
  if (send.unsubscribed_at || send.contact_status === 'unsubscribed') {
    return page('Unsubscribed', `<h1>You're unsubscribed</h1><p>${escape(String(send.email))} will not receive further fundraising emails from the Delta Phi Epsilon Foundation.</p>`)
  }
  return page('Unsubscribe', `<h1>Unsubscribe</h1><p>Stop fundraising emails from the Delta Phi Epsilon Foundation to <strong>${escape(String(send.email))}</strong>?</p>
<form method="post"><button type="submit">Unsubscribe</button></form>`)
}

export async function POST(_request: Request, { params }: { params: { token: string } }) {
  if (!validToken(params.token)) return notFound()
  try {
    if (!(await recordUnsubscribe(params.token))) return notFound()
  } catch (error) {
    console.error('Unsubscribe:', error)
    return page('Something went wrong', '<h1>Something went wrong</h1><p>Please try again, or reply to the email with "unsubscribe".</p>', 500)
  }
  return page('Unsubscribed', `<h1>You're unsubscribed</h1><p>You will not receive further fundraising emails from the Delta Phi Epsilon Foundation. Thank you for your support of the Foundation's work.</p>`)
}
