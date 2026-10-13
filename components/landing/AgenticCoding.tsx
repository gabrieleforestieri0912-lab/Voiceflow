"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { SlidersHorizontal, Cpu, GitBranch } from "lucide-react";
import { Reveal, Section } from "@/components/ui/Reveal";

const points = [
  { icon: <SlidersHorizontal size={17} />, title: "Dictate the intent", text: "Speak the change, skip the boilerplate. Placeholder flow." },
  { icon: <Cpu size={17} />, title: "Agent does the edits", text: "Reads files, updates code, shows a diff you can trust." },
  { icon: <GitBranch size={17} />, title: "Review in seconds", text: "Green lines in, doubts out. Approve or retry by voice." },
];

const typedLine = "vocalis dictate: refactor login hook and cover expired tokens";
const steps = ["Read(src/auth/useLogin.ts)", "Update(src/auth/useLogin.ts)"];
const diff = [
  { n: "12", t: "  const token = store.get()", plus: false },
  { n: "13", t: "+ const token = await refreshIfExpired(store)", plus: true },
  { n: "14", t: "+ test('refreshes on expiry', …)", plus: true },
];

export function AgenticCoding() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, margin: "-100px" });
  const [typed, setTyped] = useState("");
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!inView || reduce) {
      if (reduce && inView) {
        setTyped(typedLine);
        setStep(3);
      }
      return;
    }
    let timers: number[] = [];
    const loop = () => {
      setTyped("");
      setStep(0);
      let pos = 0;
      const typeTick = () => {
        pos += 2;
        setTyped(typedLine.slice(0, pos));
        if (pos < typedLine.length) timers.push(window.setTimeout(typeTick, 30));
        else {
          timers.push(window.setTimeout(() => setStep(1), 500));
          timers.push(window.setTimeout(() => setStep(2), 1400));
          timers.push(window.setTimeout(() => setStep(3), 2300));
          timers.push(window.setTimeout(loop, 12000));
        }
      };
      typeTick();
    };
    loop();
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [inView, reduce]);

  return (
    <Section className="pb-20 sm:pb-28">
      <div ref={ref} className="grid items-center gap-8 lg:grid-cols-2">
        <div>
          <Reveal>
            <p className="mb-3 inline-flex rounded-pill border border-border bg-surface px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-muted">Agentic coding</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2>Faster agentic workflows</h2>
          </Reveal>
          <div className="mt-6 space-y-4">
            {points.map((p, i) => (
              <Reveal key={p.title} delay={0.08 + i * 0.06}>
                <div className="flex gap-3.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-accentSoft text-accent">{p.icon}</span>
                  <div>
                    <h3 className="font-semibold">{p.title}</h3>
                    <p className="text-[15px] text-muted">{p.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        <Reveal delay={0.1}>
          <div className="card-shadow overflow-hidden rounded-card border border-border bg-[#0D0D0D]">
            <div className="border-b border-border px-4 py-2.5 font-mono text-xs text-dim">terminal — agentic demo</div>
            <div className="p-4 font-mono text-[13px] leading-relaxed sm:p-5">
              <pre className="whitespace-pre-wrap text-dim" aria-hidden>
{`+----------------------------------+
|  Vocalis agent ready. Speak up.  |
+----------------------------------+`}
              </pre>
              <p className="mt-3">
                <span className="mr-2 text-accent">❯</span>
                <span className="text-foreground">{typed}</span>
                {typed.length < typedLine.length && <span className="cursor-blink ml-1 inline-block h-4 w-[7px] bg-accent align-middle" />}
              </p>
              <div className="mt-3 space-y-1.5">
                {steps.slice(0, step >= 1 ? (step >= 2 ? 2 : 1) : 0).map((s) => (
                  <motion.p key={s} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="text-muted">
                    {s}
                  </motion.p>
                ))}
                {step >= 3 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 overflow-hidden rounded-[10px] border border-border">
                    {diff.map((d) => (
                      <div key={d.n} className={`flex gap-3 px-3 py-1 ${d.plus ? "bg-success/10 text-success" : "text-dim"}`}>
                        <span className="w-6 shrink-0 text-right opacity-60">{d.n}</span>
                        <span className="whitespace-pre-wrap">{d.t}</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
