"use client";

import { useEffect, useState } from "react";
import { WifiOff, BookOpen, SlidersHorizontal, Languages, ClipboardPaste, CalendarCheck, FileText, Mic, Keyboard, Sparkles } from "lucide-react";
import { Reveal, Section, SectionHeading, Stagger, StaggerItem } from "@/components/ui/Reveal";

type FeatureColor = "leaf" | "ocean" | "ember";

const CC: Record<FeatureColor, { text: string; soft: string; glow: string; hex: string }> = {
  leaf: { text: "text-leaf", soft: "bg-leafSoft", glow: "rgba(48,209,88,0.30)", hex: "#30D158" },
  ocean: { text: "text-ocean", soft: "bg-oceanSoft", glow: "rgba(10,132,255,0.30)", hex: "#0A84FF" },
  ember: { text: "text-ember", soft: "bg-emberSoft", glow: "rgba(255,69,58,0.30)", hex: "#FF453A" },
};

function Spotlight({ children, className = "", color = "leaf" }: { children: React.ReactNode; className?: string; color?: FeatureColor }) {
  return (
    <div
      className={`group relative overflow-hidden rounded-card border border-border bg-surface p-6 transition-all duration-standard hover:-translate-y-1 card-shadow ${className}`}
      style={{ ["--spot-glow" as string]: CC[color].glow, ["--spot-line" as string]: `${CC[color].hex}55` }}
      onMouseMove={(e) => {
        const el = e.currentTarget;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--x", `${e.clientX - r.left}px`);
        el.style.setProperty("--y", `${e.clientY - r.top}px`);
      }}
      onMouseEnter={(e) => e.currentTarget.style.setProperty("border-color", `var(--spot-line)`)}
      onMouseLeave={(e) => e.currentTarget.style.removeProperty("border-color")}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-standard group-hover:opacity-100"
        style={{ background: "radial-gradient(320px circle at var(--x, 50%) var(--y, 50%), var(--spot-glow), transparent 65%)" }}
      />
      <div aria-hidden className={`pointer-events-none absolute -top-20 left-1/2 h-40 w-72 -translate-x-1/2 rounded-full blur-3xl ${CC[color].soft}`} />
      <div className="relative">{children}</div>
    </div>
  );
}

function IconBox({ children, color = "leaf" }: { children: React.ReactNode; color?: FeatureColor }) {
  return (
    <span className={`mb-4 inline-grid h-10 w-10 place-items-center rounded-[12px] border ${CC[color].soft} ${CC[color].text}`} style={{ borderColor: `${CC[color].hex}44` }}>
      {children}
    </span>
  );
}

function ModesMini({ color = "ember" }: { color?: FeatureColor }) {
  const modes = ["Voice", "Message", "Email"];
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setI((v) => (v + 1) % modes.length), 1600);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div className="mt-4 flex gap-2">
      {modes.map((m, idx) => (
        <span key={m} className={`rounded-pill px-3 py-1 text-xs font-medium transition-all ${idx === i ? `${color === "ember" ? "bg-ember" : color === "ocean" ? "bg-ocean" : "bg-leaf"} text-white` : "border border-border text-dim"}`}>
          {m}
        </span>
      ))}
    </div>
  );
}

function ClipboardMini({ color = "ocean" }: { color?: FeatureColor }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const id = window.setInterval(() => {
      setOn(true);
      window.setTimeout(() => setOn(false), 1400);
    }, 3000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <p className="mt-4 rounded-[10px] border border-border bg-background p-3 font-mono text-xs">
      <span className={on ? `${color === "ocean" ? "bg-ocean" : color === "ember" ? "bg-ember" : "bg-leaf"} px-1 text-white transition-colors` : "transition-colors"}>quarterly report is ready for review</span>
      <span className="text-dim"> ▍pasted</span>
    </p>
  );
}

function LangMini({ color = "leaf" }: { color?: FeatureColor }) {
  const words = ["Hello", "Ciao", "Hola", "Bonjour", "Hallo", "こんにちは"];
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setI((v) => (v + 1) % words.length), 1200);
    return () => window.clearInterval(id);
  }, []);
  return <p className={`mt-4 font-mono text-sm ${color === "leaf" ? "text-leaf" : color === "ocean" ? "text-ocean" : "text-ember"}`}>“{words[i]}” <span className="text-dim">· auto-detected</span></p>;
}

const cards: { icon: React.ReactNode; title: string; desc: string; span: string; color: FeatureColor; extra: React.ReactNode }[] = [
  { icon: <WifiOff size={18} />, title: "Works offline", desc: "On-device transcription for the essentials. No connection, no waiting.", span: "sm:col-span-2", color: "leaf", extra: null },
  { icon: <BookOpen size={18} />, title: "Vocabulary", desc: "Names, acronyms and jargon learned once, spelled right forever.", span: "", color: "ocean", extra: null },
  { icon: <SlidersHorizontal size={18} />, title: "Modes", desc: "Voice, message or email formatting — pick the output shape.", span: "", color: "ember", extra: <ModesMini color="ember" /> },
  { icon: <Languages size={18} />, title: "Multilanguage", desc: "Detects your language and translates toward EN/IT.", span: "", color: "leaf", extra: <LangMini color="leaf" /> },
  { icon: <ClipboardPaste size={18} />, title: "Clipboard", desc: "Pastes where your cursor is. Any app, zero friction.", span: "", color: "ocean", extra: <ClipboardMini color="ocean" /> },
  { icon: <CalendarCheck size={18} />, title: "Meeting assistant", desc: "Records and summarizes calls into action items.", span: "sm:col-span-2", color: "ember", extra: null },
];

const mini: { icon: React.ReactNode; label: string; color: FeatureColor; badge?: string; kbd?: string }[] = [
  { icon: <FileText size={15} />, label: "File transcription", color: "leaf" },
  { icon: <Mic size={15} />, label: "Push to talk", color: "ocean", badge: "New" },
  { icon: <Keyboard size={15} />, label: "Shortcuts", color: "ember", kbd: "⌘W" },
  { icon: <Sparkles size={15} />, label: "Super Mode", color: "leaf" },
];

export function WhatsInside() {
  return (
    <Section id="inside" className="py-20 sm:py-28">
      <SectionHeading eyebrow="What's inside" title="Everything you need to stop typing" sub="Six big things, four small delights. All placeholder, all fast." />
      <Stagger className="mt-10 grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <StaggerItem key={c.title} className={c.span}>
            <Spotlight className="h-full" color={c.color}>
              <IconBox color={c.color}>{c.icon}</IconBox>
              <h3 className="text-lg font-semibold tracking-tight">{c.title}</h3>
              <p className="mt-1.5 text-[15px] text-muted">{c.desc}</p>
              {c.extra}
            </Spotlight>
          </StaggerItem>
        ))}
      </Stagger>
      <Reveal delay={0.1} className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {mini.map((m) => (
          <div key={m.label} className="flex items-center gap-2 rounded-[12px] border border-border bg-surface px-3.5 py-3 text-sm text-muted">
            <span className={m.color === "leaf" ? "text-leaf" : m.color === "ocean" ? "text-ocean" : "text-ember"}>{m.icon}</span>
            {m.label}
            {m.badge ? <span className="rounded-pill bg-foreground px-2 py-0.5 text-[10px] font-bold text-background">{m.badge}</span> : null}
            {m.kbd ? <kbd className="ml-auto">{m.kbd}</kbd> : null}
          </div>
        ))}
      </Reveal>
    </Section>
  );
}

