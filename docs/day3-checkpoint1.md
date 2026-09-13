# Giorno 3 — Checkpoint 1 — Schema database + RLS

> Branch: `feature/voiceflow-day3-api-db-20260913-125259`
> Data: 2026-09-13
> Stato: **STOP — in attesa di conferma prima di Fase 2**

## Prerequisito

PR Giorno 2 (`feature/voiceflow-day2-onboarding-20260912-120028`) **non risulta mergiata** su `main` al momento del branch (verificato con `git log main..HEAD` e `git branch -a` in entrambi i repo Web/Desktop). Procedo su branch dedicato Giorno 3 senza push su `main`, come da regola. Se preferisci mergiare Giorno 2 prima, dimmi e rebaso.

## Migration create

Due file identici nei due repo (`Web/voiceflow/supabase/migrations` e `Desktop/voiceflow/supabase/migrations`), così il progetto Supabase condiviso è deployabile da entrambi:

- `202609130001_create_licenses.sql` — tabella `licenses` (`id`, `user_id` nullable FK → `auth.users`, `license_key` unique, `plan` free/pro, `status` active/revoked, `activated_devices` default 0, `max_devices` default 3, `created_at`). RLS enabled, policy `licenses_select_own` → `auth.uid() = user_id`, scrittura solo `service_role`.
- `202609130002_create_transcription_usage.sql` — tabella `transcription_usage` (`user_id`, `words_transcribed`, `period_start`, `period_end`) con unique per periodo, RLS `transcription_usage_select_own`, scrittura solo `service_role`.

**Vincolo privacy rispettato:** nessuna tabella salva testo trascritto. `transcription_usage` salva solo contatori parole, `licenses` solo metadati licenza. Se in futuro servisse storico cloud, serve tua conferma esplicita.

Verifica locale sintassi:
```bash
# dalla root del repo (Web o Desktop)
npx supabase db lint  # opzionale se Docker attivo
# oppure verifica manuale con psql / supabase SQL editor dopo `supabase db push`
```

## Test RLS con due utenti diversi (da eseguire su Supabase collegato)

> Senza progetto Supabase live collegato (`.env.local` senza `NEXT_PUBLIC_SUPABASE_URL` e Vercel senza env vars — verificato con `vercel env ls` = 0 vars), il test va eseguito dopo `supabase link --project-ref <ref>` e `supabase db push`. Sotto lo script SQL da incollare nel SQL Editor (come `postgres` / service_role) per creare due utenti di test e verificare l'isolamento.

```sql
-- Setup test RLS (esegui come service_role / postgres)
-- Crea due utenti fittizi in auth.users (se non hai già utenti reali)
-- Sostituisci gli UUID con quelli reali dei tuoi due utenti di test (da auth.users)

-- 1. Pulisci eventuali dati precedenti
delete from public.transcription_usage where user_id in ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002');
delete from public.licenses where user_id in ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002');

-- 2. Inserisci licenze come service_role (bypassa RLS)
insert into public.licenses (user_id, license_key, plan, status) values
  ('00000000-0000-0000-0000-000000000001', 'VF-TEST-USER-A-001', 'free', 'active'),
  ('00000000-0000-0000-0000-000000000002', 'VF-TEST-USER-B-001', 'pro', 'active');

insert into public.transcription_usage (user_id, words_transcribed, period_start, period_end) values
  ('00000000-0000-0000-0000-000000000001', 123, '2026-09-01', '2026-09-30'),
  ('00000000-0000-0000-0000-000000000002', 999, '2026-09-01', '2026-09-30');

-- 3. Verifica RLS come utente A (imposta auth.uid() = user A)
-- In SQL Editor: usa "Run as user" oppure setta JWT con supabase API:
-- Con supabase-js:
--   const supaA = createClient(url, anonKey); await supaA.auth.signInWithPassword({email:'a@test.com', password:'...'})
--   const { data: licA } = await supaA.from('licenses').select('*'); // deve vedere solo 1 riga (propria)
--   const { data: usageA } = await supaA.from('transcription_usage').select('*'); // solo propria

-- Test manuale via SQL con `set local role authenticated; set local request.jwt.claim.sub = '<uuid>'` se hai pgbouncer con jwt:
-- Oppure più semplice: verifica con due sessioni supabase-js come sopra e confronta i count.

-- Atteso:
-- Utente A vede: licenses = 1 (VF-TEST-USER-A-001), usage = 123
-- Utente B vede: licenses = 1 (VF-TEST-USER-B-001), usage = 999
-- Utente A NON vede licenza/usage di B e viceversa (RLS).
-- Tentativo di insert diretto da anon/authenticated: deve fallire (0 rows / 42501).
```

**Come verificare senza SQL manuale (client JS):**

```ts
import { createClient } from '@supabase/supabase-js';
const supaA = createClient(url, anonKey); // poi signIn come utente A
const { data: aLic } = await supaA.from('licenses').select('*');
console.assert(aLic?.length === 1 && aLic[0].license_key === 'VF-TEST-USER-A-001');

const supaB = createClient(url, anonKey); // signIn come utente B
const { data: bLic } = await supaB.from('licenses').select('*');
console.assert(bLic?.length === 1 && bLic[0].license_key === 'VF-TEST-USER-B-001');
// Se A prova a leggere B: RLS filtra, non vede nulla.
```

**Deploy migration su Supabase reale:**

```bash
supabase link --project-ref <project-ref>
supabase db push   # applica le due migration
# oppure: supabase migration up
```

## Prossimo passo

Conferma questo checkpoint per procedere a Fase 2 (Edge Functions `transcribe-audio` + `apply-mode` + client main con retry). Non tocco altro fino a tuo OK.
