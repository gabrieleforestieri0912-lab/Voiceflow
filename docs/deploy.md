# Deploy e ambiente — sito web VoiceFlow

Note operative sul progetto web. L'app desktop è in un repo separato.

## Vercel

| Campo | Valore |
|-------|--------|
| Progetto | `voiceflow` |
| Scope | `Vertex` (`vertex-9`) — il team `StackUp` non esiste: `stackup` è un *progetto* dentro Vertex |
| Root Directory | **(root)** — il progetto Next è nella root del repo |
| Framework | Next.js |
| Production branch | `main` |

- Push su `main` → deploy di produzione.
- Pull request → preview automatica.
- Deploy manuale: `vercel --prod` (dalla root)

Aggiornamento: la Root Directory su Vercel va cambiata da `app-web` a **vuota/root** dopo questo spostamento (Settings → General → Root Directory → Edit → svuota / lascia `.`).

URL:

- Produzione → <https://voiceflow-flax.vercel.app>
- Alias: `voiceflow-vertex-9.vercel.app`, `voiceflow-git-main-vertex-9.vercel.app`

## Environment Variables su Vercel

Vanno impostate per **Production** e **Preview**:

| Variabile | Scope | Note |
|-----------|-------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | client + server | pubblica |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client + server | pubblica |
| `SUPABASE_SERVICE_ROLE_KEY` | solo server | **mai** esposta al client |
| `STRIPE_SECRET_KEY` | solo server | placeholder finché non c'è checkout |
| `STRIPE_WEBHOOK_SECRET` | solo server | placeholder |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | client | placeholder |

Senza le `NEXT_PUBLIC_SUPABASE_*` la landing funziona comunque (è statica), ma auth/licenze reali no.

## Supabase

Il progetto Supabase deve essere **dedicato a VoiceFlow**: non riusare progetti di altri prodotti,
per isolamento dei dati. Le migrazioni/schema vivranno in questo repo (o in un repo infrastruttura)
quando si aggiungono auth e licenze.

Nota: la Edge Function `transcribe` (proxy verso Whisper per la trascrizione) è **del desktop** e
vive nel repo dell'app desktop, non qui.

## Verifica locale

```bash
npm install
# configura .env con le variabili necessarie
npx tsc --noEmit
npm run build
npm run dev
```
