import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VoiceFlow — Dettatura istantanea per Windows",
  description:
    "Tieni premuto Ctrl+Spazio, parla, rilascia: il testo appare dove si trova il cursore. In qualsiasi app Windows. Senza fronzoli.",
  metadataBase: new URL("https://voiceflow.app"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className="dark">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">{children}</body>
    </html>
  );
}
