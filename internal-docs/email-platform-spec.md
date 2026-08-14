# Email + Contact Platform: Build Spec

Extending the existing DPE admin dashboard into the Foundation's fundraising outreach tool,
replacing the need for a paid external CRM.

Status: draft for scoping and quoting. Revised August 2026, after Donorbox went live and the
Fundraising Committee set the giving levels and designation taxonomy.

---

## 1. Why build instead of subscribe

The Foundation already has the hard parts: a Supabase database, an authenticated admin
dashboard the trustees have been trained on, and a live Next.js site. The marginal cost of
adding list management and campaign sending to that dashboard is far lower than the
recurring cost of a donor CRM, and it avoids putting a second system in front of a
non-technical, all-volunteer board.

Scope discipline is what makes this true. See section 9 for what is deliberately excluded.

---

## 2. Architecture

Three layers, each doing what it is good at:

| Layer | Tool | Purpose |
|---|---|---|
| Mailboxes | Google Workspace | info@dpefoundation.org, human replies, day to day mail |
| Sending engine | Resend (or Amazon SES) | Bulk API sending, bounce + complaint webhooks |
| Control panel | Existing admin dashboard | Contacts, segments, campaigns, reporting |

### Why a separate sending engine is required

Google Workspace is not a practical bulk sender, for four reasons in descending order of
importance. Note that the reason is practical rather than contractual: Google's acceptable
use policy bans *unsolicited* mass mail, not opt-in bulk mail, and at this volume the
Foundation never reaches the 5,000-per-day bulk sender threshold.

1. **No bounce or complaint webhooks.** Without them there is no automatic suppression, and
   automatic suppression is the actual legal requirement. This alone rules Workspace out.
2. **Reputation contamination.** Complaints against bulk mail degrade delivery of the
   Foundation's ordinary mail on the same domain.
3. **Hard caps.** Gmail allows a maximum of 500 external recipients per message and 3,000
   external recipients per day, so a single appeal has to be chopped into batches.
4. **No delivery reporting** and no one-click unsubscribe infrastructure.

Workspace and the sending API coexist. Workspace keeps the mailboxes, the API does the sending.

### DNS layout

Bulk sending is authenticated on a dedicated subdomain so its reputation is isolated from
the root domain that carries the Foundation's real mail.

```
dpefoundation.org           MX      -> Google Workspace
dpefoundation.org           TXT     -> SPF (include Google)
google._domainkey           TXT     -> Google DKIM
_dmarc.dpefoundation.org    TXT     -> DMARC policy (covers root + subdomains)

mail.dpefoundation.org      TXT     -> SPF (include ESP)
resend._domainkey.mail      TXT     -> ESP DKIM
mail.dpefoundation.org      MX/CNAME-> ESP Return-Path / bounce handling
```

Campaigns send as `From: Joseph S. Picozzi <news@mail.dpefoundation.org>` with
`Reply-To: info@dpefoundation.org`, matching the signature on the three appeal letters.
Replies land in the Gmail inbox the trustees already use, so nothing changes on their end.

**Prerequisite:** `info@dpefoundation.org` must exist and be monitored before the first send.
All three appeals invite replies about stock gifts, donor-advised funds, and major gifts, and
the printable designation form asks donors to send back a mailing address. A reply-to that
bounces would lose exactly the highest-value responses.

### Boundary with Donorbox

Donorbox is live at `donorbox.org/delta-phi-epsilon-foundation` and is the system of record
for money. Verified against Donorbox's own documentation, its free Standard plan:

- **does** handle checkout, per-gift receipts, donor records for people who gave, giving
  history, notes, and CSV export
- **does not** send campaigns of any kind (its automated mail is purely transactional)
- **does not** allow self-serve import of people who have never donated
- **does not** allow saving a segment as a reusable list, which it labels a paid CRM feature

So this build does not duplicate anything Donorbox provides on the current plan. Campaign
sending exists only in the separate Donorbox CRM add-on, which is quoted per contact, is not
publicly priced, and is currently sales-gated behind a waitlist. Worth getting that quote
before committing to the build, since it is the one thing that could make the email module
redundant.

