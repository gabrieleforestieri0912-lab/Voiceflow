"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal, Section, SectionHeading } from "@/components/ui/Reveal";
import { EASE } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

type Tone = "Formal" | "Casual" | "Legal" | "Chat";

const base = "can you send me the draft by tomorrow morning thanks";
const variants: Record<Tone, { reply: string; tone: string }> = {
  Formal: {
    reply: "Good morning. Could you please share the draft by tomorrow morning? Thank you for your support.",
    tone: "Polite · structured · email-ready",
  },
  Casual: {
    reply: "hey! mind sending the draft by tomorrow morning? thanks a lot 🙌",
    tone: "Friendly · short · slack-ready",
  },
  Legal: {
    reply: "Please transmit the draft no later than tomorrow morning. Receipt will be confirmed in writing.",
    tone: "Precise · binding · record-ready",
  },
  Chat: {
    reply: "yo send draft by tmrw morning pls? thx!",
    tone: "Ultra-short · lowercase · dm-ready",
  },
};

export function Adaptability() {
  const [tab, setTab] = useState<Tone>("Formal");
  return (
    <Section id="adaptability" className="py-20 sm:py-28">
      <SectionHeading eyebrow="Adaptability" title="Communication isn't one-size-fits-all" sub="Same idea, four registers. Vocalis rewrites on the fly." />
      <Reveal delay={0.1} className="mt-8 flex justify-center">
        <div className="relative flex rounded-pill border border-border bg-surface p-1" role="tablist" aria-label="Tone">
          {(Object.keys(variants) as Tone[]).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={cn("relative rounded-pill px-4 py-2 text-sm transition-colors sm:px-5", tab === t ? "text-black" : "text-muted hover:text-foreground")}
            >
              {tab === t && <motion.span layoutId="tone-pill" className="absolute inset-0 rounded-pill bg-accent" transition={{ duration: 0.4, ease: [...EASE] }} />}
              <span className="relative">{t}</span>
            </button>
          ))}
        </div>
      </Reveal>

      <div className="mx-auto mt-8 grid max-w-3xl gap-3">
        <Reveal delay={0.05}>
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-card rounded-bl-md border border-border bg-surface px-4 py-3 text-[15px] text-muted">
              <p className="mb-1 text-xs text-dim">You said</p>“{base}”
            </div>
          </div>
        </Reveal>
        <div className="flex justify-end">
          <div className="w-full max-w-[80%] rounded-card rounded-br-md border border-accent/25 bg-accentSoft px-4 py-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
                transition={{ duration: 0.35, ease: [...EASE] }}
              >
                <p className="mb-1 text-xs text-dim">{tab} · Vocalis</p>
                <p className="text-[15px]">{variants[tab].reply}</p>
                <p className="mt-2 inline-flex rounded-pill bg-background/60 px-2.5 py-0.5 text-xs text-muted">{variants[tab].tone}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Section>
  );
}

