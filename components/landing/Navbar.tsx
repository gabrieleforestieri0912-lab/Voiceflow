"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Download } from "lucide-react";
import { Logo, ButtonLink } from "@/components/ui/Primitives";
import { cn } from "@/lib/utils";

const links = [
  { label: "Product", href: "#inside" },
  { label: "Use cases", href: "#adaptability" },
  { label: "Pricing", href: "#pricing" },
  { label: "Docs", href: "#tutorials" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-standard",
        scrolled ? "border-b border-border bg-background/80 backdrop-blur-xl" : "border-b border-transparent bg-transparent"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8" aria-label="Main">
        <Logo />
        <div className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <a key={l.label} href={l.href} className="text-sm text-muted transition-colors hover:text-foreground">
              {l.label}
            </a>
          ))}
        </div>
        <div className="hidden md:block">
          <ButtonLink href="#pricing" size="sm">
            <Download size={15} /> Download
          </ButtonLink>
        </div>
        <button
          className="grid h-10 w-10 place-items-center rounded-[10px] border border-border bg-surface md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-b border-border bg-background/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-4">
              {links.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-[10px] px-3 py-2.5 text-[15px] text-muted hover:bg-surface hover:text-foreground"
                >
                  {l.label}
                </a>
              ))}
              <ButtonLink href="#pricing" className="mt-2 w-full" onClick={() => setOpen(false)}>
                <Download size={15} /> Download
              </ButtonLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
