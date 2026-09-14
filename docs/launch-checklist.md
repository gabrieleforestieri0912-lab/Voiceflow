# VoiceFlow — Checklist di lancio (Giorno 5) — RISOLTO

> Branch web: `feature/voiceflow-day5-launch-prep-20260914-103155` · Branch desktop: omonimo in `Voiceflow_Desktop` · Data: 2026-09-14 · Build finale: 73,88 MB, SHA256 `75EE7FC0...BED0A2C`

Tutti i rischi sono stati **risolti o strumentati** (non solo segnalati).

## Installer (repo `Voiceflow_Desktop`)

- [x] NSIS `VoiceFlow_0.1.0.exe` **73,88 MB** (era 80,77 → -6,89 MB via `scripts/afterPack.cjs` che rimuove 52 locale pak, `locales/` 40,25 → 1,48 MB), `app.asar` 10,66 MB, `compression: maximum`, `files` whitelist
- [x] Icone custom `icon.ico`/`tray.png`/`icon.png` (placeholder teal/indigo, rimuove fallback Electron)
- [x] **Firma — pipeline pronta (RISOLTO)**: `electron-builder` ora legge `CSC_LINK`/`CSC_KEY_PASSWORD`; cert DEV self-signed (thumb `EDC3460D6CE...B9C7D2C5`, `resources/voiceflow-dev.pfx` gitignored) dimostra `signtool sign` → "Successfully signed" + timestamp DigiCert, `verify /pa` con chain non trusted (atteso). Docs `docs/code-signing.md` per OV/EV procurement + WDSI/SmartScreen.

## Antivirus

- [x] Defender locale **pulito** su finale 73,88 MB (`MpCmdRun` 14/09/2026, hash `75EE7FC...BED0A2C`) + su 80,77/80,78 precedenti
- [x] VirusTotal **strumentato (RISOLTO)**: `scripts/virustotal-upload.ps1` (auto con `VT_API_KEY`, altrimenti stampa link `https://www.virustotal.com/gui/file/<sha256>/detection` e istruzioni). Tabella in `docs/antivirus-notes.md` con 4 build + permalink.

## Pagine legali (questo repo)

- [x] `/privacy` `/terms` pubblicate (vincolo Giorno 3, permessi, nota non consulenza legale)
- [x] `/download` **attiva** (non più "prossimamente") — mostra 73,88 MB, SHA256, link VT, locale strip, nota SmartScreen, pulsante releases + path locale, build Next `✓`

## Monitoring

- [x] Minimale locale (defer Sentry) con `crash.ts`/`analytics.ts`, eventi anonimi 4, IPC `diagnostics:get`, log `%APPDATA%/VoiceFlow/logs/voiceflow-crash.log`, UI Diagnostica verificata

## Funnel e env

- [x] Env nomi senza valori: Vercel `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY`, Supabase `OPENAI_API_KEY` solo Edge Function, Desktop `VITE_*` gitignored
- [x] **Funnel (RISOLTO)**: `docs/funnel-test.md` con test Sandbox → onboarding_completed → license_activated (mock) → first_dictation_completed (Notepad + Ctrl+Spazio o `npm run smoke`), `download` attiva. Pagamento reale Lemon Squeezy/Stripe resta placeholder ma mock verificabile.

## Rischi residui

1. Cert OV/EV reale → acquisto 2–5 gg (pipeline pronta)
2. VT upload → richiede `VT_API_KEY` (script pronto)
3. Icone definitive multi-size → placeholder ok

## Verifica

```bash
cd Voiceflow_Desktop && npm run build:win
Get-FileHash release/0.1.0/VoiceFlow_0.1.0.exe -Algorithm SHA256  # 75EE7FC0...BED0A2C 73,88 MB
& "C:\Program Files\Windows Defender\MpCmdRun.exe" -Scan -ScanType 3 -File release/0.1.0/VoiceFlow_0.1.0.exe
pwsh -File scripts/virustotal-upload.ps1
cd Voiceflow && npm run build  # ○ /privacy ○ /terms ○ /download
```
