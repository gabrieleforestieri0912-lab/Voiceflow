"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Home, Sparkles, BookMarked, Settings, Type, Cpu, Bookmark } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ModesShowcase() {
  const prefersReduced = useReducedMotion();

  return (
    <section className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Modalità su misura</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Configura una volta, detta ovunque. Ogni modalità ha tono e regole proprie.</p>
      </div>

      <motion.div
        initial={prefersReduced ? { opacity: 1 } : { opacity: 0, scale: 0.96, rotateX: -5 }}
        whileInView={{ opacity: 1, scale: 1, rotateX: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={prefersReduced ? { duration: 0.01 } : { duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ perspective: 1000 }}
        className="mx-auto mt-8 max-w-4xl overflow-hidden rounded-xl border border-border bg-surface shadow-2xl"
      >
        {/* Windows title bar */}
        <div className="flex items-center justify-between border-b border-border bg-background px-3 py-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-3 w-3 rounded-sm bg-muted" />
            <span>VoiceFlow — Modalità</span>
            <Badge variant="secondary" className="ml-2 text-[10px]">
              Windows 11
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-3 w-7 rounded-sm border border-border" aria-hidden>
              —
            </span>
            <span className="h-3 w-3 rounded-sm border border-border" aria-hidden>
              □
            </span>
            <span className="h-3 w-3 rounded-sm bg-destructive/80" aria-hidden>
              ×
            </span>
          </div>
        </div>

        <div className="grid sm:grid-cols-[160px_1fr]">
          {/* Sidebar */}
          <div className="hidden border-r border-border bg-background p-3 sm:block">
            {[
              { icon: Home, label: "Home", active: false },
              { icon: Sparkles, label: "Modalità", active: true },
              { icon: BookMarked, label: "Vocabolario", active: false },
              { icon: Settings, label: "Impostazioni", active: false },
            ].map((it) => (
              <div
                key={it.label}
                className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm ${it.active ? "bg-accent text-background" : "text-muted-foreground"}`}
              >
                <it.icon className="h-4 w-4" />
                {it.label}
              </div>
            ))}
          </div>

          {/* Central panel mock */}
          <div className="p-4 sm:p-6">
            <h3 className="text-sm font-semibold">Modalità: Email formale</h3>
            <p className="mt-1 text-xs text-muted-foreground">Corregge tono, punteggiatura e firma per email di lavoro.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Card className="border-border bg-background">
                <CardContent className="p-3">
                  <p className="text-xs font-medium">Tono</p>
                  <div className="mt-2 rounded-md border border-border bg-surface px-2 py-1.5 text-xs">Formale · Cortese · Conciso</div>
                </CardContent>
              </Card>
              <Card className="border-border bg-background">
                <CardContent className="p-3">
                  <p className="text-xs font-medium">Lingua output</p>
                  <div className="mt-2 rounded-md border border-border bg-surface px-2 py-1.5 text-xs">Italiano → traduce se detti in EN</div>
                </CardContent>
              </Card>
            </div>
            <div className="mt-3 rounded-lg border border-dashed border-border p-3 text-xs leading-5 text-muted-foreground">
              “Buongiorno Marco, ti invio il recap… — trascrizione grezza → riscrittura in formalità con firma automatica.”
            </div>
          </div>
        </div>
      </motion.div>

      <div className="mx-auto mt-8 grid max-w-4xl gap-4 sm:grid-cols-3">
        {[
          { icon: Type, title: "Controllo formattazione", desc: "Maiuscole, elenchi, citazioni — regole salvate per modalità." },
          { icon: Cpu, title: "Scelta modello AI", desc: "Scegli il modello per velocità o qualità, per modalità." },
          { icon: Bookmark, title: "Preset salvabili", desc: "Esporta e condividi le tue modalità con il team." },
        ].map((f) => (
          <div key={f.title} className="rounded-xl border border-border bg-surface p-4">
            <f.icon className="h-4 w-4 text-accent" />
            <h4 className="mt-2 text-sm font-semibold">{f.title}</h4>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
