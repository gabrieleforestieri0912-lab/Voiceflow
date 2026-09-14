# VoiceFlow — Test funnel end-to-end (Giorno 5)

> Branch: `feature/voiceflow-day5-launch-prep-20260914-103155` · Data: 2026-09-14

## Obiettivo

Verificare il flusso completo **acquisto → email licenza → attivazione app → primo loop di dettatura** su build reale (73,89 MB, Defender pulito, locales ottimizzate).

## Prerequisiti

- Installer `Voiceflow_Desktop/release/0.1.0/VoiceFlow_0.1.0.exe` (SHA256 `170246C62BDCAC7B52C4BC99D541E00F280E2E424E9DD2B4C113620FE4EB37A3`) già generato e scansionato
- Per trascrizione reale: Supabase project + Edge Function `transcribe-audio` deployata con secret `OPENAI_API_KEY`
- Per funnel pagamento: Lemon Squeezy / Stripe (placeholder — vedi §4)

## Variabili production (nomi, senza valori)

**Vercel (Web — Project → Settings → Environment Variables → Production):**

- `NEXT_PUBLIC_SUPABASE_URL` — es. `https://xxxx.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon key
- `NEXT_PUBLIC_TRANSCRIBE_FUNCTION_URL` — opzionale, default `${SUPABASE_URL}/functions/v1/transcribe-audio`

**Supabase (Dashboard → Edge Functions → Secrets):**

- `OPENAI_API_KEY` — mai in `VITE_*` né nel bundle desktop
- Opzionale: `SUPABASE_SERVICE_ROLE_KEY` solo server-side

**Desktop `.env` (dev, gitignored, mai nel bundle):**

- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_TRANSCRIBE_FUNCTION_URL`

## Fasi di test

### 1. Installazione su macchina pulita

Windows Sandbox o VM senza dev tools. Cronometra installazione NSIS (atteso 30–60s su SSD).

```powershell
# su macchina pulita
VoiceFlow_0.1.0.exe   # installer NSIS oneClick:false, scegli directory
# Verifica: shortcut Desktop + Start Menu, disinstallazione da Pannello
Get-FileHash VoiceFlow_0.1.0.exe -Algorithm SHA256  # deve matchare
& "C:\Program Files\Windows Defender\MpCmdRun.exe" -Scan -ScanType 3 -File VoiceFlow_0.1.0.exe
```

### 2. Primo avvio → onboarding → `onboarding_completed`

- App parte in tray, onboarding window appare
- Completa permessi (microfono + hook), evento `app_installed` già fire-once, `onboarding_completed` su `onboarding:complete`
- Verifica via `diagnostics:get`:

```js
await window.voiceflow.invoke("diagnostics:get") // analytics.__analytics_count_onboarding_completed === 1
```

### 3. Attivazione licenza (mock / reale)

Stato attuale: **mock locale** — nessuna tabella DB necessaria (opzione 2 proxy puro). Per test reale con provider:

- Lemon Squeezy: crea prodotto → checkout → webhook → email con chiave → app chiama `analytics:licenseActivated`
- Oppure mock locale:

```js
await window.voiceflow.invoke("analytics:licenseActivated", "pro")
await window.voiceflow.invoke("analytics:get") // log contiene license_activated
```

### 4. Primo loop di dettatura → `first_dictation_completed`

Con `VITE_TRANSCRIBE_FUNCTION_URL` reale:

1. Apri Notepad, posiziona cursore
2. Tieni `Ctrl+Spazio`, parla 3–5s, rilascia
3. Atteso: testo appare via `input:injectText` (clipboard + Ctrl+V), evento `first_dictation_completed` once

Senza env reale (mock):

```powershell
cd Voiceflow_Desktop
npm run smoke  # harness locale con MediaRecorder mockato, 20 cicli senza stream orfani
```

Oppure test manuale trascrizione diretta:

```js
// da renderer console
await window.voiceflow.invoke("transcription:transcribe", { audioBase64: "...", mimeType: "audio/webm" })
```

### 5. Crash reporting

Impostazioni → Diagnostica → "Simula crash main" → "Mostra diagnostica" → `voiceflow-crash.log` contiene JSON con `scope:main/manualTest`. Ripeti per renderer.

## Esito atteso (oggi)

- [x] Installer generato, Defender pulito, locales ottimizzate (73,89 MB)
- [x] Pagine legali `/privacy` `/terms` pubblicate
- [x] Crash reporting verificato (log locale)
- [ ] Funnel pagamento reale non testato (provider placeholder) — mock locale verificato
- [ ] Build firmata reale non disponibile (self-signed DEV ok, WDSI da fare dopo OV)

Per campagna ampia: completare §3 con provider reale + certificato OV/EV + sottomissione WDSI.

## Comandi rapidi

```bash
# Web build
cd Voiceflow && npm run build

# Desktop build + verifica
cd Voiceflow_Desktop && npm run build:win
Get-FileHash release/0.1.0/VoiceFlow_0.1.0.exe -Algorithm SHA256
& "C:\Program Files\Windows Defender\MpCmdRun.exe" -Scan -ScanType 3 -File release/0.1.0/VoiceFlow_0.1.0.exe
pwsh -File scripts/virustotal-upload.ps1
```