**Optional later:** Donorbox offers webhooks (`donation.created`, `donation.updated`) for
$17/month on the Standard plan, which would let gift records flow into Supabase so the
dashboard could show giving history beside a contact. Explicitly out of scope for this build,
noted here so the schema does not preclude it.

---

## 3. Database schema

New tables in the existing Supabase project. All admin access goes through server-side API
routes using the service role key, consistent with the existing `/api/admin/contact` pattern.
The anon key gets no access to these tables.

```sql
-- People we can contact
create table contacts (
  id            bigserial primary key,
  email         citext not null unique,
  first_name    text,
  last_name     text,
  -- 'trustee' | 'member' | 'community'
  audience      text not null default 'community',
  -- free-form tags for ad hoc segmentation (e.g. 'alpha-chapter', 'class-of-1978')
  tags          text[] not null default '{}',
  -- 'subscribed' | 'unsubscribed' | 'bounced' | 'complained'
  status        text not null default 'subscribed',
  source        text,            -- where the record came from (import file, contact form)
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index on contacts (audience);
create index on contacts (status);
create index on contacts using gin (tags);

-- Named, reusable segments
create table segments (
  id          bigserial primary key,
  name        text not null,
  description text,
  -- declarative filter, e.g. {"audience":["member"],"tags_any":["alpha-chapter"]}
  filter      jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

-- A single send
create table campaigns (
  id            bigserial primary key,
  name          text not null,             -- internal label
  subject       text not null,
  preheader     text,
  from_name     text not null default 'Delta Phi Epsilon Foundation',
  from_email    text not null,
  reply_to      text not null default 'info@dpefoundation.org',
  html_body     text not null,
  -- 'draft' | 'sending' | 'sent' | 'failed'
  status        text not null default 'draft',
  segment_id    bigint references segments(id),
  audience      text,                      -- convenience filter if no segment
  scheduled_at  timestamptz,
  sent_at       timestamptz,
  created_at    timestamptz not null default now()
);

-- One row per recipient per campaign. Gives idempotency and per-person status.
create table campaign_recipients (
  id            bigserial primary key,
  campaign_id   bigint not null references campaigns(id) on delete cascade,
  contact_id    bigint not null references contacts(id) on delete cascade,
  email         citext not null,           -- snapshot at send time
  -- 'pending' | 'sent' | 'delivered' | 'bounced' | 'complained' | 'failed' | 'skipped'
  status        text not null default 'pending',
  provider_id   text,                      -- ESP message id, for webhook correlation
  error         text,
  sent_at       timestamptz,
  unique (campaign_id, contact_id)         -- prevents double-sending on retry
);
create index on campaign_recipients (campaign_id, status);
create index on campaign_recipients (provider_id);

-- Raw ESP event log (delivered, bounced, complained, opened, clicked)
create table email_events (
  id            bigserial primary key,
  provider_id   text,
  campaign_id   bigint references campaigns(id) on delete set null,
  contact_id    bigint references contacts(id) on delete set null,
  event_type    text not null,
  payload       jsonb,
  occurred_at   timestamptz not null default now()
);

-- Hard block list. Checked at send time, never bypassed.
create table suppressions (
  id          bigserial primary key,
  email       citext not null unique,
  -- 'unsubscribe' | 'bounce' | 'complaint' | 'manual'
  reason      text not null,
  campaign_id bigint references campaigns(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- Signed unsubscribe tokens (or derive via HMAC and skip this table)
create table unsubscribe_tokens (
  token       text primary key,
  contact_id  bigint not null references contacts(id) on delete cascade,
  created_at  timestamptz not null default now()
);
```

---

## 4. API routes

All under `app/api/admin/*`, guarded by the existing `admin_session` cookie check. Note that
`middleware.ts` lets `/api/*` through without auth, so every route must check the cookie
itself, exactly as `app/api/admin/contact/route.ts` already does.

