"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { siteContent } from "@/lib/content";

export function Navbar() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (v) => {
    setScrolled(v > 40);
  });

  // Fallback senza motion se reduce
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-transparent">
      {/* Layer background che fa fade — solo opacity, GPU */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 border-b border-border bg-surface/80 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: scrolled ? 1 : 0 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      />
      <div className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-accent text-[10px] font-bold tracking-widest text-background">
            VF
          </span>
          <span className="text-sm font-semibold tracking-tight">VoiceFlow</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {siteContent.nav.links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {l.label}
            </a>
          ))}
          <Button asChild size="sm" className="rounded-full bg-accent text-background hover:bg-accent/90">
            <Link href="/download">{siteContent.nav.cta}</Link>
          </Button>
        </nav>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Apri menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="top" className="bg-surface border-border p-0">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <span className="text-sm font-semibold">VoiceFlow</span>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Chiudi">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex flex-col gap-2 px-6 py-6">
              {siteContent.nav.links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-2 py-2 text-base text-foreground hover:bg-secondary"
                >
                  {l.label}
                </a>
              ))}
              <Button asChild className="mt-2 rounded-full bg-accent text-background">
                <Link href="/download" onClick={() => setOpen(false)}>
                  {siteContent.nav.cta}
                </Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
