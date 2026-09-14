import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy — VoiceFlow",
  description:
    "Informativa privacy di VoiceFlow: nessun contenuto delle trascrizioni salvato lato cloud di default, testo dettato resta locale. Permessi di sistema spiegati.",
};

const UPDATED = "14 settembre 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 rounded-2xl border border-border bg-surface/50 p-6">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-6 text-muted-foreground">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-sm font-semibold tracking-tight">
            ← VoiceFlow
          </Link>
          <span className="text-xs text-muted-foreground">Ultimo aggiornamento: {UPDATED}</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <p className="inline-flex rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Privacy
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Informativa sulla privacy
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Testi come <strong className="font-semibold text-foreground">punto di partenza</strong>, non consulenza legale.
          Prima di una campagna ampia, farli rivedere a un professionista.
        </p>

        <div className="mt-6 rounded-2xl border border-accent/30 bg-accent/10 p-4">
          <p className="text-sm font-semibold text-foreground">Principio chiave (Giorno 3)</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            <strong className="text-foreground">Nessun contenuto delle trascrizioni salvato lato cloud di default.</strong> Il testo
            dettato resta <strong className="text-foreground">locale sul dispositivo</strong> e viene iniettato nell&apos;app dove si
            trova il cursore. L&apos;audio viene inviato al nostro proxy di trascrizione solo per il tempo necessario a ottenere il
            testo e poi scartato; non manteniamo un archivio delle dettature.
          </p>
        </div>

        <Section title="1. Titolare e contatti">
          <p>
            Titolare: <strong className="text-foreground">StackUp</strong> (nome operativo VoiceFlow).
            Per richieste privacy: <a href="mailto:privacy@voiceflow.app" className="underline decoration-accent underline-offset-4">privacy@voiceflow.app</a>{" "}
            — per supporto generale: <a href="mailto:support@voiceflow.app" className="underline">support@voiceflow.app</a>.
          </p>
          <p className="text-xs">Sostituire con ragione sociale, sede e DPO se nominato prima del lancio pubblico.</p>
        </Section>

        <Section title="2. Cosa raccogliamo e perché">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-foreground">Audio della dettatura (temporaneo)</strong>: quando tieni premuta la hotkey,
              l&apos;app registra dal microfono e invia l&apos;audio alla Edge Function <code className="rounded bg-background px-1 py-0.5 font-mono text-xs">/transcribe</code> che
              funge da proxy verso Whisper. L&apos;audio è usato solo per produrre il testo e
              <strong> non viene salvato in modo persistente</strong> sul nostro cloud.
            </li>
            <li>
              <strong className="text-foreground">Testo trascritto</strong>: resta locale. Non lo salviamo lato server di default.
              Se in futuro offriremo cronologia cloud opzionale, sarà esplicitamente opt-in.
            </li>
            <li>
              <strong className="text-foreground">Dati di licenza/acquisto</strong>: email d&apos;acquisto e stato licenza
              gestiti dal provider di pagamento (es. Lemon Squeezy / Stripe — da confermare) e verificati dall&apos;app. Non
              tracciamo il contenuto di ciò che detti per finalità di marketing.
            </li>
            <li>
              <strong className="text-foreground">Telemetria anonima aggregata</strong> (opzionale, vedi §5): eventi come{" "}
              <code className="bg-background px-1">app_installed</code>, <code className="bg-background px-1">onboarding_completed</code>,{" "}
              <code className="bg-background px-1">first_dictation_completed</code>,{" "}
              <code className="bg-background px-1">license_activated</code> — senza contenuto della dettatura, senza IP in chiaro
              se configurato.
            </li>
          </ul>
        </Section>

        <Section title="3. Permessi di sistema richiesti dall'app desktop (Windows)">
          <p>L&apos;app richiede questi permessi solo per la sua funzione core; puoi revocarli in qualsiasi momento.</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-foreground">Microfono</strong> — per registrare la tua voce quando premi la hotkey.
              Senza, la dettatura non può partire. Gestito via <code className="bg-background px-1">getUserMedia</code> + permesso
              Windows <code className="bg-background px-1">ms-settings:privacy-microphone</code>.
            </li>
            <li>
              <strong className="text-foreground">Hook tastiera globale (uiohook-napi)</strong> — per intercettare la hotkey (default{" "}
              <code className="bg-background px-1">Ctrl+Spazio</code>) anche quando un&apos;altra app è in primo piano. Non registra
              ciò che digiti al di fuori della dettatura e non invia sequenze di tasti a server remoti. Può essere messo in pausa
              dal tray.
            </li>
            <li>
              <strong className="text-foreground">Simulazione input / clipboard (nut-js)</strong> — per iniettare il testo trascritto
              dove si trova il cursore (clipboard swap + <code className="bg-background px-1">Ctrl+V</code>). Il contenuto iniettato
              è solo il risultato della tua ultima dettatura. L&apos;app non legge di propria iniziativa la clipboard al di fuori
              di questo flusso.
            </li>
          </ul>
          <p className="text-xs">
            Nota per utenti con antivirus/EDR: questi due pattern (hook globale + simulazione input) sono gli stessi usati da
            alcuni malware — per questo alcuni AV alzano falsi positivi. Vedi <code className="bg-background px-1">docs/antivirus-notes.md</code> nella
            build desktop.
          </p>
        </Section>

        <Section title="4. Base giuridica (UE/GDPR)">
          <p>
            Trattiamo i dati sopra per <strong className="text-foreground">esecuzione del contratto</strong> (fornirti la dettatura che
            hai acquistato) e, per la telemetria aggregata, su <strong className="text-foreground">legittimo interesse</strong> a
            misurare l&apos;uso del prodotto in forma anonima. L&apos;audio è trattato solo su tua azione esplicita (premi la
            hotkey).
          </p>
        </Section>

        <Section title="5. Telemetria e crash reporting">
          <p>
            In questa fase l&apos;app usa <strong className="text-foreground">logging locale + invio diagnostica manuale</strong> come
            default (coerente con “defer infrastructure until demand is proven”). Se attiveremo un servizio di crash reporting
            (es. Sentry), raccoglierà solo stack trace e metadati tecnici, mai il contenuto delle dettature, e sarà disattivabile.
            Gli eventi di prodotto sono conteggi anonimi senza identificativi personali.
          </p>
        </Section>

        <Section title="6. Conservazione">
          <ul className="list-disc pl-5">
            <li>Audio: non conservato di default; trattenuto solo in memoria/transito per la trascrizione.</li>
            <li>Testo dettato: locale sul tuo PC, gestito da te.</li>
            <li>Dati di licenza: per la durata del rapporto + obblighi fiscali del provider di pagamento.</li>
          </ul>
        </Section>

        <Section title="7. Condivisione con terzi">
          <p>
            L&apos;audio viene inoltrato al provider di trascrizione (OpenAI Whisper via proxy) esclusivamente per produrre il
            testo. Non vendiamo dati a terzi. Hosting sito: Vercel; backend auth/proxy: Supabase Edge Functions.
          </p>
        </Section>

        <Section title="8. I tuoi diritti">
          <p>
            Puoi chiedere accesso, rettifica, cancellazione, limitazione, opposizione e portabilità scrivendo a{" "}
            <a href="mailto:privacy@voiceflow.app" className="underline">privacy@voiceflow.app</a>. Puoi inoltre disattivare
            microfono/hook dalle impostazioni di Windows e dall&apos;app. Reclami: autorità garante del tuo Paese (in Italia: Garante Privacy).
          </p>
        </Section>

        <Section title="9. Minori">
          <p>Il servizio non è rivolto a minori di 16 anni.</p>
        </Section>

        <Section title="10. Modifiche">
          <p>Aggiorneremo questa informativa al lancio di nuove funzionalità (es. cronologia cloud opt-in) e ne daremo avviso sul sito/app.</p>
        </Section>

        <p className="mt-8 text-xs text-muted-foreground">
          Questa pagina è un <strong>template operativo</strong> per il lancio. Non costituisce consulenza legale.
        </p>

        <div className="mt-6 flex gap-3 text-sm">
          <Link href="/terms" className="underline decoration-accent underline-offset-4">
            Vai ai Termini →
          </Link>
          <span className="text-muted-foreground">·</span>
          <Link href="/" className="underline">
            Home
          </Link>
        </div>
      </main>
    </div>
  );
}
