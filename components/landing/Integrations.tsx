"use client";

import { useEffect, useState } from "react";
import { Reveal, Section, SectionHeading } from "@/components/ui/Reveal";
import { AppLogo, appMeta, type AppId } from "./AppLogos";
import { cn } from "@/lib/utils";

type Key = { label: string; app?: AppId; wide?: string; title?: string };

// Ogni tasto-lettera porta il vero logo dell'app (shape ufficiale, colore adattivo al tema).
const rows: Key[][] = [
  [
    { label: "Esc" }, { label: "1" }, { label: "2" }, { label: "3" }, { label: "4" },
    { label: "5" }, { label: "6" }, { label: "7" }, { label: "8" }, { label: "9" },
    { label: "0" }, { label: "⌫", wide: "flex-[1.6]" },
  ],
  [
    { label: "Tab", wide: "flex-[1.6]" },
    { label: "Q", app: "slack" }, { label: "W", app: "notion" }, { label: "E", app: "vscode" },
    { label: "R", app: "cursor" }, { label: "T", app: "terminal" }, { label: "Y", app: "teams" },
    { label: "U", app: "word" }, { label: "I", app: "outlook" }, { label: "O", app: "gmail" },
    { label: "P", app: "whatsapp" }, { label: "[" },
  ],
  [
    { label: "Caps", wide: "flex-[1.6]" },
    { label: "A", app: "telegram" }, { label: "S", app: "discord" }, { label: "D", app: "spotify" },
    { label: "F", app: "firefox" }, { label: "G", app: "zoom" }, { label: "H", app: "figma" },
    { label: "J", app: "linear" }, { label: "K", app: "obsidian" }, { label: "L", app: "github" },
    { label: ";" }, { label: "'" },
  ],
  [
    { label: "Shift", wide: "flex-[1.8]" },
    { label: "Z", app: "gitlab" }, { label: "X", app: "stackoverflow" }, { label: "C", app: "reddit" },
    { label: "V", app: "youtube" }, { label: "B", app: "x" }, { label: "N", app: "gdrive" },
    { label: "M", app: "dropbox" }, { label: "," }, { label: "." }, { label: "/" },
    { label: "Shift", wide: "flex-[1.8]" },
  ],
  [
    { label: "Ctrl" }, { label: "Alt" },
    { label: "Space", wide: "flex-[6]", title: "Dictate anywhere" },
    { label: "Alt" }, { label: "Enter", wide: "flex-[2.2] bg-accent/15 border-accent/30", title: "Insert text" },
  ],
];

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
      <SectionHeading eyebrow="Integrations" title="Press a key. It just works." sub="Ogni tasto ha il vero logo dell'app — passa sopra per il nome." />
      <Reveal delay={0.1} className="card-shadow mx-auto mt-10 max-w-3xl rounded-card border border-border bg-surface p-4 sm:p-6">
        <div className="space-y-2" role="img" aria-label="Illustrated keyboard with real app logos">
          {rows.map((row, r) => (
            <div key={r} className="flex gap-1.5 sm:gap-2">
              {row.map((k) => {
                flat += 1;
                const idx = flat;
                const lit = wave === idx % 13;
                const appName = k.app ? appMeta[k.app].name : null;
                return (
                  <div key={`${r}-${k.label}-${idx}`} className="group relative flex-1" style={{ flex: k.wide ? undefined : 1 }}>
                    <button
                      title={appName ?? k.title ?? (k.label === "Space" ? "Dictate anywhere" : k.label)}
                      aria-label={appName ?? k.label}
                      className={cn(
                        "flex h-11 w-full items-center justify-center rounded-[10px] border border-border bg-background text-muted transition-all duration-micro hover:border-accent/40 active:translate-y-[2px] sm:h-12",
                        k.wide,
                        lit && "border-accent/60 bg-accentSoft text-accent"
                      )}
                    >
                      {k.app ? (
                        <span className="flex flex-col items-center gap-0.5">
                          <AppLogo id={k.app} size={18} />
                          <span className="hidden font-mono text-[9px] leading-none opacity-60 sm:block">{k.label}</span>
                        </span>
                      ) : (
                        <span className="font-mono text-xs">{k.label}</span>
                      )}
                    </button>
                    {appName && (
                      <span className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-[8px] border border-border bg-surface-2 px-2 py-1 text-[11px] text-foreground opacity-0 transition-opacity group-hover:opacity-100">
                        {appName}
                      </span>
                    )}
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
