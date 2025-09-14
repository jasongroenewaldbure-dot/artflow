Supabase setup (SQL, RLS, storage, schedules, Edge Functions)

This folder contains database SQL and Edge Functions scaffolding required by ArtFlow.

Prereqs:
- Supabase project with pgvector extension enabled
- Supabase CLI installed
- Service role key available locally for function testing

Apply SQL in order:
1. sql/00_extensions.sql
2. sql/01_rls_policies.sql
3. sql/02_triggers.sql
4. sql/03_rpcs.sql
5. sql/04_schedules.sql
6. sql/05_storage.sql

Commands:
- supabase db push (or apply files manually in the dashboard SQL editor in order)
- supabase functions deploy <name> --project-ref <ref>

Environment variables (Dashboard → Project Settings → Functions):
- OPENAI_API_KEY (for embeddings)
- SERVICE_ROLE_KEY (restricted secret, used by server-invoked functions)
- ROOM_SCENE_URL, BENCH_REAL_WIDTH_M, BENCH_PIXEL_WIDTH (visualization)
- PAYFAST_MERCHANT_ID, PAYFAST_PASSPHRASE

Cron/schedules:
- If pg_cron enabled, 04_schedules.sql creates nightly jobs for learned preferences and digest emails.
- Alternatively, create Scheduled Edge Function invocations via Supabase Dashboard and call the RPCs.

Security notes:
- RLS is enabled by default; policies are permissive only for owners/admins as declared.
- Storage buckets use per-bucket RLS and signed URL flows for private assets.


