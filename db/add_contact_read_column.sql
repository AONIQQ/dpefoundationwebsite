-- Adds a `read` flag to contact form submissions so the admin dashboard can
-- mark messages as read / unread.
--
-- Run this once in the Supabase project (Dashboard → SQL Editor) before the
-- "mark as read" feature will persist. It is idempotent and safe to re-run.
-- (Deleting submissions does not require this column.)

ALTER TABLE contact_form_submissions
  ADD COLUMN IF NOT EXISTS read boolean NOT NULL DEFAULT false;
