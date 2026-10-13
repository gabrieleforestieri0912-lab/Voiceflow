"use client";

import { Check, Keyboard, Mic, ClipboardPaste } from "lucide-react";
import { Reveal, Section, SectionHeading, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { AppLogo } from "@/components/landing/AppLogos";
import { COMPAT_CATEGORIES, COMPAT_STEPS } from "@/lib/compat";

const stepIcons = [<Keyboard key="k" size={16} />, <Mic key="m" size={16} />, <ClipboardPaste key="c" size={16} />];

export function Compatibility() {
  return (
    <Section id="compatibility" className="py-20 sm:py-28">
      <SectionHeading
        eyebrow="Compatibilità totale"
        title="Un input? Allora funziona."
        sub="Voiceflow scrive nel campo di testo attivo a livello di sistema: browser, Cursor, Claude, chatbot e qualsiasi programma — senza plugin."
      />

      <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {COMPAT_CATEGORIES.map((c) => (
          <StaggerItem key={c.id}>
            <div className="card-shadow h-full rounded-card border border-border bg-surface p-5">
              <h3 className="font-semibold tracking-tight">{c.title}</h3>
              <p className="mt-1 text-[13px] text-dim">{c.desc}</p>
              <ul className="mt-4 space-y-2.5">
                {c.apps.map((a) => (
                  <li key={a.name} className="flex items-center gap-2.5 text-sm">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-[8px] border border-border bg-background text-foreground">
                      {a.logo ? <AppLogo id={a.logo} size={15} /> : <span className="font-mono text-[11px] font-bold">{a.name.slice(0, 1)}</span>}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{a.name}</span>
                      {a.note && <span className="block truncate text-xs text-dim">{a.note}</span>}
                    </span>
                    <Check size={14} className="ml-auto shrink-0 text-success" aria-label="Compatibile" />
                  </li>
                ))}
              </ul>
            </div>
          </StaggerItem>
        ))}
      </Stagger>

      <Reveal delay={0.1}>
        <ol className="mt-6 grid gap-3 rounded-card border border-leaf/25 bg-leafSoft/40 p-5 sm:grid-cols-3 sm:p-6">
          {COMPAT_STEPS.map((s, i) => (
            <li key={s.title} className="flex gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-leaf text-black">
                {stepIcons[i]}
              </span>
              <div>
                <p className="text-sm font-semibold">
                  <span className="mr-1.5 font-mono text-xs text-dim">{i + 1}.</span>
                  {s.title}
                </p>
                <p className="mt-0.5 text-[13px] text-muted">{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </Reveal>
    </Section>
  );
}
