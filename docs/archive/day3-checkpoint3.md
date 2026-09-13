# Giorno 3 — Checkpoint 3 — Storico locale e vocabolario custom

> Branch: `feature/voiceflow-day3-api-db-20260913-125259`
> Data: 2026-09-13
> Stato: **Verifica scope → rimandato (fuori MVP)**

## Verifica `docs/scope.md`

`docs/scope.md` §3.2 — **Esplicitamente FUORI scope MVP (Fase 2)**:

- "Vocabolario custom / parole personalizzate / sostituzioni" → fuori.
- "Meeting assistant, trascrizione file audio/video, **cronologia trascrizioni ricercabile**" → fuori.
- "Modelli locali offline" → fuori.

Quindi **Fase 3 Giorno 3 è rimandata**: non si crea ora tabella SQLite `better-sqlite3` per storico né UI vocabolario completa. L'app resta funzionante offline per impostazioni, vocabolario futuro e storico solo locale (SQLite locale, `better-sqlite3` quando sarà reintrodotto).

## Cosa è stato fatto comunque (scaffolding predisposto)

Per non perdere il lavoro di design e rispettare il principio "app il più possibile funzionante offline — solo trascrizione cloud richiede rete. Impostazioni, storico locale, vocabolario restano disponibili offline":

- `Desktop/voiceflow/src/services/storage/history.ts` (**nuovo stub**): interfaccia `addHistoryEntry`/`getHistory`/`purgeExpired` con retention 30 giorni (default, pulizia automatica), commento con schema SQLite futuro. Oggi in-memory non persistito (MVP fuori scope); quando `better-sqlite3` sarà reintrodotto con `electron-rebuild` sicuro, implementare con `CREATE TABLE transcription_history ...` e `DELETE ... WHERE created_at < datetime('now','-30 days')`.
- `Desktop/voiceflow/src/services/storage/vocabulary.ts` (**nuovo stub**): interfaccia `getVocabulary`/`addVocabularyTerm`/`removeVocabularyTerm`/`getVocabularyTermsForPrompt`, persistenza attuale via `electron-store` (già disponibile, puro JS), schema SQLite futuro commentato, inclusione nel prompt `transcribe-audio`/`apply-mode` via campo `vocabulary` già supportato dalle Edge Functions (max 50 termini).
- `transcribe-audio` già accetta `vocabulary` e lo inoltra come `prompt` a Whisper; `transcription/client.ts` e `main/transcription.ts` già lo propagano.

## Storico locale — retention 30 giorni (quando attivo)

Schema futuro (SQLite, `better-sqlite3` o `sql.js` se nativo non disponibile):

```sql
CREATE TABLE transcription_history (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  created_at TEXT NOT NULL,
  duration_ms INTEGER,
  language TEXT
);
CREATE INDEX idx_history_created ON transcription_history(created_at);
-- Pulizia automatica (job all'avvio o giornaliero):
DELETE FROM transcription_history WHERE created_at < datetime('now', '-30 days');
```

Oggi: nessun salvataggio storico (fuori scope), nessun dato cloud.

## Vocabolario custom — dimostrazione prima/dopo (quando attivo)

Quando Fase 3 sarà in scope, la verifica richiesta:

1. Aggiungi termine custom via UI Impostazioni → `addVocabularyTerm("Kubernetes", "K8s")`.
2. Dettatura senza vocabolario: Whisper potrebbe trascrivere "coobernetti".
3. Dettatura con vocabolario: `transcribeAudio(blob, "it", getVocabularyTermsForPrompt())` invia `vocabulary` a `transcribe-audio`, che imposta `prompt: "Vocabulary: Kubernetes (K8s)"` verso Whisper → trascrizione corretta "Kubernetes".

Oggi: lo stub è verificabile via console:

```ts
import { addVocabularyTerm, getVocabularyTermsForPrompt } from "./services/storage/vocabulary.js";
addVocabularyTerm("VoiceFlow");
console.log(getVocabularyTermsForPrompt()); // ["VoiceFlow"]
```

UI minima nelle impostazioni per gestire il vocabolario è rimandata a quando la feature entrerà in scope (Fase 2).

## Conclusione

Fase 3 **non implementata in MVP** per coerenza con `scope.md` §3.2. Scaffolding e Edge Function già pronti per attivazione futura senza modifiche al contratto. Nessun push su `main` fino a tua conferma.
