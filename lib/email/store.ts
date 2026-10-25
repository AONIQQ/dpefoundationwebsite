import { sql, writesPaused } from '@/lib/data-store'
import { extractLinks } from '@/lib/email/render'

// Database access for fundraising email. Schema: db/email.sql.

export const CONTACT_STATUSES = ['subscribed', 'unsubscribed', 'bounced', 'complained'] as const
export type ContactStatus = typeof CONTACT_STATUSES[number]

function writable() { if (writesPaused()) throw new Error('Writes are paused for maintenance') }
const num = (v: unknown) => Number(v)

// ---------------------------------------------------------------- settings

export interface Settings { daily_cap: number; from_name: string; reply_to: string | null; paused: boolean; last_poll_at: string | null }

export async function getSettings(): Promise<Settings> {
  const [row] = await sql()`select daily_cap, from_name, reply_to, paused, last_poll_at from email_settings where id = 1`
  if (!row) throw new Error('Email tables are not set up. Run db/email.sql.')
  return row as unknown as Settings
}

export async function updateSettings(values: Partial<Pick<Settings, 'daily_cap' | 'from_name' | 'reply_to' | 'paused'>>) {
  writable()
  const db = sql()
  await db`update email_settings set ${db(values as Record<string, unknown>)}, updated_at = now() where id = 1`
}

export async function notePoll() {
  await sql()`update email_settings set last_poll_at = now() where id = 1`
}

// ---------------------------------------------------------------- lists

export async function listLists() {
  const rows = await sql()`
    select l.id, l.name, l.description,
      count(m.contact_id)::integer as members,
      count(m.contact_id) filter (where c.status = 'subscribed')::integer as subscribed
    from email_lists l
    left join email_list_members m on m.list_id = l.id
    left join email_contacts c on c.id = m.contact_id
    group by l.id order by l.id`
  return rows.map((r) => ({ ...r, id: num(r.id) }))
}

export async function createList(name: string, description: string | null) {
  writable()
  const [row] = await sql()`insert into email_lists (name, description) values (${name}, ${description}) returning id`
  return num(row.id)
}

export async function deleteList(id: number) {
  writable()
  await sql()`delete from email_lists where id = ${id}`
}

// ---------------------------------------------------------------- contacts

export interface ContactInput { email: string; first_name?: string | null; last_name?: string | null }

export async function listContacts(opts: { search?: string; listId?: number; status?: string; limit: number; offset: number }) {
  const db = sql()
  const search = opts.search ? `%${opts.search.toLowerCase().replace(/[\\%_]/g, '\\$&')}%` : null
  const where = db`
    where true
    ${search ? db`and (c.email like ${search} or lower(coalesce(c.first_name,'') || ' ' || coalesce(c.last_name,'')) like ${search})` : db``}
    ${opts.listId ? db`and exists (select 1 from email_list_members m where m.contact_id = c.id and m.list_id = ${opts.listId})` : db``}
    ${opts.status ? db`and c.status = ${opts.status}` : db``}`
  const rows = await db`
    select c.*, coalesce(array_agg(m.list_id) filter (where m.list_id is not null), '{}') as list_ids
    from email_contacts c left join email_list_members m on m.contact_id = c.id
    ${where}
    group by c.id order by c.created_at desc, c.id desc
    limit ${opts.limit} offset ${opts.offset}`
  const [{ count }] = await db`select count(*)::integer as count from email_contacts c ${where}`
  return {
    rows: rows.map((r) => ({ ...r, id: num(r.id), list_ids: (r.list_ids as unknown[]).map(num) })),
    total: num(count),
  }
}

/**
 * Add or update contacts by email and put them on the given lists. Existing
 * names are only overwritten by non-empty values, and an existing contact's
 * status is never changed here: re-importing someone who unsubscribed does not
 * resubscribe them.
 */
