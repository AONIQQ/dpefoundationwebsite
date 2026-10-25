import { adminHandler, fail, ok, readJson } from '@/lib/email/admin-route'
import { campaignRecipients, deleteCampaign, getCampaign, setCampaignStatus, updateCampaign } from '@/lib/email/store'

export const dynamic = 'force-dynamic'

type Ctx = { params: { id: string } }
const campaignId = (ctx: Ctx) => { const id = Number(ctx.params.id); return Number.isSafeInteger(id) && id > 0 ? id : null }
const FILTERS = ['queued', 'sending', 'sent', 'failed', 'skipped', 'bounced', 'opened', 'clicked', 'replied', 'unsubscribed']

export const GET = adminHandler(async (request: Request, ctx: Ctx) => {
  const id = campaignId(ctx)
  if (!id) return fail('Invalid campaign')
  const campaign = await getCampaign(id)
  if (!campaign) return fail('Campaign not found', 404)
  const params = new URL(request.url).searchParams
  const filter = params.get('filter')
  if (filter && !FILTERS.includes(filter)) return fail('Invalid filter')
  const offset = Math.max(Number(params.get('offset') || 0), 0)
  const recipients = await campaignRecipients(id, filter, 200, offset)
  return ok({ campaign, recipients })
})

// { name, subject, html } edits; { action: 'pause' | 'resume' } controls sending.
export const PATCH = adminHandler(async (request: Request, ctx: Ctx) => {
  const id = campaignId(ctx)
  const body = await readJson(request)
  if (!id || !body) return fail('Invalid request')
  if (body.action === 'pause' || body.action === 'resume') {
    const changed = await setCampaignStatus(id, body.action === 'pause' ? 'paused' : 'sending')
    return changed ? ok({ success: true }) : fail(`Campaign can't be ${body.action}d right now`, 409)
  }
  const values: { name?: string; subject?: string; html?: string } = {}
  if (body.name !== undefined) {
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    if (!name || name.length > 200) return fail('Campaign name is required (up to 200 characters)')
    values.name = name
  }
  if (body.subject !== undefined) {
    if (typeof body.subject !== 'string' || body.subject.length > 300) return fail('Subject must be up to 300 characters')
    values.subject = body.subject.trim()
  }
  if (body.html !== undefined) {
    if (typeof body.html !== 'string' || body.html.length > 500000) return fail('Invalid email content')
    values.html = body.html
  }
  if (!Object.keys(values).length) return fail('Nothing to update')
  const result = await updateCampaign(id, values)
  if (result === 'missing') return fail('Campaign not found', 404)
  if (result === 'locked') return fail('This campaign has already started sending, so its subject and content are locked. Duplicate it to make changes.', 409)
  return ok({ success: true })
})

export const DELETE = adminHandler(async (_request: Request, ctx: Ctx) => {
  const id = campaignId(ctx)
  if (!id) return fail('Invalid campaign')
  return (await deleteCampaign(id)) ? ok({ success: true }) : fail('Pause the campaign before deleting it', 409)
})
