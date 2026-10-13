// Matrice di compatibilità Vocalis (dati fittizi).
// Principio tecnico: Vocalis scrive a livello di sistema operativo nel campo
// di testo attivo — quindi funziona in QUALSIASI input, senza plugin per-app.

import type { AppId } from "@/components/landing/AppLogos";

export type CompatApp = { name: string; logo?: AppId; note?: string };

export type CompatCategory = {
  id: string;
  title: string;
  desc: string;
  apps: CompatApp[];
};

export const COMPAT_CATEGORIES: CompatCategory[] = [
  {
    id: "browser",
    title: "Browser & input web",
    desc: "Ogni campo di testo nel browser: niente estensioni.",
    apps: [
      { name: "Chrome", note: "address bar, form, Docs" },
      { name: "Edge", note: "form e sidebar" },
      { name: "Firefox", logo: "firefox", note: "tutti gli input" },
      { name: "Brave / Arc", note: "stesso motore, zero setup" },
    ],
  },
  {
    id: "ai",
    title: "AI assistant & chatbot",
    desc: "Detta i prompt direttamente nelle chat AI.",
    apps: [
      { name: "Claude", logo: "claude", note: "web + desktop" },
      { name: "ChatGPT", logo: "chatgpt", note: "prompt e custom GPT" },
      { name: "Gemini", logo: "gemini", note: "web app e Gmail" },
      { name: "Copilot", note: "chat e inline" },
    ],
  },
  {
    id: "code",
    title: "Codice & terminale",
    desc: "Prompt per agenti, commit, comandi.",
    apps: [
      { name: "Cursor", logo: "cursor", note: "chat, Cmd-K, terminale" },
      { name: "VS Code", logo: "vscode", note: "editor + Copilot chat" },
      { name: "Windows Terminal", logo: "terminal", note: "comandi dettati" },
      { name: "GitHub", logo: "github", note: "PR, issue, commenti" },
    ],
  },
  {
    id: "team",
    title: "Team chat & meeting",
    desc: "Messaggi e recap ovunque parli col team.",
    apps: [
      { name: "Slack", logo: "slack", note: "canali, thread, huddle" },
      { name: "Teams", logo: "teams", note: "chat e meeting" },
      { name: "Discord", logo: "discord", note: "server e DM" },
      { name: "Zoom", logo: "zoom", note: "chat in-call" },
    ],
  },
  {
    id: "mail-docs",
    title: "Email, docs & note",
    desc: "Testi lunghi dettati, formattati dal Mode giusto.",
    apps: [
      { name: "Gmail", logo: "gmail", note: "compose nel browser" },
      { name: "Outlook", logo: "outlook", note: "mail e calendario" },
      { name: "Notion", logo: "notion", note: "pagine e database" },
      { name: "Word", logo: "word", note: "documenti" },
    ],
  },
  {
    id: "other",
    title: "…e tutto il resto",
    desc: "Se ci puoi scrivere, Vocalis ci detta.",
    apps: [
      { name: "WhatsApp", logo: "whatsapp", note: "web + desktop" },
      { name: "Telegram", logo: "telegram", note: "chat e canali" },
      { name: "Obsidian", logo: "obsidian", note: "note markdown" },
      { name: "Qualsiasi CRM / gestionale", note: "input web e desktop" },
    ],
  },
];

export const COMPAT_STEPS = [
  {
    title: "Premi la shortcut",
    desc: "Alt + Spazio ovunque: browser, Cursor, Claude, chatbot, gestionali.",
  },
  {
    title: "Parla",
    desc: "Il modello AI locale trascrive sul tuo PC, anche offline.",
  },
  {
    title: "Rilascia: è già scritto",
    desc: "Il testo appare nel campo attivo. Nessun plugin, nessuna allowlist.",
  },
];