export async function upsertContacts(contacts: ContactInput[], listIds: number[], source: string | null) {
  writable()
  const db = sql()
  let added = 0
  let updated = 0
  const ids: number[] = []
  // Chunked so a large CSV doesn't become one enormous statement.
  for (let i = 0; i < contacts.length; i += 500) {
    const chunk = contacts.slice(i, i + 500).map((c) => ({
      email: c.email,
      first_name: c.first_name || null,
      last_name: c.last_name || null,
      source,
    }))
    const rows = await db`
      insert into email_contacts ${db(chunk, 'email', 'first_name', 'last_name', 'source')}
      on conflict (email) do update set
        first_name = coalesce(nullif(excluded.first_name, ''), email_contacts.first_name),
        last_name = coalesce(nullif(excluded.last_name, ''), email_contacts.last_name),
        updated_at = now()
      returning id, (xmax = 0) as inserted`
    for (const r of rows) {
      ids.push(num(r.id))
      if (r.inserted) added++
      else updated++
    }
  }
  if (listIds.length && ids.length) {
    const pairs = listIds.flatMap((list_id) => ids.map((contact_id) => ({ list_id, contact_id })))
    for (let i = 0; i < pairs.length; i += 1000) {
      await db`insert into email_list_members ${db(pairs.slice(i, i + 1000), 'list_id', 'contact_id')} on conflict do nothing`
    }
  }
  return { added, updated }
}

export async function updateContact(id: number, values: { first_name?: string | null; last_name?: string | null; status?: ContactStatus; notes?: string | null }, listIds?: number[]) {
  writable()
  const db = sql()
  const fields: Record<string, unknown> = { ...values }
  if (Object.keys(fields).length) {
    await db`update email_contacts set ${db(fields)}, updated_at = now()
      ${values.status ? db`, status_changed_at = case when status is distinct from ${values.status} then now() else status_changed_at end` : db``}
      where id = ${id}`
  }
  if (listIds) {
    await db`delete from email_list_members where contact_id = ${id} ${listIds.length ? db`and list_id not in ${db(listIds)}` : db``}`
    if (listIds.length) {
      await db`insert into email_list_members ${db(listIds.map((list_id) => ({ list_id, contact_id: id })), 'list_id', 'contact_id')} on conflict do nothing`
    }
  }
}

export async function deleteContacts(ids: number[]) {
  writable()
  const rows = await sql()`delete from email_contacts where id in ${sql()(ids)} returning id`
  return rows.length
}

export async function removeFromList(listId: number, contactIds: number[]) {
  writable()
  await sql()`delete from email_list_members where list_id = ${listId} and contact_id in ${sql()(contactIds)}`
}

export async function addToList(listId: number, contactIds: number[]) {
  writable()
  const db = sql()
  await db`insert into email_list_members ${db(contactIds.map((contact_id) => ({ list_id: listId, contact_id })), 'list_id', 'contact_id')} on conflict do nothing`
}

// ---------------------------------------------------------------- campaigns

const STATS = `
  count(s.id)::integer as total,
  count(s.id) filter (where s.status = 'queued' or s.status = 'sending')::integer as queued,
  count(s.id) filter (where s.status in ('sent', 'bounced'))::integer as sent,
  count(s.id) filter (where s.status = 'failed')::integer as failed,
  count(s.id) filter (where s.status = 'skipped')::integer as skipped,
  count(s.id) filter (where s.status = 'bounced')::integer as bounced,
  count(s.opened_at)::integer as opened,
  count(s.clicked_at)::integer as clicked,
  count(s.unsubscribed_at)::integer as unsubscribed,
  count(s.replied_at)::integer as replied`

export async function listCampaigns() {
  const rows = await sql()`
    select c.id, c.name, c.subject, c.status, c.created_at, c.updated_at, c.queued_at, c.completed_at, ${sql().unsafe(STATS)}
    from email_campaigns c left join email_sends s on s.campaign_id = c.id
    group by c.id order by c.created_at desc`
  return rows.map((r) => ({ ...r, id: num(r.id) }))
}

export interface Campaign {
  id: number; name: string; subject: string; html: string; status: string; links: string[]
  created_at: string; updated_at: string; queued_at: string | null; completed_at: string | null
  total: number; queued: number; sent: number; failed: number; skipped: number; bounced: number
  opened: number; clicked: number; unsubscribed: number; replied: number
}

export async function getCampaign(id: number): Promise<Campaign | null> {
  if (!Number.isSafeInteger(id) || id <= 0) return null
  const [row] = await sql()`
    select c.*, ${sql().unsafe(STATS)}
    from email_campaigns c left join email_sends s on s.campaign_id = c.id
    where c.id = ${id} group by c.id`
  return row ? ({ ...row, id: num(row.id) } as unknown as Campaign) : null
}

export async function createCampaign(values: { name: string; subject: string; html: string }) {
  writable()
  const [row] = await sql()`insert into email_campaigns (name, subject, html) values (${values.name}, ${values.subject}, ${values.html}) returning id`
  return num(row.id)
}

