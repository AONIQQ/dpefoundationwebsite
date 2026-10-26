import { randomBytes } from 'node:crypto'
import { adminHandler, fail, normalizeEmail, ok, readJson } from '@/lib/email/admin-route'
import { gmailConfigured, senderAddress, sendRaw } from '@/lib/email/gmail'
import { buildMime } from '@/lib/email/mime'
import { renderForRecipient } from '@/lib/email/render'
import { getCampaign, getSettings } from '@/lib/email/store'

export const dynamic = 'force-dynamic'

// Sends one copy to the given address, exactly as a recipient would see it,
// but with tracking and unsubscribe links pointing nowhere real.
export const POST = adminHandler(async (request: Request, { params }: { params: { id: string } }) => {
  const body = await readJson(request)
  const to = normalizeEmail(body?.to)
  if (!to) return fail('Enter an email address for the test')
  if (!gmailConfigured()) return fail('Gmail sending is not set up yet. See the setup checklist.', 409)
  const campaign = await getCampaign(Number(params.id))
  if (!campaign) return fail('Campaign not found', 404)
  if (!String(campaign.subject).trim() || !String(campaign.html).trim()) return fail('Add a subject and content first')
  const settings = await getSettings()
  const token = `test${randomBytes(8).toString('hex')}`
  const firstName = typeof body?.first_name === 'string' ? body.first_name.slice(0, 200) : ''
  const rendered = renderForRecipient(String(campaign.html), { email: to, first_name: firstName }, token, [], { track: false })
  const mime = buildMime({
    fromName: settings.from_name,
    fromEmail: senderAddress()!,
    to,
    replyTo: settings.reply_to,
    subject: `[Test] ${campaign.subject}`,
    html: rendered.html,
    text: rendered.text,
  })
  await sendRaw(mime)
  return ok({ success: true })
})
