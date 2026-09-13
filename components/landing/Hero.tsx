"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { siteContent } from "@/lib/content";
import { fadeInUp, staggerContainer } from "@/lib/animations";

function usePrefersReducedMotion() {
  const hook = useReducedMotion();
  const [pref, setPref] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setPref(m.matches);
    onChange();
    m.addEventListener("change", onChange);
    return () => m.removeEventListener("change", onChange);
  }, []);
  return hook || pref;
}

export function Hero() {
  const prefersReduced = usePrefersReducedMotion();
  const examples = siteContent.hero.typewriterExamples as unknown as string[];
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [listening, setListening] = useState(false);
  const intervalRef = useRef<number | null>(null);

  // Typewriter ciclico decisione #2 fallback — via setInterval, non CSS width
  useEffect(() => {
    if (prefersReduced) {
      setTyped(examples[index]);
      const id = window.setTimeout(() => setIndex((i) => (i + 1) % examples.length), 4000);
      return () => clearTimeout(id);
    }
    const full = examples[index];
    setTyped("");
    let pos = 0;
    intervalRef.current = window.setInterval(() => {
      pos += 1;
      setTyped(full.slice(0, pos));
      if (pos >= full.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        window.setTimeout(() => setIndex((i) => (i + 1) % examples.length), 1800);
      }
    }, 22);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [index, prefersReduced, examples]);

  // Demo interattiva: Ctrl+Space reale → listening 1.5s → typewriter burst
  const [demoActive, setDemoActive] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isCtrlSpace = (e.ctrlKey || e.metaKey) && e.code === "Space";
      if (isCtrlSpace) {
        e.preventDefault();
        setListening(true);
        setDemoActive(true);
        window.setTimeout(() => {
          setListening(false);
          setIndex((i) => (i + 1) % examples.length);
          window.setTimeout(() => setDemoActive(false), 2000);
        }, 900);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [examples.length]);

  const headlineWords = siteContent.hero.headline.join(" ").split(" ");

  return (
    <section className="relative overflow-hidden">
      {/* Sfondo: radial gradient + dot grid leggera — no animazione pesante */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(600px 400px at 50% -10%, hsl(var(--accent) / 0.12), transparent 60%), radial-gradient(800px 600px at 90% 30%, hsl(var(--accent-secondary) / 0.08), transparent 60%)`,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6 py-14 sm:py-20">
        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-3xl">
          <motion.p
            variants={fadeInUp}
            className="inline-flex rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium uppercase tracking-widest text-muted-foreground"
          >
            Solo Windows · Push-to-talk ovunque
          </motion.p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            <motion.span className="block" variants={staggerContainer} initial="hidden" animate="visible">
              {headlineWords.map((w, i) => (
                <motion.span
                  key={`${w}-${i}`}
                  variants={prefersReduced ? { hidden: { opacity: 0 }, visible: { opacity: 1 } } : fadeInUp}
                  transition={prefersReduced ? { duration: 0.01 } : { delay: i * 0.03 }}
                  className="inline-block pr-[0.25em] last:pr-0"
                >
                  {w}
                </motion.span>
              ))}
            </motion.span>
            <motion.span variants={fadeInUp} className="block text-muted-foreground">
              Nativo Windows, non un porting.
            </motion.span>
          </h1>

          <motion.p variants={fadeInUp} className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            {siteContent.hero.sub}
          </motion.p>

          <motion.div variants={fadeInUp} className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full bg-accent text-background hover:bg-accent/90">
              <Link href="/download">{siteContent.hero.ctaPrimary}</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full border-border bg-surface hover:bg-secondary">
              <a href="#features">{siteContent.hero.ctaSecondary}</a>
            </Button>
          </motion.div>
          <p className="mt-3 text-xs text-muted-foreground">Requisiti: Windows 10/11 64-bit · Microfono · Whisper via proxy, nessuna chiave nel bundle.</p>
        </motion.div>

        {/* Demo scorciatoia */}
        <motion.div
          initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 rounded-2xl border border-border bg-surface/60 p-4 backdrop-blur sm:p-5"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex h-9 w-9 items-center justify-center">
                {/* Pallino pulsante — solo scale/opacity */}
                <motion.span
                  aria-hidden
                  className="absolute inset-0 rounded-full bg-accent/30"
                  animate={listening && !prefersReduced ? { scale: [1, 1.35, 1], opacity: [0.6, 0.15, 0.6] } : {}}
                  transition={listening && !prefersReduced ? { duration: 1.1, repeat: Infinity, ease: "easeInOut" } : {}}
                />
                <span className={`relative h-2.5 w-2.5 rounded-full ${listening ? "bg-accent" : "bg-muted-foreground"} ${listening && !prefersReduced ? "animate-pulse" : ""}`} />
              </div>
              <div>
                <p className="text-sm font-medium">{listening ? "Sto ascoltando…" : siteContent.hero.shortcutHint}</p>
                <p className="text-xs text-muted-foreground">
                  Tieni premuto <kbd className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">Ctrl</kbd> +{" "}
                  <kbd className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">Space</kbd> {demoActive ? "— demo attiva" : "— prova ora"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="hidden sm:inline">Testo trascritto:</span>
              <AnimatePresence mode="wait">
                <motion.p
                  key={`${index}-${typed.length}`}
                  initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: prefersReduced ? 0.01 : 0.25 }}
                  className="min-h-[20px] max-w-[36ch] truncate font-mono text-sm text-foreground sm:max-w-[42ch]"
                >
                  {typed}
                  <span className="ml-0.5 inline-block h-3 w-[2px] -mb-0.5 bg-accent" />
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
