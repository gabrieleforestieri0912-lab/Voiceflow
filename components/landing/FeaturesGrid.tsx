"use client";

import { motion, useReducedMotion } from "framer-motion";
import { WifiOff, BookMarked, SlidersHorizontal, Languages, ClipboardCopy, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { siteContent } from "@/lib/content";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const icons = [WifiOff, BookMarked, SlidersHorizontal, Languages, ClipboardCopy, Users] as const;

export function FeaturesGrid() {
  const prefersReduced = useReducedMotion();
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Cosa include</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Tutto ciò che serve per dettare ovunque — senza fronzoli.</p>
      </div>

      <motion.div
        initial={prefersReduced ? { opacity: 1 } : "hidden"}
        whileInView={prefersReduced ? { opacity: 1 } : "visible"}
        viewport={{ once: true, margin: "-60px" }}
        variants={prefersReduced ? undefined : staggerContainer}
        className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {siteContent.features.map((f, i) => {
          const Icon = icons[i % icons.length];
          return (
            <motion.div key={f.title} variants={prefersReduced ? undefined : fadeInUp} className="group relative">
              {/* shadow layer animata via opacity */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-2xl bg-accent/10 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              />
              <Card className="relative h-full border-border bg-surface transition-transform duration-200 will-change-transform group-hover:translate-y-[-4px] group-hover:scale-[1.02]">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background">
                      <Icon className="h-4 w-4 text-accent" />
                    </span>
                    {(f as { badge?: string }).badge && (
                      <motion.span
                        animate={prefersReduced ? {} : { scale: [1, 1.05, 1] }}
                        transition={prefersReduced ? {} : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Badge className="bg-accent text-background hover:bg-accent">{(f as { badge?: string }).badge}</Badge>
                      </motion.span>
                    )}
                  </div>
                  <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">{f.desc}</p>
                  <div className="pointer-events-none mt-4 h-16 rounded-lg bg-gradient-to-br from-accent/10 via-accent-secondary/10 to-transparent opacity-60" />
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
