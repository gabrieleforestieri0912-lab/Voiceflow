-- newsletter_signups — RLS insert-only da anon key
create table if not exists public.newsletter_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null check (email ~* '^[^@]+@[^@]+\.[^@]+$'),
  created_at timestamptz not null default now(),
  unique(email)
);
alter table public.newsletter_signups enable row level security;
drop policy if exists "allow_insert_anon" on public.newsletter_signups;
create policy "allow_insert_anon" on public.newsletter_signups for insert to anon, authenticated with check (true);
-- no select/update/delete for anon (insert-only)
