# Fase 0 — Setup progetto & design system

Branch: `landing/setup-design-system-20260913-142656` → commit `0e4930b`

> **Evoluzione successiva (2026-10-13):** i tokens sotto sono quelli originari della Fase 0.
> Stato corrente in `app/globals.css` + `tailwind.config.ts`: accento giallo `#FFD60A`
> (solo Pricing), palette sezioni verde `#30D158` / blu `#0A84FF` / rosso `#FF453A` / azzurro,
> hero "cielo all'alba", tema **chiaro/scuro con toggle** (`darkMode: "class"`,
> `components/ui/ThemeToggle.tsx`), font Inter + Geist Mono. Sezioni correnti in
> `components/landing/` (19 file: Navbar, Hero, LogoMarquee, Compatibility, LocalModels,
> Integrations, Pricing, Faq, Tutorials, Mobile, SiteFooter…).

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
