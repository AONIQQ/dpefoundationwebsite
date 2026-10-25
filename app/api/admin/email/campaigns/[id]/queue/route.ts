import { adminHandler, fail, intList, ok, readJson } from '@/lib/email/admin-route'
import { gmailConfigured } from '@/lib/email/gmail'
import { queueCampaign } from '@/lib/email/store'

export const dynamic = 'force-dynamic'

// Queue the campaign to every subscribed member of the chosen lists.
export const POST = adminHandler(async (request: Request, { params }: { params: { id: string } }) => {
  const id = Number(params.id)
  const body = await readJson(request)
  const listIds = intList(body?.listIds)
  if (!Number.isSafeInteger(id) || id <= 0 || !listIds?.length) return fail('Choose at least one list')
  if (!gmailConfigured()) return fail('Gmail sending is not set up yet. See the setup checklist.', 409)
  try {
    return ok({ queued: await queueCampaign(id, listIds) })
  } catch (error) {
    if (error instanceof Error && /not found|subject and content/.test(error.message)) return fail(error.message)
    throw error
  }
})
