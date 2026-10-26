import { adminHandler, ok, positiveInt } from '@/lib/email/admin-route'
import { pollMailbox, runQueue } from '@/lib/email/runner'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// The campaign page calls this every few seconds while a campaign is sending.
// Sending only happens while an admin has that page open; there is no
// background job.
//
// poll=force means "check the mailbox now" from Setup, and that path must never
// send: an admin looking at replies has no reason to expect a batch of appeals
// to go out, and a campaign left with queued recipients would otherwise resume
// from a button that reads as read-only.
export const POST = adminHandler(async (request: Request) => {
  const params = new URL(request.url).searchParams
  const pollOnly = params.get('poll') === 'force'
  // Sending is scoped to the campaign whose page is open. Without an id there
  // is nothing to send, so the call only checks the mailbox: a run must never
  // drain a different campaign that was left with recipients queued.
  const campaignId = Number(params.get('campaign'))
  const run = pollOnly || !positiveInt(campaignId) ? null : await runQueue(25_000, campaignId)
  const poll = await pollMailbox({ force: pollOnly })
  return ok({ run, poll })
})
