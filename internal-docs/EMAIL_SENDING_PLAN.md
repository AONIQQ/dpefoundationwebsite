# Fundraising email sending

Scope from the October 2, 2026 proposal to Al (approved by the trustees October 25): email sending from the Foundation's own domain, admin-panel management of fundraising emails and lead lists, and domain authentication and warm-up. No outside CRM or email service; everything runs through the Foundation's existing Google Workspace and this site's Neon database.

## Sending path

- The site sends through the **Gmail API** as `info@dpefoundation.org` (or `give@`), using a Google Cloud service account with domain-wide delegation limited to the `gmail.send` and `gmail.readonly` scopes. Neither the API nor the service account costs anything.
- Each recipient gets their own message, with no BCC blasts, so merge fields, unsubscribe links and tracking work per person.
- Google Workspace allows about 2,000 messages per user per day. The queue sends about one message per second and stops at a configurable daily cap that is well under that limit.
- Sends land in the `info@` Sent folder, and replies come back to the same inbox, so trustees can see the conversations in Gmail.

## Deliverability

1. DNS at the registrar (Joe Picozzi's account):
   - SPF: `v=spf1 include:_spf.google.com ~all`
   - DKIM: a 2048-bit key generated in Admin console → Apps → Gmail → Authenticate email.
   - DMARC: start with `p=none; rua=mailto:info@dpefoundation.org`, then move to `quarantine` once the reports are clean.
2. Every message carries `List-Unsubscribe` and `List-Unsubscribe-Post: List-Unsubscribe=One-Click` (RFC 8058), a plain-text part alongside the HTML, and a visible unsubscribe link.
3. Suppression: unsubscribes, hard bounces and complaints are never sent to again. This is enforced in the queue, not the UI.
4. Warm-up: ramp the daily cap (roughly 50 → 100 → 250 → 500 → 1,000) and send to the most engaged list first (trustees, then brothers, then the wider community, which matches the rollout plan).
5. Register the domain in Google Postmaster Tools to watch reputation and spam rate.
6. Links use only `dpefoundation.org` URLs, with no shorteners.

## Tracking

- **Clicks:** links are rewritten to `/e/c/<token>`, which logs the click and redirects. The donate link carries the campaign tag so gifts can be traced back to a campaign.
- **Opens:** a 1×1 pixel at `/e/o/<token>`. Reported as approximate, because Apple Mail Privacy Protection and Gmail's image proxy inflate or mask opens.
- **Unsubscribes:** `/e/u/<token>`, with a one-click POST plus a confirmation page.
- **Bounces and replies:** the sender polls the `info@` mailbox through the Gmail API for mailer-daemon DSNs (hard bounces suppress the address) and for replies in campaign threads.
- Tokens are random per-send IDs stored in the database, so they reveal nothing about the recipient.

## Admin dashboard (`/admin` → Email)

- **Contacts and lists:** CSV import with column mapping and de-duplication by lowercased email, tags/lists (Trustees, Brothers, Community), manual add/edit, and suppression status.
- **Campaigns:** compose from the existing templates in `emails/`, merge fields (`{{FirstName}}`, donate and designation-form URLs), preview, a test send to yourself, then queue for a list. Campaigns can be paused and resumed.
- **Results:** per-campaign sent, bounced, opened (approximate), clicked, unsubscribed and replied counts, plus a per-recipient view.
- **Settings:** daily cap and warm-up stage, and the from name and reply-to address.

## Data (Neon)

`email_contacts`, `email_lists`, `email_list_members`, `email_campaigns`, `email_sends` (one row per recipient per campaign: status, token, Gmail message/thread id, timestamps), `email_events` (open, click, unsubscribe, bounce, reply). Migration lives in `db/email.sql`.

## Queue runner

`/api/email/run` sends the next batch within the daily cap and polls for bounces. It is protected by `CRON_SECRET` and called by Vercel Cron. If the Vercel plan only allows daily cron jobs, the campaign page also drives the queue while it is open, so a send never depends on one trigger.

## Needed before go-live

- A Google Cloud project with the Gmail API enabled, a service account key in Vercel env (`GOOGLE_SERVICE_ACCOUNT_JSON`), and domain-wide delegation granted in the dpefoundation.org Admin console.
- Registrar access for the SPF, DKIM and DMARC records.
- Contact lists from Sanjay and the Fraternity.
