# VoiceFlow — Checklist di lancio (Giorno 5)

> Branch web: `feature/voiceflow-day5-launch-prep-20260914-103155` · Branch desktop: omonimo in `Voiceflow_Desktop` · Data: 2026-09-14

Stato **reale verificato** (non stimato). Vedi anche `Voiceflow_Desktop/docs/launch-checklist.md` per dettagli desktop + `docs/antivirus-notes.md`.

## Installer (repo `Voiceflow_Desktop`)

- [x] Installer NSIS `VoiceFlow_0.1.0.exe` generato (`electron-builder 26.15.3`, target `nsis` x64, `asar`+`asarUnpack`, `compression: maximum`): **80,77 MB**, SHA256 `4F3693A6CE2D8CEA26FBFC06B9596ECD957DCB4856724CED08EDF94A0ABEA6E5`, `app.asar` 10,6 MB
- [x] `files` limitato a `dist-electron`+`dist` con esclusioni dev — verificato, niente sorgenti nel bundle
- [ ] Firma codice: **RISCHIO NOTO — non firmato** (`signAndEditExecutable: false`). SmartScreen mostrerà “editore sconosciuto”. Richiede certificato OV/EV prima di campagna ampia + sottomissione Microsoft WDSI.

## Antivirus

- [x] Windows Defender locale: **pulito** (`MpCmdRun -Scan -ScanType 3` 14/09/2026)
- [ ] VirusTotal multi-engine: **non caricato in questo ciclo** — da fare manuale su https://www.virustotal.com/gui/home/upload e compilare `Voiceflow_Desktop/docs/antivirus-notes.md`
- [x] `docs/antivirus-notes.md` creato con motivi falsi positivi (uiohook+nut-js+updater), motori, template segnalazione e contromisure

## Pagine legali (questo repo)

- [x] `/privacy` — vincolo Giorno 3 enfatizzato (“nessun contenuto trascrizioni salvato cloud di default, testo resta locale”), permessi (microfono, hook tastiera, simulazione input) con perché, GDPR, telemetria anonima
- [x] `/terms` — licenza, uso vietato, pagamenti, auto-update, limitazioni
- [x] Footer con link reali `/privacy` `/terms` · Build Next `✓` con route `/privacy` `/terms` statiche
- Nota: testi come punto di partenza, non consulenza legale.

## Monitoring e crash reporting (repo `Voiceflow_Desktop`)

- [x] Scelta motivata: **minimale locale, non @sentry/electron ora** (defer until demand proven). Implementati `analytics.ts` + `crash.ts` con log locale `%APPDATA%/VoiceFlow/logs/voiceflow-crash.log` e IPC `diagnostics:get`. Aggiunta Sentry documentata come 10 righe future.
- [x] Eventi anonimi: `app_installed`, `onboarding_completed`, `first_dictation_completed`, `license_activated` (via `electron-store`, whitelist IPC)
- [x] Crash main+renderer: `uncaughtException`/`unhandledRejection` + `window.onerror` → file log; UI Diagnostica in `App.tsx` con “Simula crash main/renderer” + “Mostra diagnostica” — build ricompilata e Defender pulito

## Funnel e env production

- [ ] Funnel end-to-end (acquisto → email licenza → attivazione → primo loop dettatura) **non verificato in produzione** in questo ciclo — da testare su build firmata con env reali
- [x] Variabili da impostare — **nomi senza valori**:
  - Vercel (Production): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, (opz.) `NEXT_PUBLIC_TRANSCRIBE_FUNCTION_URL`
  - Supabase Edge Function secrets (server-side): `OPENAI_API_KEY` (mai in `VITE_*` né nel bundle), eventuale `SUPABASE_SERVICE_ROLE_KEY`
  - Desktop `.env` dev (gitignored): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_TRANSCRIBE_FUNCTION_URL`

## Rischi noti non risolti

1. Firma codice assente → barriera SmartScreen.
2. Falsi positivi AV — Defender ok, VT da caricare; whitelist vendor dopo firma.
3. Dimensione bundle 80,77 MB (normale Electron ma percepita pesante).
4. Icone brand assenti (fallback Electron).

## Comandi di verifica

```bash
# Desktop
cd Voiceflow_Desktop && npm run build:win && Get-FileHash release/0.1.0/VoiceFlow_0.1.0.exe -Algorithm SHA256
& "C:\Program Files\Windows Defender\MpCmdRun.exe" -Scan -ScanType 3 -File release/0.1.0/VoiceFlow_0.1.0.exe

# Web
cd Voiceflow && npm run build  # atteso ○ /privacy ○ /terms
```
