# Deploy e ambiente — VoiceFlow (Web + Desktop + Mobile)

Note operative sul monorepo. Il deploy Vercel riguarda **solo il Web** (root Next.js);
Desktop (`desktop/`) si distribuisce con installer `electron-builder`, Mobile (`mobile/`)
con build store — vedi i rispettivi README.

## Vercel

| Campo | Valore |
|-------|--------|
| Progetto | `voiceflow` |
| Scope | `Vertex` (`vertex-9`) — il team `StackUp` non esiste: `stackup` è un *progetto* dentro Vertex |
| Root Directory | **(root)** — il progetto Next è nella root del repo |
| Framework | Next.js |
| Production branch | `main` |

- Push su `main` → deploy di produzione.
- Pull request → preview automatica.
- Deploy manuale: `vercel --prod` (dalla root)

Root Directory su Vercel: **vuota/root** (il progetto Next è nella root del repo;
`desktop/` e `mobile/` sono esclusi dal deploy — nessun `vercel.json` necessario).

URL:

- Produzione → <https://voiceflow-voice.vercel.app>
- Alias precedenti: `voiceflow-flax.vercel.app`, `voiceflow-vertex-9.vercel.app`, `voiceflow-git-main-vertex-9.vercel.app`

## Environment Variables su Vercel

Vanno impostate per **Production** e **Preview**:

| Variabile | Scope | Note |
|-----------|-------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | client + server | pubblica |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client + server | pubblica |
| `SUPABASE_SERVICE_ROLE_KEY` | solo server | **mai** esposta al client |
| `STRIPE_SECRET_KEY` | solo server | placeholder finché non c'è checkout |
| `STRIPE_WEBHOOK_SECRET` | solo server | placeholder |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | client | placeholder |

Senza le `NEXT_PUBLIC_SUPABASE_*` la landing funziona comunque (è statica), ma auth/licenze reali no.

## Env Desktop e Mobile (non Vercel, non committate)

| Progetto | File / modo | Variabili |
|----------|-------------|-----------|
| Desktop (`desktop/`) | `desktop/.env` (da `.env.example`, gitignored) | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (pubbliche), `VITE_LICENSE_KEY` opzionale |
| Mobile (`mobile/`) | flag `--dart-define` a `flutter run/build` | `SUPABASE_URL`, `SUPABASE_ANON_KEY` (mai hardcodate) |
| Edge Functions | `supabase secrets set` | `OPENAI_API_KEY` (**solo server**, mai nel bundle né nei client) |

## Supabase

Il progetto Supabase deve essere **dedicato a VoiceFlow**: non riusare progetti di altri prodotti,
per isolamento dei dati.

Stato attuale (Opzione 2 — proxy puro Whisper):

- Edge Functions condivise da Desktop e Mobile: `transcribe` (legacy), `transcribe-audio`
  (primaria, usata da `desktop/src/main/transcription.ts` e
  `mobile/lib/services/transcription_service.dart`), `apply-mode` (stub `501`, fuori MVP).
- Deploy: `supabase functions deploy transcribe transcribe-audio apply-mode` (dalla root).
- Unica migration attiva: `202609130010_newsletter_signups.sql` (tabella `newsletter_signups`,
  RLS insert-only). Le tabelle `licenses` / `transcription_usage` del Giorno 3 sono state rimosse.

## Verifica locale

Web (richiede **Node.js 20.9+**, Next 16):

```bash
npm install
cp .env.example .env.local
npx tsc --noEmit
npm run build
npm run dev
```

Desktop:

```bash
cd desktop && npm install && npm run typecheck && npm run build
```

Mobile (richiede Flutter SDK ≥ 3.4):

```bash
cd mobile && flutter pub get && flutter analyze && flutter test
```
