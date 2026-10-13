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

function themeInit() {
  // Default: scuro. Rispetta scelta salvata, altrimenti OS.
  try {
    const saved = localStorage.getItem("vocalis-theme");
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    if (saved === "light") root.classList.add("light");
    else root.classList.add("dark");
  } catch {}
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(${themeInit.toString()})()` }} />
      </head>
      <body className={`${inter.variable} ${geistMono.variable} min-h-screen bg-background font-sans text-foreground antialiased`}>
        {children}
      </body>
    </html>
  );
}
