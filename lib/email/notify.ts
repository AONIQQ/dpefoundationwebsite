import { gmailConfigured, senderAddress, sendRaw } from '@/lib/email/gmail'
import { buildMime } from '@/lib/email/mime'

// Emails the Foundation's own inbox when someone uses the contact form, so a
// message is not only waiting in the admin dashboard. The submission is already
// saved by the time this runs: a failure here is logged and never reaches the
// visitor, and the dashboard stays the source of truth.

const NOTIFY_TO = (process.env.CONTACT_NOTIFY_EMAIL || 'info@dpefoundation.org').trim().toLowerCase()
const TIMEOUT_MS = 8000

const escapeHtml = (v: string) =>
  v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

// The form only checks for something@something.something, which still admits
// quotes and angle brackets. Reply-To is only set when it is a plain address.
const PLAIN_ADDRESS = /^[A-Za-z0-9._%+'-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/

export async function notifyContactSubmission(s: { full_name: string; email: string; message: string }): Promise<void> {
  if (!gmailConfigured()) return
  const from = senderAddress()!
  try {
    const subjectName = s.full_name.replace(/\s+/g, ' ').slice(0, 80)
    const mime = buildMime({
      fromName: 'DPE Foundation Website',
      fromEmail: from,
      to: NOTIFY_TO,
      replyTo: PLAIN_ADDRESS.test(s.email) ? s.email : null,
      subject: `New contact form message from ${subjectName}`,
      text: `Name: ${s.full_name}\nEmail: ${s.email}\n\n${s.message}\n\nReply to this email to answer ${s.full_name}. It is also saved in the admin dashboard.`,
      html:
        `<p><strong>Name:</strong> ${escapeHtml(s.full_name)}<br><strong>Email:</strong> ${escapeHtml(s.email)}</p>` +
        `<p style="white-space:pre-wrap">${escapeHtml(s.message)}</p>` +
        `<p style="color:#777;font-size:12px">Reply to this email to answer ${escapeHtml(s.full_name)}. It is also saved in the admin dashboard.</p>`,
    })
    await Promise.race([
      sendRaw(mime),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timed out')), TIMEOUT_MS)),
    ])
  } catch (error) {
    console.error('Contact notification email:', error)
  }
}
