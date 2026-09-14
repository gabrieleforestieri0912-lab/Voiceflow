import type { Metadata } from "next";
import Link from "next/link";

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

const BUILD = {
  version: "0.1.0",
  date: "2026-09-14",
  sizeMB: "73,88",
  sha256: "75EE7FC0173110487E6316000BAAB0283BDC0B00698BDDA4E3E372A95BED0A2C",
  sha256Short: "75EE7FC0…BED0A2C",
  signedDevSha256: "7D6BA1B36FFDF5C391736BD8900E0B8264F5A1A4C0B1D46FCACC250CDB7E5B25",
  locales: "en-US, en-GB, it (52 rimosse, 40 MB → 1,48 MB)",
  defender: "pulito (MpCmdRun 14/09/2026)",
};

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
        <p className="inline-flex rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium uppercase tracking-widest text-accent">
          v0.1.0 · 14 settembre 2026
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Scarica per Windows</h1>
        <p className="mt-3 text-base leading-7 text-zinc-400">
          Installer NSIS x64 <strong className="font-semibold text-zinc-200">pronto per test su macchina pulita</strong>. Firma di
          produzione OV/EV in arrivo — la build attuale è ottimizzata e scansionata. Vedi dettagli sotto.
        </p>

        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://github.com/gabrieleforestieri0912-lab/Voiceflow/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-100"
            >
              Scarica VoiceFlow {BUILD.version} per Windows
            </a>
            <span className="text-xs text-zinc-500">
              {BUILD.sizeMB} MB · NSIS · {BUILD.locales} · Defender {BUILD.defender}
            </span>
          </div>
          <div className="mt-4 rounded-xl bg-zinc-950 p-3">
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">Verifica integrità</p>
            <p className="mt-1 font-mono text-xs text-zinc-300">
              SHA256: <span className="break-all">{BUILD.sha256}</span>
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Build firmata DEV (self-signed): <span className="font-mono">{BUILD.signedDevSha256}</span> —{" "}
              <span className="text-zinc-400">pipeline in docs/code-signing.md</span>
            </p>
            <p className="mt-2 text-xs leading-5 text-zinc-500">
              VirusTotal:{" "}
              <a
                href={`https://www.virustotal.com/gui/file/${BUILD.sha256}/detection`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-accent underline-offset-4"
              >
                apri report hash
              </a>{" "}
              · Script auto: <code className="rounded bg-zinc-900 px-1 py-0.5">.\scripts\virustotal-upload.ps1</code> in{" "}
              <code className="rounded bg-zinc-900 px-1 py-0.5">Voiceflow_Desktop</code>
            </p>
          </div>
          <p className="mt-4 text-sm leading-6 text-zinc-400">
            Release GitHub placeholder — finché non c&apos;è hosting firmato, scarica l&apos;artefatto locale:{" "}
            <code className="rounded bg-zinc-950 px-1.5 py-0.5 font-mono text-xs text-zinc-200">
              Voiceflow_Desktop/release/0.1.0/VoiceFlow_0.1.0.exe
            </code>{" "}
            (73,89 MB) o avvia da sorgenti{" "}
            <code className="rounded bg-zinc-950 px-1.5 py-0.5 font-mono text-xs text-zinc-200">cd Voiceflow_Desktop && npm run dev</code>.
          </p>
          <p className="mt-2 text-xs leading-5 text-amber-300/90">
            Nota SmartScreen: build non firmata con cert reale → Windows mostrerà “Editore sconosciuto”. Dettagli e sottomissione WDSI
            in <code className="rounded bg-zinc-900 px-1 py-0.5">Voiceflow_Desktop/docs/code-signing.md</code>.
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
