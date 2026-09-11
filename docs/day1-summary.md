# VoiceFlow — Riepilogo Giorno 1

> Branch: `feature/voiceflow-day1-20260911-124406`
> Data: 2026-09-11
> Regola rispettata: nessun push su `main`, nessun merge.

## 1. Decisioni prese (Fase 1)

Lo scope completo è in [`scope.md`](scope.md). Sintesi delle scelte operative:

| Tema | Decisione |
|------|-----------|
| Nome | `VoiceFlow` come **nome di lavoro** fino al Giorno 6 (seconda scelta: `Detta`) |
| Monorepo | Un repo con `/app-desktop` + `/app-web` + `/supabase` + `/docs` |
| App desktop | Electron + TypeScript, `electron-builder` (NSIS), output `dist-electron/` |
| Hotkey | Push-to-talk globale, default `Ctrl+Space`, via `uiohook-napi` |
| Iniezione | Clipboard swap + `Ctrl+V` simulato (`@nut-tree-fork/nut-js`) |
| Audio | `getUserMedia` + `MediaRecorder` nel renderer (webm/opus) |
| Trascrizione | Cloud-only, `whisper-1` proxato da Edge Function Supabase |
| Storage | `better-sqlite3` opzionale → fallback `electron-store` → fallback memoria |
| Finestra | Nessuna finestra principale di default: tray + overlay pill + impostazioni on-demand |
| Deploy web | Vercel team `StackUp`, root directory `app-web`; Supabase **dedicato** |
| Fuori scope MVP | Modes LLM, vocabolario, meeting assistant, file transcription, modelli locali, auth/licenza, updater |

## 2. Cosa funziona oggi

### App desktop (`app-desktop`)

- `npm install` pulito, `npm run typecheck` ✅, `npx vite build` ✅ → `dist-electron/main/index.js`,
  `dist-electron/preload/index.mjs`, `dist/index.html`.
- Processo main: single-instance lock, tray con menu (Impostazioni / Pausa-Riprendi / Esci),
  overlay non focalizzabile sempre-on-top, `close → hide` (quit solo dal tray).
- IPC con whitelist di canali nel preload (`contextIsolation`, `nodeIntegration: false`, `sandbox: true`).
- Hotkey push-to-talk con key-down/key-up distinti (`uiohook-napi`), con `stop()` esplicito su quit.
- Cattura audio con gestione `NotAllowedError` / `NotFoundError`, riuso stream e cleanup tracce.
- Finestra impostazioni: microfono, hotkey, lingua (auto/it/en), avvio automatico, avvia minimizzata.
- Iniezione: salva clipboard → scrive trascrizione → `Ctrl+V` → ripristino solo se la clipboard è
  ancora invariata (~1.1s).
- Errori user-facing per microfono negato/assente, audio troppo breve/lungo, rete/timeout, incolla fallito.

### Sito web (`app-web`)

- `npm install` pulito, `npm run typecheck` ✅, `npm run build` ✅ → rotte statiche `/` e `/download`.
- Landing shell dark coerente (hero, "come funziona", CTA "Scarica per Windows").
- Pagina `/download` placeholder completa (requisiti + privacy + istruzioni dev).
- shadcn/ui **base**: `components.json`, `lib/utils.ts` (`cn`), `components/ui/button.tsx`,
  token tema in `app/globals.css`.
- Client Supabase App Router: `lib/supabase/client.ts` (browser) e `lib/supabase/server.ts` (cookie).

### Backend

- Edge Function `supabase/functions/transcribe/index.ts`: proxy verso Whisper `whisper-1`,
  `OPENAI_API_KEY` come secret server-side, limiti 10 MB / 60s, rate-limit best-effort per IP,
  CORS, risposta `{ text }` / `{ error }`, nessun salvataggio audio.

## 3. Bug corretti durante la rifinitura

Trovati verificando build/typecheck e runtime ESM:

1. **`tsconfig` con project reference non buildabile** → unificato in un solo `tsconfig.json`
   (`tsc --noEmit` ora passa), rimosso `tsconfig.node.json`.
2. **`require` in moduli ESM** (`settings.ts`, `overlay.ts`): a runtime `require` non esiste nel main
   ESM → lo storage sarebbe caduto silenziosamente in memoria e la posizione overlay sarebbe fallita.
   Ora: `createRequire` per i CJS (`better-sqlite3`), `import()` dinamico per `electron-store` (ESM-only),
   import statico di `screen`.
