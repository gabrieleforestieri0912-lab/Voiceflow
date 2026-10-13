"use client";

import { useEffect, useState } from "react";
import { Reveal, Section, SectionHeading } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

const rows: string[][] = [
  ["Esc", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "⌫"],
  ["Tab", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "["],
  ["Caps", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'"],
  ["Shift", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "Shift"],
  ["Ctrl", "Alt", "Space", "Alt", "Enter"],
];

const wide: Record<string, string> = { Space: "flex-[6]", Enter: "flex-[2.2] bg-accent/15 border-accent/30", Shift: "flex-[1.8]", Tab: "flex-[1.6]", Caps: "flex-[1.6]", "⌫": "flex-[1.6]" };

export function Integrations() {
  const [wave, setWave] = useState(-1);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      let i = 0;
      const tick = window.setInterval(() => {
        setWave(i);
        if (i++ > 12) {
          window.clearInterval(tick);
          setWave(-1);
        }
      }, 120);
    }, 6000);
    return () => window.clearInterval(id);
  }, []);

  let flat = -1;
  return (
    <Section id="integrations" className="py-20 sm:py-28">
      <SectionHeading eyebrow="Integrations" title="Press a key. It just works." sub="Hover a key to feel the press. Placeholder apps, real rhythm." />
      <Reveal delay={0.1} className="card-shadow mx-auto mt-10 max-w-3xl rounded-card border border-border bg-surface p-4 sm:p-6">
        <div className="space-y-2" role="img" aria-label="Illustrated keyboard with app icons">
          {rows.map((row, r) => (
            <div key={r} className="flex gap-1.5 sm:gap-2">
              {row.map((k) => {
                flat += 1;
                const idx = flat;
                const lit = wave === idx % 13;
                return (
                  <div key={`${r}-${k}-${idx}`} className="group relative flex-1" style={{ flex: wide[k] ? undefined : 1 }}>
                    <button
                      title={k === "Space" ? "Dictate anywhere" : k === "Enter" ? "Insert text" : `App placeholder ${k}`}
                      className={cn(
                        "flex h-11 w-full items-center justify-center rounded-[10px] border border-border bg-background font-mono text-xs text-muted transition-all duration-micro hover:-translate-y-0 hover:border-accent/40 active:translate-y-[2px] sm:h-12",
                        wide[k],
                        lit && "border-accent/60 bg-accentSoft text-accent"
                      )}
                    >
                      {k.length === 1 ? (
                        <span className="flex items-center gap-1">
                          <span className="hidden h-3.5 w-3.5 rounded-[4px] border border-current opacity-50 sm:block" aria-hidden />
                          {k}
                        </span>
                      ) : (
                        k
                      )}
                    </button>
                    <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-[8px] border border-border bg-surface-2 px-2 py-1 text-[11px] text-foreground opacity-0 transition-opacity group-hover:opacity-100">
                      {k}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}

