# VoiceFlow — Web + Desktop + Mobile

Landing, download e (in prospettiva) gestione licenza per **VoiceFlow**, dettatura vocale
push-to-talk: tieni premuto, parli, rilasci, e il testo viene incollato nell'app attiva.

- **Web:** Next.js (App Router) + TypeScript + Tailwind CSS + Supabase. Deploy su **Vercel**.
- **Desktop:** Electron + TypeScript + Vite + React (`desktop/`, Windows).
- **Mobile:** Flutter (`mobile/`, Android + iOS).

🌐 **Live:** <https://voiceflow-voice.vercel.app>

## Struttura

```
.
├── app/                 # Next.js App Router: `/` (landing), `/download`, `/desktop`
│   ├── desktop/page.tsx # anteprima overlay desktop + compatibilità + modelli locali
│   └── download/page.tsx# requisiti + privacy + istruzioni
├── components/
│   ├── ui/              # shadcn/ui (button, card, tabs, sheet, dialog, accordion…)
│   └── landing/         # sezioni landing: Navbar, Hero, LogoMarquee, Compatibility,
│                        # LocalModels, Integrations, Pricing, Faq, Tutorials, Mobile…
├── lib/
│   ├── animations.ts    # varianti Framer Motion (solo transform/opacity)
│   ├── content.ts       # copy centralizzata
│   ├── compat.ts        # matrice compatibilità input
│   ├── models.ts        # catalogo modelli AI locali
│   ├── supabase/        # client browser/server
│   └── utils.ts
├── supabase/
│   ├── config.toml      # Edge Functions transcribe / transcribe-audio / apply-mode
│   ├── functions/       # proxy Whisper (nessuna chiave nel bundle)
│   └── migrations/      # newsletter_signups (RLS insert-only)
├── desktop/             # app Electron (tray, hotkey, overlay, impostazioni) — vedi desktop/README.md
├── mobile/              # app Flutter (push-to-talk Android/iOS) — vedi mobile/README.md
├── public/              # voiceflow-icon.svg + asset statici
└── docs/
    ├── scope.md         # scope Giorno 1 (storico)
    ├── deploy.md        # deploy Vercel + env
    ├── landing/         # fase 0-9 (phase-gated)
    └── archive/         # day summaries Giorno 1-3 (storici)
```

## Requisiti

- Node.js 20+ e npm
- Un progetto **Supabase dedicato a VoiceFlow** (isolamento dati: non riusare progetti di altri prodotti)

## Avvio

Web (dalla root):

```bash
npm install
cp .env.example .env.local   # riempi i placeholder
npm run dev                  # http://localhost:3000
```

Desktop e mobile hanno README e dipendenze proprie:

```bash
cd desktop && npm install && npm run dev   # Electron (vedi desktop/README.md)
cd mobile && flutter pub get && flutter run # Flutter (vedi mobile/README.md, richiede Flutter SDK)
```

Altri comandi:

```bash
npm run build    # build di produzione
npm run start    # serve la build
npx tsc --noEmit # typecheck
```

## Variabili d'ambiente

In `.env.local` (gitignored). Vedi `.env.example`.

| Variabile | Dove vive | Note |
|-----------|-----------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | client + server | pubblica |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client + server | pubblica |
| `SUPABASE_SERVICE_ROLE_KEY` | **solo server** | mai nel client |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | **solo server** | placeholder finché non c'è checkout |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | client | placeholder |

## Deploy

Vercel, progetto `voiceflow` (scope `Vertex` / `vertex-9`), **Root Directory vuota (root)**,
framework Next.js. Git integration attiva su `main`: ogni push su `main` deploya in produzione,
ogni PR ottiene una preview automatica.

- Produzione → <https://voiceflow-voice.vercel.app> (`/` e `/download`)
- Deploy manuale da CLI: `vercel --prod` (dalla root)

Dettagli e checklist in [`docs/deploy.md`](docs/deploy.md).

Prima di usare auth/licenze reali, le variabili `NEXT_PUBLIC_SUPABASE_*` (e la service role, lato
server) vanno impostate anche nelle **Environment Variables** del progetto Vercel, per Production e
Preview.

## Stato

- **Web:** landing Fase 0–9 completa (19 sezioni: Navbar, Hero cielo-alba, LogoMarquee, Compatibility,
  LocalModels, Integrations, Pricing 3 piani, Faq, Tutorials, Mobile, footer…), tema chiaro/scuro
  con toggle (`darkMode: "class"`), pagine `/download` e `/desktop`, newsletter `newsletter_signups`
  (migration RLS insert-only). Design tokens correnti in `app/globals.css` (accento giallo `#FFD60A`,
  palette sezioni verde/blu/rosso) + `tailwind.config.ts`
- **Desktop** (`desktop/`): scaffolding Electron verificato il 2026-10-13 — `typecheck` e `build` OK
  (`dist-electron/` + `dist/renderer/`); loop hold→trascrivi→incolla da completare su Windows reale
- **Mobile** (`mobile/`): scaffolding Flutter completo (UI long-press + `TranscriptionService` verso
  `transcribe-audio`); `flutter analyze/test` da eseguire dopo installazione Flutter SDK (assente su
  questa macchina)

Vedi `docs/README.md` e `docs/landing/fase0-setup.md` per dettaglio fasi.
