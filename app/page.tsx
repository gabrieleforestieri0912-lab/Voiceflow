import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { TrustBar } from "@/components/landing/TrustBar";
import { AdaptabilitySection } from "@/components/landing/AdaptabilitySection";

export default function Page() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <TrustBar />
        <AdaptabilitySection />
        <section id="features" className="mx-auto max-w-6xl px-6 py-12">
          <p className="text-sm text-muted-foreground">Fase 4+ in arrivo — Features…</p>
        </section>
      </main>
      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        VoiceFlow · StackUp · Solo Windows · Fase 3 — Adattabilità tono
      </footer>
    </div>
  );
}
