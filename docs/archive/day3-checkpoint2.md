# Giorno 3 — Checkpoint 2 — Edge Functions + client main

> Branch: `feature/voiceflow-day3-api-db-20260913-125259`
> Data: 2026-09-13
> Stato: **STOP — in attesa di conferma dopo Checkpoint 1**

## Edge Functions create

Tutte in `supabase/functions/` (identiche nei repo Web e Desktop, deploy da uno dei due):

- `transcribe` (legacy Giorno 1/2, mantenuta per compatibilità) — `verify_jwt = true`, proxy diretto a `whisper-1`.
- `transcribe-audio` (**nuova, primaria Giorno 3**) — `supabase/functions/transcribe-audio/index.ts`:
  - Riceve `multipart/form-data` con `audio` (max 10 MB), `language`, `vocabulary` (JSON array opzionale per Fase 3).
  - Autenticazione: `Authorization: Bearer <Supabase JWT>` o `x-license-key`; verifica licenza in `licenses` (plan/status) via `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`.
  - Quota: se `plan === 'free'`, verifica `transcription_usage` per periodo mensile corrente; blocca con `429 QUOTA_EXCEEDED` se `words_transcribed >= FREE_MONTHLY_WORD_LIMIT` (default 10000, via env `FREE_MONTHLY_WORD_LIMIT`).
  - Rate limit IP best-effort (20 req/min), CORS, timeout 75s verso OpenAI, gestione esplicita: rete assente → `502 UPSTREAM_NETWORK_ERROR`, provider down → `502 UPSTREAM_RATE_LIMITED/UPSTREAM_ERROR`, risposta malformata → `502 UPSTREAM_MALFORMED`, audio vuoto/troppo grande → `400/413`, trascrizione vuota → `422`.
  - Sempre errore strutturato `{ error, code }`, mai crash. Nessun salvataggio audio, nessun log testo.
  - Dopo trascrizione ok, aggiorna `transcription_usage` (count words) best-effort.
  - Chiave provider solo in `OPENAI_API_KEY` env della Edge Function.
- `apply-mode` (**nuova, stub Fase 2**) — `supabase/functions/apply-mode/index.ts`:
  - Riceve `JSON { text, mode, vocabulary? }`, valida `text`/`mode`, verifica `OPENAI_API_KEY`.
  - Fuori scope MVP (`docs/scope.md` §3.2: Modes multipli rimandati), risponde `501 NOT_IMPLEMENTED` con messaggio chiaro e lista modes noti. Quando i Modes saranno in scope, qui chiamare `POST https://api.openai.com/v1/chat/completions`.

Config: `supabase/config.toml` aggiornato con `[functions.transcribe-audio]` e `[functions.apply-mode]` (`verify_jwt = false` per gestire JWT manualmente + license_key).

## Client HTTP lato main (superficie attacco minima)

- `src/main/transcription.ts` (**nuovo**) — esegue `fetch` verso `transcribe-audio` (fallback legacy `transcribe`) dal **processo main**, non dal renderer. Usa `Buffer` + `Blob` + `FormData`, header `apikey`/`Authorization`/`x-license-key` da `VITE_SUPABASE_ANON_KEY`/`VITE_LICENSE_KEY`, timeout 30s, retry max 2 tentativi (1 retry su 5xx/rete/timeout con backoff 600–800ms), gestione `QUOTA_EXCEEDED`/`RATE_LIMITED` senza retry, errori strutturati con `code`.
- `src/main/index.ts` — `ipcMain.handle("transcription:transcribe", ...)` ora importa `transcribeInMain` e ritorna `{ ok, text } | { ok:false, error, code }` invece del dummy.
- `src/services/transcription/client.ts` — aggiornato: `transcribeAudio(blob, language, vocabulary?)` prima tenta `window.voiceflow.invoke("transcription:transcribe", { audioBase64, mimeType, language, vocabulary })` (via `blobToBase64`), poi fallback fetch diretto (per smoke/test) con stesso retry max 2 e stessi codici errore. Nessuna chiave nel bundle: solo `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` (pubbliche) e `VITE_TRANSCRIBE_FUNCTION_URL` opzionale.

## Verifica bundle — nessuna chiave AI esposta

```bash
# Desktop
npm run build
# Cerca chiavi nel bundle distribuito
grep -r "OPENAI_API_KEY\|sk-" dist-electron/ dist/ || echo "OK: nessuna chiave nel bundle"
grep -r "supabase.*service_role\|SERVICE_ROLE" dist-electron/ dist/ || echo "OK: nessuna service_role nel bundle"
# Atteso: solo VITE_SUPABASE_URL/ANON_KEY (pubbliche) e nessun sk-/OPENAI
```

Variabile segreta `OPENAI_API_KEY` vive solo come `supabase secrets set OPENAI_API_KEY=...` per le Edge Functions, mai in `.env` del desktop né nel bundle.

## Test end-to-end (da eseguire dopo deploy)

```bash
# 1. Collega Supabase e deploya
supabase link --project-ref <ref>
supabase secrets set OPENAI_API_KEY=sk-...
supabase functions deploy transcribe transcribe-audio apply-mode

# 2. Avvia desktop
cd "C:/Users/Utente/Documents/Vertex/Desktop/voiceflow"
npm run dev
# 3. Tieni premuto Ctrl+Spazio, parla 2–3s, rilascia
# Atteso: overlay recording → processing → testo iniettato nell'app attiva (Notepad/Slack/browser)
# Log main: [transcribe-audio] non logga testo, solo status/errori troncati
# Se free quota superata: errore chiaro "Limite parole mensile superato (10000 parole nel piano free). Passa a Pro..."
# Se rete assente: renderer mostra "Errore rete trascrizione" con retry (max 2), poi messaggio "servizio down"
# Se provider down: 502 UPSTREAM_RATE_LIMITED con messaggio "Provider AI temporaneamente sovraccarico, riprova tra poco."
```

## Checkpoint 2 — cosa mostrare

- Log del flusso completo: richiesta `POST /functions/v1/transcribe-audio` con `Authorization: Bearer <anon>` + `x-license-key` opzionale → `200 { text }` → `input:injectText` → testo incollato.
- Se non hai ancora un progetto Supabase collegato, il test va rimandato a dopo `supabase link` + `supabase functions deploy`.
