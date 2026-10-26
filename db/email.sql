-- Fundraising email: contacts, lists, campaigns, per-recipient sends and the
-- events (opens, clicks, unsubscribes, bounces, replies) recorded against them.
-- See internal-docs/EMAIL_SENDING_PLAN.md.
--
-- Run once in the DPE Neon database. Idempotent and safe to re-run.

CREATE TABLE IF NOT EXISTS email_contacts (
  id               bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email            text NOT NULL UNIQUE CHECK (email = lower(email) AND char_length(email) BETWEEN 3 AND 320),
  first_name       text CHECK (first_name IS NULL OR char_length(first_name) <= 200),
  last_name        text CHECK (last_name IS NULL OR char_length(last_name) <= 200),
  -- Anything but 'subscribed' is never sent to again; the queue enforces it.
  status           text NOT NULL DEFAULT 'subscribed' CHECK (status IN ('subscribed', 'unsubscribed', 'bounced', 'complained')),
  source           text CHECK (source IS NULL OR char_length(source) <= 200),
  notes            text CHECK (notes IS NULL OR char_length(notes) <= 5000),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  status_changed_at timestamptz
);

CREATE TABLE IF NOT EXISTS email_lists (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name        text NOT NULL UNIQUE CHECK (char_length(name) BETWEEN 1 AND 100),
  description text CHECK (description IS NULL OR char_length(description) <= 1000),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS email_list_members (
  list_id    bigint NOT NULL REFERENCES email_lists(id) ON DELETE CASCADE,
  contact_id bigint NOT NULL REFERENCES email_contacts(id) ON DELETE CASCADE,
  added_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (list_id, contact_id)
);
CREATE INDEX IF NOT EXISTS email_list_members_contact ON email_list_members (contact_id);

CREATE TABLE IF NOT EXISTS email_campaigns (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name         text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200),
  subject      text NOT NULL DEFAULT '' CHECK (char_length(subject) <= 300),
  html         text NOT NULL DEFAULT '' CHECK (char_length(html) <= 500000),
  status       text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sending', 'paused', 'done')),
  -- Tracked link targets, frozen when the campaign is first queued, so a click
  -- URL (/e/c/<token>/<index>) can only ever redirect to a link the campaign
  -- actually contained.
  links        jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  queued_at    timestamptz,
  completed_at timestamptz
);

CREATE TABLE IF NOT EXISTS email_sends (
  id               bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  campaign_id      bigint NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
  contact_id       bigint REFERENCES email_contacts(id) ON DELETE SET NULL,
  email            text NOT NULL,
  -- Random, unguessable; used in tracking and unsubscribe URLs.
  token            text NOT NULL UNIQUE,
  status           text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sending', 'sent', 'failed', 'skipped', 'bounced')),
  error            text,
  gmail_message_id text,
  gmail_thread_id  text,
  queued_at        timestamptz NOT NULL DEFAULT now(),
  claimed_at       timestamptz,
  sent_at          timestamptz,
  opened_at        timestamptz,
  open_count       integer NOT NULL DEFAULT 0,
  clicked_at       timestamptz,
  click_count      integer NOT NULL DEFAULT 0,
  unsubscribed_at  timestamptz,
  bounced_at       timestamptz,
  replied_at       timestamptz,
  UNIQUE (campaign_id, contact_id)
);
CREATE INDEX IF NOT EXISTS email_sends_queue ON email_sends (status, id);
CREATE INDEX IF NOT EXISTS email_sends_sent_at ON email_sends (sent_at);
CREATE INDEX IF NOT EXISTS email_sends_thread ON email_sends (gmail_thread_id);
CREATE INDEX IF NOT EXISTS email_sends_email ON email_sends (email);

CREATE TABLE IF NOT EXISTS email_events (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  send_id     bigint REFERENCES email_sends(id) ON DELETE CASCADE,
  type        text NOT NULL CHECK (type IN ('open', 'click', 'unsubscribe', 'bounce', 'reply')),
  detail      text,
  -- Gmail message id for bounce/reply events, so the mailbox poll never
  -- records the same message twice.
  external_id text UNIQUE,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS email_events_send ON email_events (send_id);

CREATE TABLE IF NOT EXISTS email_settings (
  id          integer PRIMARY KEY CHECK (id = 1),
  -- Rolling 24-hour limit. Start low and raise it as the domain warms up;
  -- Google Workspace allows about 2,000 per user per day.
  daily_cap   integer NOT NULL DEFAULT 50 CHECK (daily_cap BETWEEN 0 AND 1900),
  from_name   text NOT NULL DEFAULT 'Delta Phi Epsilon Foundation' CHECK (char_length(from_name) BETWEEN 1 AND 100),
  reply_to    text CHECK (reply_to IS NULL OR char_length(reply_to) <= 320),
  -- Stops every campaign at once without touching their individual states.
  paused      boolean NOT NULL DEFAULT false,
  last_poll_at timestamptz,
  updated_at  timestamptz NOT NULL DEFAULT now()
);
INSERT INTO email_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

INSERT INTO email_lists (name, description) VALUES
  ('Trustees', 'Foundation trustees'),
  ('Brothers', 'Past and current Delta Phi Epsilon members'),
  ('Community', 'Friends of the Foundation, the Fraternity and Georgetown')
ON CONFLICT (name) DO NOTHING;
