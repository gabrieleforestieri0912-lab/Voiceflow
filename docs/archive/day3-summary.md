# VoiceFlow — Riepilogo Giorno 3 (Backend API, Proxy AI e Database)

> Branch: `feature/voiceflow-day3-api-db-20260913-125259`
> Data: 2026-09-13
> Regola: nessun push su `main`, PR non mergiata, checkpoint tra fasi, RLS obbligatoria, nessuna chiave AI nel bundle.

## Prerequisito

PR Giorno 2 (`feature/voiceflow-day2-onboarding-*`) **non risulta mergiata** su `main` al 2026-09-13 (verificato `git log main..HEAD` in Web e Desktop). Branch Giorno 3 creato comunque da `feature/voiceflow-day2-*` senza push su `main`. Se vuoi mergiare Giorno 2 prima, rebaso su `main` aggiornato.

## Fase 1 — Schema database (Supabase)

**Migration (identiche in Web e Desktop `supabase/migrations/`):**

- `202609130001_create_licenses.sql` — `licenses(id uuid, user_id uuid→auth.users nullable, license_key text unique, plan free/pro, status active/revoked, activated_devices int default 0, max_devices int default 3, created_at)`. RLS: `licenses_select_own` → `auth.uid()=user_id`, scrittura solo `service_role` (Edge Function). Chiave generata server-side.
- `202609130002_create_transcription_usage.sql` — `transcription_usage(id, user_id→auth.users, words_transcribed int, period_start/end date, unique user+period)`. RLS: `transcription_usage_select_own`, scrittura solo `service_role`. Nessun testo trascritto salvato (privacy).

**Vincolo privacy:** nessuna tabella salva contenuto trascrizioni cloud per default. Solo contatori parole e metadati licenza.

**Checkpoint 1 — vedi `docs/day3-checkpoint1.md`:** script SQL per test RLS con due utenti (verifica isolamento), istruzioni `supabase link` + `supabase db push`. Senza progetto Supabase live collegato (verificato `vercel env ls` = 0 vars, `.env.local` solo `VERCEL_OIDC_TOKEN`), il test RLS va eseguito dopo collegamento progetto dedicato.

## Fase 2 — Edge Functions proxy + client main

**Edge Functions (`supabase/functions/` in entrambi i repo):**

- `transcribe` (legacy Giorno 1/2, `verify_jwt=true`) — mantenuta per compatibilità.
- `transcribe-audio` (nuova primaria) — `POST multipart/form-data { audio, language?, vocabulary? } → { text } | { error, code }`. Autenticata via `Authorization: Bearer <JWT>` o `x-license-key`, verifica `licenses` e quota `transcription_usage` (free limit default 10000 parole/mese via `FREE_MONTHLY_WORD_LIMIT`), rate-limit IP, timeout 75s verso Whisper, errori strutturati (`QUOTA_EXCEEDED` 429, `UPSTREAM_*` 502, `AUDIO_TOO_LARGE` 413, ecc.), sempre `{ error, code }` mai crash, `OPENAI_API_KEY` solo env Edge Function.
- `apply-mode` (stub Fase 2) — `POST JSON { text, mode, vocabulary? }` valida input, verifica `OPENAI_API_KEY`, risponde `501 NOT_IMPLEMENTED` finché Modes non sono in scope MVP (`docs/scope.md` §3.2 fuori scope). Quando attivi, qui `POST https://api.openai.com/v1/chat/completions`.

`supabase/config.toml` aggiornato con `[functions.transcribe-audio]` e `[functions.apply-mode]` (`verify_jwt=false` per gestire JWT+license_key manualmente).

**Client HTTP main (superficie attacco minima):**

- `Desktop/voiceflow/src/main/transcription.ts` — fetch dal **processo main** (non renderer), `Buffer`→`Blob`→`FormData`, header `apikey`/`Authorization`/`x-license-key`, timeout 30s, retry max 2 tentativi (1 retry su 5xx/rete/timeout), gestione quota senza retry, errori strutturati.
- `Desktop/voiceflow/src/main/index.ts` — `ipcMain.handle("transcription:transcribe")` ora chiama `transcribeInMain`.
- `Desktop/voiceflow/src/services/transcription/client.ts` — `transcribeAudio(blob, language, vocabulary?)` preferisce `window.voiceflow.invoke("transcription:transcribe", { audioBase64, mimeType, ... })` (via `blobToBase64`), fallback fetch diretto per smoke/test con stesso retry.

