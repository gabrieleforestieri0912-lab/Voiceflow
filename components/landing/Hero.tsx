"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Play } from "lucide-react";
import { ButtonLink } from "@/components/ui/Primitives";
import { EASE } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

type DemoApp = "Cursor" | "Slack" | "Notes";

const DEMO_TEXT: Record<DemoApp, string> = {
  Cursor: "refactor the auth hook, extract the retry logic and add a unit test for expired tokens",
  Slack: "hey team, shipping the beta notes tomorrow morning, please review the onboarding draft tonight",
  Notes: "idea: voice-first shopping list with weekly templates and shared family mode",
};

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Sfondo griglia lettere con effetto "ascolto"
function LetterGrid() {
  const reduce = useReducedMotion();
  const [lit, setLit] = useState<Set<number>>(new Set());
  const cells = useMemo(() => {
    const arr: string[] = [];
    for (let i = 0; i < 480; i++) arr.push(LETTERS[Math.floor(Math.random() * LETTERS.length)]);
    return arr;
  }, []);

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => {
      const next = new Set<number>();
      const count = 8 + Math.floor(Math.random() * 10);
      for (let i = 0; i < count; i++) next.add(Math.floor(Math.random() * 480));
      setLit(next);
      window.setTimeout(() => setLit(new Set()), 800);
    }, 900);
    return () => window.clearInterval(id);
  }, [reduce]);

  return (
    <div aria-hidden className="mask-radial pointer-events-none absolute inset-0 overflow-hidden">
      <div className="grid h-full w-full grid-cols-[repeat(24,minmax(0,1fr))] gap-1 p-4 font-mono text-[14px] leading-none">
        {cells.map((ch, i) => (
          <span
            key={i}
            className="text-center transition-colors duration-700"
            style={{ opacity: lit.has(i) ? 0.9 : 0.06, color: lit.has(i) ? "#FFD60A" : "#fff" } as React.CSSProperties}
          >
            {ch}
          </span>
        ))}
      </div>
    </div>
  );
}

function Waveform({ active }: { active: boolean }) {
  const reduce = useReducedMotion();
  const bars = 28;
  return (
    <div className="flex h-10 items-center gap-[3px]" aria-hidden>
      {Array.from({ length: bars }).map((_, i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full bg-accent"
          animate={
            active && !reduce
              ? { height: [6, 14 + Math.abs(Math.sin(i * 0.9)) * 22, 6] }
              : { height: 5 }
          }
          transition={active && !reduce ? { duration: 0.7, repeat: Infinity, delay: i * 0.03, ease: "easeInOut" } : { duration: 0.2 }}
          style={{ height: 5 }}
        />
      ))}
    </div>
  );
}

