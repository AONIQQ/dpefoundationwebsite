import { adminHandler, ok } from '@/lib/email/admin-route'
import { pollMailbox, runQueue } from '@/lib/email/runner'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// The campaign page calls this every few seconds while a campaign is sending,
// so sending keeps moving even where cron only runs once a day.
export const POST = adminHandler(async (request: Request) => {
  const force = new URL(request.url).searchParams.get('poll') === 'force'
  const run = await runQueue(25_000)
  const poll = await pollMailbox({ force })
  return ok({ run, poll })
})