| Route | Method | Purpose |
|---|---|---|
| `/api/admin/contacts` | GET | List, search, filter, paginate |
| `/api/admin/contacts` | POST | Create one |
| `/api/admin/contacts` | PATCH | Edit, tag, change status |
| `/api/admin/contacts` | DELETE | Remove |
| `/api/admin/contacts/import` | POST | CSV upload, map columns, validate, dedupe, report |
| `/api/admin/contacts/export` | GET | CSV out (data portability) |
| `/api/admin/segments` | GET/POST/PATCH/DELETE | Saved segments |
| `/api/admin/campaigns` | GET/POST/PATCH/DELETE | Campaign CRUD |
| `/api/admin/campaigns/preview` | POST | Resolve recipient count for a segment |
| `/api/admin/campaigns/test` | POST | Send one test to a chosen address |
| `/api/admin/campaigns/send` | POST | Materialize recipients, enqueue, begin send |
| `/api/admin/campaigns/[id]/stats` | GET | Per-campaign delivery numbers |

Public, unauthenticated:

| Route | Method | Purpose |
|---|---|---|
| `/unsubscribe/[token]` | GET | Human-facing confirmation page |
| `/api/unsubscribe` | POST | RFC 8058 one-click target, and form submit |
| `/api/webhooks/email` | POST | ESP events. Verify signature. No cookie auth. |

---

## 5. Send pipeline

The part that deserves the most care.

1. **Resolve recipients.** Apply the segment filter, then remove anyone in `suppressions`
   or whose `contacts.status` is not `subscribed`. Insert one `campaign_recipients` row per
   person. The unique constraint on `(campaign_id, contact_id)` makes re-running safe.
2. **Batch.** Send in chunks sized to the ESP rate limit, with a short pause between
   batches. Resend and SES both accept batch endpoints.
3. **Per-recipient render.** Substitute merge fields and generate that person's unique
   unsubscribe URL, then inject `List-Unsubscribe` and
   `List-Unsubscribe-Post: List-Unsubscribe=One-Click` headers.

   The three existing templates in `/emails` already use these placeholders, so the renderer
   must resolve exactly this set:

   | Placeholder | Resolves to |
   |---|---|
   | `{{DONATE_URL}}` | the live Donorbox campaign, or `dpefoundation.org/donate` |
   | `{{DESIGNATION_FORM_URL}}` | `dpefoundation.org/donate/designation-form` |
   | `{{UnsubscribeURL}}` | per-recipient signed unsubscribe link |
   | `{{FirstName}}` | contact first name, with a sensible fallback when blank |

   A missing or misspelled placeholder must fail loudly at preview time rather than sending a
   letter containing a literal `{{DONATE_URL}}`.
4. **Record.** Store the ESP message id on the recipient row so webhook events can be
   correlated back.
5. **Retry.** Failed rows stay `pending` and can be retried without touching anyone already
   `sent`.
6. **Ingest events.** The webhook marks delivered, bounced, complained. Hard bounces and
   complaints write to `suppressions` automatically and flip `contacts.status`.

Because sends can exceed a serverless request timeout, the send runs as a background job
(Supabase scheduled function, or a queue table drained by a cron route) rather than inside
the HTTP request.

---

## 6. Admin UI

One new top-level tab in the existing dashboard, matching the current cream and gold design
system so it looks like part of the tool the trustees already know.

**Contacts**
- Table: name, email, audience, tags, status, date added
- Search and filter by audience, tag, status
- Inline edit, add single contact, delete
- Import CSV: upload, map columns, preview, show duplicates and invalid rows, confirm
- Export CSV

**Segments**
- Create a named segment from audience plus tag filters
- Live recipient count

**Campaigns**
- List of campaigns with status and headline stats
- Composer: name, subject, preheader, from name, reply-to, segment picker with live count
- Paste or upload the HTML from the three existing templates in `/emails`
- Side-by-side rendered preview
- Send test to an arbitrary address
- Confirm-and-send with an explicit recipient count in the confirmation
- Post-send report: sent, delivered, bounced, unsubscribed, complained

