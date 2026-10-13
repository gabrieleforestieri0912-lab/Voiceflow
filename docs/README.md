# VoiceFlow — Docs

Monorepo: **Web** (root Next.js) + **Desktop** (`desktop/`, Electron) + **Mobile** (`mobile/`, Flutter).

```
.                        # repo unico — https://github.com/gabrieleforestieri0912-lab/Voiceflow
├── app/                 # Web: App Router (`/`, `/download`, `/desktop`)
├── components/landing/  # Web: sezioni landing (Fase 0-9)
├── lib/                 # Web: animations.ts / content.ts / compat.ts / models.ts / supabase/
├── supabase/            # condiviso: config.toml, functions/, migrations/
│   ├── functions/       # transcribe (legacy) / transcribe-audio (primaria) / apply-mode (stub)
│   └── migrations/      # 202609130010_newsletter_signups.sql (RLS insert-only)
├── desktop/             # App Electron — vedi desktop/README.md
│   └── src/             # main / preload / renderer / services
├── mobile/              # App Flutter — vedi mobile/README.md
│   └── lib/             # app / screens / services
└── docs/                # ← sei qui
    ├── scope.md         # Scope Giorno 1 (storico, resta per riferimento)
    ├── deploy.md        # Deploy Vercel (Web) + env desktop/mobile
    ├── landing/         # Fase 0-9 landing (phase-gated)
    └── archive/         # Day 1-3 summaries (storici, layout pre-monorepo)
```

## Regole

- Un solo repo Git (`main` su GitHub). Web, Desktop e Mobile convivono senza dipendenze
  incrociate: il typecheck/build web esclude `desktop/` e `mobile/` (vedi `tsconfig.json`),
  ognuno ha `package.json` / `pubspec.yaml` e `.gitignore` propri.
- Supabase è condiviso come progetto cloud: Edge Functions `transcribe-audio` usata sia da
  `desktop/src/main/transcription.ts` sia da `mobile/lib/services/transcription_service.dart`
  (stesso contratto `multipart { audio, language? } → { text }`). Nessuna chiave AI nel bundle,
  mai: `OPENAI_API_KEY` solo secret Edge Function, chiavi mobile solo via `--dart-define`.
- Opzione 2 — proxy puro Whisper: nessuna tabella licenze/utilizzo (rimosse, vedi commit
  `48e4222`); unica migration attiva `newsletter_signups`, futura tabella solo Web.
- Landing segue branch `landing/<fase>-<timestamp>` → PR → main, STOP tra fasi.

## Landing — stato fasi

- Fase 0 — Setup design system: `landing/fase0-setup.md` (tokens originari + nota evoluzione
  successiva: accento giallo, toggle chiaro/scuro, Inter + Geist Mono)
- Fase 1-9 — Navbar, Hero, marquee loghi, compatibilità, modelli locali, integrazioni,
  showcase, testimonial, pricing 3 piani, FAQ, footer: **complete e su `main`**
  (vedi `git log --oneline`, commit `e53efb1` merge Fase 0-9 + iterazioni del 2026-10-13)
