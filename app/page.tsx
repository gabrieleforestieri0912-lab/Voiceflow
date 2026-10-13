import dynamic from "next/dynamic";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { LogoMarquee } from "@/components/landing/LogoMarquee";
import { Adaptability } from "@/components/landing/Adaptability";
import { WhatsInside } from "@/components/landing/WhatsInside";

// Heavy sections lazy-loaded to avoid layout shift / large initial bundle
const AppMockup = dynamic(() => import("@/components/landing/AppMockup").then((m) => m.AppMockup), { ssr: true });
const DesktopOverlay = dynamic(() => import("@/components/landing/DesktopOverlay").then((m) => m.DesktopOverlay), { ssr: true });
const CustomMode = dynamic(() => import("@/components/landing/CustomMode").then((m) => m.CustomMode), { ssr: true });
const Integrations = dynamic(() => import("@/components/landing/Integrations").then((m) => m.Integrations), { ssr: true });
const Compatibility = dynamic(() => import("@/components/landing/Compatibility").then((m) => m.Compatibility), { ssr: true });
const AgenticCoding = dynamic(() => import("@/components/landing/AgenticCoding").then((m) => m.AgenticCoding), { ssr: true });
const Mobile = dynamic(() => import("@/components/landing/Mobile").then((m) => m.Mobile), { ssr: true });
const Testimonials = dynamic(() => import("@/components/landing/Testimonials").then((m) => m.Testimonials), { ssr: true });
const Pricing = dynamic(() => import("@/components/landing/Pricing").then((m) => m.Pricing), { ssr: true });
const Tutorials = dynamic(() => import("@/components/landing/Tutorials").then((m) => m.Tutorials), { ssr: true });
const Faq = dynamic(() => import("@/components/landing/Faq").then((m) => m.Faq), { ssr: true });
const SiteFooter = dynamic(() => import("@/components/landing/SiteFooter").then((m) => m.SiteFooter), { ssr: true });

export default function Page() {
  return (
    <div className="min-h-screen overflow-x-clip">
      <Navbar />
      <main>
        <Hero />
        <LogoMarquee />
        <Adaptability />
        <WhatsInside />
        <AppMockup />
        <DesktopOverlay />
        <CustomMode />
        <Integrations />
        <Compatibility />
        <AgenticCoding />
        <Mobile />
        <Testimonials />
        <Pricing />
        <Tutorials />
        <Faq />
      </main>
      <SiteFooter />
    </div>
  );
}
