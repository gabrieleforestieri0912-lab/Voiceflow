"use client";

import { motion, useReducedMotion } from "framer-motion";
import { siteContent } from "@/lib/content";

const apps = siteContent.integrations.apps as unknown as string[];

export function IntegrationsSection() {
  const prefersReduced = useReducedMotion();
  return (
    <section className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{siteContent.integrations.title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Incolla dove già lavori — senza cambiare abitudini.</p>
      </div>
      <div className="mt-8 grid grid-cols-3 gap-4 sm:grid-cols-6">
        {apps.map((name, i) => (
          <motion.div
            key={name}
            className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface p-4"
            animate={
              prefersReduced
                ? {}
                : {
                    y: [0, -3, 0],
                  }
            }
            transition={
              prefersReduced
                ? {}
                : {
                    duration: 3 + (i % 3),
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut",
                  }
            }
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-background text-xs font-bold">
              {name.slice(0, 2).toUpperCase()}
            </span>
            <span className="text-xs font-medium text-muted-foreground">{name}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
