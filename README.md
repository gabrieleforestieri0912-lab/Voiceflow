# VoiceFlow — Sito web

Landing, download e (in prospettiva) gestione licenza per **VoiceFlow**, l'app di dettatura vocale
push-to-talk per Windows: tieni premuta una hotkey, parli, rilasci, e il testo viene incollato
nell'app attiva.

Stack: **Next.js (App Router) + TypeScript + Tailwind CSS + Supabase**. Deploy su **Vercel**.

> Questo repo contiene **solo il sito web**. L'app desktop (Electron + TypeScript) è un progetto
> separato in `Vertex/Desktop/voiceflow`.

🌐 **Live:** <https://voiceflow-flax.vercel.app>

## Struttura

```
.
├── app/                 # Next.js App Router: `/` (landing) e `/download`
├── components/
│   ├── ui/              # shadcn/ui (button, card, tabs, sheet, dialog…)
│   └── landing/         # Navbar, Hero, TrustBar… (uno per sezione, Fase 1-9)
├── lib/
│   ├── animations.ts    # varianti Framer Motion (solo transform/opacity)
│   ├── content.ts       # copy centralizzata
│   ├── supabase/        # client browser/server
│   └── utils.ts
└── docs/
    ├── scope.md         # scope Giorno 1 (storico)
    ├── deploy.md
    ├── landing/         # fase 0-9 (phase-gated)
    └── archive/         # day summaries precedenti
```

> Separazione: questo repo è **solo Web**. L'app desktop è `Vertex/Desktop/voiceflow` (Electron, repo Git separato). Nessuna cartella condivisa.

## Requisiti

- Node.js 20+ e npm
- Un progetto **Supabase dedicato a VoiceFlow** (isolamento dati: non riusare progetti di altri prodotti)

## Avvio

```bash
npm install
cp .env.example .env.local   # riempi i placeholder
npm run dev                  # http://localhost:3000
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

- Produzione → <https://voiceflow-flax.vercel.app> (`/` e `/download`)
- Deploy manuale da CLI: `vercel --prod` (dalla root)

Dettagli e checklist in [`docs/deploy.md`](docs/deploy.md).

Prima di usare auth/licenze reali, le variabili `NEXT_PUBLIC_SUPABASE_*` (e la service role, lato
server) vanno impostate anche nelle **Environment Variables** del progetto Vercel, per Production e
Preview.

## Stato

- Design system dark teal/indigo (`#0B0D10`, `#5EEAD4`, `#818CF8`) + Geist Sans/Mono, `lib/animations.ts`
- Fase 0 completa (`landing/setup-design-system-*`), Fase 1 in corso (`landing/hero-demo-*`)
- Pagina `/download` (requisiti + privacy + istruzioni dev)
- shadcn/ui + Framer Motion (solo GPU props), newsletter futura `newsletter_signups` (RLS insert-only)

Vedi `docs/README.md` e `docs/landing/fase0-setup.md` per dettaglio fasi.
