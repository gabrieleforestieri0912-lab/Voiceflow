"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { siteContent } from "@/lib/content";

export function Testimonials() {
  const prefersReduced = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const items = siteContent.testimonials as unknown as { name: string; role: string; quote: string }[];
  const loop = [...items, ...items];

  const Row = ({ reverse = false }: { reverse?: boolean }) => (
    <motion.div
      className="flex gap-4 will-change-transform"
      animate={
        prefersReduced || paused
          ? {}
          : { x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }
      }
      transition={
        prefersReduced || paused
          ? {}
          : { duration: 30, repeat: Infinity, ease: "linear" }
      }
      onHoverStart={() => setPaused(true)}
      onHoverEnd={() => setPaused(false)}
    >
      {loop.map((t, i) => (
        <div key={`${t.name}-${i}`} className="min-w-[320px] max-w-[320px] rounded-xl border border-border bg-surface p-4">
          <p className="text-sm leading-6 text-foreground">“{t.quote}”</p>
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-background text-xs font-semibold">
              {t.name[0]}
            </span>
            <div>
              <p className="text-xs font-medium">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.role}</p>
            </div>
          </div>
        </div>
      ))}
    </motion.div>
  );

  return (
    <section className="overflow-hidden border-y border-border bg-surface/30 py-10 sm:py-12">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">Chi lo usa ne parla</h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">Nomi e quote fittizi — testimonianze illustrative</p>
      </div>
      <div className="mt-8 space-y-4" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <div className="overflow-hidden">
          <Row />
        </div>
        <div className="overflow-hidden">
          <Row reverse />
        </div>
      </div>
    </section>
  );
}
