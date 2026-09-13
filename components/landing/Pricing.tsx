"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { siteContent } from "@/lib/content";

type Billing = "mensile" | "annuale" | "lifetime";

export function Pricing() {
  const [billing, setBilling] = useState<Billing>("mensile");
  const prefersReduced = useReducedMotion();

  const prices: Record<string, Record<Billing, string>> = {
    Free: { mensile: "0€", annuale: "0€", lifetime: "0€" },
    Pro: { mensile: "19€", annuale: "15€", lifetime: "149€" }, // TODO: confermare pricing
    Enterprise: { mensile: "Custom", annuale: "Custom", lifetime: "Custom" },
  };

  return (
    <section id="pricing" className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Prezzi semplici</h2>
        <p className="mt-2 text-sm text-muted-foreground">Mensile, annuale con sconto, o lifetime. // TODO: confermare pricing</p>
      </div>

      <div className="mx-auto mt-6 flex w-fit rounded-full border border-border bg-surface p-1">
        {(["mensile", "annuale", "lifetime"] as Billing[]).map((b) => (
          <button
            key={b}
            onClick={() => setBilling(b)}
            className={`relative rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors ${billing === b ? "text-background" : "text-muted-foreground"}`}
          >
            {billing === b && (
              <motion.span
                layoutId="billing-indicator"
                className="absolute inset-0 rounded-full bg-accent"
                transition={prefersReduced ? { duration: 0.01 } : { type: "spring", bounce: 0.2, duration: 0.4 }}
              />
            )}
            <span className="relative">{b}</span>
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {siteContent.pricing.plans.map((p) => {
          const featured = (p as { featured?: boolean }).featured;
          return (
            <Card
              key={p.name}
              className={`relative flex flex-col border-border bg-surface ${featured ? "border-accent shadow-lg sm:scale-[1.03]" : ""}`}
            >
              {featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-background">
                  Più scelto
                </span>
              )}
              <CardHeader>
                <CardTitle className="text-base">{p.name}</CardTitle>
                <p className="mt-2 text-2xl font-bold">
                  {prices[p.name]?.[billing] ?? p.price}
                  <span className="text-sm font-normal text-muted-foreground">/{billing}</span>
                </p>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <ul className="space-y-2 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-success" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button className={`mt-6 w-full rounded-full ${featured ? "bg-accent text-background hover:bg-accent/90" : ""}`} variant={featured ? "default" : "outline"}>
                  {p.name === "Enterprise" ? "Contattaci" : "Inizia"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
