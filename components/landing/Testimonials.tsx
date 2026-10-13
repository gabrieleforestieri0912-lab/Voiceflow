"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal, Section, SectionHeading } from "@/components/ui/Reveal";

type T = { name: string; role: string; quote: string; rot: number; initials: string };

const initial: T[] = [
  { name: "Mara Voss", role: "Fictional PM", quote: "I dictate standups while making coffee. Voiceflow formats them before I sit down.", rot: -2, initials: "MV" },
  { name: "Theo Lindt", role: "Fake indie hacker", quote: "Voice to commit message in three seconds. My keyboard feels abandoned.", rot: 1.5, initials: "TL" },
  { name: "Aya Ferro", role: "Imaginary novelist", quote: "I whisper chapters on walks. Drafts arrive clean, with my slang intact.", rot: -1, initials: "AF" },
  { name: "Jonas Reber", role: "Placeholder dev", quote: "Custom modes turned rambling into tickets. QA thinks I hired an assistant.", rot: 2, initials: "JR" },
];

export function Testimonials() {
  const [cards, setCards] = useState(initial);
  const rotate = () => setCards(([first, ...rest]) => [...rest, first]);

  return (
    <Section id="testimonials" className="py-20 sm:py-28">
      <SectionHeading eyebrow="Wall of love (all fake)" title="Loved by fast typists who don't type" />
      <Reveal delay={0.1}>
        <p className="mt-3 text-center text-xs text-dim">Tap to see more</p>
      </Reveal>
      <Reveal delay={0.15}>
        <div className="group relative mx-auto mt-6 h-[300px] max-w-md sm:h-[280px]" onClick={rotate} role="button" tabIndex={0} aria-label="Show next testimonial" onKeyDown={(e) => e.key === "Enter" && rotate()}>
          <AnimatePresence>
            {cards.map((c, i) => {
              const top = i === 0;
              return (
                <motion.figure
                  key={c.name}
                  layout
                  initial={false}
                  animate={{
                    y: i * 14,
                    rotate: top ? 0 : c.rot,
                    scale: 1 - i * 0.04,
                    zIndex: cards.length - i,
                    x: 0,
                  }}
                  whileHover={top ? {} : { x: (i % 2 === 0 ? -1 : 1) * i * 22 }}
                  transition={{ type: "spring", stiffness: 260, damping: 26 }}
                  className="card-shadow absolute inset-x-0 top-0 cursor-pointer rounded-card border border-border bg-surface p-6"
                  style={{ pointerEvents: top ? "auto" : "none" }}
                >
                  <svg aria-hidden className="absolute -top-3 left-1/2 h-7 w-6 -translate-x-1/2 text-dim" viewBox="0 0 24 28" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v20M5 6l7-4 7 4" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="22" r="3" fill="var(--surface)" />
                  </svg>
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-emberSoft text-sm font-bold text-ember">{c.initials}</span>
                    <div>
                      <figcaption className="text-sm font-semibold">{c.name}</figcaption>
                      <p className="text-xs text-dim">{c.role}</p>
                    </div>
                  </div>
                  <blockquote className="mt-3 text-[15px] text-muted">“{c.quote}”</blockquote>
                </motion.figure>
              );
            })}
          </AnimatePresence>
        </div>
      </Reveal>
      <Reveal delay={0.2} className="mt-14 text-center">
        <p className="text-xs uppercase tracking-[0.16em] text-dim">Endless happy users</p>
        <div className="mt-3 flex justify-center -space-x-2">
          {["AK", "BM", "CS", "DL", "ER", "FT", "GH"].map((a) => (
            <span key={a} className="grid h-8 w-8 place-items-center rounded-full border-2 border-background bg-surface-2 text-[10px] font-bold text-muted">{a}</span>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}
