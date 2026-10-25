import { GmailAuthError, GmailError, getMessage, gmailConfigured, searchMessages, senderAddress, sendRaw } from '@/lib/email/gmail'
import { parseBounce } from '@/lib/email/bounce'
import { buildMime } from '@/lib/email/mime'
import { renderForRecipient } from '@/lib/email/render'
import {
  claimNext, finishCampaigns, getSettings, markFailed, markSent, notePoll, prepareQueue, queuedCount,
  knownEventIds, recordBounce, recordReply, sendsForThreads, sentInLast24h,
} from '@/lib/email/store'

// Drains one campaign's send queue within the daily cap, then checks the
// mailbox for
// bounces and replies. The admin campaign page calls it every few seconds
// while it is open. Safe to run concurrently (two admins with the page open):
// claimNext reserves both the recipient and its slot under the daily cap in a
// single statement, so overlapping runs neither double-send nor overshoot.

const SPACING_MS = 1000

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export interface RunResult {
  configured: boolean
  paused: boolean
  sent: number
  failed: number
  queued: number
  sentLast24h: number
  dailyCap: number
  stoppedBy: 'empty' | 'cap' | 'time' | 'paused' | 'not-configured' | 'gmail-error'
  error?: string
}

export async function runQueue(budgetMs: number, campaignId: number): Promise<RunResult> {
  const started = Date.now()
  const settings = await getSettings()
  const base = { sent: 0, failed: 0, dailyCap: settings.daily_cap, paused: settings.paused }
  const finish = async (stoppedBy: RunResult['stoppedBy'], error?: string): Promise<RunResult> => {
    await finishCampaigns()
    return { ...base, configured: gmailConfigured(), queued: await queuedCount(campaignId), sentLast24h: await sentInLast24h(), stoppedBy, error }
  }

  if (!gmailConfigured()) return finish('not-configured')
  if (settings.paused) return finish('paused')
  await prepareQueue()

  const fromEmail = senderAddress()!

  while (Date.now() - started < budgetMs - 3000) {
    const send = await claimNext(settings.daily_cap, campaignId)
    if (send === 'at-cap') return finish('cap')
    if (!send) return finish('empty')

    try {
      const rendered = renderForRecipient(send.html, send, send.token, send.links)
      const mime = buildMime({
        fromName: settings.from_name,
        fromEmail,
        to: send.email,
        replyTo: settings.reply_to,
        subject: send.subject,
        html: rendered.html,
        text: rendered.text,
        unsubscribeUrl: rendered.unsubscribeUrl,
        feedbackId: `c${send.campaign_id}:fundraising:dpefoundation`,
      })
      const result = await sendRaw(mime)
      await markSent(send.id, result.id, result.threadId)
      base.sent++
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      const transient = error instanceof GmailError && error.transient
      // Nothing reached Gmail: a token could not be obtained, or Gmail refused
      // the credentials outright. Keep the recipient queued so the campaign can
      // resume once the configuration is fixed, instead of burning them.
      const auth = error instanceof GmailAuthError
        || (error instanceof GmailError && (error.status === 401 || error.status === 403))
      await markFailed(send.id, message, auth || transient)
      if (auth || transient) {
        // Rate limited, Google is having trouble, or the credentials are
        // wrong: every following send would fail the same way.
        return finish('gmail-error', message)
      }
      base.failed++
    }
    await sleep(SPACING_MS)
  }
  return finish('time')
}

// ---------------------------------------------------------------- mailbox

export interface PollResult { bounces: number; replies: number; skipped?: boolean; error?: string }

const MIN_LOOKBACK_DAYS = 4
const MAX_LOOKBACK_DAYS = 30

/**
 * How far back to search, based on when the mailbox was last polled
 * successfully.
 *
 * A fixed window would silently drop everything older than itself: nobody opens
 * the campaign page for a week after a send (there is no background poll), and
 * the bounces from the first days are then never seen, leaving hard-bounced
 * addresses subscribed and liable to be mailed again. One extra day of overlap
 * covers the gap between polls, and Gmail's newer_than is day-granular anyway.
 */
function lookbackDays(lastPollAt: string | null): number {
  if (!lastPollAt) return MIN_LOOKBACK_DAYS
  const elapsed = Date.now() - new Date(lastPollAt).getTime()
  if (!Number.isFinite(elapsed)) return MIN_LOOKBACK_DAYS
  const days = Math.ceil(elapsed / 86_400_000) + 1
  return Math.min(Math.max(days, MIN_LOOKBACK_DAYS), MAX_LOOKBACK_DAYS)
}

/** Check the sending mailbox for bounce reports and replies to campaign mail. */
export async function pollMailbox(opts: { force?: boolean } = {}): Promise<PollResult> {
  if (!gmailConfigured()) return { bounces: 0, replies: 0, skipped: true }
  const settings = await getSettings()
  if (!opts.force && settings.last_poll_at && Date.now() - new Date(settings.last_poll_at).getTime() < 5 * 60_000) {
    return { bounces: 0, replies: 0, skipped: true }
  }
  const days = lookbackDays(settings.last_poll_at)
  const result: PollResult = { bounces: 0, replies: 0 }
  try {
    const reports = await searchMessages(`from:(mailer-daemon OR postmaster) newer_than:${days}d`, 500)
    for (const ref of reports.messages) {
      const message = await getMessage(ref.id)
      const bounce = parseBounce(message.headers, message.text)
      if (!bounce) continue
      for (const email of bounce.emails) {
        if (await recordBounce(email, `${message.id}:${email}`, bounce.detail)) result.bounces++
      }
    }

    const sender = senderAddress()
    const inbox = await searchMessages(`in:inbox newer_than:${days}d -from:me -from:(mailer-daemon OR postmaster) -from:${sender}`, 500)
    const sends = await sendsForThreads(Array.from(new Set(inbox.messages.map((m) => m.threadId))))
    const byThread = new Map(sends.map((s) => [s.threadId, s.id]))
    const known = await knownEventIds(inbox.messages.map((m) => m.id))
    for (const ref of inbox.messages) {
      const sendId = byThread.get(ref.threadId)
      if (!sendId || known.has(ref.id)) continue
      const message = await getMessage(ref.id)
      if (await recordReply(sendId, ref.id, message.snippet ?? '')) result.replies++
    }
    // Only once the window was processed in full does the checkpoint move.
    // Advancing it up front would skip whatever the failed run never read, and
    // advancing it past an unread page would lose those messages for good once
    // they age out of the window. Re-reading a window is harmless: bounces and
    // replies are both recorded against the Gmail message id, so a second pass
    // records nothing twice.
    if (reports.complete && inbox.complete) await notePoll()
    else result.error = 'More mailbox messages than one check can read. Check again to continue.'
  } catch (error) {
    result.error = error instanceof Error ? error.message : String(error)
  }
  return result
}
