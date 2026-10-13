"use client";

import { Reveal, Section } from "@/components/ui/Reveal";

const logos = [
  "Northwind", "Acme Co", "Lumen", "Hexlab", "Paperplane", "Driftly",
  "Monochrome", "Brightline", "Koda", "Fieldset", "Alloy", "Parabol",
  "Softframe", "Quickdraft", "Meridian", "Ozone", "Plaintext", "Roundup",
  "Statice", "Voltaic",
];

export function LogoMarquee() {
  return (
    <section className="mt-14 border-y border-border bg-surface/40 py-8">
      <Reveal className="text-center">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-dim">Used by those who move fast</p>
      </Reveal>
      <Reveal delay={0.1} className="marquee-paused mask-fade-x mt-6 overflow-hidden">
        <div className="animate-marquee flex w-max gap-10 pr-10" aria-hidden={false}>
          {[...logos, ...logos].map((name, i) => (
            <span
              key={`${name}-${i}`}
              className="flex items-center gap-2 whitespace-nowrap text-sm font-semibold text-muted opacity-50 transition-opacity hover:opacity-100"
              aria-hidden={i >= logos.length}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                <rect x="1" y="1" width="14" height="14" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="8" cy="8" r="3" />
              </svg>
              {name}
            </span>
          ))}
        </div>
      </Reveal>
      <Reveal delay={0.15} className="mt-5 text-center">
        <a href="#testimonials" className="text-xs text-dim underline-offset-4 hover:text-muted hover:underline">
          See the companies
        </a>
      </Reveal>
    </section>
  );
}

