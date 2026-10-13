"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Mic, Wand2, ListChecks, Settings2, Keyboard } from "lucide-react";
import { Reveal, Section, SectionHeading } from "@/components/ui/Reveal";
import { EASE } from "@/components/ui/Reveal";
import { MODEL_CATALOG, MODELS_CHANGED_EVENT, loadActiveModel, loadDownloaded } from "@/lib/models";
import { cn } from "@/lib/utils";

type DesktopAction = "Dettatura" | "Migliora" | "Riassumi";

const ACTIONS: { id: DesktopAction; icon: React.ReactNode; hint: string }[] = [
  { id: "Dettatura", icon: <Mic size={15} />, hint: "Parla, Vocalis scrive dove è il cursore." },
  { id: "Migliora", icon: <Wand2 size={15} />, hint: "Riscrive il testo selezionato nel tono giusto." },
  { id: "Riassumi", icon: <ListChecks size={15} />, hint: "Condensa meeting e thread in punti azione." },
];

const DEMO_RESULT: Record<DesktopAction, string> = {
  Dettatura: "ciao team, vi mando il recap: chiusi i task della sprint, domani testiamo la build",
  Migliora: "Buongiorno team, in allegato il recap: abbiamo chiuso i task della sprint e domani testiamo la build.",
  Riassumi: "• Sprint chiusa • Test build domani 10:00 • Owner: Mara",
};

function formatShortcut(e: KeyboardEvent): string {
  const parts: string[] = [];
  if (e.ctrlKey) parts.push("Ctrl");
  if (e.metaKey) parts.push("⌘");
  if (e.altKey) parts.push("Alt");
  if (e.shiftKey) parts.push("Shift");
  const key = e.key.length === 1 ? e.key.toUpperCase() : e.key === " " ? "Spazio" : e.key;
  if (!["Control", "Alt", "Shift", "Meta"].includes(e.key)) parts.push(key);
  return parts.join(" + ");
}

function Waveform({ active }: { active: boolean }) {
  const reduce = useReducedMotion();
  return (
    <div className="flex h-9 items-center gap-[3px]" aria-hidden>
      {Array.from({ length: 24 }).map((_, i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full bg-accent"
          animate={active && !reduce ? { height: [5, 12 + Math.abs(Math.sin(i * 0.8)) * 20, 5] } : { height: 5 }}
          transition={active && !reduce ? { duration: 0.7, repeat: Infinity, delay: i * 0.03 } : { duration: 0.2 }}
          style={{ height: 5 }}
        />
      ))}
    </div>
  );
}

