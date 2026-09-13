import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VoiceFlow — parli, Voiceflow scrive. Nativo Windows.",
  description:
    "Dettatura vocale push-to-talk per Windows. Tieni premuto Ctrl+Spazio, parla, rilascia: il testo appare dove si trova il cursore, in qualsiasi app. Offline, con vocabolario personalizzato.",
  metadataBase: new URL("https://voiceflow.app"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background font-sans text-foreground antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
