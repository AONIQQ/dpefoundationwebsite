-- Brotherhood comments on the new scholarship program.
--
-- Run this once in the Supabase project (Dashboard -> SQL Editor). It is
-- idempotent and safe to re-run.
--
-- Access model: row level security is ON and NO policies are defined, so the
-- public (anon) key and any logged-in user can neither read nor write this
-- table. Only the server-side routes, which use the service-role key, touch it:
--   POST /api/scholarship-comments   (brothers submit a comment)
--   /api/committee/comments          (Scholarship Committee reads / deletes,
--                                     behind the committee password)
-- Do not add a SELECT policy: it would expose the comments to anyone who has
-- the site's public key.

CREATE TABLE IF NOT EXISTS scholarship_comments (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at  timestamptz NOT NULL DEFAULT now(),
  name        text CHECK (name IS NULL OR char_length(name) <= 200),
  email       text CHECK (email IS NULL OR char_length(email) <= 320),
  comments    text NOT NULL CHECK (char_length(comments) BETWEEN 10 AND 10000)
);

ALTER TABLE scholarship_comments ENABLE ROW LEVEL SECURITY;

-- Belt and braces: Supabase grants table privileges to anon/authenticated by
-- default; take them away so the table is closed even if RLS is ever disabled.
REVOKE ALL ON scholarship_comments FROM anon, authenticated;
