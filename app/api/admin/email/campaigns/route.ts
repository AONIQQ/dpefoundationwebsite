import { adminHandler, fail, ok, readJson } from '@/lib/email/admin-route'
import { createCampaign, listCampaigns } from '@/lib/email/store'

export const dynamic = 'force-dynamic'

export const GET = adminHandler(async () => ok({ campaigns: await listCampaigns() }))

export const POST = adminHandler(async (request: Request) => {
  const body = await readJson(request)
  const name = typeof body?.name === 'string' ? body.name.trim() : ''
  if (!name || name.length > 200) return fail('Campaign name is required (up to 200 characters)')
  const subject = typeof body?.subject === 'string' ? body.subject.trim().slice(0, 300) : ''
  const html = typeof body?.html === 'string' ? body.html : ''
  if (html.length > 500000) return fail('Email content is too large')
  return ok({ id: await createCampaign({ name, subject, html }) })
})
