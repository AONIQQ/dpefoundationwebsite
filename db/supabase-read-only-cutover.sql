-- Run in the Supabase source ONLY, immediately before the final export.
-- Preserves every row; blocks stale deployments from writing after cutover.
BEGIN;
CREATE OR REPLACE FUNCTION public.dpe_migration_read_only() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'DPE database migrated; this source is retained read-only';
END;
$$;
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['scholarship_comments','bleakley_scholarship_submissions','weiss_scholarship_submissions','butts_scholarship_submissions','lemoine_scholarship_submissions','contact_form_submissions','heartbeats'] LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgrelid=format('public.%I',t)::regclass AND tgname='dpe_migration_freeze') THEN
      EXECUTE format('CREATE TRIGGER dpe_migration_freeze BEFORE INSERT OR UPDATE OR DELETE ON public.%I FOR EACH STATEMENT EXECUTE FUNCTION public.dpe_migration_read_only()',t);
    END IF;
    EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated',t);
  END LOOP;
END;
$$;
-- Uploaded files remain here and are opened only through signed admin URLs.
UPDATE storage.buckets SET public=false WHERE id IN ('applications','proofs','fsot','weiss-applications','weiss-attendance-proof','weiss-intern-proof','butts-applications','butts-attendance-proof','butts-requirements','lemoine-applications','lemoine-resumes','lemoine-transcripts','lemoine-recommendations');
REVOKE SELECT, UPDATE, DELETE ON storage.objects FROM anon, authenticated;
COMMIT;
