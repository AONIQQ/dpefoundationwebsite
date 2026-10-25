import { resolveMx, resolveTxt } from 'node:dns/promises'
import { gmailConfigured, senderAddress } from '@/lib/email/gmail'

// Deliverability checklist for the sending domain, shown on the admin Email
// page. Each check says what is wrong and what to add at the registrar.

export interface Check { name: string; ok: boolean; detail: string }

async function txt(host: string): Promise<string[]> {
  try { return (await resolveTxt(host)).map((parts) => parts.join('')) } catch { return [] }
}

export async function deliverabilityChecks(): Promise<Check[]> {
  const sender = senderAddress()
  const domain = sender?.split('@')[1] ?? 'dpefoundation.org'
  const checks: Check[] = [{
    name: 'Gmail API access',
    ok: gmailConfigured(),
    detail: gmailConfigured()
      ? `Sending as ${sender}`
      : 'Set GOOGLE_SERVICE_ACCOUNT_JSON and EMAIL_SENDER in Vercel, and grant the service account domain-wide delegation for gmail.send and gmail.readonly.',
  }]

  let mx: string[] = []
  try { mx = (await resolveMx(domain)).map((r) => r.exchange.toLowerCase()) } catch { /* reported below */ }
  const googleMx = mx.some((h) => h.endsWith('google.com') || h.endsWith('googlemail.com'))
  checks.push({ name: 'MX (Google mail)', ok: googleMx, detail: googleMx ? mx.join(', ') : `No Google MX records found for ${domain}. Replies and bounces won't reach the mailbox.` })

  const spf = (await txt(domain)).find((r) => r.toLowerCase().startsWith('v=spf1'))
  const spfOk = Boolean(spf && spf.includes('include:_spf.google.com'))
  checks.push({ name: 'SPF', ok: spfOk, detail: spf ? (spfOk ? spf : `${spf} (missing include:_spf.google.com)`) : `Add TXT on ${domain}: v=spf1 include:_spf.google.com ~all` })

  const dkim = (await txt(`google._domainkey.${domain}`)).find((r) => r.includes('v=DKIM1') || r.includes('p='))
  checks.push({ name: 'DKIM', ok: Boolean(dkim), detail: dkim ? 'google._domainkey record found' : 'Generate a 2048-bit key in Google Admin (Apps, Gmail, Authenticate email), add the TXT record at google._domainkey, then click Start authentication.' })

  const dmarc = (await txt(`_dmarc.${domain}`)).find((r) => r.toLowerCase().startsWith('v=dmarc1'))
  checks.push({ name: 'DMARC', ok: Boolean(dmarc), detail: dmarc ?? `Add TXT on _dmarc.${domain}: v=DMARC1; p=none; rua=mailto:${sender ?? `info@${domain}`}` })

  return checks
}
