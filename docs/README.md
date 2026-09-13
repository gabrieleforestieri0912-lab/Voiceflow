# VoiceFlow — Docs

Struttura documentazione dopo separazione **Web / Desktop**.

```
Vertex/
├── Web/voiceflow/          # Sito Next.js (questo repo)
│   ├── app/                # App Router
│   ├── components/landing/ # Sezioni landing (Fase 1-9)
│   ├── lib/animations.ts / content.ts
│   └── docs/               # ← sei qui
│       ├── scope.md        # Scope condiviso Giorno 1 (storico, resta per riferimento)
│       ├── deploy.md       # Deploy Vercel (Web)
│       ├── landing/        # Fase 0-9 landing (phase-gated)
│       └── archive/        # Day 1-3 summaries desktop/web precedenti
└── Desktop/voiceflow/      # App Electron (repo separato)
    ├── src/                # main / renderer / services
    ├── supabase/functions/ # transcribe / transcribe-audio / apply-mode
    └── docs/               # scope.md + day summaries desktop
```

## Regole

- **Web** e **Desktop** sono repo Git separati con remote diversi (`voiceflow` Web su GitHub, Desktop senza remote locale). Nessuna cartella condivisa, nessuna dipendenza incrociata.
- Supabase è condiviso come progetto cloud ma le migration vivono solo dove servono: oggi nessuna tabella DB necessaria (opzione 2 — proxy puro Whisper), futura `newsletter_signups` vivrà solo in Web.
- Landing segue branch `landing/<fase>-<timestamp>` → PR → main, STOP tra fasi.

## Landing — stato fasi

- Fase 0 — Setup design system: `landing/fase0-setup.md` (palette scura teal/indigo, Geist, tokens, shadcn, framer-motion)
- Fase 1 — Navbar + Hero: in corso `landing/hero-demo-*`