/**
 * Content can change until the first recipient is queued; after that only the
 * name can.
 *
 * The lock is part of the UPDATE rather than a check before it. Reading
 * queued_at in a separate statement leaves a window where queueCampaign() can
 * freeze the link targets and commit in between, after which this would
 * overwrite the subject or HTML of a campaign that is already going out: the
 * new content would be delivered against the old frozen tracking links, and
 * recipients claimed before and after the overwrite would get different mail.
 */
export async function updateCampaign(id: number, values: { name?: string; subject?: string; html?: string }) {
  writable()
  const db = sql()
  const touchesContent = values.subject !== undefined || values.html !== undefined
  const rows = touchesContent
    ? await db`update email_campaigns set ${db(values as Record<string, unknown>)}, updated_at = now()
        where id = ${id} and queued_at is null returning id`
    : await db`update email_campaigns set ${db(values as Record<string, unknown>)}, updated_at = now()
        where id = ${id} returning id`
  if (rows.length > 0) return 'ok'
  // Nothing matched: either the campaign is gone, or it was queued under us.
  const [campaign] = await db`select queued_at from email_campaigns where id = ${id}`
  if (!campaign) return 'missing'
  return touchesContent && campaign.queued_at ? 'locked' : 'missing'
}

export async function setCampaignStatus(id: number, status: 'sending' | 'paused') {
  writable()
  const from = status === 'sending' ? 'paused' : 'sending'
  const rows = await sql()`update email_campaigns set status = ${status}, updated_at = now() where id = ${id} and status = ${from} returning id`
  return rows.length > 0
}

/**
 * Delete a campaign that never went out.
 *
 * A campaign that has been queued is kept for good. Its email_sends rows carry
 * the unsubscribe and click tokens printed into mail already sitting in
 * people's inboxes, and deleting the campaign would cascade those away: past
 * recipients would get "link not recognized" from a one-click unsubscribe, the
 * donation links in delivered appeals would stop resolving, and the deliveries
 * would drop out of the rolling daily-cap count, letting the next campaign
 * overshoot the warm-up limit.
 */
export async function deleteCampaign(id: number): Promise<'ok' | 'missing' | 'sending' | 'has-sends'> {
  writable()
  const db = sql()
  const [campaign] = await db`select status, queued_at from email_campaigns where id = ${id}`
  if (!campaign) return 'missing'
  if (campaign.status === 'sending') return 'sending'
  if (campaign.queued_at) return 'has-sends'
  const rows = await db`
    delete from email_campaigns where id = ${id} and queued_at is null and status <> 'sending' returning id`
  return rows.length > 0 ? 'ok' : 'missing'
}

/**
 * Queue every subscribed member of the given lists who hasn't already been
 * queued for this campaign, and start sending. Contacts on several lists are
 * queued once.
 */
export async function queueCampaign(id: number, listIds: number[]) {
  writable()
  const db = sql()
  return db.begin(async (tx) => {
    const [campaign] = await tx`select id, html, subject, status, queued_at from email_campaigns where id = ${id} for update`
    if (!campaign) throw new Error('Campaign not found')
    if (!String(campaign.subject).trim() || !String(campaign.html).trim()) throw new Error('Add a subject and content first')
    if (!campaign.queued_at) {
      await tx`update email_campaigns set links = ${tx.json(extractLinks(campaign.html))}, queued_at = now() where id = ${id}`
    }
    const inserted = await tx`
      insert into email_sends (campaign_id, contact_id, email, token)
      select ${id}, c.id, c.email, replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')
      from email_contacts c
      where c.status = 'subscribed'
        and exists (select 1 from email_list_members m where m.contact_id = c.id and m.list_id in ${tx(listIds)})
      on conflict (campaign_id, contact_id) do nothing
      returning id`
    await tx`update email_campaigns set status = 'sending', completed_at = null, updated_at = now() where id = ${id} and status <> 'paused'`
    return inserted.length
  })
}

export async function campaignRecipients(id: number, filter: string | null, limit: number, offset: number) {
  const db = sql()
  const where = db`where s.campaign_id = ${id} ${
    filter === 'opened' ? db`and s.opened_at is not null`
    : filter === 'clicked' ? db`and s.clicked_at is not null`
    : filter === 'replied' ? db`and s.replied_at is not null`
    : filter === 'unsubscribed' ? db`and s.unsubscribed_at is not null`
    : filter ? db`and s.status = ${filter}` : db``}`
  const rows = await db`
    select s.id, s.email, s.status, s.error, s.sent_at, s.opened_at, s.open_count, s.clicked_at, s.click_count,
      s.unsubscribed_at, s.bounced_at, s.replied_at, c.first_name, c.last_name
    from email_sends s left join email_contacts c on c.id = s.contact_id
    ${where} order by s.id limit ${limit} offset ${offset}`
  const [{ count }] = await db`select count(*)::integer as count from email_sends s ${where}`
  return { rows: rows.map((r) => ({ ...r, id: num(r.id) })), total: num(count) }
}

