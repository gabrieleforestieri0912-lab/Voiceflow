import Link from "next/link";

export default function Page() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-sm font-semibold tracking-tight">VoiceFlow</span>
          <nav className="flex items-center gap-2">
            <Link
              href="/download"
              className="rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-800"
            >
              Scarica per Windows
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto max-w-6xl px-6">
        <section className="py-16 sm:py-20">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs font-medium uppercase tracking-widest text-zinc-400">
              Solo Windows · Push-to-talk ovunque
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              La dettatura che cercavi su Windows.
              <br />
              <span className="text-zinc-400">Tieni premuto. Parla. Incollato.</span>
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
              Seleziona un campo di testo in <em className="text-zinc-200">qualsiasi app</em> — Slack, Gmail, Cursor, Word — tieni premuto{" "}
              <kbd className="rounded bg-zinc-900 px-1.5 py-0.5 font-mono text-sm text-zinc-200">Ctrl+Spazio</kbd>, parla, rilascia.
              Il testo appare dove si trova il cursore. Nessun copia-incolla manuale.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/download"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-950 hover:bg-zinc-100"
              >
                Scarica per Windows — v0.1.0
              </Link>
              <a
                href="#come-funziona"
                className="inline-flex items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 px-6 py-3 text-sm font-semibold text-zinc-100 hover:bg-zinc-800"
              >
                Come funziona
              </a>
            </div>
            <p className="mt-3 text-xs text-zinc-500">
              v0 shell · Requisiti: Windows 10/11 64-bit · Microfono · Connessione per trascrizione cloud (Whisper via proxy).
            </p>
          </div>

          {/* Mock pill */}
          <div className="mt-10 flex justify-center">
            <div className="flex items-center gap-3 rounded-full border border-red-500/20 bg-red-500/10 px-5 py-3">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
              <span className="text-sm font-medium text-zinc-100">Registrazione… rilascia per trascrivere</span>
              <span className="hidden text-xs text-zinc-400 sm:inline">— overlay pill durante la dettatura</span>
            </div>
          </div>
        </section>

        <section id="come-funziona" className="grid gap-4 border-t border-zinc-900 py-12 sm:grid-cols-3">
          {[
            { k: "01", t: "Ovunque", d: "Funziona in qualsiasi campo di testo di qualsiasi app Windows. Non solo nel browser." },
            { k: "02", t: "Istantaneo", d: "Push-to-talk vero (tieni premuto / rilascia). Clipboard swap + Ctrl+V, zero frizione." },
            { k: "03", t: "Windows-native", d: "Tray, avvio automatico, overlay minimale. Pensato per Windows, non adattato da Mac." },
          ].map((c) => (
            <div key={c.k} className="rounded-2xl border border-zinc-900 bg-zinc-900/40 p-6">
              <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">{c.k}</p>
              <h3 className="mt-2 text-base font-semibold text-white">{c.t}</h3>
              <p className="mt-1 text-sm leading-6 text-zinc-400">{c.d}</p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-zinc-900 bg-zinc-900/30 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">Fase 1 — Scope</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Questo è lo <strong className="font-semibold text-zinc-200">scaffolding v0</strong> del Giorno 1. App desktop Electron + overlay +
            tray + impostazioni, più sito Next.js. Il design finale arriva al Giorno 6. Vedi{" "}
            <code className="rounded bg-zinc-900 px-1 py-0.5 text-zinc-200">docs/scope.md</code> per il piano completo di 6 giorni, feature
            MVP e decisioni aperte.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-zinc-500">
            <span className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1">Electron + TypeScript</span>
            <span className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1">uiohook-napi push-to-talk</span>
            <span className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1">Supabase Edge Function proxy</span>
            <span className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1">Next.js + Supabase + Vercel</span>
          </div>
        </section>

        <footer className="border-t border-zinc-900 py-8 text-xs text-zinc-500">
          <p>VoiceFlow · StackUp · Solo Windows · v0 shell — Giorno 1</p>
        </footer>
      </main>
    </div>
  );
}
