import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { TrustBar } from "@/components/landing/TrustBar";
import { AdaptabilitySection } from "@/components/landing/AdaptabilitySection";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { ModesShowcase } from "@/components/landing/ModesShowcase";

export default function Page() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <TrustBar />
        <AdaptabilitySection />
        <FeaturesGrid />
        <ModesShowcase />
      </main>
      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        VoiceFlow · StackUp · Solo Windows · Fase 5 — Modes
      </footer>
    </div>
  );
}
