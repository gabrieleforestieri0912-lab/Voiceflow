# VoiceFlow — Riepilogo Giorno 2 (Onboarding Primo Avvio)

> Branch: `feature/voiceflow-day2-onboarding-<timestamp>` (creato da `feature/voiceflow-day1-*` / `main`)
> Data: 2026-09-12
> Regola: nessun push su `main`, PR non mergiata, checkpoint tra fasi.

---

## 1. Cosa è stato fatto

### Fase 1 — Rilevamento primo avvio e permessi di sistema

- Storage: `settings.ts` esteso con `onboarding_completed: boolean` + `onboarding_completed_at: string|null` (con fallback automatico better-sqlite3 → electron-store → memoria).
  Primo avvio = nessuna config salvata → `onboarding_completed == false` (default). Al completamento tutorial, flag salvato su SQLite/JSON.
- Finestra onboarding dedicata (`src/main/onboarding.ts`): `BrowserWindow` separata dalla main settings e dall'overlay di registrazione.
  Dimensioni 720×620, centrata, `autoHideMenuBar`, `backgroundColor #09090b`, `close → hide` (non quit) così l'utente può sempre rifare il tutorial dal tray.
- Permessi microfono:
  - Check reale via `getUserMedia` nel renderer (`services/permissions.ts` → `checkMicrophonePermission()`), che distingue:
    `granted` / `denied` (NotAllowedError) / `not-found` (NotFoundError) / `NotReadableError` (device occupato) / `unknown`.
  - Se negato a livello sistema Windows (Impostazioni privacy disabilitate per le app desktop), `getUserMedia` fallisce con `NotAllowedError`
    e la UI spiega il percorso esatto + pulsante **“Apri Impostazioni microfono di Windows”** che apre `ms-settings:privacy-microphone`
    via `shell.openExternal` (fallback `exec start`). Session permission handlers lato main sempre permissivi (`media → true`) così la barriera reale resta Windows.
  - Se permesso negato, app resta utilizzabile; badge “Richiesta azione” + banner “Puoi proseguire — funzioni non bloccate restano disponibili”.
- Hook tastiera globale (`uiohook-napi`):
  - `testHook()` nel main diagnostica caricamento modulo nativo, `hook.start()` e stato `active`; messaggi specifici per antivirus/EDR (Defender for Endpoint, CrowdStrike, SentinelOne) e istruzioni whitelist + reinstalla + toggle Pausa/Riprendi.
  - IPC `permissions:checkHook` esposto al renderer; onboarding step permessi mostra OK/Bloccata e diagnosi.
  - Se hook fallisce, nessun crash: `registerHotkey` ritorna `false`, l'app resta in tray e “Rifai tutorial” riprova.

### Fase 2 — Tutorial interattivo (max 3 schermate)

- `src/renderer/Onboarding.tsx` — 3 step + schermata successo:
  1. **Concetto + permessi**: spiega push-to-talk, mostra stato mic/hook con retry indipendenti e CTA “Apri Impostazioni Windows” quando rilevante.
  2. **Prova guidata reale** (vero loop, non simulazione): l'utente apre Blocco Note, preme `Ctrl+Spazio` tenendo premuto, parla, rilascia.
     Il componente usa `createCapture` + `transcribeAudio` + `input:injectText` e inietta davvero il testo nell'app attiva.
     Errori distinti in 3 diagnosi:
     - **mic** (NotAllowed/NotFound/silenzio) → guida privacy/device;
     - **trascrizione fallita** (rete/API/timeout) → suggerisce controllare connessione e deploy Edge Function;
     - **iniezione fallita** (focus perso/clipboard) → testo comunque in clipboard, istruzione `Ctrl+V` manuale.
  3. **Conferma hotkey + autoLaunch**: input hotkey (default `Ctrl+Space`, validabile) + toggle “Avvia all'accesso a Windows” (persiste via `app.setLoginItemSettings` nell'IPC `settings:set`).
  Al “Finito”, salva `onboarding_completed = true` + `onboarding_completed_at = ISO`, mostra schermata ✓ “Tutto pronto!” e minimizza in tray.

- Routing renderer: `main.tsx` gestisce hash `#onboarding` / `#overlay` / default (App).

### Fase 3 — Prima esperienza post-onboarding

- Dopo tutorial: `onboarding:minimizeToTray` nasconde onboarding + main, mostra **notifica Windows nativa** via `new Notification()` (Electron):
  titolo “VoiceFlow è pronto”, body “Premi [hotkey] per iniziare…”, click sulla notifica riapre le impostazioni.
- Tray: menu aggiornato a minimo richiesto — **Impostazioni…**, **Rifai tutorial**, **Pausa/Riprendi dettatura**, versione, **Esci**. “Rifai tutorial” resetta flag `onboarding_completed=false` e riapre la finestra onboarding con reset UI.
- Persistenza riavvio Windows: `autoLaunch` salvato in storage e applicato a `app.setLoginItemSettings({ openAtLogin: true, openAsHidden: true })`
  ogni avvio (e su toggle). Verificabile con riavvio reale di Windows; `getLoginItemSettings` non è esposto ma il flag è persistito correttamente.
- Impostazioni (`App.tsx`): pulsante “Rifai tutorial” + banner “Onboarding non completato” quando pertinente.

---

## 2. Verifiche

