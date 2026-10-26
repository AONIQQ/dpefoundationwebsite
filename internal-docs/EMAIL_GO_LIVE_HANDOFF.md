# Handoff: take DPE fundraising email live

You are picking up finished, tested code and making it work in production. Work on Andrew's computer, using his logins for GitHub, Vercel, Neon, the Google Workspace and Google Cloud consoles for dpefoundation.org, and GoDaddy. Ask Andrew whenever a login or approval is needed. Don't guess, and don't change anything not listed here.

## Context

- **Repo and branch:** `aoniqq/dpefoundationwebsite`, branch `claude/email-infrastructure`. It is pushed but not merged; `main` doesn't have it yet. The branch also contains the earlier commit with the plan doc.
- **What it does:** the Foundation's fundraising emails are sent through the Gmail API as `info@dpefoundation.org`, using a Google Cloud service account with domain-wide delegation. There is no outside email service and no cost. Admins manage campaigns, contacts and lists at `https://dpefoundation.org/admin/email`, behind the existing admin login.
- **No background job:** sending runs only while an admin has a sending campaign open in that page. There is no cron and nothing to schedule.
- **Full design and file map:** `internal-docs/EMAIL_SENDING_PLAN.md`. Read it first.
- **Hosting:** the site runs on Vercel under the `info@aoniqq.com` account. The database is the dedicated Neon project `dpe-foundation-neon`, and its URL is the `DATABASE_URL` env var in Vercel.
- **Workspace:** dpefoundation.org is on Google Workspace (Business Starter, 3 users). The domain is at **GoDaddy** (nameservers ns51/ns52.domaincontrol.com), in Joe Picozzi's account.
- **Current DNS** (checked October 25, 2026): MX already points to `smtp.google.com`. **SPF, DKIM and DMARC are all missing.**
- **Already verified:** build, lint, `npm run test:email` (10 unit tests), and the full flow end to end against a local Postgres and a mock Gmail (`scripts/email-e2e/`). It has **not** yet sent through real Google.

## Steps

1. **Review and merge.** Read the diff on `claude/email-infrastructure` and run `npm ci && npm run build && npm run lint && npm run test:email`. Open a PR to `main` and merge it once Andrew approves.

2. **Database.** Run `db/email.sql` once against the production Neon database. Use the Neon SQL editor or `psql "$DATABASE_URL" -f db/email.sql`. It is idempotent and only creates `email_*` tables plus three starter lists (Trustees, Brothers, Community). Don't run anything else against production.

3. **Google Cloud** (signed in as a dpefoundation.org admin; create a project if there is none):
   - Enable the **Gmail API**.
   - Create a service account (for example `dpe-mailer`) and a **JSON key**. Treat the key as a secret: don't commit it, paste it into chat or save it anywhere but Vercel.
   - If the org policy `iam.disableServiceAccountKeyCreation` blocks key creation, ask Andrew before changing it.

4. **Domain-wide delegation.** In the Google Admin console for dpefoundation.org, go to Security → Access and data control → API controls → Manage domain-wide delegation → Add new. Use the service account's numeric **client ID** with exactly these scopes:
   `https://www.googleapis.com/auth/gmail.send,https://www.googleapis.com/auth/gmail.readonly`

5. **Vercel env** (Production) for the dpefoundation.org project:
   - `GOOGLE_SERVICE_ACCOUNT_JSON`: the entire JSON key file contents
   - `EMAIL_SENDER`: `info@dpefoundation.org`

   Then redeploy.

6. **DKIM.** In Google Admin, go to Apps → Google Workspace → Gmail → Authenticate email, select dpefoundation.org and generate a new record with a **2048-bit** key and the `google` prefix. Add the TXT record it shows in GoDaddy (step 7). Once the record resolves, which can take up to about an hour, come back and click **Start authentication**.

7. **GoDaddy DNS** for dpefoundation.org. Add records only; don't touch the existing MX or the `google-site-verification` TXT.
   - TXT, host `@`: `v=spf1 include:_spf.google.com ~all`. If an SPF record already exists by then, merge into it rather than adding a second one.
   - TXT, host `google._domainkey`: the DKIM value from step 6.
   - TXT, host `_dmarc`: `v=DMARC1; p=none; rua=mailto:info@dpefoundation.org`

8. **Verify:**
   - Log into `https://dpefoundation.org/admin`, click **Email**, then **Setup & settings**. All five checks should be green: Gmail API access, MX, SPF, DKIM, DMARC.
   - Create a campaign from the members appeal template and send a **test** to Andrew's address. In Gmail, open it, go to ⋮ → Show original, and confirm **SPF, DKIM and DMARC all PASS** and that the From is `info@dpefoundation.org`.
   - Click the donate link in the test. It should land on `/donate`. Test sends aren't tracked, by design.
   - Don't send a real campaign. Andrew and the Fundraising Committee decide when that happens.

9. **Postmaster Tools.** Add dpefoundation.org at https://postmaster.google.com, and verify it with the TXT record it gives you in GoDaddy.

10. **Report back to Andrew:**
    - What was done and the result of each Setup check.
    - The Show original authentication results.
    - Anything that needed a decision.

    Remind him of the warm-up plan:
    - Keep the daily limit at 50 in week 1, then 100, 250, 500 and 1,000.
    - Send to trustees first, then brothers, then the community.
    - Keep the campaign page open while a campaign sends.

## Not part of this task

- **Invoice:** invoice AON-2026-1025-01 ($5,302.40) is a draft in Andrew's Gmail (info@aoniqq.com), in the "Payment" thread with Al Grasso, with Sanjay Mullick and Eddie Deschapelles cc'd. Andrew attaches the PDF and sends it himself. Don't send it.
- **Contact lists:** importing them is a later step, once Sanjay and the Fraternity provide them. The admin page has a CSV import.
