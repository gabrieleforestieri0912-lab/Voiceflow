# Fase 0 — Setup progetto & design system

Branch: `landing/setup-design-system-20260913-142656` → commit `0e4930b`

## Tokens confermati (decisione #1 — fallback scura teal/indigo)

`app/globals.css` dark-only, HSL per shadcn cssVariables:

- `--background #0B0D10`, `--surface #15181D`, `--foreground #F4F5F7`, `--muted #8B92A0`, `--accent #5EEAD4`, `--accent-secondary #818CF8`, `--border #22262E`, `--success #4ADE80`

`tailwind.config.ts` estende `background/surface/foreground/muted/accent/border/success` + `fontFamily` Geist.

`app/layout.tsx` usa `next/font/google` `Geist`/`Geist_Mono` con `variable`, `color-scheme: dark`.

## Struttura creata

```
app/page.tsx / layout.tsx
components/landing/{Navbar,Hero,TrustBar,AdaptabilitySection,FeaturesGrid,ModesShowcase,IntegrationsSection,AgenticCodingDemo,Testimonials,Pricing,FAQ,Footer}.tsx
components/ui/{button,card,tabs,accordion,badge,separator,sheet,select,dialog}
lib/animations.ts (fadeInUp, staggerContainer, scaleIn — solo transform/opacity, rispetta prefers-reduced-motion)
lib/content.ts (copy originale centralizzata, typewriterExamples ciclici fallback decisione #2)
```

Build: `npm run build` OK, typecheck OK, mobile-first baseline.
