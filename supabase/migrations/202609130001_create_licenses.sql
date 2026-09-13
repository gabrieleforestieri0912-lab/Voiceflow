-- Migration: licenses
-- Giorno 3 — Fase 1
-- Tabella licenze: una licenza per utente (o pre-acquisto senza user_id).
-- license_key generato SOLO server-side via Edge Function (service_role), mai dal client.
-- RLS: utente vede solo la propria licenza; scrittura solo via service_role (Edge Function).

-- Estensione per gen_random_uuid se non già presente
create extension if not exists "pgcrypto";

create table if not exists public.licenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  license_key text not null unique,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  status text not null default 'active' check (status in ('active', 'revoked')),
  -- Contatore device attivi; limite massimo 3 di default (enforced in Edge Function).
  activated_devices integer not null default 0 check (activated_devices >= 0),
  max_devices integer not null default 3 check (max_devices > 0),
  created_at timestamptz not null default now()
);

-- Indici
create unique index if not exists licenses_license_key_key on public.licenses(license_key);
create index if not exists licenses_user_id_idx on public.licenses(user_id);

-- RLS obbligatoria
alter table public.licenses enable row level security;

-- Policy: utente autenticato legge solo la propria licenza (user_id = auth.uid())
drop policy if exists "licenses_select_own" on public.licenses;
create policy "licenses_select_own"
  on public.licenses for select
  to authenticated
  using (auth.uid() = user_id);

-- Nessuna policy di insert/update/delete per authenticated → solo service_role può scrivere.
-- service_role bypassa RLS di default, quindi la Edge Function (con service_role key)
-- è l'unico writer. Chi tenta insert diretto da client riceve 0 rows / permission denied.

-- Commento vincolo privacy: nessun contenuto trascrizione salvato qui.
comment on table public.licenses is 'Licenze VoiceFlow. license_key generato solo via Edge Function (service_role). RLS: select solo own.';

-- Helper function (opzionale) per generazione chiave server-side — usata solo da Edge Function
-- Non esposta al client. La Edge Function genera chiave con crypto random e fa insert via service_role.
