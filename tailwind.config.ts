import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        foreground: "var(--foreground)",
        muted: "var(--muted)",
        dim: "var(--dim)",
        accent: "var(--accent)",
        success: "var(--success)",
        danger: "var(--danger)",
        border: "var(--border)",
      },
      backgroundColor: {
        accentSoft: "var(--accent-soft)",
      },
      borderRadius: {
        card: "20px",
        pill: "999px",
        DEFAULT: "12px",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 0 rgba(255,255,255,0.04) inset, 0 20px 60px -20px rgba(0,0,0,0.6)",
        glow: "0 0 24px 0 var(--accent-glow), 0 0 64px -8px var(--accent-glow)",
      },
      transitionTimingFunction: {
        vocalis: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      transitionDuration: {
        micro: "150ms",
        standard: "400ms",
        reveal: "700ms",
      },
    },
  },
} satisfies Config;
