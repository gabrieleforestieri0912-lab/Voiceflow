# VoiceFlow — Scope Giorno 1

> **Stato:** Fase 1 (scope) approvata — Fasi 2–4 eseguite. Riepilogo di giornata: [`day1-summary.md`](day1-summary.md)
> **Branch:** `feature/voiceflow-day1-20260911-124406`
> **Data:** 2026-09-11
> **Regola:** nessun push diretto su `main`.

---

## 0. Contesto sintetico

App di dettatura vocale **solo Windows**, ispirata concettualmente a Superwhisper ma focalizzata sull'ecosistema Windows. Loop core: utente posiziona il cursore in **qualsiasi app** (Slack, Gmail, Cursor, Word, editor di codice…), tiene premuta una hotkey globale → parla → rilascia → il testo trascritto (MVP: verbatim, senza rielaborazione LLM) viene incollato automaticamente dove si trovava il cursore.

Due componenti con stack separati:

- **App desktop:** il prodotto — Electron + TypeScript (hook tastiera globale, mic in background, iniezione testo).
- **Sito web:** landing + download + checkout + gestione licenza — Next.js App Router + TypeScript + Tailwind + Supabase (stack standard Vertex).

Questo documento è l'output della **Fase 1 — Brainstorming e definizione ambito (NO CODICE)**.

---

## 1. Naming — 3 opzioni

> Il nome provvisorio `VoiceFlow` è usabile ma va validato per disponibilità dominio `.com`, conflitti trademark e collisioni con prodotti esistenti (esistono già prodotti similari con nomi vicini). Qui 3 proposte ragionate; **raccomandazione in fondo.**

### Opzione A — **VoiceFlow** (conferma del provvisorio)

- **Pro:** descrittivo immediato (voice + flow), coerente con il brief, facile da ricordare, già usato come placeholder nel branch.
- **Contro:** generico, rischio alta collisione SEO/dominio, possibile omonimia con tool AI voice esistenti.
- **Dominio da verificare:** `voiceflow.com` quasi certamente occupato → fallback `voiceflow.app` / `getvoiceflow.com` / `voiceflowwindows.com`.
- **Tone:** professionale, neutro, adatto a utility "per professionisti".

### Opzione B — **Detta** (da "dettatura")

- **Pro:** brevissimo, memorabile, suono italiano ma pronunciabile internazionalmente, forte differenziazione rispetto ai nomi anglofoni affollati del settore. Disponibilità dominio/trademark più probabile.
- **Contro:** meno auto-descrittivo per pubblico non-italofono; richiede payoff esplicativo ("Detta — dettatura istantanea per Windows").
- **Dominio da verificare:** `detta.app` / `detta.ai` / `usedetta.com`.
- **Tone:** distintivo, minimalista, premium.

### Opzione C — **WhisperWin / Whisper for Windows**

- **Pro:** sfrutta l'associazione mentale con "Whisper" (modello OpenAI) = chiarezza immediata sul "cosa fa"; SEO naturale per chi cerca "whisper windows alternative".
- **Contro:** dipendenza semantica da un brand terzo (OpenAI), rischio di sembrare "wrapper" e non prodotto autonomo; possibile debolezza trademark.
- **Dominio da verificare:** `whisperwin.com` / `whisperwindows.com`.
- **Tone:** esplicito, tecnico, orientato a chi già conosce Superwhisper/Whisper.

### Raccomandazione

**Mantenere `VoiceFlow` come nome di lavoro per il Giorno 1–6** (evita rename a metà scaffolding) e riservare la decisione finale di branding al Giorno 6 dopo verifica disponibilità dominio `.com`/`.app`, handle social, e ricerca rapida trademark EU/US. Se `VoiceFlow` risulta bloccato, **seconda scelta: Detta**. `WhisperWin` solo come fallback SEO se si punta a posizionamento "alternativa a Superwhisper per Windows".

> **Decisione richiesta al Checkpoint 1:** confermi `VoiceFlow` come nome di lavoro fino a Giorno 6, o scegli già uno dei tre?

---

## 2. Differenziazione rispetto a Superwhisper