// ---------------------------------------------------------------- queue

export async function sentInLast24h(): Promise<number> {
  const [{ count }] = await sql()`select count(*)::integer as count from email_sends where sent_at > now() - interval '24 hours'`
  return num(count)
}

export async function queuedCount(): Promise<number> {
  const [{ count }] = await sql()`
    select count(*)::integer as count from email_sends s join email_campaigns c on c.id = s.campaign_id
    where s.status = 'queued' and c.status = 'sending'`
  return num(count)
}

/**
 * Housekeeping before each batch:
 * - a send left 'sending' for 10 minutes means a run died mid-send. Gmail may
 *   or may not have accepted it, so it is marked failed rather than retried:
 *   a duplicate appeal to a donor is worse than a missed one.
 * - queued sends to anyone who has since unsubscribed or bounced are skipped.
 */
export async function prepareQueue() {
  const db = sql()
  await db`update email_sends set status = 'failed', error = 'Interrupted while sending; check the Sent folder before resending'
    where status = 'sending' and claimed_at < now() - interval '10 minutes'`
  await db`update email_sends s set status = 'skipped',
      error = 'Contact is ' || coalesce((select c.status from email_contacts c where c.id = s.contact_id), 'deleted')
    where s.status = 'queued'
      and not exists (select 1 from email_contacts c where c.id = s.contact_id and c.status = 'subscribed')`
}

export interface ClaimedSend {
  id: number
  campaign_id: number
  email: string
  token: string
  first_name: string | null
  last_name: string | null
  subject: string
  html: string
  links: string[]
}

/** Nothing left to claim, or the daily cap is already accounted for. */
export type ClaimOutcome = ClaimedSend | 'at-cap' | null

/**
 * Atomically take the next queued send, so overlapping runs never send the
 * same message twice and never exceed the daily cap between them.
 *
 * The cap is enforced inside the same statement that claims the row, counting
 * both messages already sent in the window and any currently in flight. Two
 * admins with the campaign page open therefore cannot each reserve the last
 * slot: whichever claim lands second sees the first as 'sending' and matches
 * no row. (Stale 'sending' rows from a dead run are cleared by prepareQueue.)
 */
export async function claimNext(dailyCap: number): Promise<ClaimOutcome> {
  const db = sql()
  const [claimed] = await db`
    update email_sends set status = 'sending', claimed_at = now()
    where id = (
      select s.id from email_sends s join email_campaigns c on c.id = s.campaign_id
      where s.status = 'queued' and c.status = 'sending'
        and (
          select count(*) from email_sends d
          where d.sent_at > now() - interval '24 hours' or d.status = 'sending'
        ) < ${dailyCap}
      order by s.id limit 1 for update of s skip locked
    )
    returning id`
  if (!claimed) {
    // The claim matches nothing both when the queue is empty and when the cap
    // blocks it, so ask which it was.
    const [{ count }] = await db`
      select count(*)::integer as count from email_sends s join email_campaigns c on c.id = s.campaign_id
      where s.status = 'queued' and c.status = 'sending'`
    return num(count) > 0 ? 'at-cap' : null
  }
  const [row] = await db`
    select s.id, s.campaign_id, s.email, s.token, ct.first_name, ct.last_name, ct.status as contact_status,
      c.subject, c.html, c.links
    from email_sends s join email_campaigns c on c.id = s.campaign_id left join email_contacts ct on ct.id = s.contact_id
    where s.id = ${claimed.id}`
  if (row.contact_status !== 'subscribed') {
    await db`update email_sends set status = 'skipped', error = ${`Contact is ${row.contact_status ?? 'deleted'}`} where id = ${claimed.id}`
    return claimNext(dailyCap)
  }
  return { ...row, id: num(row.id), campaign_id: num(row.campaign_id), links: row.links as string[] } as ClaimedSend
}

export async function markSent(id: number, gmailId: string, threadId: string) {
  await sql()`update email_sends set status = 'sent', sent_at = now(), gmail_message_id = ${gmailId}, gmail_thread_id = ${threadId}, error = null where id = ${id}`
}

export async function markFailed(id: number, error: string, retry: boolean) {
  await sql()`update email_sends set status = ${retry ? 'queued' : 'failed'}, error = ${error.slice(0, 1000)}, claimed_at = null where id = ${id}`
}

