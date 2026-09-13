"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

const lines = [
  "PS C:\\Dev\\voiceflow> voiceflow --mode commit",
  '🎙️  "fix del refresh token con retry e chiudi issue 42"',
  "→ fix(auth): gestito edge case su refresh token — Closes #42",
  "✓ Commit creato. Push su origin/main? [y/N]",
];

export function AgenticCodingDemo() {
  const prefersReduced = useReducedMotion();
  const [visible, setVisible] = useState(0);
  const [charPos, setCharPos] = useState(0);

  useEffect(() => {
    if (prefersReduced) {
      setVisible(lines.length);
      return;
    }
    if (visible >= lines.length) {
      const t = window.setTimeout(() => {
        setVisible(0);
        setCharPos(0);
      }, 2500);
      return () => clearTimeout(t);
    }
    const current = lines[visible] ?? "";
    if (charPos < current.length) {
      const id = window.setTimeout(() => setCharPos((c) => c + 1), 18);
      return () => clearTimeout(id);
    }
    const t = window.setTimeout(() => {
      setVisible((v) => v + 1);
      setCharPos(0);
    }, 400);
    return () => clearTimeout(t);
  }, [visible, charPos, prefersReduced]);

  return (
    <section className="mx-auto max-w-6xl px-6 pb-12 sm:pb-16">
      <div className="mx-auto max-w-3xl rounded-xl border border-border bg-background overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border bg-surface px-3 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
          <span className="h-2.5 w-2.5 rounded-full bg-success" />
          <span className="ml-2 text-xs text-muted-foreground">Windows Terminal — PowerShell</span>
        </div>
        <div className="min-h-[180px] bg-background p-4 font-mono text-xs leading-5 sm:text-sm">
          {lines.slice(0, visible).map((l, i) => (
            <div key={i} className={i === 1 ? "text-accent" : i === 2 ? "text-success" : "text-foreground"}>
              {l}
            </div>
          ))}
          {visible < lines.length && (
            <div className="text-foreground">
              {lines[visible].slice(0, charPos)}
              <span className="ml-0.5 inline-block h-3 w-[6px] -mb-0.5 bg-accent" />
            </div>
          )}
          <p className="mt-4 text-[11px] text-muted-foreground">Voiceflow per chi programma con agenti — generico, non legato a un tool specifico (fallback decisione #3).</p>
        </div>
      </div>
    </section>
  );
}
