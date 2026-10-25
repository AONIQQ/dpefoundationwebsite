import { randomBytes } from 'node:crypto'

// Builds the raw RFC 5322 message handed to the Gmail API.

export interface Message {
  fromName: string
  fromEmail: string
  to: string
  replyTo?: string | null
  subject: string
  html: string
  text: string
  /** One-click unsubscribe (RFC 8058). Gmail and Yahoo require it for bulk senders. */
  unsubscribeUrl?: string
  /** Groups messages per campaign in Google Postmaster Tools. */
  feedbackId?: string
}

/** RFC 2047 encoded-word for header values that aren't plain ASCII. */
function encodeHeader(value: string): string {
  const clean = value.replace(/[\r\n]+/g, ' ')
  return /^[\x20-\x7e]*$/.test(clean) ? clean : `=?UTF-8?B?${Buffer.from(clean, 'utf8').toString('base64')}?=`
}

function address(name: string, email: string): string {
  const clean = name.replace(/[\r\n"\\]+/g, ' ').trim()
  if (!clean) return email
  return /^[\x20-\x7e]*$/.test(clean) ? `"${clean}" <${email}>` : `${encodeHeader(clean)} <${email}>`
}

const base64Body = (s: string) => Buffer.from(s, 'utf8').toString('base64').replace(/.{76}(?=.)/g, '$&\r\n')

const SAFE_ADDRESS = /^[^\s@<>"',;()\\\r\n]+@[^\s@<>"',;()\\\r\n]+$/

export function buildMime(m: Message): string {
  for (const addr of [m.fromEmail, m.to, m.replyTo].filter(Boolean) as string[]) {
    if (!SAFE_ADDRESS.test(addr)) throw new Error(`Invalid email address: ${addr}`)
  }
  const boundary = `dpe_${randomBytes(12).toString('hex')}`
  const headers = [
    `From: ${address(m.fromName, m.fromEmail)}`,
    `To: ${m.to}`,
    m.replyTo ? `Reply-To: ${m.replyTo}` : null,
    `Subject: ${encodeHeader(m.subject)}`,
    `Date: ${new Date().toUTCString().replace('GMT', '+0000')}`,
    'MIME-Version: 1.0',
    m.unsubscribeUrl ? `List-Unsubscribe: <${m.unsubscribeUrl}>, <mailto:${m.replyTo || m.fromEmail}?subject=unsubscribe>` : null,
    m.unsubscribeUrl ? 'List-Unsubscribe-Post: List-Unsubscribe=One-Click' : null,
    m.feedbackId ? `Feedback-ID: ${m.feedbackId}` : null,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
  ].filter(Boolean)

  return [
    ...headers,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    base64Body(m.text),
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    base64Body(m.html),
    `--${boundary}--`,
    '',
  ].join('\r\n')
}