export function DesktopOverlay() {
  const reduce = useReducedMotion();
  const [action, setAction] = useState<DesktopAction>("Dettatura");
  const [shortcut, setShortcut] = useState("Alt + Spazio");
  const [recordingKeys, setRecordingKeys] = useState(false);
  const [mic, setMic] = useState("Microfono integrato");
  const [lang, setLang] = useState("Auto (IT)");
  const [modelId, setModelId] = useState("vocalis-base");
  const [modelChoices, setModelChoices] = useState<string[]>(["vocalis-base"]);
  const [autoPaste, setAutoPaste] = useState(true);
  const [phase, setPhase] = useState<"idle" | "rec" | "done">("idle");
  const [text, setText] = useState("");
  const timers = useRef<number[]>([]);

  const clear = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  const startRecording = useCallback(
    (a: DesktopAction = action) => {
      clear();
      setText("");
      if (reduce) {
        setPhase("done");
        setText(DEMO_RESULT[a]);
        return;
      }
      setPhase("rec");
      timers.current.push(
        window.setTimeout(() => {
          setPhase("done");
          const full = DEMO_RESULT[a];
          let pos = 0;
          const step = () => {
            pos += 2;
            setText(full.slice(0, pos));
            if (pos < full.length) timers.current.push(window.setTimeout(step, 26));
          };
          step();
        }, 1300)
      );
    },
    [action, reduce]
  );

  // Modello AI locale attivo (condiviso con la sezione Modelli)
  useEffect(() => {
    const sync = () => {
      setModelId(loadActiveModel());
      setModelChoices(loadDownloaded());
    };
    sync();
    window.addEventListener(MODELS_CHANGED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(MODELS_CHANGED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  // Shortcut globale: la combo salvata fa partire la registrazione
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (recordingKeys) {
        e.preventDefault();
        const label = formatShortcut(e);
        if (label) {
          setShortcut(label);
          setRecordingKeys(false);
        }
        return;
      }
      // Match sulla combo salvata (semplice: Alt+Spazio di default)
      const current = formatShortcut(e);
      if (current.toLowerCase() === shortcut.toLowerCase()) {
        e.preventDefault();
        startRecording();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      clear();
    };
  }, [recordingKeys, shortcut, startRecording]);

  return (
    <Section id="desktop" className="py-20 sm:py-28">
      <SectionHeading
        eyebrow="App desktop"
        title="L'overlay sempre a portata di tasto"
        sub="Tre bottoni iniettati in alto al centro dello schermo + una shortcut per dettare ovunque."
      />

      {/* Finestra che simula lo schermo desktop */}
      <Reveal delay={0.1}>
        <div className="card-shadow relative mt-10 overflow-hidden rounded-card border border-border bg-surface">
          {/* Barra finestra */}
          <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
            <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
            <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
            <span className="h-3 w-3 rounded-full bg-[#28C840]" />
            <span className="ml-2 font-mono text-xs text-dim">desktop — anteprima overlay</span>
            <a href="/desktop" className="ml-auto text-xs text-muted underline-offset-4 hover:underline">
              Apri la demo a tutto schermo →
            </a>
          </div>

          {/* Area schermo simulata */}
          <div className="relative min-h-[480px] bg-background p-4 sm:p-8">
            {/* Pill iniettata top-center con 3 bottoni */}
            <motion.div
              initial={false}
              className="absolute left-1/2 top-4 z-10 -translate-x-1/2"
            >
              <div
                className="flex items-center gap-1 rounded-pill border border-border bg-surface/95 p-1.5 shadow-glow backdrop-blur-xl"
                role="toolbar"
                aria-label="Vocalis overlay: 3 azioni rapide"
              >
                {ACTIONS.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => {
                      setAction(a.id);
                      startRecording(a.id);
                    }}
                    aria-pressed={action === a.id}
                    title={a.hint}
                    className={cn(
                      "relative flex items-center gap-1.5 rounded-pill px-3.5 py-2 text-[13px] font-medium transition-all duration-micro sm:px-4",
                      action === a.id ? "text-black" : "text-muted hover:text-foreground"
                    )}
                  >
                    {action === a.id && (
                      <motion.span
                        layoutId="desktop-action-pill"
                        className="absolute inset-0 rounded-pill bg-accent"
                        transition={{ duration: 0.4, ease: [...EASE] }}
                      />
                    )}
                    <span className="relative flex items-center gap-1.5">
                      {a.icon}
                      {a.id}
                    </span>
                  </button>
                ))}
                <span className="mx-1 hidden h-5 w-px bg-border sm:block" aria-hidden />
                <span className="relative hidden pr-1.5 text-[11px] text-dim sm:block">
                  <kbd>{shortcut}</kbd>
                </span>
              </div>
            </motion.div>

            <div className="grid gap-4 pt-20 lg:grid-cols-[1fr_300px]">
              {/* Pannello risultato */}
              <div className="rounded-[14px] border border-border bg-surface p-4">
                <div className="flex items-center gap-2 text-xs text-dim">
                  <span className={cn("h-2 w-2 rounded-full", phase === "rec" ? "animate-pulse bg-danger" : "bg-success")} />
                  {phase === "rec" ? `Registrazione… (${action})` : phase === "done" ? `${action} completata` : `Pronto — premi ${shortcut}`}
                </div>
                <div className="mt-3 min-h-[120px] rounded-[10px] border border-border bg-background p-3">
                  {phase === "rec" ? (
                    <Waveform active />
                  ) : (
                    <p className="font-mono text-sm leading-relaxed">
                      {text || <span className="text-dim">— premi la shortcut o clicca un bottone in alto —</span>}
                    </p>
                  )}
                </div>
                <p className="mt-3 text-xs text-dim">
                  {ACTIONS.find((a) => a.id === action)?.hint}{" "}
                  {autoPaste && phase === "done" ? "Incollato dove era il cursore ✓" : ""}{" "}
                  <span className="font-mono">[{MODEL_CATALOG.find((m) => m.id === modelId)?.name ?? modelId}]</span>
                </p>
              </div>

              {/* Pannello opzioni */}
              <div className="rounded-[14px] border border-border bg-surface p-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <Settings2 size={14} className="text-accent" /> Opzioni
                </h3>
                <label className="mt-4 block text-xs text-dim">
                  Microfono
                  <select
                    value={mic}
                    onChange={(e) => setMic(e.target.value)}
                    className="mt-1.5 w-full rounded-[10px] border border-border bg-background px-3 py-2 text-sm text-foreground"
                  >
                    <option>Microfono integrato</option>
                    <option>Cuffie USB</option>
                    <option>Interfaccia esterna</option>
                  </select>
                </label>
                <label className="mt-3 block text-xs text-dim">
                  Lingua
                  <select
                    value={lang}
                    onChange={(e) => setLang(e.target.value)}
                    className="mt-1.5 w-full rounded-[10px] border border-border bg-background px-3 py-2 text-sm text-foreground"
                  >
                    <option>Auto (IT)</option>
                    <option>Italiano</option>
                    <option>English</option>
                    <option>Auto → EN</option>
                  </select>
                </label>
                <label className="mt-3 block text-xs text-dim">
                  Modello AI locale
                  <select
                    value={modelId}
                    onChange={(e) => setModelId(e.target.value)}
                    className="mt-1.5 w-full rounded-[10px] border border-border bg-background px-3 py-2 text-sm text-foreground"
                  >
                    {MODEL_CATALOG.filter((m) => modelChoices.includes(m.id)).map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} · {m.size}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-muted">Incolla automatico</span>
                  <button
                    role="switch"
                    aria-checked={autoPaste}
                    onClick={() => setAutoPaste((v) => !v)}
                    className={cn("relative h-6 w-11 rounded-full transition-colors", autoPaste ? "bg-accent" : "bg-surface-2")}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all",
                        autoPaste ? "left-[22px]" : "left-0.5"
                      )}
                    />
                  </button>
                </div>

                {/* Shortcut per la registrazione vocale */}
                <div className="mt-4 rounded-[10px] border border-accent/25 bg-accentSoft p-3">
                  <p className="flex items-center gap-1.5 text-xs font-semibold">
                    <Keyboard size={13} className="text-accent" /> Shortcut registrazione
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <kbd className="text-[13px]">{recordingKeys ? "premi i tasti…" : shortcut}</kbd>
                    <button
                      onClick={() => setRecordingKeys(true)}
                      className="rounded-[8px] border border-border bg-background px-2.5 py-1 text-xs hover:border-accent/40"
                    >
                      {recordingKeys ? "In ascolto…" : "Cambia"}
                    </button>
                  </div>
                  <AnimatePresence>
                    {recordingKeys && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="mt-2 text-[11px] text-muted"
                      >
                        Premi la nuova combinazione (es. Ctrl + Shift + V)…
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  onClick={() => startRecording()}
                  className="mt-4 w-full rounded-[12px] bg-accent px-4 py-2.5 text-sm font-semibold text-black transition-all hover:-translate-y-[1px] hover:shadow-glow active:scale-[0.98]"
                >
                  ▶ Prova la registrazione
                </button>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