- `npx tsc --noEmit` → OK (app-desktop + app-web).
- `npx vite build` → OK (client + electron_main + electron_preload) — 13s tailwind, bundle ~254kB.
- IPC whitelist (`preload/index.ts`) aggiornata: `permissions:*`, `onboarding:*`, `onboarding:reset-ui` / `onboarding:show`.
- **Crash safety**:
  - `permissions:checkMic` non crasha: `checkMicrophonePermission()` cattura tutti i `DOMException` e ritorna stato `error/denied/not-found` con messaggio; nessun `throw` non gestito.
  - `testHook()` non crasha: `ensureHook()` cattura import failure, salva `lastHookError`; `hook.start()` in try/catch.
  - Prova guidata: ogni `await` in try/catch con `dispose()` in finally; blob null/short → errore mic; transcription error → kind `transcription`; inject error → kind `injection`.
  - Finestre: tutte `close → hide` tranne `before-quit`; nessun `app.quit()` su `window-all-closed`.

## 3. Come testare — Checkpoint 1 (permesso concesso vs negato, no crash)

```bash
cd app-desktop
npm run dev
```

**Caso A — permesso concesso:**
- Primo avvio (cancella `%APPDATA%/VoiceFlow/voiceflow.db` o `config.json` di electron-store per forzare `onboarding_completed=false`).
- Step 1 deve mostrare Mic “OK” (badge verde) e Hook “OK”.

**Caso B — permesso negato (simulabile senza toccare Windows privacy):**
- Nega manualmente il permesso microfono dal picker Chromium, oppure — per simulare privacy Windows disabilitata — disabilita “Consenti alle app desktop di accedere al microfono” in `ms-settings:privacy-microphone` e rilancia.
- Riapri onboarding → Step 1 mostra Mic “Richiesta azione” con messaggio specifico + pulsante “Apri Impostazioni microfono di Windows” funzionante (apre `ms-settings:privacy-microphone`). Hook se bloccato mostra “Bloccata” con diagnosi AV/EDR.
- In entrambi i casi, “Continua” resta abilitato, l’app prosegue a step 2/3 e resta utilizzabile; **nessun crash**.

## 4. Come testare — Checkpoint 2 (tutorial end-to-end)

```bash
cd app-desktop
npm run dev
```

1. Completa step 1 (OK o anche negato — la prova non sarà bloccante).
2. Step 2: apri Blocco Note, tieni `Ctrl+Spazio`, parla 2–3s, rilascia. Attesi:
   - Overlay rosso “Registrazione…” durante hold, poi giallo “Trascrizione…”, poi “Fatto!” con testo iniettato nel Blocco Note.
   - Se mic negato → errore “Diagnosi: microfono non rilevato” (non crash).
   - Se trascrizione fallita (senza `VITE_SUPABASE_URL`/Edge Function) → errore “Diagnosi: trascrizione fallita (rete/API)” (non crash).
   - Se focus perso durante processing (alt-tab) → “Diagnosi: testo non iniettato — incolla con Ctrl+V” (testo comunque in clipboard).
3. Step 3: modifica hotkey, attiva/disattiva autoLaunch, “Finito” → salva `onboarding_completed=true` (verificabile in `voiceflow.db` / electron-store file) e minimizza in tray con notifica toast.

## 5. Come testare — Checkpoint 3 (post-onboarding)

- Dopo “Finito”, verifica toast “VoiceFlow è pronto — premi Ctrl+Spazio per iniziare” (click apre Impostazioni).
- Menu tray: Impostazioni / Rifai tutorial / Esci.
- Auto-launch: attiva toggle, riavvia Windows, verifica che VoiceFlow riparta in tray (processo presente, finestra non mostrata se `launchMinimized`).

---

## 6. Problemi noti / decisioni aperte

- **Hotkey riassegnabile realmente oltre `Ctrl+Space`**: input salvato ma `hotkey.ts` ha ancora logica hard-coded `Ctrl+Space` (parseHotkey logga warning e usa fallback). Da rendere totalmente riassegnabile (registrare combo arbitrarie) nel prossimo giorno.
- **`ms-settings:` su build**: `shell.openExternal("ms-settings:...")` funziona in dev; in build `electron-builder` va verificato che non serva protocol allowlist.
- **Migrazione storage esistente**: utenti con DB già esistente ricevono nuovi default al `getSettings()` (merge con `DEFAULTS`), quindi `onboarding_completed` appare `false` alla prima apertura post-aggiornamento — comportamento voluto (mostra onboarding una volta).
- **Rifai tutorial reset**: attualmente azzera `onboarding_completed` e riapre la finestra; non cancella altri setting (hotkey scelta resta). Decidere se resettare anche altre preferenze.
- **Test 20 cicli / processi orfani** (da Giorno 1) ancora da rifare con onboarding attivo (hook condiviso tra overlay/main/onboarding).

## 7. File toccati / nuovi

- `app-desktop/src/services/storage/settings.ts` — nuovo flag onboarding
- `app-desktop/src/services/permissions.ts` — **nuovo** helper mic check
- `app-desktop/src/main/hotkey.ts` — `getLastHookError` + `testHook()`
- `app-desktop/src/main/onboarding.ts` — **nuovo** window dedicata
- `app-desktop/src/main/tray.ts` — voce Rifai tutorial
- `app-desktop/src/main/index.ts` — ipc onboarding/permessi/notifica/minimizeToTray + lifecycle primo avvio
- `app-desktop/src/preload/index.ts` — whitelist canali onboarding
- `app-desktop/src/renderer/Onboarding.tsx` — **nuovo** tutorial 3 step con prova reale
- `app-desktop/src/renderer/main.tsx` — routing `#onboarding`
- `app-desktop/src/renderer/App.tsx` — link Rifai tutorial

## 8. Checkpoint richiesti

- **Checkpoint 1 — STOP.** Mostra comportamento con permesso concesso e negato, conferma no crash (vedi §3).
- **Checkpoint 2 — STOP.** Dopo OK su 1, testa l'intero flusso da zero e riporta esito (vedi §4).
- **Checkpoint 3 — STOP.** Conferma notifica post-onboarding + tray minimo + sopravvivenza a riavvio Windows (vedi §5).
