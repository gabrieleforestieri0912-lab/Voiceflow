"use client";

import { useEffect, useState } from "react";
import { WifiOff, BookOpen, SlidersHorizontal, Languages, ClipboardPaste, CalendarCheck, FileText, Mic, Keyboard, Sparkles } from "lucide-react";
import { Reveal, Section, SectionHeading, Stagger, StaggerItem } from "@/components/ui/Reveal";

function Spotlight({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`group relative overflow-hidden rounded-card border border-border bg-surface p-6 transition-all duration-standard hover:-translate-y-1 hover:border-accent/30 card-shadow ${className}`}
      onMouseMove={(e) => {
        const el = e.currentTarget;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--x", `${e.clientX - r.left}px`);
        el.style.setProperty("--y", `${e.clientY - r.top}px`);
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-standard group-hover:opacity-100"
        style={{ background: "radial-gradient(320px circle at var(--x, 50%) var(--y, 50%), var(--accent-glow), transparent 65%)" }}
      />
      <div aria-hidden className="pointer-events-none absolute -top-20 left-1/2 h-40 w-72 -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
      <div className="relative">{children}</div>
    </div>
  );
}

function IconBox({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-4 inline-grid h-10 w-10 place-items-center rounded-[12px] border border-accent/20 bg-accentSoft text-accent">
      {children}
    </span>
  );
}

function ModesMini() {
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
        <span key={m} className={`rounded-pill px-3 py-1 text-xs font-medium transition-all ${idx === i ? "bg-accent text-black" : "border border-border text-dim"}`}>
          {m}
        </span>
      ))}
    </div>
  );
}

function ClipboardMini() {
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
      <span className={on ? "bg-accent px-1 text-black transition-colors" : "transition-colors"}>quarterly report is ready for review</span>
      <span className="text-dim"> ▍pasted</span>
    </p>
  );
}

function LangMini() {
  const words = ["Hello", "Ciao", "Hola", "Bonjour", "Hallo", "こんにちは"];
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setI((v) => (v + 1) % words.length), 1200);
    return () => window.clearInterval(id);
  }, []);
  return <p className="mt-4 font-mono text-sm text-accent">“{words[i]}” <span className="text-dim">· auto-detected</span></p>;
}

const cards = [
  { icon: <WifiOff size={18} />, title: "Works offline", desc: "On-device transcription for the essentials. No connection, no waiting.", span: "sm:col-span-2", extra: null },
  { icon: <BookOpen size={18} />, title: "Vocabulary", desc: "Names, acronyms and jargon learned once, spelled right forever.", span: "", extra: null },
  { icon: <SlidersHorizontal size={18} />, title: "Modes", desc: "Voice, message or email formatting — pick the output shape.", span: "", extra: <ModesMini /> },
  { icon: <Languages size={18} />, title: "Multilanguage", desc: "Detects your language and translates toward EN/IT.", span: "", extra: <LangMini /> },
  { icon: <ClipboardPaste size={18} />, title: "Clipboard", desc: "Pastes where your cursor is. Any app, zero friction.", span: "", extra: <ClipboardMini /> },
  { icon: <CalendarCheck size={18} />, title: "Meeting assistant", desc: "Records and summarizes calls into action items.", span: "sm:col-span-2", extra: null },
];

const mini = [
  { icon: <FileText size={15} />, label: "File transcription" },
  { icon: <Mic size={15} />, label: "Push to talk", badge: "New" },
  { icon: <Keyboard size={15} />, label: "Shortcuts", kbd: "⌘W" },
  { icon: <Sparkles size={15} />, label: "Super Mode" },
];

export function WhatsInside() {
  return (
    <Section id="inside" className="py-20 sm:py-28">
      <SectionHeading eyebrow="What's inside" title="Everything you need to stop typing" sub="Six big things, four small delights. All placeholder, all fast." />
      <Stagger className="mt-10 grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <StaggerItem key={c.title} className={c.span}>
            <Spotlight className="h-full">
              <IconBox>{c.icon}</IconBox>
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
            <span className="text-accent">{m.icon}</span>
            {m.label}
            {m.badge ? <span className="rounded-pill bg-accent px-2 py-0.5 text-[10px] font-bold text-black">{m.badge}</span> : null}
            {m.kbd ? <kbd className="ml-auto">{m.kbd}</kbd> : null}
          </div>
        ))}
      </Reveal>
    </Section>
  );
}

