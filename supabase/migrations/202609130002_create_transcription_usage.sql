-- Migration: transcription_usage
-- Giorno 3 — Fase 1
-- Traccia consumo parole per piano free. Verifica scope §3.2: checkout/licenza fuori MVP,
-- ma tabella predisposta per quando il limite verrà attivato (limite parole mensile su free).
-- Se il limite non è ancora attivo, la tabella resta vuota e la Edge Function non blocca.
--
-- RLS: utente legge solo il proprio consumo; scrittura solo da Edge Function (service_role).
-- Nessun contenuto trascrizione salvato (privacy).

create table if not exists public.transcription_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  words_transcribed integer not null default 0 check (words_transcribed >= 0),
  period_start date not null,
  period_end date not null,
  created_at timestamptz not null default now(),
  constraint transcription_usage_period_check check (period_end >= period_start),
  constraint transcription_usage_unique_user_period unique (user_id, period_start)
);

create index if not exists transcription_usage_user_id_idx on public.transcription_usage(user_id);
create index if not exists transcription_usage_period_idx on public.transcription_usage(period_start, period_end);

alter table public.transcription_usage enable row level security;

drop policy if exists "transcription_usage_select_own" on public.transcription_usage;
create policy "transcription_usage_select_own"
  on public.transcription_usage for select
  to authenticated
  using (auth.uid() = user_id);

-- Nessuna policy insert/update/delete per authenticated → solo service_role (Edge Function) scrive.

comment on table public.transcription_usage is 'Consumo parole per utente/periodo. RLS: select own, write solo service_role. Nessun testo trascritto salvato.';

-- Nota: limite free (es. 10_000 parole/mese) verificato in Edge Function transcribe-audio:
-- SELECT words_transcribed WHERE user_id = auth.uid() AND period = current_month
-- Se words_transcribed + new_words > limit → 429 con messaggio chiaro.
