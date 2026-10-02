# DPE database and scholarship feedback

Source: Supabase project `feocmpaoiuifvzhjdtny`, seven public tables and thirteen storage buckets. Destination: dedicated Neon resource `dpe-foundation-neon` (`proud-star-95115511`) in the existing Neon integration of the `info@aoniqq.com` Vercel account. Other websites' databases are not reused.

`lib/data-store.ts` uses Neon exclusively. Private documents are in `dpe-foundation-documents` (`store_6cHi1pChmFkXiTxT`), with original bucket/key paths preserved. Admin download routes authenticate every request and stream private Blob contents. New applications upload through short-lived tokens limited to approved paths, document MIME types and 20 MB. Sessions use an independent `SESSION_SIGNING_SECRET`. No runtime Supabase dependency remains.

## Preservation and cutover

1. Export the schema, all seven tables, bucket metadata and every file to a private directory outside Git. Record row counts and SHA-256 hashes.
2. Create the dedicated destination using `db/neon-schema.sql`. Import original IDs, timestamps, nulls and notes; advance identity/serial sequences. Preserve the shared Weiss/LeMoine sequence.
3. Compare every row using schema-aware canonicalization (ISO UTC timestamps and bigint IDs as strings), not just counts.
4. Verify submit/read/delete, forged-session rejection, admin access and signed-file delivery against Neon. Remove only uniquely marked synthetic records.
5. Deploy the server changes first on Supabase. Freeze source writes before the final snapshot. Import and compare it before connecting production to Neon. Keep Supabase as a read-only rollback source.
6. Remove public database read/update/delete privileges and make the application buckets private after deploying the server file route. Keep insert permission for uploads and verify it still works.
7. Verify production by submitting a synthetic narrative, reading it through committee login, confirming it exists in Neon, then deleting that exact record. Verify admin tables and preserved files too.

The historical cutover steps above describe the original database migration. Before retiring the source, copy all 143 documents, compare every destination SHA-256 hash, reconcile the final source inventory and verify live admin downloads and new uploads. Preserve the private schema, records, files and checksum backup outside Git. A future restoration must use the current Neon and Blob state; the historical source is stale.

## Verification

`node --env-file=/private/path/dpe.env scripts/smoke-scholarships.cjs https://dpefoundation.org`

The environment must point at the same Neon database as the server and include admin/committee credentials. Optional `DPE_QA_FILE_BUCKET` / `DPE_QA_FILE_PATH` verify a preserved file; `DPE_QA_PROOF_FILE` saves the result. The script creates and cleans up uniquely tagged synthetic records.

Brothers submit at `https://dpefoundation.org/scholarships/input`; name and email are optional. The committee uses its separate password at `https://dpefoundation.org/committee/scholarship-comments`. Database administrators can technically access stored comments. The ready-to-send email body is `emails/scholarship-feedback-to-al.md`.