3. **Icona tray vuota** (`tray.ts` caricava l'icona ma non la usava) → `icon.ts` con fallback PNG inline,
   così il tray è sempre visibile.
4. **`preload.off()` non rimuoveva il listener** (rimuoveva la funzione originale, non il wrapper) →
   ora il wrapper è tracciato con una `WeakMap`.
5. **Hook nativo mai fermato** → `stopHotkey()` chiama `uIOhook.stop()` in `before-quit`: senza,
   il thread nativo tiene vivo il processo (processi orfani).
6. **Dipendenze disallineate**: `vite` 6 vs `@vitejs/plugin-react` 6 (richiede vite 8), e
   `vite-plugin-electron@^1.1.3` inesistente → allineati a `vite@^8`, `@vitejs/plugin-react@^6.1.1`,
   `vite-plugin-electron@^1.1.2`.

## 4. Rischi tecnici noti (invariati o ridotti)

| Rischio | Stato | Mitigazione |
|---------|-------|-------------|
| Hook globale bloccato da AV/EDR | Aperto | Toggle Pausa/Riprendi dal tray; code-signing in fase 2 |
| Hook intercetta input normale | Da testare a mano | Hook non-intercept (uiohook non blocca i tasti); test su Win 10/11 + layout IT/US |
| `Ctrl+V` non accettato (terminali/campi protetti) | Aperto | Testo lasciato in clipboard + messaggio "incolla manualmente" |
| `better-sqlite3` non installabile su altre macchine | Ridotto | Modulo **opzionale** con doppio fallback automatico |
| Processi orfani dopo N cicli | Ridotto | `stopHotkey()` su quit + cleanup tracce audio; resta il test manuale 20 cicli |
| Chiave API nel bundle | Chiuso | Solo Edge Function con secret |
| Sicurezza renderer | Chiuso | `contextIsolation` + whitelist IPC + CSP |

## 5. Decisioni ancora aperte

- **Nome definitivo** e disponibilità dominio/trademark (`VoiceFlow` vs `Detta`) → Giorno 6.
- **Hotkey riassegnabile davvero** (MVP: solo `Ctrl+Space`) → Fase 2.
- **Lingua default** selettore vs auto-detect persistito per app → Fase 2.
- **Ripristino clipboard**: delay 1.1s è una scelta; verificare su Word/Outlook (incolla asincrono).
- **Durata max registrazione** 60s: alzare a 120s solo se UX regge.
- **Telemetria/analytics** e **auto-update** (`electron-updater` già in deps) → Fase 2.

## 6. Blocker per la chiusura formale del Giorno 1 (serve il tuo intervento)

Queste attività richiedono credenziali/accessi che non ho in questo ambiente:

1. **Progetto Supabase dedicato** — da creare in dashboard e collegare con `supabase link`.
   Poi `supabase secrets set OPENAI_API_KEY=...` e `supabase functions deploy transcribe`.
   Senza questo, il loop end-to-end non può trascrivere (l'app mostra l'errore esplicativo).
2. **Deploy Vercel** (team `StackUp`, root directory `app-web`) — richiede login Vercel.
3. **Remote Git e PR** — il repo locale **non ha remote configurato** e non ci sono ancora commit.
   Non ho eseguito `git push` (esplicitamente vietato dal brief). Per aprire la PR:
   ```bash
   git add -A
   git commit -m "Giorno 1 — scope, scaffolding Electron/Next, Edge Function transcribe"
   git remote add origin <url>
   git push -u origin feature/voiceflow-day1-20260911-124406
   # poi apri la PR verso main — NON mergiare
   ```
4. **Test manuale del loop** su Windows reale (`npm run dev` in `app-desktop`): hold `Ctrl+Space` →
   parla → rilascia → verifica incolla in Slack/browser/editor e assenza di processi orfani dopo 20 cicli.

## 7. Criteri di successo v0 — stato

- [x] `docs/scope.md` completo
- [x] `app-desktop` build + typecheck puliti; tray/overlay/impostazioni implementati
- [x] `app-web` build + typecheck puliti; landing + `/download` shell
- [x] Edge Function `transcribe` scritta (deploy da fare)
- [ ] Loop end-to-end verificato su Windows reale (manuale)
- [ ] 20 cicli senza processi orfani (manuale)
- [ ] Deploy preview Vercel (manuale)
- [ ] PR aperta verso `main` (bloccata: nessun remote)
