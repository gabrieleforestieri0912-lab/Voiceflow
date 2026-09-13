"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { siteContent } from "@/lib/content";

const faqs = [
  ...siteContent.faq,
  { q: "I miei dati vocali sono salvati?", a: "No. Trascrizione via proxy senza salvataggio audio, nessun log testo. Solo contatori anonimi se attivi." },
  { q: "Posso provare gratis?", a: "Sì, Free include trascrizione base e offline. Passi a Pro quando vuoi." },
  { q: "Roadmap?", a: "Vocabolario condiviso, assistente riunioni esteso e modelli locali opzionali." },
];

export function FAQ() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
      <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">Domande frequenti</h2>
      <Accordion type="single" collapsible className="mt-6">
        {faqs.map((f, i) => (
          <AccordionItem key={i} value={`item-${i}`} className="border-border">
            <AccordionTrigger className="text-left text-sm">{f.q}</AccordionTrigger>
            <AccordionContent className="text-sm leading-6 text-muted-foreground">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
