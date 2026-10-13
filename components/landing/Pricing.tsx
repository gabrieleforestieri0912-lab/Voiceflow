"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { Reveal, Section, SectionHeading } from "@/components/ui/Reveal";
import { EASE } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

type Billing = "Monthly" | "Yearly" | "Lifetime";

const prices: Record<Billing, { pro: string; note: string }> = {
  Monthly: { pro: "$12", note: "per month, cancel anytime" },
  Yearly: { pro: "$120", note: "per year · 2 months free" },
  Lifetime: { pro: "$249", note: "once · yours forever" },
};

const plans = [
  { name: "Free", price: (b: Billing) => "$0", desc: "Try dictation basics.", features: ["6000 chars dictation", "1 custom mode", "English only"], cta: "Start free", hot: false },
  { name: "Pro", price: (b: Billing) => prices[b].pro, desc: "For daily voice writers.", features: ["Unlimited dictation", "Unlimited modes", "40+ languages", "Meeting summaries"], cta: "Get Pro", hot: true },
  { name: "Enterprise", price: () => "Custom", desc: "Teams & compliance.", features: ["SSO & audit log", "Shared vocabularies", "Priority support"], cta: "Talk to us", hot: false },
];

export function Pricing() {
  const [billing, setBilling] = useState<Billing>("Yearly");
  const tabs: { id: Billing; badge?: string }[] = [
    { id: "Monthly" },
    { id: "Yearly", badge: "2 months free" },
    { id: "Lifetime", badge: "Top choice" },
  ];

  return (
    <Section id="pricing" className="py-20 sm:py-28">
      <SectionHeading eyebrow="Pricing" title="Pay once or never" sub="Fictional prices. Real toggle animation." />
      <Reveal delay={0.1} className="mt-8 flex justify-center">
        <div className="flex flex-wrap justify-center rounded-pill border border-border bg-surface p-1" role="tablist" aria-label="Billing period">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={billing === t.id}
              onClick={() => setBilling(t.id)}
              className={cn("relative flex items-center gap-2 rounded-pill px-4 py-2 text-sm transition-colors", billing === t.id ? "text-black" : "text-muted hover:text-foreground")}
            >
              {billing === t.id && <motion.span layoutId="billing-pill" className="absolute inset-0 rounded-pill bg-accent" transition={{ duration: 0.4, ease: [...EASE] }} />}
              <span className="relative">{t.id}</span>
              {t.badge ? (
                <span className={cn("relative rounded-pill px-2 py-0.5 text-[10px] font-bold", billing === t.id ? "bg-black text-accent" : "bg-accentSoft text-accent")}>
                  {t.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </Reveal>

      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        {plans.map((p, i) => (
          <Reveal key={p.name} delay={i * 0.07}>
            <div
              className={cn(
                "card-shadow relative flex h-full flex-col rounded-card border p-6",
                p.hot ? "border-accent bg-surface shadow-glow" : "border-border bg-surface"
              )}
            >
              {p.hot && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-pill bg-accent px-3 py-1 text-xs font-bold text-black">Most popular</span>}
              <h3 className="font-semibold">{p.name}</h3>
              <p className="text-sm text-dim">{p.desc}</p>
              <div className="mt-4 flex h-12 items-end overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={billing + p.name}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [...EASE] }}
                    className="text-4xl font-semibold tracking-tight"
                  >
                    {p.price(billing)}
                  </motion.span>
                </AnimatePresence>
              </div>
              <p className="mt-1 h-5 text-xs text-dim">{p.hot ? prices[billing].note : p.name === "Free" ? "free forever" : "tailored quote"}</p>
              <ul className="mt-4 space-y-2.5 text-[14px] text-muted">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check size={15} className="shrink-0 text-accent" /> {f}
                  </li>
                ))}
              </ul>
              <a
                href="#top"
                className={cn(
                  "mt-6 inline-flex items-center justify-center rounded-[12px] px-5 py-2.5 text-[15px] font-medium transition-all active:scale-[0.98]",
                  p.hot ? "bg-accent text-black hover:-translate-y-[1px] hover:shadow-glow" : "border border-border hover:border-accent/40"
                )}
              >
                {p.cta}
              </a>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal delay={0.15}>
        <p className="mt-6 text-center text-xs text-dim">30 day refund. No questions, no forms, no hard feelings (all fictional).</p>
      </Reveal>
    </Section>
  );
}