**Checkpoint 2 — vedi `docs/day3-checkpoint2.md`:** istruzioni `supabase secrets set` + `supabase functions deploy`, test end-to-end (hold Ctrl+Space → `transcribe-audio` → `input:injectText`), gestione rete assente / provider down / risposta malformata, verifica bundle senza chiavi.

**Nessuna chiave nel bundle — verificato:**
```bash
npm run build && grep -r "OPENAI_API_KEY\|sk-" dist-electron/ dist/ || echo "OK"
# Atteso: solo VITE_SUPABASE_URL/ANON_KEY (pubbliche), mai sk-/service_role
```
`OPENAI_API_KEY` vive solo come `supabase secrets set OPENAI_API_KEY=...`.

## Fase 3 — Storico locale e vocabolario custom

**Verifica scope:** `docs/scope.md` §3.2 li dichiara **FUORI scope MVP** (vocabolario custom, cronologia ricercabile, meeting assistant). Fase 3 quindi **rimandata**.

**Scaffolding predisposto (Desktop):**

- `src/services/storage/history.ts` — stub `addHistoryEntry`/`getHistory`/`purgeExpired` con retention 30 giorni, schema SQLite futuro commentato. Oggi in-memory non persistito.
- `src/services/storage/vocabulary.ts` — stub `getVocabulary`/`addVocabularyTerm`/`removeVocabularyTerm`/`getVocabularyTermsForPrompt`, persistenza attuale via `electron-store`, schema SQLite futuro, `transcribe-audio` già supporta `vocabulary` come `prompt` Whisper.
- UI vocabolario nelle impostazioni rimandata a Fase 2.

**Checkpoint 3 — vedi `docs/day3-checkpoint3.md`:** design tabelle SQLite, retention, dimostrazione prima/dopo vocabolario (quando attivo).

## Chiusura giornata

- PR da `feature/voiceflow-day3-api-db-20260913-125259` → `main`. **Non mergiare** (in attesa conferma checkpoint).
- Schema finale: `licenses` + `transcription_usage` con RLS, nessun contenuto trascrizione cloud.
- Edge Functions: `transcribe` (legacy), `transcribe-audio` (con quota), `apply-mode` (stub).
- Conferma privacy: `OPENAI_API_KEY` solo secret Edge Function, mai nel bundle; audio non salvato, testo non loggato.
- Prossimi passi: `supabase link --project-ref <ref>` + `supabase db push` + `supabase functions deploy transcribe transcribe-audio apply-mode` + test RLS a due utenti + test end-to-end registra→trascrivi→incolla.

## File toccati / nuovi (Web)

- `supabase/migrations/202609130001_create_licenses.sql` (nuovo)
- `supabase/migrations/202609130002_create_transcription_usage.sql` (nuovo)
- `supabase/config.toml` (nuovo/aggiornato)
- `supabase/functions/transcribe-audio/index.ts` (nuovo)
- `supabase/functions/apply-mode/index.ts` (nuovo)
- `supabase/functions/transcribe/index.ts` (copiato da Desktop per coerenza)
- `tsconfig.json` (exclude supabase)
- `docs/day3-checkpoint1.md`, `day3-checkpoint2.md`, `day3-checkpoint3.md`, `day3-summary.md` (nuovi)

## File toccati / nuovi (Desktop)

- `supabase/migrations/202609130001_create_licenses.sql` (nuovo)
- `supabase/migrations/202609130002_create_transcription_usage.sql` (nuovo)
- `supabase/config.toml` (aggiornato)
- `supabase/functions/transcribe-audio/index.ts` (nuovo)
- `supabase/functions/apply-mode/index.ts` (nuovo)
- `src/main/transcription.ts` (nuovo)
- `src/main/index.ts` (transcription:transcribe via main)
- `src/services/transcription/client.ts` (IPC + retry max 2 + vocabulary)
- `src/services/storage/history.ts`, `src/services/storage/vocabulary.ts` (stub Fase 3)
- `.env.example` (VITE_LICENSE_KEY, FREE_MONTHLY_WORD_LIMIT)
- `docs/day3-checkpoint*.md`, `docs/day3-summary.md` (copie)
