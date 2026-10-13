"use client";

import { useState } from "react";
import { Globe, AtSign, Rss } from "lucide-react";
import { Logo } from "@/components/ui/Primitives";

const cols: { title: string; links: string[] }[] = [
  { title: "Product", links: ["Modes", "Vocabulary", "Pricing", "Changelog"] },
  { title: "Agentic coding", links: ["Workflows", "Diffs", "Prompts"] },
  { title: "Free tools", links: ["Mic test", "WPM meter", "Prompt library"] },
  { title: "Resources", links: ["Tutorials", "Blog", "Community"] },
  { title: "Support", links: ["Docs", "Contact", "Status"] },
  { title: "Policies", links: ["Privacy", "Terms", "Refunds"] },
];

export function SiteFooter() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface/40">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-muted">Voiceflow — fictional AI dictation. Just speak, write faster. No real data, all placeholder.</p>
            <form
              className="mt-5 flex max-w-xs gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (email.trim()) setSent(true);
              }}
            >
              <label htmlFor="newsletter" className="sr-only">Email for newsletter</label>
              <input
                id="newsletter"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@fast.com"
                className="w-full rounded-pill border border-border bg-background px-4 py-2.5 text-sm outline-none placeholder:text-dim focus:border-ocean"
              />
              <button className="shrink-0 rounded-pill bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition-all hover:-translate-y-[1px] hover:shadow-pop active:scale-[0.98]">
                {sent ? "✓" : "Join"}
              </button>
            </form>
            {sent && <p className="mt-2 text-xs text-success">You're on the (fake) list.</p>}
            <div className="mt-5 flex gap-2">
              {[AtSign, Globe, Rss].map((Icon, i) => (
                <a key={i} href="#top" aria-label="Social link" className="grid h-9 w-9 place-items-center rounded-[10px] border border-border text-muted hover:text-foreground">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
          <nav className="grid grid-cols-2 gap-6 sm:grid-cols-3" aria-label="Footer">
            {cols.map((c) => (
              <div key={c.title}>
                <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-dim">{c.title}</h3>
                <ul className="mt-3 space-y-2">
                  {c.links.map((l) => (
                    <li key={l}>
                      <a href="#top" className="text-sm text-muted hover:text-foreground">{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6 text-xs text-dim">
          <span>© {year} Voiceflow Labs (fictional). All rights reserved.</span>
          <span className="font-mono">Just speak. Write faster.</span>
        </div>
      </div>
    </footer>
  );
}
