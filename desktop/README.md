# VoiceFlow Desktop

App di dettatura vocale push-to-talk per Windows: tieni premuta la hotkey, parli, rilasci, il testo viene incollato nell'app attiva.

Stack: **Electron + TypeScript + Vite + React**. Trascrizione cloud-only via Supabase Edge Function `transcribe-audio` (Whisper, nessuna chiave nel bundle).

Vive dentro il monorepo VoiceFlow (`desktop/`). Il sito web resta nella root Next.js, il mobile in `mobile/`.

## Avvio

```bash
cd desktop
npm install
cp .env.example .env   # VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
npm run dev            # avvia Electron in dev (renderer http://localhost:5173)
```

Altri comandi:

```bash
npm run typecheck  # tsc --noEmit
npm run build      # electron-vite build → dist-electron/ + dist/
npm run dist       # build + installer Windows NSIS → release/
```

> Su Linux `npm run dist` (target `--win nsis`) richiede Wine; in alternativa
> `npx electron-builder --linux AppImage` per un artefatto Linux di test.

## Struttura

```
src/main/         # index, tray, hotkey (uiohook-napi opzionale), onboarding, transcription
src/preload/      # contextBridge whitelist IPC
src/renderer/     # App (impostazioni), Overlay (pill), Onboarding (3 step)
src/services/     # audio/capture, transcription/client, input-injection, storage, permissions
resources/        # icone tray/installer
```

## Note

- `uiohook-napi`, `@nut-tree/nut-js`, `better-sqlite3` sono `optionalDependencies`: lo scaffolding parte anche senza (fallback + warning, nessun crash).
- Sicurezza: `contextIsolation:true`, `nodeIntegration:false`, `sandbox:true`, CSP nel renderer.
- Loop G3 da completare: hold hotkey → `createCapture` → `transcribeInMain` → `injectText` (clipboard swap + Ctrl+V).
