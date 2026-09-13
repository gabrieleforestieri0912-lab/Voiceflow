import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";

export default function Page() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <section id="features" className="mx-auto max-w-6xl px-6 py-12">
          <p className="text-sm text-muted-foreground">Fase 2+ in arrivo — TrustBar, Features, Modes… (stub Fase 0)</p>
        </section>
      </main>
      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        VoiceFlow · StackUp · Solo Windows · Fase 1 — Navbar + Hero
      </footer>
    </div>
  );
}