Superwhisper copre macOS/iOS + Windows, ha modelli locali, libreria vocabolari, meeting assistant e trascrizione file. Noi copriamo **solo Windows** — il vantaggio non può essere "più piattaforme", deve stare altrove.

| # | Differenziazione | Perché conta per l'utente Windows |
|---|------------------|-----------------------------------|
| **1** | **Windows-native, non porting** — hotkey push-to-talk vera (key-down/key-up), tray, avvio automatico, overlay pill non invasiva pensata per il comportamento finestre di Windows, iniezione `Ctrl+V` che rispetta focus e layout tastiera IT/US | Superwhisper nasce Mac-first; su Windows l'esperienza è spesso "adattata". Noi costruiamo per Win32/Win11 da subito: meno frizione con app Win comuni (Office,Teams, Outlook desktop, app legacy Win32, Cursor/VS Code su Windows). |
| **2** | **Prezzo semplice e aggressivo** — licenza one-time o abbonamento annuale basso, senza tier per "modelli locali vs cloud" al lancio | Superwhisper ha pricing che riflette 3 piattaforme + modelli locali. Per un utente solo-Windows è sovrapprezzo. Un prezzo "solo Windows, solo ciò che ti serve" è un argomento di vendita immediato. |
| **3** | **Focus verticale "dettatura ovunque"** — un solo job fatto benissimo: premi, parli, incolli ovunque. Zero feature "meeting bot / trascrizione file" nel MVP | Superwhisper è diventato suite. Chi vuole solo dettare veloce in qualsiasi campo di testo percepisce complessità inutile. La promessa "fa una cosa, la fa istantanea" riduce time-to-value. |
| **4** | **Integrazione stretta con ecosistema Windows** — roadmap dichiarata: PowerToys Run plugin, AutoHotkey-friendly, supporto layout tastiera Windows, attenzione a IME e accenti IT, compatibilità con app aziendali Windows (es. gestionali Win32) | Differenziatore pratico per professionisti/aziende che vivono su Windows: non è un tool "anche per Windows", è *per* Windows. |
| **5** | **Privacy pragmatica** — trascrizione cloud proxata (niente chiave nel bundle), no audio salvato di default, opzione futura modello locale offline come scelta esplicita non come default pesante | Chiarezza: sai dove vanno i dati (Edge Function Supabase → Whisper API), niente binari modello da 2–4 GB al primo avvio. Per molti utenti Windows aziendali è preferibile a "scarica 3 modelli locali". |

> Messaggio di posizionamento Giorno 6 (draft): *"La dettatura che Superwhisper ha portato su Mac — finalmente fatta bene su Windows. Tieni premuto, parla, incolla ovunque. Niente fronzoli."*

---

## 3. Feature set MVP — realistico per 6 giorni (spietato)

Obiettivo Giorno 6: **loop core affidabile + scaffolding solido**. Tutto ciò che non è indispensabile al loop è **fuori scope**.

### 3.1 MVP — IN scope (must-have)

