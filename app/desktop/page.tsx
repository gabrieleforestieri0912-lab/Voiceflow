import { Navbar } from "@/components/landing/Navbar";
import { DesktopOverlay } from "@/components/landing/DesktopOverlay";
import { LocalModels } from "@/components/landing/LocalModels";
import { Compatibility } from "@/components/landing/Compatibility";
import { SiteFooter } from "@/components/landing/SiteFooter";

export const metadata = {
  title: "Voiceflow Desktop — overlay + shortcut",
  description: "Anteprima dell'interfaccia desktop Voiceflow: pill con 3 bottoni in alto al centro e shortcut per la registrazione vocale.",
};

export default function DesktopPage() {
  return (
    <div className="min-h-screen overflow-x-clip">
      <Navbar />
      <main>
        <DesktopOverlay />
        <Compatibility />
        <LocalModels />
      </main>
      <SiteFooter />
    </div>
  );
}
