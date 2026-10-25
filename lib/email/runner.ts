import { GmailError, getMessage, gmailConfigured, searchMessages, senderAddress, sendRaw } from '@/lib/email/gmail'
import { parseBounce } from '@/lib/email/bounce'
import { buildMime } from '@/lib/email/mime'
import { renderForRecipient } from '@/lib/email/render'
import {
  claimNext, finishCampaigns, getSettings, markFailed, markSent, notePoll, prepareQueue, queuedCount,
  knownEventIds, recordBounce, recordReply, sendsForThreads, sentInLast24h,
} from '@/lib/email/store'

// Drains the send queue within the daily cap, then checks the mailbox for
// bounces and replies. Called by the cron route and by the campaign page while
// it is open, so sending never depends on a single trigger. Safe to run
// concurrently: each send is claimed atomically before it goes out.

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

export async function runQueue(budgetMs: number): Promise<RunResult> {
  const started = Date.now()
  const settings = await getSettings()
  const base = { sent: 0, failed: 0, dailyCap: settings.daily_cap, paused: settings.paused }
  const finish = async (stoppedBy: RunResult['stoppedBy'], error?: string): Promise<RunResult> => {
    await finishCampaigns()
    return { ...base, configured: gmailConfigured(), queued: await queuedCount(), sentLast24h: await sentInLast24h(), stoppedBy, error }
  }

  if (!gmailConfigured()) return finish('not-configured')
  if (settings.paused) return finish('paused')
  await prepareQueue()

  const fromEmail = senderAddress()!
  let alreadySent = await sentInLast24h()

  while (Date.now() - started < budgetMs - 3000) {
    if (alreadySent >= settings.daily_cap) return finish('cap')
    const send = await claimNext()
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
      alreadySent++
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      const transient = error instanceof GmailError && error.transient
      await markFailed(send.id, message, transient)
      if (transient || (error instanceof GmailError && (error.status === 401 || error.status === 403))) {
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

/** Check the sending mailbox for bounce reports and replies to campaign mail. */
export async function pollMailbox(opts: { force?: boolean } = {}): Promise<PollResult> {
  if (!gmailConfigured()) return { bounces: 0, replies: 0, skipped: true }
  const settings = await getSettings()
  if (!opts.force && settings.last_poll_at && Date.now() - new Date(settings.last_poll_at).getTime() < 5 * 60_000) {
    return { bounces: 0, replies: 0, skipped: true }
  }
  await notePoll()
  const result: PollResult = { bounces: 0, replies: 0 }
  try {
    const reports = await searchMessages('from:(mailer-daemon OR postmaster) newer_than:4d', 100)
    for (const ref of reports) {
      const message = await getMessage(ref.id)
      const bounce = parseBounce(message.headers, message.text)
      if (!bounce) continue
      for (const email of bounce.emails) {
        if (await recordBounce(email, `${message.id}:${email}`, bounce.detail)) result.bounces++
      }
    }

    const sender = senderAddress()
    const inbox = await searchMessages(`in:inbox newer_than:4d -from:me -from:(mailer-daemon OR postmaster) -from:${sender}`, 200)
    const sends = await sendsForThreads(Array.from(new Set(inbox.map((m) => m.threadId))))
    const byThread = new Map(sends.map((s) => [s.threadId, s.id]))
    const known = await knownEventIds(inbox.map((m) => m.id))
    for (const ref of inbox) {
      const sendId = byThread.get(ref.threadId)
      if (!sendId || known.has(ref.id)) continue
      const message = await getMessage(ref.id)
      if (await recordReply(sendId, ref.id, message.snippet ?? '')) result.replies++
    }
  } catch (error) {
    result.error = error instanceof Error ? error.message : String(error)
  }
  return result
}
