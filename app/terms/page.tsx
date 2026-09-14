import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Termini di servizio — VoiceFlow",
  description: "Termini di servizio di VoiceFlow: licenza d'uso, uso consentito, limitazioni e supporto.",
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

export default function TermsPage() {
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
          Termini
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Termini di servizio</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Testi come <strong className="font-semibold text-foreground">punto di partenza</strong>, non consulenza legale.
        </p>

        <Section title="1. Oggetto">
          <p>
            VoiceFlow è un&apos;app desktop per Windows che offre dettatura vocale push-to-talk: tieni premuta una hotkey
            globale, parli, rilasci — il testo trascritto viene iniettato dove si trova il cursore. Il sito{" "}
            <code className="rounded bg-background px-1 py-0.5 font-mono text-xs">voiceflow.app</code> distribuisce l&apos;installer
            e gestisce licenze/acquisto.
          </p>
        </Section>

        <Section title="2. Licenza d'uso">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Ti concediamo una licenza personale, non esclusiva, non trasferibile per installare e usare VoiceFlow su dispositivi
              Windows di tua proprietà, in base al piano acquistato.
            </li>
            <li>Non puoi rivendere, sublicenziare o distribuire l&apos;app al di fuori dei canali ufficiali.</li>
            <li>La licenza è verificata via chiave/attivazione online; l&apos;uso offline prolungato può richiedere riverifica.</li>
          </ul>
        </Section>

        <Section title="3. Uso consentito e vietato">
          <ul className="list-disc space-y-2 pl-5">
            <li>Usa VoiceFlow solo per contenuti di cui hai diritto a dettare/inserire.</li>
            <li>
              Vietato: reverse engineering sistematico, elusione dei controlli di licenza, uso per sorveglianza occulta di terzi
              (l&apos;app richiede azione esplicita sulla hotkey e non registra di nascosto), o per generare contenuti illegali.
            </li>
            <li>Sei responsabile del testo che inietti nelle app di destinazione.</li>
          </ul>
        </Section>

        <Section title="4. Privacy e trascrizioni — vincolo del Giorno 3">
          <p>
            <strong className="text-foreground">Nessun contenuto delle trascrizioni salvato lato cloud di default.</strong> Il testo
            dettato resta locale sul tuo dispositivo. L&apos;audio viene trasmesso al nostro proxy di trascrizione solo per
            generare il testo e non viene archiviato. Vedi l&apos;
            <Link href="/privacy" className="underline decoration-accent underline-offset-4">
              Informativa privacy
            </Link>{" "}
            per permessi richiesti (microfono, hook tastiera, simulazione input) e base giuridica.
          </p>
        </Section>

        <Section title="5. Pagamenti e rimborsi">
          <p>
            I pagamenti sono gestiti da un provider esterno (es. Lemon Squeezy / Stripe — da confermare al go-live). Prezzi e
            piani sono su <Link href="/#pricing" className="underline">/pricing</Link>. Eventuali rimborsi seguono le policy del
            provider e la normativa applicabile; per richieste scrivi a{" "}
            <a href="mailto:support@voiceflow.app" className="underline">support@voiceflow.app</a>.
          </p>
        </Section>

        <Section title="6. Aggiornamenti e compatibilità">
          <p>
            L&apos;app include un meccanismo di auto-update (<code className="bg-background px-1">electron-updater</code>). Potremo
            rilasciare aggiornamenti per compatibilità, sicurezza o nuove funzionalità. Requisiti minimi: Windows 10/11 64-bit,
            microfono, connessione per la trascrizione cloud.
          </p>
        </Section>

        <Section title="7. Garanzie e limitazioni di responsabilità">
          <p>
            VoiceFlow è fornita &quot;così com&apos;è&quot;. Non garantiamo accuratezza perfetta della trascrizione né
            compatibilità con ogni app di terzi (es. campi protetti/terminali dove l&apos;iniezione via clipboard non funziona — il
            testo resta in clipboard). Nei limiti consentiti dalla legge, la nostra responsabilità è limitata a quanto pagato per
            il servizio nel periodo rilevante.
          </p>
        </Section>

        <Section title="8. Supporto">
          <p>
            Supporto via <a href="mailto:support@voiceflow.app" className="underline">support@voiceflow.app</a>. Segnalazioni di
            falsi positivi antivirus: includi versione dell&apos;app, motore AV e SHA256 dell&apos;installer (vedi{" "}
            <code className="bg-background px-1">docs/antivirus-notes.md</code> nella build desktop).
          </p>
        </Section>

        <Section title="9. Modifiche ai termini">
          <p>
            Potremo aggiornare questi termini per riflettere novità di prodotto o requisiti legali. Le modifiche rilevanti saranno
            comunicate sul sito/app.
          </p>
        </Section>

        <Section title="10. Legge applicabile">
          <p>
            Salvo norme imperative diverse, questi termini sono regolati dalla legge italiana. Foro competente: quello del
            consumatore se applicabile, altrimenti Milano. (Da adeguare a ragione sociale/sede definitiva.)
          </p>
        </Section>

        <p className="mt-8 text-xs text-muted-foreground">
          Template operativo per il lancio. Far rivedere a un legale prima di una campagna ampia.
        </p>

        <div className="mt-6 flex gap-3 text-sm">
          <Link href="/privacy" className="underline decoration-accent underline-offset-4">
            Vai alla Privacy →
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
