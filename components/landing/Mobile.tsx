"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Apple, Play } from "lucide-react";
import { Reveal, Section } from "@/components/ui/Reveal";

export function Mobile() {
  const reduce = useReducedMotion();
  return (
    <Section className="pb-20 sm:pb-28">
      <div className="card-shadow grid items-center gap-8 rounded-card border border-border bg-surface p-6 sm:p-10 lg:grid-cols-2">
        <div>
          <Reveal>
            <h2 className="text-balance">Take Voiceflow anywhere</h2>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mt-3 text-muted">Fictional companion app. Scan the placeholder QR to get the fake beta link.</p>
          </Reveal>
          <Reveal delay={0.1} className="mt-5 flex items-center gap-4">
            <div className="grid h-28 w-28 place-items-center rounded-[14px] border border-border bg-background" role="img" aria-label="Placeholder QR code">
              <svg width="88" height="88" viewBox="0 0 88 88" fill="none" aria-hidden>
                <rect x="4" y="4" width="24" height="24" rx="4" stroke="#F5F5F5" strokeWidth="3" />
                <rect x="60" y="4" width="24" height="24" rx="4" stroke="#F5F5F5" strokeWidth="3" />
                <rect x="4" y="60" width="24" height="24" rx="4" stroke="#F5F5F5" strokeWidth="3" />
                <rect x="38" y="38" width="12" height="12" fill="#FFD60A" />
                <rect x="54" y="54" width="8" height="8" fill="#F5F5F5" />
                <rect x="66" y="66" width="10" height="10" fill="#F5F5F5" />
              </svg>
            </div>
            <div className="flex flex-col gap-2">
              <span className="inline-flex items-center gap-2 rounded-[10px] border border-border bg-background px-3.5 py-2 text-sm"><Apple size={15} /> App Store</span>
              <span className="inline-flex items-center gap-2 rounded-[10px] border border-border bg-background px-3.5 py-2 text-sm"><Play size={15} /> Google Play</span>
            </div>
          </Reveal>
        </div>
        <div className="flex justify-center">
          <motion.div
            animate={reduce ? {} : { y: [0, -6, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="w-[200px] rounded-[28px] border border-border bg-background p-3"
          >
            <div className="rounded-[20px] bg-surface p-4">
              <div className="mx-auto mb-3 h-1.5 w-16 rounded-full bg-border" />
              <div className="grid h-10 w-10 place-items-center rounded-full bg-accent text-black">🎙</div>
              <p className="mt-3 font-mono text-xs text-muted">“send the recap…”</p>
              <div className="mt-3 h-2 rounded-full bg-accent/70" style={{ width: "80%" }} />
              <div className="mt-2 h-2 rounded-full bg-border" style={{ width: "55%" }} />
            </div>
          </motion.div>
        </div>
      </div>
    </Section>
  );
}