| Area | Feature | Criterio di accettazione |
|------|---------|--------------------------|
| **Hotkey globale** | Push-to-talk configurabile, default `Ctrl+Space` via `uiohook-napi` (key-down = start, key-up = stop). Fallback single-press se hold non rilevato. | Key-down/key-up distinti su Windows 10/11, nessun blocco dell'input normale, nessun conflitto con scorciatoie di sistema comuni. |
| **Cattura audio** | `getUserMedia` in `BrowserWindow` nascosta; selezione dispositivo di input; indicatore livello minimo (silenzio vs parlato). | Registra da microfono default e da device selezionato; gestisce `NotAllowedError`/`NotFoundError` con messaggio utente. |
| **Trascrizione** | Cloud-only Whisper API via Supabase Edge Function proxy. Invio blob audio, ritorno testo. | Nessuna chiave API nel bundle Electron. Timeout/retry base + messaggio "rete assente". Lingua: auto-detect, default `it`/`en` se configurabile. |
| **Iniezione testo** | Clipboard swap + `Ctrl+V` simulato via `@nut-tree/nut-js` (o alternativa mantenuta verificata al momento dell'implementazione). Salva clipboard originale, incolla, ripristina dopo delay. | Funziona in Slack, Gmail (browser), Cursor/VS Code, Notepad, Word. Test su campo con testo preesistente: non perde contenuto clipboard dopo 1–2s. |
| **Overlay registrazione** | Pill/overlay flottante minimale, sempre-on-top, non invasiva: stati `idle` (nascosta) → `recording` (rossa/pulsante) → `processing` (spinner) → `idle`. | Appare solo durante registrazione/processing, non ruba focus, si posiziona in area non ostruttiva. |
| **Tray + lifecycle** | Tray icon con menu: Apri Impostazioni, Pausa/Resume hotkey, Quit. App in background senza finestra principale di default. | Chiusura finestra ≠ quit; quit solo da tray. Nessun processo orfano dopo 20 cicli registrazione. |
| **Finestra Impostazioni** | Minimale: selezione microfono, hotkey (display + riassegnazione base), toggle avvio automatico (`app.setLoginItemSettings`), toggle "avvia minimizzata". | Persistenza su SQLite locale. Validazione hotkey (evita combo di sistema critiche se possibile). |
| **Storage locale** | SQLite (`better-sqlite3` o equivalente con prebuild per Electron) per impostazioni utente. | DB creato al primo avvio, migrazione minimale, nessun dato utente sensibile in chiaro oltre preferenze. |
| **Gestione errori base** | Microfono non disponibile, permessi negati, rete assente, trascrizione fallita, clipboard non accessibile. | Messaggi utente comprensibili (IT/EN), log in console dev, nessun crash silenzioso. |
| **Sicurezza Electron** | `contextIsolation: true`, `nodeIntegration: false`, `contextBridge` + `ipcMain`/`ipcRenderer` con canali espliciti. | Verificato in scaffolding; nessuna esposizione Node al renderer. |
| **Sito web shell** | Next.js App Router + Tailwind + Supabase + deploy Vercel (team `StackUp`): hero, sottotitolo, CTA "Scarica per Windows" placeholder, dark theme coerente con utility professionale, pagina `/download` placeholder. | `npm run dev` funzionante per entrambi i progetti; deploy preview Vercel visibile. |

### 3.2 Esplicitamente FUORI scope MVP (Fase 2)

> Se una di queste viene richiesta durante i 6 giorni, la risposta è "Fase 2, non ora".

- Modes multipli / prompt LLM di rielaborazione ("email formale", "codice", "riassunto"…)
- Vocabolario custom / parole personalizzate / sostituzioni
- Meeting assistant, trascrizione file audio/video, cronologia trascrizioni ricercabile
- Modelli locali offline (Whisper.cpp / ONNX) e download modelli
- Multi-lingua avanzata con glossari, diarizzazione, punteggiatura intelligente configurabile
- Autenticazione utente / licenza / checkout Stripe / gestione abbonamento (nel sito: solo shell, non logica di pagamento)
- Sincronizzazione cloud delle impostazioni
- Scorciatoie multiple / profili hotkey / gesture mouse
- Telemetria / analytics prodotto
- Auto-aggiornamento (Electron updater) — previsto ma non nel MVP di 6 giorni

### 3.3 Timeline 6 giorni (indicativa, spietata)

- **G1 (oggi):** scope + repo init + checkpoint (questo documento).
- **G2:** scaffolding `app-desktop` Electron + TS (electron-vite), `uiohook-napi` funzionante, tray, overlay, SQLite, IPC sicuro.
- **G3:** audio capture + Edge Function proxy + iniezione clipboard/Ctrl+V end-to-end (loop manuale funzionante).
- **G4:** scaffolding `app-web` Next.js + Tailwind + Supabase + Vercel preview.
- **G5:** rifinitura v0: impostazioni minimale, overlay stati, gestione errori, test 20 cicli no leak.
- **G6:** landing shell, README, PR verso main, riepilogo rischi/decis. aperte.

---

## 4. Conferma stack tecnico + verifica vincoli

> Stack già deciso — non ridiscusso, ma verificato per blocchi noti su Windows + Electron.

### 4.1 App desktop — Electron + TypeScript

- **Scelta:** `electron-vite` (o template moderno equivalente con Vite + TS + hot-reload per main/preload/renderer) + `electron-builder` per packaging NSIS su Windows.
- **Verifica:** maturissimo, usato in produzione da App note; nessun blocco. Trade-off dichiarato (bundle Chromium+Node pesante vs velocità di sviluppo in TS) accettato consapevolmente.
- **Rischio residuo:** dimensione installer (~80–150 MB) — atteso per Electron, non bloccante per MVP.

### 4.2 Hotkey globale push-to-talk — `uiohook-napi`

- **Perché non `globalShortcut`:** `globalShortcut` di Electron rileva solo la combo completa premuta (evento singolo), non distingue `key-down` da `key-up` necessario per "tieni premuto per parlare, rilascia per trascrivere".
- **Verifica:** `uiohook-napi` (fork mantenuto di `iohook`) offre hook low-level tastiera/mouse multipiattaforma, binari precompilati (niente toolchain nativa aggiuntiva), API `uIOhook.on('keydown'/'keyup')`. Ben supportato su Windows 10/11; richiede test esplicito che non blocchi input normale (hook deve essere non-intercept se non è la hotkey target).
- **Vincolo:** su alcuni antivirus/EDR aziendali gli hook globali possono triggerare warning — mitigazione: documentarlo, firmare l'eseguibile con certificato code-signing in seguito (fuori MVP), fornire fallback "click-to-toggle" se l'hook è bloccato.
- **Alternativa se `uiohook-napi` dovesse risultare non mantenuta al momento dell'install:** `node-global-key-listener` (solo tastiera, più leggero) — da valutare solo se `uiohook-napi` non installa su Node 20+/Electron corrente. Verifica da fare in Fase 2 al `npm install`.

### 4.3 Iniezione testo — clipboard swap + `Ctrl+V` via `@nut-tree/nut-js`

- **Scelta:** non digitazione tasto-per-tasto (lenta, rompe con unicode/emoji/accenti, layout tastiera), ma clipboard swap + simulazione `Ctrl+V`.
- **Verifica:** `@nut-tree/nut-js` è mantenuto, API `clipboard`, `keyboard` astratta per Win/Mac/Linux; alternativa storica `robotjs` è meno mantenuta. Al momento dell'implementazione verificare ultimo publish su npm e issue aperte; se `nut-js` dovesse essere non installabile, fallback `clipboardy` + `nut-js` solo per `keyboard` o `node-key-sender` (Windows-specific).
- **Dettagli implementativi MVP:** salvare `clipboard.readText()` originale → `clipboard.writeText(trascrizione)` → `keyboard.pressKey(Key.LeftControl, Key.V)` → delay 150–300ms → ripristino clipboard originale. Testare che il ripristino non sovrascriva un nuovo contenuto clipboard dell'utente se l'utente copia altro nei 2s successivi (mitigazione: ripristino solo se clipboard contiene ancora la trascrizione).
- **Permessi:** su Windows non servono permessi di accessibilità come su macOS; nessun blocco.

### 4.4 Cattura audio — `getUserMedia` in `BrowserWindow` nascosta

- **Verifica:** Electron include Chromium → `navigator.mediaDevices.getUserMedia({ audio: true })` disponibile senza librerie esterne. Richiede `BrowserWindow` con `webPreferences` corretta e gestione permessi (`session.setPermissionRequestHandler` per `media`). Funziona in background se la window è hidden ma non distrutta.
- **Vincolo:** selezione device: enumerare `enumerateDevices()` e persistere `deviceId` preferito; se il device viene scollegato, fallback a default con messaggio.
- **Formato audio:** `MediaRecorder` con `mimeType` preferito `audio/webm;codecs=opus` (Chromium Windows) — lato Edge Function convertire/accettare webm/opus per Whisper API (che accetta webm, mp3, wav, m4a). Da validare in Fase 2 con chiamata reale.

### 4.5 Sito web — Next.js App Router + TypeScript + Tailwind + Supabase (Vercel team `StackUp`)

- **Verifica:** stack standard Vertex, nessun blocco. Supabase progetto **nuovo e isolato** (non riusare progetti di altri prodotti Vertex). Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (solo server), `STRIPE_*` placeholder test.
- **Deploy:** Vercel team `StackUp` già esistente — nessun blocco, solo collegare repo/monorepo.

### 4.6 Storage locale — SQLite (`better-sqlite3`)

- **Verifica:** `better-sqlite3` è sincrono, performante, ampiamente usato con Electron, ma è modulo nativo → richiede `electron-rebuild` / `prebuild-install`. Su Windows con Node 25 + Electron 30+ verificare compatibilità prebuild; alternativa se build fallisce: `sqlite3` (async) o `sql.js` (WASM, senza nativi) o `electron-store` (JSON) per MVP impostazioni semplici. Preferenza resta `better-sqlite3` per robustezza, fallback `electron-store` se il nativo blocca lo scaffolding.
- **Dati:** solo impostazioni (hotkey, deviceId, autoLaunch, window prefs) — niente cronologia audio/testo in MVP.

### 4.7 Sicurezza Electron — non negoziabile

- `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true` dove possibile, `preload` con `contextBridge.exposeInMainWorld` e canali IPC espliciti tipizzati (`ipcMain.handle`/`ipcRenderer.invoke`). Mai `remote`, mai `enableRemoteModule`.
- Validazione input su ogni canale IPC; CSP di base nel renderer.

---

## 5. Approccio trascrizione per MVP

**Cloud-only, proxato — mai chiave nel bundle.**

```
[App Electron] --audio blob--> [Supabase Edge Function /transcribe] --Whisper API--> [App Electron] --clipboard+Ctrl+V--> [App attiva]
                      (anon key)                     (OPENAI_API_KEY server-side)
```

- **Perché proxy:** una chiave API nel bundle Electron è estraibile con trivial reverse-engineering (anche offuscata). Il proxy è più importante qui che in un'app web, non meno. L'Edge Function detiene `OPENAI_API_KEY` come secret, valida la richiesta (rate limit base, max durata audio es. 60s, max size es. 10 MB), inoltra a `https://api.openai.com/v1/audio/transcriptions` con modello `whisper-1`, ritorna `{ text }`.
- **Modello MVP:** `whisper-1` (OpenAI Whisper API). Nessuna rielaborazione LLM nel MVP (niente "Mode" GPT-4o).
- **Lingua:** parametro `language` opzionale (auto se omesso). MVP: auto-detect; impostazione lingua preferita rimandata a Fase 2 se non banale.
- **Privacy MVP:** nessun salvataggio audio lato server (Edge Function stateless), nessun log del testo trascritto oltre log errori anonimi. Da dichiarare in landing/privacy.
- **Costi:** Whisper API ~$0.006/min — trascurabile per MVP con pochi tester; rate limit lato Edge Function per evitare abusi se l'endpoint fosse scoperto.
- **Evoluzione Fase 2:** aggiungere Modes LLM (GPT-4o mini per rielaborazione), vocabolario custom via prompt, opzione modello locale offline (Whisper.cpp) per privacy totale.

---

## 6. Struttura repository proposta — Monorepo

**Raccomandazione: monorepo con due cartelle top-level.**

```
/ (root)
├── docs/
│   └── scope.md                 # questo file
├── app-desktop/                 # Electron + TypeScript (prodotto)
│   ├── src/
│   │   ├── main/                # processo main: tray, uiohook, lifecycle, IPC, autoLaunch
│   │   ├── renderer/            # UI: overlay registrazione + finestra impostazioni
│   │   ├── preload/             # bridge sicuro contextBridge
│   │   └── services/
│   │       ├── audio/           # cattura microfono (getUserMedia wrapper)
│   │       ├── transcription/   # client verso Supabase Edge Function
│   │       ├── input-injection/ # clipboard swap + Ctrl+V
│   │       └── storage/         # SQLite (better-sqlite3) / electron-store fallback
│   ├── resources/               # icone tray, assets
│   ├── electron.vite.config.ts
│   ├── package.json
│   └── .env.example
├── app-web/                     # Next.js App Router + Tailwind + Supabase (sito)
│   ├── app/
│   ├── components/
│   ├── lib/supabase/
│   ├── public/
│   ├── package.json
│   └── .env.example
├── .gitignore
└── README.md
```

**Motivazione monorepo:**

1. **Unico branch/PR per Giorno 1** (`feature/voiceflow-day1-…` → `main`) come richiesto dal brief, senza coordinare due repo.
2. **Condivisione doc/decisions** (`docs/`, `README.md` root) e CI futura unica.
3. **Deploy separati comunque:** `app-web` deploya su Vercel con root directory `app-web`; `app-desktop` non deploya su Vercel (build locale con `electron-builder`).
4. **Alternativa repo separati:** valida solo se i team dovessero divergere o se si vuole isolamento permessi — non è il caso per MVP solo-founder di 6 giorni. Se preferisci due repo, lo si può fare in Fase 3 su tua indicazione esplicita — per ora si procede monorepo.

---

## 7. Decisioni aperte con fallback

| Decisione | Opzioni considerate | Fallback deciso per MVP | Quando rivedere |
|-----------|---------------------|-------------------------|-----------------|
| **Hotkey di default** | `Ctrl+Space`, `Alt+Space`, `F9`, `Ctrl+Shift+Space` | **Push-to-talk configurabile, default `Ctrl+Space`** (hold = registra, release = trascrivi). `Ctrl+Space` ha bassa collisione su Windows (usata da alcuni IME/code completion ma raramente bloccante). | Se `Ctrl+Space` confligge con app target comuni, rendere hotkey totalmente riassegnabile in Impostazioni (già previsto). |
| **App sempre in background con tray?** | Sempre in tray vs finestra principale persistente | **Sì — `Tray` API Electron, icona sempre visibile, menu contestuale, avvio automatico opzionale (default OFF) via `app.setLoginItemSettings({ openAtLogin })`** | Se UX tray risulta poco scopribile, aggiungere onboarding "cerca l'icona nel tray" al primo avvio. |
| **Finestra principale visibile o solo tray+overlay?** | Finestra main persistente vs solo tray+overlay vs tray+finestra impostazioni on-demand | **Nessuna finestra principale di default; solo tray icon + overlay pill flottante durante registrazione + finestra Impostazioni richiamabile dal tray** | Se serve dashboard cronologia in Fase 2, introdurre finestra principale opzionale. |
| **Lingua trascrizione default** | Auto-detect vs IT fisso vs EN fisso vs selettore | **Auto-detect (Whisper) per MVP; selettore lingua in Impostazioni come enhancement G5 se a costo zero** | Fase 2: preferenza lingua persistita + auto-switch per app attiva. |
| **Durata massima registrazione** | 15s / 30s / 60s / illimitata | **60s max per MVP** (limite Edge Function + UX: dettatura lunga = incolla lungo, meglio spezzare). Oltre 60s: tronca con avviso. | Aumentabile a 120s se Whisper gestisce bene e UX non ne soffre. |
| **Ripristino clipboard** | Ripristina sempre vs ripristina solo se invariata vs non ripristinare | **Ripristina solo se clipboard contiene ancora la trascrizione** (evita di sovrascrivere una copia fatta dall'utente nei 2s successivi). Delay 800–1200ms dopo `Ctrl+V`. | Testare su Word/Outlook dove l'incolla può essere asincrono. |
| **Hotkey registrata a livello sistema vs app** | Globale sempre attiva vs solo quando app a fuoco | **Globale sempre attiva** (è il valore core: dettare in qualsiasi app). Toggle "Pausa dettatura" da tray per disattivarla temporaneamente. | Se antivirus blocca hook, fallback toggle manuale. |
| **Gestione errori rete** | Retry automatico vs messaggio immediato | **1 retry rapido, poi messaggio "Rete assente — riprova" con bottone Riprova che reinvia ultimo blob** | Fase 2: coda offline + reinvio. |

---

## 8. Rischi tecnici noti e mitigazioni

| Rischio | Impatto | Mitigazione MVP |
|---------|---------|-----------------|
| **Hook globale intercetta/blocca input normale** | Critico — bug serio, utente non può digitare | Test approfondito su Windows 10/11: hook in modalità non-intercept tranne per hotkey target; test con layout IT/US, con `CapsLock`/`NumLock`, con app elevate (admin). Se `uiohook-napi` blocca, valutare `node-global-key-listener`. |
| **Falso positivo antivirus/EDR su hook globale** | Medio — installer bloccato o warning | Documentare, firmare eseguibile in futuro (code signing cert), fornire istruzioni whitelist; fallback modalità "click-to-toggle" senza hook se rilevato blocco. |
| **Iniezione clipboard fallisce (app non accetta Ctrl+V, es. terminali, campi protetti)** | Medio — incolla non avviene | MVP supporta app standard (browser, Slack, Office, editor). Per terminali/campi password: messaggio "Incolla manualmente con Ctrl+V" + copia in clipboard come fallback. |
| **`better-sqlite3` native build fallisce su Node 25/Electron** | Medio — blocca scaffolding | Fallback immediato a `electron-store` (JSON) per impostazioni MVP; `better-sqlite3` reintrodotto quando prebuild disponibile. |
| **`@nut-tree/nut-js` non mantenuto / install fallisce** | Medio — blocca iniezione | Verificare al `npm install` in Fase 2; fallback `clipboardy` + alternativa key sender Windows-specific. |
| **Permesso microfono negato / device scollegato** | Basso — UX degradata | Gestione esplicita `NotAllowedError`/`NotFoundError` con dialog che rimanda a Impostazioni Windows > Privacy > Microfono. |
| **Chiave API esposta se non proxata** | Alto — costo/abuso | Mai nel bundle; solo Edge Function con secret. Rate limit + max size/durata lato funzione. |
| **Processi orfani dopo cicli registrazione** | Medio — consumo risorse | Test 20 cicli con Task Manager; garantire `MediaRecorder.stop()`, `stream.getTracks().forEach(t => t.stop())`, cleanup `uIOhook.stop()` su quit. |
| **Sicurezza renderer (XSS → Node access)** | Alto se trascurata | `contextIsolation: true`, `nodeIntegration: false`, `sandbox`, IPC tipizzato, CSP. Mai esporre `require`/`process` al renderer. |

---

## 9. Criteri di successo per v0 (fine Giorno 6)

- [ ] `docs/scope.md` approvato (Checkpoint 1).
- [ ] `app-desktop` si avvia in dev (`npm run dev` in `app-desktop`), tray visibile, overlay appare su hotkey, hook non blocca input.
- [ ] Loop end-to-end funzionante: `Ctrl+Space` (hold) → parla → release → trascrizione via Edge Function → incolla in app attiva (testato in almeno 3 app diverse).
- [ ] `app-web` si avvia (`npm run dev` in `app-web`), deploy preview Vercel visibile, landing shell con CTA placeholder.
- [ ] 20 cicli registrazione senza processi orfani / leak.
- [ ] PR `feature/voiceflow-day1-…` → `main` aperta, non mergiata, con README e `.gitignore` verificati.

---

## 10. Prossimi passi — cosa serve da te ora (Checkpoint 1)

**STOP — non procedo oltre senza tua conferma esplicita.**

Per procedere alla Fase 2 (scaffolding `app-desktop`), conferma:

1. **Nome:** confermi `VoiceFlow` come nome di lavoro fino a Giorno 6, o scegli `Detta` / `WhisperWin`?
2. **Feature set MVP:** approvi la tabella §3.1 come scope spietato, o vuoi spostare qualcosa tra IN/FUORI?
3. **Monorepo:** approvi struttura `/app-desktop` + `/app-web` in unico repo, o preferisci due repo separati?
4. **Stack:** confermi `uiohook-napi` + `@nut-tree/nut-js` + `better-sqlite3` (con fallback dichiarati), o hai preferenze diverse?

Appena confermi, procedo con Fase 2 (scaffolding Electron) e poi Fase 3 (scaffolding Next.js) con checkpoint dedicati.

---

*Documento generato per Giorno 1 — Fase 1. Nessun codice è stato scritto in questa fase, come da regola.*
