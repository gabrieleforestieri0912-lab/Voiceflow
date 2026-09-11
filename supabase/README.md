# Supabase — VoiceFlow

Questa cartella contiene la **Edge Function `transcribe`**, l'unico punto in cui vive la
chiave OpenAI (`OPENAI_API_KEY`) come secret. L'app desktop non contiene mai la chiave:
invia il blob audio alla funzione e riceve `{ text }`.

```
[App Electron] --audio blob--> [Edge Function /transcribe] --whisper-1--> [App Electron]
     (anon key)                    (OPENAI_API_KEY server-side)
```

## Setup (progetto dedicato, non riusare altri progetti)

```bash
# 1. Crea un progetto Supabase dedicato a VoiceFlow (dashboard) e collega la CLI
supabase link --project-ref <project-ref>

# 2. Imposta il secret (mai nel repo)
supabase secrets set OPENAI_API_KEY=sk-...

# 3. Deploy della funzione
supabase functions deploy transcribe
```

## Sviluppo locale

```bash
supabase start
cp .env.example .env      # inserisci OPENAI_API_KEY
supabase functions serve transcribe --env-file .env
```

## Contratto

`POST` `multipart/form-data`

| Campo      | Tipo   | Note |
|------------|--------|------|
| `audio`    | file   | webm/ogg/mp3/m4a/wav, max 10 MB (≈60s) |
| `language` | string | opzionale (`it`, `en`, …); `auto`/omesso = auto-detect |

Risposta: `200 { "text": string }` oppure `4xx/5xx { "error": string }`.

Header richiesti dal client: `apikey: <anon>` e `Authorization: Bearer <anon>`.

## Privacy

La funzione è **stateless**: nessun audio salvato, nessun log del testo trascritto
(solo log di errore troncati). Vedi `docs/scope.md` §5.
