# Privacy and security release checklist

This checklist is based on a local review of the private working repository. It deliberately identifies locations and data classes without reproducing sensitive values.

## Remove from the public export

- [ ] Exclude the entire `graphify-out/` directory. A generated cache contains a string shaped like a Twilio credential/identifier, and generated graphs duplicate private documentation and code context.
- [ ] Exclude private operations documents, runbooks, smoke-test records, issue-resolution logs, task logs, launch notes, and deployment notes unless rewritten for public use.
- [ ] Exclude `docs/refresh-pact-days-cron.md`; it contains a specific Supabase project URL. The same path appears in Git history.
- [ ] Exclude or replace the complete-rules Google Docs link in `docs/PRD.md`; verify the document's sharing settings separately.
- [ ] Exclude all real phone numbers, names, message bodies, proof media, storage URLs, database exports, screenshots of dashboards/logs, and live test transcripts.
- [ ] Exclude local `.env*` files other than the placeholder-only `.env.example`, Supabase local state, CLI caches, logs, CSV/TSV exports, and database files.
- [ ] Export only `public-portfolio/` into a new repository. Do not make the current private repository public or copy its `.git` directory.

## Rotate or verify manually

- [ ] Rotate Twilio auth tokens/API keys and review active keys, webhook destinations, messaging logs, and subaccounts before publication.
- [ ] Rotate the Supabase service-role key, internal scheduled-job secret, database password, and any deployed function secrets that ever existed in local files, chat transcripts, shell history, CI logs, or shared documents.
- [ ] Review the specific Supabase project referenced by the private cron documentation; replace its project reference if concealing infrastructure identity matters.
- [ ] Review GitHub Actions, repository variables/secrets, deployment integrations, branch protection, collaborator access, and webhook configuration.
- [ ] Audit the Google document linked from the PRD for names, comments, revision history, and public-sharing scope; publish a newly sanitized copy if needed.
- [ ] Review all four Git author identities in repository history for personal names or email addresses. A fresh-history export avoids carrying them into the portfolio repository.
- [ ] Revoke or replace any beta invitation codes and synthetic/test accounts used against a live environment.
- [ ] Confirm proof-media buckets are private, old signed URLs are expired, and test/production records follow a documented retention and deletion policy.

## Before publishing screenshots or demos

- [ ] Use invented names, reserved fictional phone numbers, synthetic pact IDs, and a non-production Supabase/Twilio environment.
- [ ] Crop browser chrome, bookmarks, account avatars, project references, request IDs, and dashboard navigation that could reveal identity or infrastructure.
- [ ] Remove image metadata and inspect every frame of GIF/video demos.
- [ ] Ensure message timestamps, goals, proof images, and monetary amounts cannot be linked to real participants.
- [ ] Run an automated secret scanner against both the export and its Git history, then manually inspect every finding.

## Audit notes

- No private-key block, database connection URI, or JWT-shaped token was detected by the local pattern scan of tracked files.
- Environment access in the reviewed Edge Functions generally uses environment-variable lookups; this does not prove that secrets never existed in history or external systems.
- A generated Graphify cache produced one Twilio-shaped finding. Treat it as sensitive until manually classified, and exclude generated graph artifacts regardless.
- Pattern scanning cannot prove absence. Complete the rotations above when a credential may ever have been exposed.

