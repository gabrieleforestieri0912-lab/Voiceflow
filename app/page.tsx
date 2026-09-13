import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { TrustBar } from "@/components/landing/TrustBar";
import { AdaptabilitySection } from "@/components/landing/AdaptabilitySection";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { ModesShowcase } from "@/components/landing/ModesShowcase";
import { IntegrationsSection } from "@/components/landing/IntegrationsSection";
import { AgenticCodingDemo } from "@/components/landing/AgenticCodingDemo";
import { Testimonials } from "@/components/landing/Testimonials";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";

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
        <IntegrationsSection />
        <AgenticCodingDemo />
        <Testimonials />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
