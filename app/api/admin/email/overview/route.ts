import { adminHandler, ok } from '@/lib/email/admin-route'
import { deliverabilityChecks } from '@/lib/email/health'
import { getSettings, listCampaigns, listLists, queuedCount, recentReplies, sentInLast24h } from '@/lib/email/store'

export const dynamic = 'force-dynamic'

export const GET = adminHandler(async () => {
  const [settings, lists, campaigns, checks, queued, sent24h, replies] = await Promise.all([
    getSettings(), listLists(), listCampaigns(), deliverabilityChecks(), queuedCount(), sentInLast24h(), recentReplies(20),
  ])
  return ok({ settings, lists, campaigns, checks, queued, sent24h, replies })
})