export function Hero() {
  const reduce = useReducedMotion();
  const [app, setApp] = useState<DemoApp>("Cursor");
  const [phase, setPhase] = useState<"idle" | "listening" | "typing">("idle");
  const [typed, setTyped] = useState("");
  const [textOnly, setTextOnly] = useState(false);
  const timer = useRef<number[]>([]);

  const clearTimers = () => {
    timer.current.forEach((t) => window.clearTimeout(t));
    timer.current = [];
  };

  const runDemo = useCallback(
    (nextApp: DemoApp = app) => {
      clearTimers();
      setTyped("");
      if (textOnly || reduce) {
        setPhase("typing");
        setTyped(DEMO_TEXT[nextApp]);
        return;
      }
      setPhase("listening");
      timer.current.push(
        window.setTimeout(() => {
          setPhase("typing");
          const full = DEMO_TEXT[nextApp];
          let pos = 0;
          const step = () => {
            pos += 2;
            setTyped(full.slice(0, pos));
            if (pos < full.length) timer.current.push(window.setTimeout(step, 28));
          };
          step();
        }, 1400)
      );
    },
    [app, textOnly, reduce]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey && e.code === "Space") {
        e.preventDefault();
        runDemo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runDemo]);

  const headlineA = ["Just", "speak."];
  const headlineB = ["Write", "faster."];

  return (
    <section id="top" className="relative overflow-hidden pb-10 pt-16 sm:pt-24">
      <LetterGrid />
      <div className="relative mx-auto max-w-6xl px-5 text-center sm:px-8">
        <motion.h1 className="text-balance" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}>
          <span className="block">
            {headlineA.map((w) => (
              <motion.span
                key={w}
                className="mr-[0.24em] inline-block last:mr-0"
                variants={reduce ? {} : { hidden: { opacity: 0, y: 30, filter: "blur(8px)" }, show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: [...EASE] } } }}
              >
                {w}
              </motion.span>
            ))}
          </span>
          <span className="text-gradient-gray block">
            {headlineB.map((w) => (
              <motion.span
                key={w}
                className="mr-[0.24em] inline-block last:mr-0"
                variants={reduce ? {} : { hidden: { opacity: 0, y: 30, filter: "blur(8px)" }, show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: [...EASE] } } }}
              >
                {w}
              </motion.span>
            ))}
          </span>
        </motion.h1>

        <motion.p
          initial={reduce ? {} : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [...EASE] }}
          className="mx-auto mt-5 max-w-xl text-balance text-muted"
        >
          Vocalis turns your voice into clean text anywhere you work. Hold a key, talk, release — done.
        </motion.p>
        <motion.p
          initial={reduce ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="mt-2 text-sm text-dim"
        >
          Works in your browser, Cursor, Claude — and any other app or chatbot
        </motion.p>

        <motion.div
          initial={reduce ? {} : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: [...EASE] }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <ButtonLink href="#pricing" size="lg">
            Download
          </ButtonLink>
          <ButtonLink href="#tutorials" variant="ghost" size="lg" onClick={(e) => { e.preventDefault(); runDemo(); }}>
            <Play size={16} /> Watch demo
          </ButtonLink>
        </motion.div>

        {/* Demo interattiva */}
        <motion.div
          initial={reduce ? { opacity: 1 } : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease: [...EASE] }}
          className="card-shadow mx-auto mt-10 max-w-2xl rounded-card border border-border bg-surface p-4 text-left sm:p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex rounded-pill border border-border bg-background p-1" role="tablist" aria-label="Demo app">
              {(["Cursor", "Slack", "Notes"] as DemoApp[]).map((a) => (
                <button
                  key={a}
                  role="tab"
                  aria-selected={app === a}
                  onClick={() => {
                    setApp(a);
                    runDemo(a);
                  }}
                  className={cn("relative rounded-pill px-4 py-1.5 text-sm transition-colors", app === a ? "text-black" : "text-muted hover:text-foreground")}
                >
                  {app === a && (
                    <motion.span layoutId="demo-pill" className="absolute inset-0 rounded-pill bg-accent" transition={{ duration: 0.4, ease: [...EASE] }} />
                  )}
                  <span className="relative">{a}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-dim">
              Premi <kbd>⌥</kbd> + <kbd>space</kbd> per dettare
            </p>
          </div>

          <button
            onClick={() => runDemo()}
            className="mt-4 block w-full rounded-[14px] border border-border bg-background p-4 text-left transition-colors hover:border-accent/30"
            aria-label="Run dictation demo"
          >
            <div className="mb-2 flex items-center gap-2 text-xs text-dim">
              <span className={cn("h-2 w-2 rounded-full", phase === "listening" ? "animate-pulse bg-accent" : "bg-dim")} />
              {phase === "idle" ? `Ready in ${app} — click to dictate` : phase === "listening" ? "Listening…" : `Pasted in ${app}`}
            </div>
            {phase === "listening" && !textOnly ? (
              <Waveform active />
            ) : (
              <p className="min-h-[48px] font-mono text-[15px] leading-relaxed">
                {typed || <span className="text-dim">— press the keys and speak —</span>}
                {phase === "typing" && typed.length < DEMO_TEXT[app].length && <span className="cursor-blink ml-0.5 inline-block h-4 w-[2px] bg-accent align-middle" />}
              </p>
            )}
          </button>

          <div className="mt-3 text-center">
            <AnimatePresence mode="wait">
              {!textOnly ? (
                <motion.button
                  key="q"
                  exit={{ opacity: 0 }}
                  onClick={() => setTextOnly(true)}
                  className="text-xs text-dim underline-offset-4 hover:text-muted hover:underline"
                >
                  Non puoi parlare ora? Guarda la demo in modalità solo testo.
                </motion.button>
              ) : (
                <motion.p key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-dim">
                  Modalità solo testo attiva — nessun microfono richiesto.
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
