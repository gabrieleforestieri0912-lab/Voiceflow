"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Home, SlidersHorizontal, BookOpen, Settings, Star } from "lucide-react";
import { Reveal, Section } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

const nav = [
  { icon: <Home size={15} />, label: "Home" },
  { icon: <SlidersHorizontal size={15} />, label: "Modes" },
  { icon: <BookOpen size={15} />, label: "Vocabulary" },
  { icon: <Settings size={15} />, label: "Configuration" },
];

const apps = ["Cursor", "Claude", "Browser", "Slack", "Gmail", "Terminal"];
const favs = [
  { name: "Voiceflow Clear", badge: "Most popular" },
  { name: "Voiceflow Fast", badge: null },
  { name: "Voiceflow Precise", badge: null },
];

export function AppMockup() {
  const [active, setActive] = useState("Modes");
  return (
    <Section className="pb-20 sm:pb-28">
      <Reveal>
        <motion.div
          initial={{ scale: 0.96, rotateX: 8, opacity: 0 }}
          whileInView={{ scale: 1, rotateX: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformPerspective: 1200 }}
          className="card-shadow overflow-hidden rounded-card border border-border bg-surface"
        >
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
            <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
            <span className="h-3 w-3 rounded-full bg-[#28C840]" />
            <span className="ml-3 font-mono text-xs text-dim">voiceflow — settings</span>
          </div>
          <div className="grid md:grid-cols-[220px_1fr]">
            <aside className="border-b border-border p-3 md:border-b-0 md:border-r">
              {nav.map((n) => (
                <button
                  key={n.label}
                  onClick={() => setActive(n.label)}
                  className={cn(
                    "relative flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-sm transition-colors",
                    active === n.label ? "text-foreground" : "text-dim hover:text-muted"
                  )}
                  aria-current={active === n.label}
                >
                  {active === n.label && (
                    <motion.span layoutId="mockup-nav" className="absolute inset-0 rounded-[10px] bg-surface-2" transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} />
                  )}
                  <span className="relative">{n.icon}</span>
                  <span className="relative">{n.label}</span>
                </button>
              ))}
            </aside>
            <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-2">
              <div>
                <h3 className="font-semibold">Message mode</h3>
                <p className="mt-1 text-sm text-dim">Placeholder settings, nothing real.</p>
                <label className="mt-4 block text-xs text-dim">
                  Language model
                  <span className="mt-1.5 block rounded-[10px] border border-border bg-background px-3 py-2.5 text-sm text-foreground">Voiceflow Clear v2</span>
                </label>
                <label className="mt-3 block text-xs text-dim">
                  Voice model
                  <span className="mt-1.5 block rounded-[10px] border border-border bg-background px-3 py-2.5 text-sm text-foreground">Nova voice</span>
                </label>
                <p className="mt-5 text-xs text-dim">Works everywhere — these just get auto-enhance</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {apps.map((a) => (
                    <span key={a} className="rounded-pill border border-border bg-background px-3 py-1 text-xs text-muted">{a}</span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold">Favorites</h3>
                <div className="mt-3 space-y-2">
                  {favs.map((f) => (
                    <div key={f.name} className="flex items-center gap-2 rounded-[10px] border border-border bg-background px-3 py-2.5 text-sm">
                      <Star size={14} className="text-ocean" />
                      {f.name}
                      {f.badge ? <span className="ml-auto rounded-pill bg-ocean px-2 py-0.5 text-[10px] font-bold text-white">{f.badge}</span> : null}
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-[10px] border border-ocean/25 bg-oceanSoft p-3 text-xs text-muted">
                  Tip: hold <kbd>⌥</kbd> + <kbd>space</kbd> anywhere to dictate.
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </Reveal>
    </Section>
  );
}

