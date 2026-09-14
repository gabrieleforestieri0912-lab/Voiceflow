# VoiceFlow — Documentazione

## Cos'è VoiceFlow

**VoiceFlow** è un'app di dettatura vocale push-to-talk **solo per Windows**. L'utente tiene premuta una hotkey globale, parla, rilascia: il testo trascritto viene incollato automaticamente nell'app attiva (Slack, Gmail, Word, Cursor, ecc.).

Il progetto è diviso in due repo separati:

- **Sito web** — questo repo (`Vertex/Web/voiceflow`): landing, pagina download e futura gestione licenze. Stack **Next.js App Router + TypeScript + Tailwind CSS + Supabase**, deploy su **Vercel**.
- **App desktop** — repo separato (`Vertex/Desktop/voiceflow`): prodotto vero e proprio in **Electron + TypeScript** (hook tastiera globale, cattura microfono, trascrizione via Whisper, iniezione `Ctrl+V`).

## Come funziona (flusso core)

```
[hotkey premuta] → [registrazione microfono] → [Edge Function Supabase → Whisper API] → [testo] → [clipboard + Ctrl+V nell'app attiva]
```

- Nessuna chiave API nel bundle: la trascrizione è proxata via Supabase Edge Function.
- Audio non salvato di default, privacy dichiarata in landing.

## Stack sito web

- **Next.js 16** (App Router), **React 19**, **Tailwind CSS 4**, **shadcn/ui**, **Framer Motion**
- **Supabase** (auth futura, tabella `newsletter_signups`)
- **Stripe** (placeholder, checkout fuori scope MVP)
- Deploy **Vercel** — progetto `voiceflow`, team `Vertex` (`vertex-9`), Root Directory `root`

Live: https://voiceflow-flax.vercel.app (`/` e `/download`)

## Struttura repo

```
.
├── app/                 # Next.js App Router
├── components/
│   ├── ui/              # shadcn/ui
│   └── landing/         # sezioni landing (Navbar, Hero, ecc.)
├── lib/
│   ├── supabase/        # client browser/server
│   ├── animations.ts
│   └── content.ts       # copy centralizzata
├── supabase/            # config e funzioni
└── docs/                # questa documentazione
```

## Avvio locale

```bash
npm install
# configura .env (vedi .env)
npm run dev              # http://localhost:3000
npm run build
npx tsc --noEmit
```

Variabili in `.env` (gitignored): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (solo server), `STRIPE_*`, `NEXT_PUBLIC_SITE_URL`.
