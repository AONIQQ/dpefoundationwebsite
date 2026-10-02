# DPE database and scholarship feedback

Source: Supabase project `feocmpaoiuifvzhjdtny`, seven public tables and thirteen storage buckets. Destination: dedicated Neon resource `dpe-foundation-neon` (`proud-star-95115511`) in the existing Neon integration of the `info@aoniqq.com` Vercel account. Other websites' databases are not reused.

`lib/data-store.ts` uses Neon when server-only `DATABASE_URL` is present, and the Supabase service key otherwise. Database reads and mutations run through server routes. The public Supabase key is used only for uploads. Admin file viewing uses five-minute signed URLs. Documents remain in Supabase Storage and have separate local checksum backups.

## Preservation and cutover

1. Export the schema, all seven tables, bucket metadata and every file to a private directory outside Git. Record row counts and SHA-256 hashes.
2. Create the dedicated destination using `db/neon-schema.sql`. Import original IDs, timestamps, nulls and notes; advance identity/serial sequences. Preserve the shared Weiss/LeMoine sequence.
3. Compare every row using schema-aware canonicalization (ISO UTC timestamps and bigint IDs as strings), not just counts.
4. Verify submit/read/delete, forged-session rejection, admin access and signed-file delivery against Neon. Remove only uniquely marked synthetic records.
5. Deploy the server changes first on Supabase. Freeze source writes before the final snapshot. Import and compare it before connecting production to Neon. Keep Supabase as a read-only rollback source.
6. Remove public database read/update/delete privileges and make the application buckets private after deploying the server file route. Keep insert permission for uploads and verify it still works.
7. Verify production by submitting a synthetic narrative, reading it through committee login, confirming it exists in Neon, then deleting that exact record. Verify admin tables and preserved files too.

A rollback must copy all post-cutover Neon changes back to Supabase before removing `DATABASE_URL` and the source write-freeze triggers. Do not point the app at a stale source or delete the source project/backups.

## Verification

`node --env-file=/private/path/dpe.env scripts/smoke-scholarships.cjs https://dpefoundation.org`

The environment must point at the same Neon database as the server and include admin/committee credentials. Optional `DPE_QA_FILE_BUCKET` / `DPE_QA_FILE_PATH` verify a preserved file; `DPE_QA_PROOF_FILE` saves the result. The script creates and cleans up uniquely tagged synthetic records.

Brothers submit at `https://dpefoundation.org/scholarships/input`; name and email are optional. The committee uses its separate password at `https://dpefoundation.org/committee/scholarship-comments`. Database administrators can technically access stored comments. The ready-to-send email body is `emails/scholarship-feedback-to-al.md`.
