"use client";

import { motion, useReducedMotion } from "framer-motion";
import { siteContent } from "@/lib/content";
import { fadeInUp } from "@/lib/animations";

const logos = ["Vertex", "Cursor", "Notion", "Linear", "Vercel", "Supabase"] as const;

export function TrustBar() {
  const prefersReduced = useReducedMotion();

  return (
    <section className="border-y border-border bg-surface/40">
      <motion.div
        initial={prefersReduced ? { opacity: 1 } : "hidden"}
        whileInView={prefersReduced ? { opacity: 1 } : "visible"}
        viewport={{ once: true, margin: "-40px" }}
        variants={prefersReduced ? undefined : fadeInUp}
        className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-6 sm:flex-row sm:justify-between sm:py-5"
      >
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground sm:text-[11px]">
          {siteContent.trustBar.label}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
          {logos.map((name) => (
            <span
              key={name}
              className="select-none text-sm font-semibold tracking-tight text-muted-foreground/60 transition-opacity hover:text-muted-foreground hover:opacity-100 sm:text-[13px]"
              style={{ opacity: 0.6 }}
              aria-label={name}
            >
              {name}
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