export async function finishCampaigns() {
  await sql()`
    update email_campaigns c set status = 'done', completed_at = now(), updated_at = now()
    where c.status = 'sending' and not exists (
      select 1 from email_sends s where s.campaign_id = c.id and s.status in ('queued', 'sending'))`
}

// ---------------------------------------------------------------- tracking

export async function recordOpen(token: string) {
  const db = sql()
  const [row] = await db`update email_sends set open_count = open_count + 1, opened_at = coalesce(opened_at, now())
    where token = ${token} returning id`
  if (row) await db`insert into email_events (send_id, type) values (${row.id}, 'open')`
}

/** Returns the campaign link to redirect to, or null for an unknown token or index. */
export async function recordClick(token: string, index: number): Promise<string | null> {
  const db = sql()
  const [row] = await db`
    select s.id, c.links from email_sends s join email_campaigns c on c.id = s.campaign_id where s.token = ${token}`
  const links = (row?.links ?? []) as string[]
  const url = links[index]
  if (!row || typeof url !== 'string') return null
  // A click implies the message was opened, even when images were blocked.
  await db`update email_sends set click_count = click_count + 1, clicked_at = coalesce(clicked_at, now()),
    opened_at = coalesce(opened_at, now()) where id = ${row.id}`
  await db`insert into email_events (send_id, type, detail) values (${row.id}, 'click', ${url})`
  return url
}

export async function sendByToken(token: string) {
  const [row] = await sql()`select s.id, s.email, s.unsubscribed_at, c.status as contact_status
    from email_sends s left join email_contacts c on c.id = s.contact_id where s.token = ${token}`
  return row ?? null
}

export async function recordUnsubscribe(token: string): Promise<boolean> {
  const db = sql()
  const [row] = await db`update email_sends set unsubscribed_at = coalesce(unsubscribed_at, now()) where token = ${token} returning id, contact_id, email`
  if (!row) return false
  await db`update email_contacts set status = 'unsubscribed', status_changed_at = now(), updated_at = now()
    where (id = ${row.contact_id} or email = ${row.email}) and status = 'subscribed'`
  await db`insert into email_events (send_id, type) values (${row.id}, 'unsubscribe')`
  return true
}

/** Hard bounce reported by the mailbox poll. Returns false if this report was already recorded. */
export async function recordBounce(email: string, externalId: string, detail: string): Promise<boolean> {
  const db = sql()
  const [event] = await db`insert into email_events (type, detail, external_id) values ('bounce', ${`${email}: ${detail}`.slice(0, 2000)}, ${externalId})
    on conflict (external_id) do nothing returning id`
  if (!event) return false
  const [send] = await db`update email_sends set status = 'bounced', bounced_at = now()
    where id = (select id from email_sends where email = ${email} and status = 'sent' order by sent_at desc limit 1) returning id`
  if (send) await db`update email_events set send_id = ${send.id} where id = ${event.id}`
  await db`update email_contacts set status = 'bounced', status_changed_at = now(), updated_at = now()
    where email = ${email} and status = 'subscribed'`
  return true
}

export async function sendsForThreads(threadIds: string[]) {
  if (!threadIds.length) return []
  const rows = await sql()`select id, gmail_thread_id from email_sends where gmail_thread_id in ${sql()(threadIds)}`
  return rows.map((r) => ({ id: num(r.id), threadId: String(r.gmail_thread_id) }))
}

export async function recordReply(sendId: number, externalId: string, snippet: string): Promise<boolean> {
  const db = sql()
  const [event] = await db`insert into email_events (send_id, type, detail, external_id) values (${sendId}, 'reply', ${snippet.slice(0, 500)}, ${externalId})
    on conflict (external_id) do nothing returning id`
  if (event) await db`update email_sends set replied_at = coalesce(replied_at, now()) where id = ${sendId}`
  return Boolean(event)
}

export async function knownEventIds(ids: string[]): Promise<Set<string>> {
  if (!ids.length) return new Set()
  const rows = await sql()`select external_id from email_events where external_id in ${sql()(ids)}`
  return new Set(rows.map((r) => String(r.external_id)))
}

export async function recentReplies(limit: number) {
  const rows = await sql()`
    select e.created_at, e.detail, s.email, c.name as campaign
    from email_events e join email_sends s on s.id = e.send_id join email_campaigns c on c.id = s.campaign_id
    where e.type = 'reply' order by e.created_at desc limit ${limit}`
  return rows
}
