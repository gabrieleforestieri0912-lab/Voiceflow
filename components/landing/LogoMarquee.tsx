"use client";

import { Reveal } from "@/components/ui/Reveal";
import { AppLogo, appMeta, type AppId } from "./AppLogos";

// 20 loghi veri delle app dove Voiceflow funziona
const logos: AppId[] = [
  "slack", "notion", "vscode", "cursor", "terminal",
  "teams", "word", "outlook", "gmail", "whatsapp",
  "telegram", "discord", "firefox", "zoom", "figma",
  "linear", "github", "claude", "chatgpt", "gemini",
];

export function LogoMarquee() {
  return (
    <section className="mt-14 border-y border-border bg-surface/40 py-8">
      <Reveal className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground">Used by those who move fast</p>
      </Reveal>
      <Reveal delay={0.1} className="mask-fade-x mt-6 overflow-hidden">
        <div className="animate-marquee flex w-max gap-12 pr-12" aria-hidden={false}>
          {[...logos, ...logos].map((id, i) => (
            <span
              key={`${id}-${i}`}
              className="flex items-center gap-2.5 whitespace-nowrap text-[15px] font-semibold text-foreground"
              aria-hidden={i >= logos.length}
              title={appMeta[id].name}
            >
              <AppLogo id={id} size={20} />
              {appMeta[id].name}
            </span>
          ))}
        </div>
      </Reveal>
      <Reveal delay={0.15} className="mt-5 text-center">
        <a href="#testimonials" className="text-sm font-medium text-muted underline-offset-4 hover:text-foreground hover:underline">
          See the companies
        </a>
      </Reveal>
    </section>
  );
}
