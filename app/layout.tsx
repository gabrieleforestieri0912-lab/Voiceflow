import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vocalis — Just speak. Write faster.",
  description:
    "Vocalis è l'app di dettatura vocale AI (placeholder fittizio): premi un tasto, parla, il testo appare in qualsiasi app. Offline, multilingua, con modalità personalizzate.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${geistMono.variable} min-h-screen bg-background font-sans text-foreground antialiased`}>
        {children}
      </body>
    </html>
  );
}
