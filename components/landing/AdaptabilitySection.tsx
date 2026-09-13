"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { siteContent } from "@/lib/content";

type TabKey = "formale" | "casual" | "tecnico" | "chat";

export function AdaptabilitySection() {
  const [tab, setTab] = useState<TabKey>("formale");
  const prefersReduced = useReducedMotion();
  const ex = siteContent.adaptability.examples[tab];

  return (
    <section className="mx-auto max-w-6xl px-6 py-12 sm:py-16" id="adaptability">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Si adatta al tuo tono</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Parli come ti viene. Voiceflow riscrive nel tono giusto per il contesto — email, Slack, codice o chat.
        </p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)} className="mt-8">
        <TabsList className="mx-auto flex w-full justify-center bg-surface sm:w-auto">
          {siteContent.adaptability.tabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="data-[state=active]:bg-accent data-[state=active]:text-background">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-border bg-surface p-4 sm:p-6">
          <p className="mb-4 text-xs uppercase tracking-widest text-muted-foreground">{ex.ctx}</p>
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: prefersReduced ? 0.01 : 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="grid gap-4 sm:grid-cols-2"
            >
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Input vocale grezzo</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">“{ex.input}”</p>
              </div>
              <div className="rounded-xl border border-accent/20 bg-accent/10 p-4">
                <p className="text-xs font-medium uppercase tracking-widest text-accent">Output Voiceflow — {tab}</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground">{ex.output}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </Tabs>
    </section>
  );
}