**Suppressions**
- Read-only list of blocked addresses and why, with manual add

---

## 7. Compliance requirements (non-negotiable)

These are the items a paid CRM would handle, and the reason the build cannot be trimmed
below this line.

- Every campaign includes a working unsubscribe link, unique per recipient.
- `List-Unsubscribe` and `List-Unsubscribe-Post` headers on every message (Google and Yahoo
  require one-click unsubscribe from bulk senders).
- Unsubscribes take effect immediately and permanently via the `suppressions` table, which
  is enforced at send time with no bypass.
- The Foundation's physical mailing address appears in every footer (already in the
  templates).
- Accurate From and Subject, no deceptive headers.
- Hard bounces and spam complaints auto-suppress, protecting sender reputation.
- SPF, DKIM, and DMARC all aligned before the first real send.

---

## 8. Build phases and estimate

Bottom-up, assuming the existing dashboard, auth, database, and design system are reused,
and the work is done by someone already fluent in this codebase.

### Phase 1: the necessary core

| # | Task | Hours |
|---|---|---|
| 1 | Schema and migrations | 1.5 |
| 2 | ESP account, domain, SPF/DKIM/DMARC, subdomain, verification | 2.5 |
| 3 | CSV import: upload, column mapping, validation, dedupe, error report | 3.0 |
| 4 | Contacts UI: table, search, filter, edit, tag | 3.0 |
| 5 | Segments: builder and live recipient count | 2.5 |
| 6 | Campaign composer: fields, HTML paste, preview, test send | 3.5 |
| 7 | Send pipeline: batching, rate limits, merge fields, retries, background job | 4.0 |
| 8 | Unsubscribe: tokens, public page, one-click endpoint, headers | 2.5 |
| 9 | Webhooks: signature verify, event ingest, auto-suppression | 2.5 |
| 10 | Send-time suppression enforcement and guards | 1.0 |
| 11 | Reporting: per-campaign delivery stats | 2.0 |
| 12 | QA: seed data, live test sends, edge cases | 2.5 |
| 13 | Documentation and a training session for the board | 2.5 |
| | **Phase 1 total** | **~33** |

Realistic range: **28 to 36 hours**, depending mostly on how clean the existing contact
lists turn out to be.

### Phase 2: optional, later

| Task | Hours |
|---|---|
| Open and click tracking with per-campaign charts | 3 |
| Saved template library (store the 3 templates in-app) | 2 |
| Scheduled sends | 2 |
| A/B subject line testing | 3 |
| Duplicate-and-edit a past campaign | 1 |

### Separately variable: data import

Cleaning and consolidating the Foundation's existing records is the least predictable line
item. If the lists arrive as a single clean CSV, it folds into task 3 above. If they arrive
as several inconsistent spreadsheets, paper records, or old mailing lists, budget an
additional 3 to 8 hours for normalization, deduplication across sources, and validation.

---

## 9. Explicitly out of scope

Naming these protects both sides. The build stays cheap because it stays narrow.

- Donation and gift records, pledges, recurring gift tracking. The payment platform
  (Stripe, Donorbox, or whatever the board selects) is the system of record for money.
- Tax acknowledgment letter generation and mail merge.
- Soft credits, household grouping, major gift pipelines, moves management.
- Event or ticketing management.
- Accounting integration.
- Marketing automation: drip sequences, behavioral triggers, lead scoring.
- Multi-user roles and permissions beyond the current single admin login.

If the board later wants genuine donor CRM functionality, that is a separate decision and
a real CRM is likely the right answer for it. This system is deliberately an outreach tool,
not a fundraising database.

---

## 10. Ongoing cost after build

| Item | Cost |
|---|---|
| Sending API at this volume | roughly $0 to $20 per month |
| Supabase | existing, no change |
| Vercel hosting | existing, no change |
| Google Workspace | existing, possibly $0 if the nonprofit edition applies |

Compared to a donor CRM subscription, which recurs indefinitely and rises with contact
count.
