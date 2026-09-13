import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Scarica VoiceFlow per Windows",
  description:
    "Download di VoiceFlow per Windows 10/11 64-bit. Push-to-talk globale, trascrizione cloud via proxy, nessuna chiave nel client.",
};

const REQUIREMENTS = [
  "Windows 10 o 11, 64-bit",
  "Microfono funzionante (integrato o esterno)",
  "Connessione internet per la trascrizione cloud (Whisper via proxy)",
  "~150 MB di spazio su disco",
];

export default function DownloadPage() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-sm font-semibold tracking-tight">
            ← VoiceFlow
          </Link>
          <Link
            href="/"
            className="rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-800"
          >
            Home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16">
        <p className="inline-flex rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs font-medium uppercase tracking-widest text-zinc-400">
          v0 · shell
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Scarica per Windows</h1>
        <p className="mt-3 text-base leading-7 text-zinc-400">
          L&apos;installer NSIS non è ancora pubblicato: questo è lo <strong className="font-semibold text-zinc-200">scaffolding
          v0</strong> del Giorno 1. La build di produzione arriverà dopo il Giorno 6 (firma del codice inclusa).
        </p>

        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" disabled aria-disabled="true">
              Scarica per Windows — prossimamente
            </Button>
            <span className="text-xs text-zinc-500">Installer firmato in arrivo · Fase 2 della roadmap</span>
          </div>
          <p className="mt-4 text-sm leading-6 text-zinc-400">
            In alternativa, per ora puoi avviare l&apos;app dagli sorgenti:{" "}
            <code className="rounded bg-zinc-950 px-1.5 py-0.5 font-mono text-xs text-zinc-200">cd app-desktop &amp;&amp; npm run dev</code>.
          </p>
        </div>

        <section className="mt-10 rounded-2xl border border-zinc-900 bg-zinc-900/30 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">Requisiti</h2>
          <ul className="mt-3 space-y-2 text-sm text-zinc-300">
            {REQUIREMENTS.map((r) => (
              <li key={r} className="flex gap-2">
                <span aria-hidden className="text-zinc-600">
                  •
                </span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-6 rounded-2xl border border-zinc-900 bg-zinc-900/30 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">Privacy</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            L&apos;audio viene inviato alla Edge Function <code className="rounded bg-zinc-950 px-1 py-0.5 text-zinc-200">/transcribe</code>{" "}
            e inoltrato a Whisper. Nessun audio viene salvato lato server e nessuna chiave API è presente nel client.
          </p>
        </section>

        <p className="mt-8 text-xs text-zinc-500">
          Problemi con l&apos;installazione o l&apos;hook globale? Se un antivirus/EDR blocca l&apos;hook tastiera, la dettatura non parte:
          usa il toggle Pausa/Riprendi dal tray. Dettagli in <code className="rounded bg-zinc-900 px-1 py-0.5">docs/scope.md</code>.
        </p>
      </main>
    </div>
  );
}
