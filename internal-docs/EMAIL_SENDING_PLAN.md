# Fundraising email

Scope from the October 2, 2026 proposal to Al (approved by the trustees October 25): email sending from the Foundation's own domain, admin-panel management of fundraising emails and lead lists, and domain authentication and warm-up. There is no outside CRM or email service; everything runs through the Foundation's Google Workspace and this site's Neon database.

Admins manage everything at `/admin/email` (the **Email** button on the admin dashboard).

## How it works

- **Sending:** through the Gmail API as `EMAIL_SENDER` (`info@dpefoundation.org`), using a Google Cloud service account with domain-wide delegation (`lib/email/gmail.ts`). Each recipient gets their own message, never a BCC blast. Sent mail appears in that mailbox's Sent folder, and replies arrive in its inbox.
- **Queue:** `lib/email/runner.ts`. Each send is claimed atomically, so overlapping runs never double-send. Messages go out about one per second, up to the daily limit (a rolling 24 hours, set in the admin). If Gmail returns a rate limit or server error, the run stops and the message is retried. A send that was cut off mid-way is marked failed, not retried, because a duplicate appeal is worse than a missed one.
- **What drives the queue:** the campaign page in the admin, every few seconds while it is open. There is no background job or cron: close the page and sending pauses, and it resumes when the campaign is opened again. Once the daily limit is hit, the rest goes out when the page is opened the next day.
- **Deliverability built in:**
  - A one-click `List-Unsubscribe` header (RFC 8058) and a visible unsubscribe link. One is added automatically if a template lacks it.
  - A plain-text part generated from the HTML.
  - A `Feedback-ID` header for each campaign, used by Postmaster Tools.
  - Suppression of unsubscribed, bounced and complained contacts, enforced at queue time and again at send time.
  - Re-importing a contact never resubscribes them.
- **Tracking:**
  - Clicks: `/e/c/<token>/<n>`. It only redirects to links the campaign contained when it was queued.
  - Opens: `/e/o/<token>`. Approximate, because of Apple Mail Privacy Protection and image blocking.
  - Unsubscribe: `/e/u/<token>`. A GET shows a confirmation, so link scanners can't unsubscribe anyone; a POST unsubscribes.
  - Bounces and replies: the sending mailbox is polled for delivery-failure reports (hard bounces only) and for replies in campaign threads.
- **Templates:** the three appeal emails in `emails/` appear in the campaign editor. The merge fields are `{{FirstName}}`, `{{FirstName|Brother}}` (with a fallback), `{{LastName}}`, `{{DONATE_URL}}`, `{{DESIGNATION_FORM_URL}}` and `{{UnsubscribeURL}}`. The editing notes at the top of each template are stripped before sending.

## Go-live checklist

The **Setup & settings** tab on `/admin/email` checks the Gmail connection and the DNS records live.

1. **Database:** run `db/email.sql` once on the DPE Neon database. It is idempotent.
2. **Google Cloud** (any project, owned by the Foundation's Workspace):
   - Enable the Gmail API.
   - Create a service account and a JSON key.
   - In the dpefoundation.org Admin console (Security → API controls → Domain-wide delegation), add the service account's client ID with these scopes:
     `https://www.googleapis.com/auth/gmail.send,https://www.googleapis.com/auth/gmail.readonly`
3. **Vercel env:**
   - `GOOGLE_SERVICE_ACCOUNT_JSON`: the key file contents
   - `EMAIL_SENDER`: `info@dpefoundation.org`
   - Optional: `EMAIL_PUBLIC_BASE_URL`, which defaults to `https://dpefoundation.org`
4. **DNS at the registrar (GoDaddy; nameservers ns51/ns52.domaincontrol.com).** As of October 25, 2026, the MX record already points to Google, but these three are missing:
   - SPF, TXT on `dpefoundation.org`: `v=spf1 include:_spf.google.com ~all`
   - DKIM: in the Admin console, go to Apps → Google Workspace → Gmail → Authenticate email and generate a 2048-bit key. Add the TXT record at `google._domainkey`, wait for DNS, then click **Start authentication**.
   - DMARC, TXT on `_dmarc.dpefoundation.org`: `v=DMARC1; p=none; rua=mailto:info@dpefoundation.org`. Move to `p=quarantine` once the reports are clean.
5. Register the domain in [Google Postmaster Tools](https://postmaster.google.com).
6. Send a test to yourself from the campaign editor and check that Gmail's "Show original" reports SPF, DKIM and DMARC as PASS.
7. **Warm up:** keep the daily limit at 50 in week 1, then 100, 250, 500 and 1,000. Send to trustees first, then brothers, then the wider community. Keep the spam rate in Postmaster Tools under 0.1%.

## Code

| Path | What |
|---|---|
| `db/email.sql` | Tables: contacts, lists, campaigns, sends, events, settings |
| `lib/email/gmail.ts` | Service-account auth and Gmail API calls |
| `lib/email/render.ts` | Merge fields, link tracking, pixel, unsubscribe, plain text |
| `lib/email/mime.ts` | Raw message with the unsubscribe headers |
| `lib/email/store.ts` | All database queries |
| `lib/email/runner.ts`, `bounce.ts` | Queue runner and mailbox poll |
| `lib/email/health.ts` | Gmail and DNS checklist |
| `app/admin/email/` | Admin UI |
| `app/api/admin/email/` | Admin API (signed admin cookie required) |
| `app/e/` | Public open, click and unsubscribe endpoints |

Tests: `npm run test:email` for the unit tests, and `scripts/email-e2e/` for the full flow against a throwaway database and a mock Gmail.
