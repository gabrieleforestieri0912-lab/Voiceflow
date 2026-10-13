"use client";

import { Wand2, Blocks, Zap } from "lucide-react";
import { Reveal, Section, SectionHeading, Stagger, StaggerItem } from "@/components/ui/Reveal";

const blocks = [
  { icon: <Wand2 size={18} />, title: "Describe the output", text: "Tell Voiceflow how formal, how long, which language. Placeholder logic." },
  { icon: <Blocks size={18} />, title: "Reuse everywhere", text: "One custom mode, available in every app via the same shortcut." },
  { icon: <Zap size={18} />, title: "Switch instantly", text: "Cycle modes with a keypress. No menus, no clicks." },
];

export function CustomMode() {
  return (
    <Section className="pb-20 sm:pb-28">
      <SectionHeading eyebrow="Custom mode" title="Teach Voiceflow your style" />
      <div className="mt-10 grid items-stretch gap-4 lg:grid-cols-2">
        <Stagger className="grid gap-4">
          {blocks.map((b) => (
            <StaggerItem key={b.title}>
              <div className="card-shadow flex gap-4 rounded-card border border-border bg-surface p-5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-accentSoft text-accent">{b.icon}</span>
                <div>
                  <h3 className="font-semibold">{b.title}</h3>
                  <p className="mt-1 text-[15px] text-muted">{b.text}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
        <Reveal delay={0.1}>
          <div className="card-shadow h-full overflow-hidden rounded-card border border-border bg-[#0D0D0D]">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
              <span className="ml-2 font-mono text-xs text-dim">standup-mode.prompt</span>
            </div>
            <pre className="p-5 font-mono text-[13.5px] leading-relaxed text-muted">
              <code>
                <span className="text-accent"># mode: standup</span>{"\n"}
                <span className="text-dim">tone:</span> casual, short{"\n"}
                <span className="text-dim">format:</span> 3 bullets + blockers{"\n"}
                <span className="text-dim">language:</span> auto → en{"\n\n"}
                <span className="text-foreground">yesterday I fixed the login bug…</span>
                <span className="cursor-blink ml-1 inline-block h-4 w-[7px] bg-accent align-middle" />
              </code>
            </pre>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
