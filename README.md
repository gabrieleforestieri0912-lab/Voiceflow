# VoiceFlow

Dettatura vocale **push-to-talk per Windows**. Selezioni un campo di testo in qualsiasi app
(Slack, Gmail, Cursor, Word…), tieni premuta una hotkey globale, parli, rilasci: il testo
trascritto viene incollato dove si trova il cursore. Zero copia-incolla manuale.

> Nome `VoiceFlow` è **di lavoro**: la decisione di branding finale (dominio/trademark) è al Giorno 6.
> Scope completo, feature MVP e decisioni aperte: [`docs/scope.md`](docs/scope.md).

## Struttura (monorepo)

```
.
├── docs/           # scope, riepiloghi, decisioni
├── app-desktop/    # Electron + TypeScript — il prodotto
│   └── src/
│       ├── main/            # tray, uiohook (hotkey), overlay, lifecycle, IPC
│       ├── preload/         # contextBridge con canali IPC in whitelist
│       ├── renderer/        # UI: finestra impostazioni + overlay registrazione
│       └── services/
│           ├── audio/           # getUserMedia + MediaRecorder
│           ├── transcription/   # client → Supabase Edge Function
│           ├── input-injection/ # clipboard swap + Ctrl+V (nut-js)
│           └── storage/         # better-sqlite3 → electron-store → memoria
├── app-web/        # Next.js App Router + Tailwind + Supabase — landing/download
└── supabase/       # Edge Function `transcribe` (proxy Whisper, tiene la API key)
```

## Requisiti

- **Windows 10/11 64-bit**
- Node.js 20+ (testato con Node 25) e npm
- Microfono + connessione internet (trascrizione cloud)

## App desktop (Electron)

```bash
cd app-desktop
npm install
npm run dev          # avvia in dev con hot-reload (main/preload/renderer)
npm run typecheck    # tsc --noEmit
npm run build:win    # build NSIS su Windows (electron-builder)
```

Config: copia `.env.example` in `.env` e imposta `VITE_SUPABASE_URL` / `VITE_TRANSCRIBE_FUNCTION_URL`
e `VITE_SUPABASE_ANON_KEY`. **Mai** mettere `OPENAI_API_KEY` qui o nel bundle distribuito.

Sicurezza Electron: `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`,
IPC solo tramite canali in whitelist nel preload. Nessuna API Node esposta al renderer.

## Sito web (Next.js)

```bash
cd app-web
npm install
cp .env.example .env.local   # riempi i placeholder
npm run dev                  # http://localhost:3000
npm run build                # build di produzione (verificata)
```

Deploy Vercel (team `StackUp`) con **root directory `app-web`**. Il progetto Supabase deve essere
**dedicato a VoiceFlow** (isolamento dati: non riusare progetti di altri prodotti).

## Edge Function di trascrizione

La chiave OpenAI vive solo server-side. Vedi [`supabase/README.md`](supabase/README.md):

```bash
supabase link --project-ref <project-ref>
supabase secrets set OPENAI_API_KEY=sk-...
supabase functions deploy transcribe
```

Il client invia `multipart/form-data` con `audio` (+ `language` opzionale) e riceve `{ text }`.

## Stato (Giorno 1)

- **Fase 1** — scope e decisioni: ✅ [`docs/scope.md`](docs/scope.md)
- **Fase 2** — scaffolding desktop (Electron + TS, hotkey, tray, overlay, storage, IPC): ✅
- **Fase 3** — scaffolding web (Next.js + Tailwind + shadcn base + Supabase client): ✅ (deploy Vercel da collegare)
- **Fase 4** — rifinitura v0 (impostazioni, overlay, gestione errori, landing shell): ✅
- Riepilogo, rischi e decisioni aperte: [`docs/day1-summary.md`](docs/day1-summary.md)

### Verifica locale

```bash
cd app-desktop && npm run typecheck && npx vite build   # ✅
cd app-web     && npm run typecheck && npm run build    # ✅
```

Il loop end-to-end (hold hotkey → parla → rilascia → incolla nella app attiva) va verificato a mano
con `npm run dev`: richiede microfono, hook globale e una Edge Function `transcribe` deployata.

## Rischi noti principali

- **Hook globale** (`uiohook-napi`): può essere bloccato da antivirus/EDR e va testato che non
  intercetti l'input normale. Fallback: toggle manuale dal tray.
- **Iniezione**: clipboard swap + `Ctrl+V` non funziona in terminali/campi protetti → il testo resta
  in clipboard e va incollato a mano.
- **Origine del modulo nativo**: `better-sqlite3` è opzionale e ha fallback automatico
  (`electron-store`, poi storage in memoria).

Dettagli completi in `docs/scope.md` §8.
