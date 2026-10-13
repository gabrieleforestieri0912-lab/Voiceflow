"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { Reveal, Section, SectionHeading } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

const faqs = [
  { q: "Is my voice sent to the cloud?", a: "Placeholder answer: base transcription runs on-device in this fictional product. Cloud features would be opt-in and never bundle API keys." },
  { q: "Which apps does it work in?", a: "Everywhere you can type: browser inputs, Cursor, VS Code, Claude, ChatGPT and any other chatbot or program. It pastes at your cursor — no plugins, no per-app setup." },
  { q: "Can I teach it my words?", a: "Yes — add names, acronyms and jargon to Vocabulary once. Fictional demo data only." },
  { q: "What if I can't talk right now?", a: "Use text-only mode: type the rough idea and let a Mode rewrite it in the right register." },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <Section className="pb-20 sm:pb-28">
      <SectionHeading eyebrow="FAQ" title="Questions, answered" />
      <div className="mx-auto mt-8 max-w-2xl space-y-3">
        {faqs.map((f, i) => {
          const isOpen = open === i;
          return (
            <Reveal key={f.q} delay={i * 0.05}>
              <div className={cn("overflow-hidden rounded-card border transition-colors", isOpen ? "border-accent/30 bg-surface" : "border-border bg-surface")}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                  className="flex w-full items-center gap-3 px-5 py-4 text-left font-medium"
                >
                  {f.q}
                  <span className={cn("ml-auto grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border transition-transform duration-standard", isOpen && "rotate-45 border-accent/40 text-accent")}>
                    <Plus size={16} />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-panel-${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <p className="px-5 pb-5 text-[15px] text-muted">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
